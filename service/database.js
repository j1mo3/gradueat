const { MongoClient, ObjectId } = require('mongodb');
const config = require('./dbConfig.json');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);

const db = client.db('gradueat');
const users = db.collection('users');
const posts = db.collection('posts');

async function getUser(username) {
    query = { username: username };
    user = await users.findOne(query);
    return user;
}

function getUserByToken(token) {
  return users.findOne({ token: token });
}

async function getPost(id) {
  const newId = new ObjectId(id);
  const post = await posts.findOne({ "_id": newId });
  return post;
}

async function getPosts() {
  const currentDate = new Date();
  const unixTimeInMil = Math.floor(currentDate.getTime());
  const adjustTime = unixTimeInMil - (6 * 3600000); // adjust 6 hrs for MST

  const query = { endTime: { $gte: adjustTime } };
  const options = { sort: { date: 1 } }; // Sort by the "date" field in ascending order

  const cursor = posts.find(query, options); // Pass the options object to the find method
  const posts_db = await cursor.toArray();
  return posts_db;
}

async function getTodaysPosts() {
  //next 24 hours
  const startOfDay = new Date();
  const startDayMils = Math.floor(startOfDay.getTime());
  const adjustStartTime = startDayMils - (6 * 3600000); // adjust 6 hrs for MST
  const adjustEndTime = adjustStartTime + (24 * 3600000);

  const query = { endTime: { $gte: adjustStartTime, $lte: adjustEndTime } };
  const options = { sort: { startTime: 1 } }; // Sort by the "date" field in ascending order
  const cursor = posts.find(query, options);
  currentPosts = await cursor.toArray();
  return currentPosts;
}

async function getPopularPosts() {
  const currentDate = new Date();
  //currentDate.setHours(currentDate.getHours() - 6); //adjust for MST
  const unixTimeInMil = Math.floor(currentDate.getTime());
  const adjustTime = unixTimeInMil - (6 * 3600000); // adjust 6 hrs for MST

  const pipeline = [
    {
      $addFields: { 
        likesCount: { $size: "$likes" }, // Calculate likes count
        dislikesCount: { $size: "$dislikes" } // Calculate dislikes count
      }
    },
    { 
      $addFields: { 
        totalScore: { $subtract: ["$likesCount", "$dislikesCount"] } // Subtract dislikes from likes to get total score
      }
    },
    { $sort: { totalScore: -1 } }, // Sort documents based on total score in descending order
    { $match: { endTime: { $gte: adjustTime }}}
  ];

  // const pipeline = [
  //   { 
  //     $addFields: { 
  //       likesCount: { $size: "$likes" }, // Calculate likes count
  //       dislikesCount: { $size: "$dislikes" }, // Calculate dislikes count
  //       reportCount: { $size: "$reports" }
  //     } 
  //   }, 
  //   { 
  //     $addFields: { 
  //       totalScore: { $subtract: ["$likesCount", "$dislikesCount"] } // Subtract dislikes from likes to get total score
  //     } 
  //   },
  //   { $sort: { totalScore: -1 } }, // Sort documents based on total score in descending order
  //   { $match: { endTime: { $gte: adjustTime }, reportSize: { $lt: 5 }}}
  // ];

  const cursor = posts.aggregate(pipeline); // Use aggregate() method
  popularPosts = await cursor.toArray();
  return popularPosts;
}

async function likePost(postId, userId) {
  try {
      // Check if the post exists
      const newId = new ObjectId(postId);
      const post = await posts.findOne({ "_id": newId });
      if (!post) {
          throw new Error('Post not found');
      }
      
      // Check if the user has already liked the post
      if (post.likes.includes(userId)) {
          throw new Error('User has already liked the post');
      }
      
      // Check if the user has disliked the post and remove from dislikes
      const updatedDislikes = post.dislikes.filter(dislikeUserId => dislikeUserId !== userId);
      
      // Update the post document to add the new like and remove from dislikes
      const updatedPost = await posts.findOneAndUpdate(
          { _id: newId },
          { $set: { likes: [...post.likes, userId], dislikes: updatedDislikes } }, // Update both likes and dislikes
          { returnOriginal: false }
      );
      
      if (!updatedPost) {
          throw new Error('Failed to update post');
      }
      
      return updatedPost;
  } catch (error) {
      throw new Error(`Failed to add like to post: ${error.message}`);
  }
}

