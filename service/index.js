const express = require('express');
const app = express();
const DB = require('./database.js');
const bcrypt = require('bcrypt');
const path = require('path'); // Import the path module
const { peerProxy } = require('./peerProxy.js');
const cookieParser = require('cookie-parser');

// The service port. In production the frontend code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 5000;
const authCookieName = 'token';

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the frontend static content hosting
app.use(express.static('public'));

app.use(cookieParser());

// Router for service endpoints
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.get('/user/:username', async (_req, res) => {
  const user = await DB.getUser(_req.params.username);
  res.send(user);
});

apiRouter.get('/posts/today', async (_req, res) => {
  const todays_post = await DB.getTodaysPosts();
  res.send(todays_post);
});

apiRouter.get('/posts/popular', async (_req, res) => {
  const popular_post = await DB.getPopularPosts();
  res.send(popular_post);
});

apiRouter.get('/posts', async (_req, res) => {
    const posts = await DB.getPosts();
    res.send(posts);
});

apiRouter.get('/post/:id', async (_req, res) => {
  const postId = _req.params.id;
  const post = await DB.getPost(postId);
  res.send(post);
});

apiRouter.post('/user', async (req, res) => {
    body = {...req.body};
    if (await DB.getUser(body['username'])) {
      res.status(409).send({ msg: 'Existing user' });
    }
    else {
      const user = await DB.createUser(body['username'], body['password'], body['school']);
      setAuthCookie(res, user.token);
      res.status(201).send({ msg: 'User Created' });
    } 
});

apiRouter.post('/auth/login', async (req, res) => {
    body = {...req.body};
    const user = await DB.getUser(body['username']);
    if (user) {
      const passwordMatch = await bcrypt.compare(body['password'], user['password']);
      if (passwordMatch) {
        setAuthCookie(res, user.token);
        res.status(200).send({ msg: 'Authorized' });
      } else {
        res.status(401).send({ msg: 'Unauthorized' });
      }
    } else {
        res.status(401).send({ msg: 'Invalid'});
    }
});

apiRouter.delete('/auth/logout', (_req, res) => {
  console.log('Logging out')
  res.clearCookie(authCookieName);
  res.status(204).end();
});


//secure router function
const secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  const authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

secureApiRouter.post('/post', async (req, res) => {
  body = {...req.body};
  p = await DB.createPost(body['createdBy'], body['school'], body['food'], body['sponsor'], body['location'], body['date'], body['startTime'], body['endTime'], body['likes'], body['dislikes'], body['reports']);
  res.status(201).send({post: p});
});

secureApiRouter.post('/posts/:postId/like', async (req, res) => {
  try {
      const postId = req.params.postId;
      const body = {...req.body};
      const userId = body.username; // Assuming userId is sent in the request body

      // Call the function to add the like to the post
      const updatedPost = await DB.likePost(postId, userId);

      // Send the updated post as the response
      res.status(200).json(updatedPost);
  } catch (error) {
      console.error('Error adding like to post:', error);
      res.status(500).json({ error: 'Failed to add like to post' });
  }
});

secureApiRouter.post('/posts/:postId/dislike', async (req, res) => {
  try {
      const postId = req.params.postId;
      const body = {...req.body};
      const userId = body.username; // Assuming userId is sent in the request body

      // Call the function to add the like to the post
      const updatedPost = await DB.dislikePost(postId, userId);

      // Send the updated post as the response
      res.status(200).json(updatedPost);
  } catch (error) {
      console.error('Error adding like to post:', error);
      res.status(500).json({ error: 'Failed to add like to post' });
  }
});

secureApiRouter.post('/posts/:postId/report', async (req, res) => {
  try {
      const postId = req.params.postId;
      const body = {...req.body};
      const userId = body.username; // Assuming userId is sent in the request body

      // Call the function to add the like to the post
      const updatedPost = await DB.reportPost(postId, userId);

      // Send the updated post as the response
      res.status(200).json(updatedPost);
  } catch (error) {
      console.error('Error adding like to post:', error);
      res.status(500).json({ error: 'Failed to add like to post' });
  }
});



// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

peerProxy(httpService);