async function dislikePost(postId, userId) {
  try {
      // Check if the post exists
      const newId = new ObjectId(postId);
      const post = await posts.findOne({ "_id": newId });
      if (!post) {
          throw new Error('Post not found');
      }
      
      // Check if the user has already liked the post
      if (post.dislikes.includes(userId)) {
          throw new Error('User has already disliked the post');
      }
      
      // Check if the user has disliked the post and remove from dislikes
      const updatedLikes = post.likes.filter(likeUserId => likeUserId !== userId);
      
      // Update the post document to add the new like and remove from dislikes
      const updatedPost = await posts.findOneAndUpdate(
          { _id: newId },
          { $set: { likes: updatedLikes, dislikes: [...post.dislikes, userId] } }, // Update both likes and dislikes
          { returnOriginal: false }
      );
      
      if (!updatedPost) {
          throw new Error('Failed to update post');
      }
      return updatedPost;
  } catch (error) {
      throw new Error(`Failed to add dislike to post: ${error.message}`);
  }
}

async function reportPost(postId, userId) {
  try {
      // Check if the post exists
      const newId = new ObjectId(postId);
      const post = await posts.findOne({ "_id": newId });
      if (!post) {
          throw new Error('Post not found');
      }
      
      // Check if the user has already liked the post
      if (post.reports.includes(userId)) {
          throw new Error('User has already disliked the post');
      }
      
      // Check if the user has disliked the post and remove from dislikes
      const updatedLikes = post.likes.filter(likeUserId => likeUserId !== userId);
      
      // Update the post document to add the new like and remove from dislikes
      const updatedPost = await posts.findOneAndUpdate(
          { _id: newId },
          { $set: { reports: [...post.reports, userId] } }, // Update both likes and dislikes
          { returnOriginal: false }
      );
      
      if (!updatedPost) {
          throw new Error('Failed to update post');
      }
      return updatedPost;
  } catch (error) {
      throw new Error(`Failed to add dislike to post: ${error.message}`);
  }
}

async function createUser(username, password, school) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      username: username,
      password: passwordHash,
      school: school,
      token: uuid.v4()
    };
    await users.insertOne(user);
    return user;
}

function getUserByToken(token) {
  return users.findOne({ token: token });
}

async function createPost(createdBy, school, food, sponsor, location, date, startTime, endTime, likes, dislikes, reports) {
  const specificDate = new Date(date);
  const dateMils = Math.floor(specificDate.getTime());

  const [hoursStart, minutesStart] = startTime.split(':');
  const hoursMilsStart = 3600000*hoursStart;
  const minutesMilsStart = 60000*minutesStart;

  const [hoursEnd, minutesEnd] = endTime.split(':');
  const hoursMilsEnd = 3600000*hoursEnd;
  const minutesMilsEnd = 60000*minutesEnd;  
  
  const post = {
    createdBy: createdBy,
    school: school,
    food: food,
    sponsor: sponsor,
    location: location,
    dateString: date,
    date: dateMils,
    startTime: dateMils + hoursMilsStart + minutesMilsStart,
    endTime: dateMils + hoursMilsEnd + minutesMilsEnd,
    startTimeString: startTime,
    endTimeString: endTime,
    likes: likes,
    dislikes: dislikes,
    reports: reports
    };

    const result = await posts.insertOne(post);
    let returnDict = post;
    returnDict._id = result.insertedId;
    return returnDict;
}

module.exports = { getUser, getPosts, getPost, getTodaysPosts, getPopularPosts, getUserByToken, createUser, createPost, likePost, dislikePost, reportPost };
