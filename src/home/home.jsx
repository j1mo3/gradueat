import React from 'react';
import './home.css';

import { Account } from './account';
import { CreatePost } from './createpost';
import { Posts } from './posts';

import { websocket } from './websocket';

export function Home() {
    const schools = ['BYU'];

    const [username, setUsername] = React.useState(localStorage.getItem('username'));
    const [notSignedIn, setNotSignedIn] = React.useState(!Boolean(username));

    const [posts, updatePosts] = React.useState([]);
    const [todaysPosts, updateTodaysPosts] = React.useState([]);
    const [popularPosts, updatePopularPosts] = React.useState([]);    

    const handleSignIn = (username) => {
        localStorage.setItem('username', username);
        setUsername(username);
        setNotSignedIn(false);
    };

    const handleSignOut = () => {
        fetch(`/api/auth/logout`, {
            method: 'delete',
          })
        localStorage.removeItem('username');
        setUsername('');
        setNotSignedIn(true);
    };

    React.useEffect(() => {
        fetch(`/api/posts/today`)
            .then((response) => response.json())
            .then((data) => {
                updateTodaysPosts(data);
                // Update state with fetched data if needed
            })
            .catch(error => console.error('Error fetching posts:', error));
    }, []);

    React.useEffect(() => {
        fetch(`/api/posts/popular`)
            .then((response) => response.json())
            .then((data) => {
                updatePopularPosts(data.slice(0, 5));
                // Update state with fetched data if needed
            })
            .catch(error => console.error('Error fetching posts:', error));
    }, []);

    React.useEffect(() => {
        fetch(`/api/posts`)
            .then((response) => response.json())
            .then((data) => {
                // Update posts only after todaysPosts and popularPosts are updated
                const updatePostsAfterUpdate = () => {
                    const filteredPosts = data.filter(post => {
                        const isInTodaysPosts = todaysPosts.some(todaysPost => todaysPost._id === post._id);
                        const isInPopularPosts = popularPosts.some(popularPost => popularPost._id === post._id);
                        return !isInTodaysPosts && !isInPopularPosts;
                    });
                    updatePosts(filteredPosts);
                };
    
                // Check if todaysPosts and popularPosts are fully updated
                if (todaysPosts.length > 0 && popularPosts.length > 0) {
                    updatePostsAfterUpdate();
                } else {
                    // If not fully updated, wait for the next render cycle
                    requestAnimationFrame(updatePostsAfterUpdate);
                }
            })
            .catch(error => console.error('Error fetching posts:', error));
    }, [todaysPosts, popularPosts]);

    //websocket
    React.useEffect(() => {
        websocket.addHandler(handleNewPost);
    
        return () => {
          websocket.removeHandler(handleNewPost);
        };
      });
    
      function handleNewPost(event) {
        if (event.type === 'post') {
            updatePosts([...posts, event]);
            
            const startOfDay = new Date();
            const startDayMils = Math.floor(startOfDay.getTime());
            const adjustStartTime = startDayMils - (6 * 3600000); // adjust 6 hrs for MST
            const adjustEndTime = adjustStartTime + (24 * 3600000);
    
            if (event['endTime'] < adjustEndTime && event['endTime'] > adjustStartTime) {
                updateTodaysPosts([...todaysPosts, event])
            }
        }
      }


    return (
        <div className='menu'>
            <div className="sidebar">
                <img id="main-logo" src="logo.png" alt="home"/>
                <h1 className="campus-name">AT BYU</h1>
                <Account
                    username={username}
                    notSignedIn={notSignedIn}
                    handleSignIn={handleSignIn}
                    handleSignOut={handleSignOut}
                    schools= {schools}
                    />
                <div className="filter-bar">
                {/* <h1>Filter</h1> */}
                {/* <label htmlFor="formdate">From:</label>
                <input type="date" id="fromdate" name="fromdate"/>
                <label htmlFor="todate">To:</label>
                <input type="date" id="todate" name="todate"/> */}
            </div>
            </div>

            <div className="main">
                <CreatePost 
                    username={username}
                    />

                <h1 className="food-category">Upcoming Specials</h1>
                <hr className="horizontal-line"/>
                <Posts
                    username={username}
                    posts={todaysPosts}
                />

                <h1 className="food-category">Popular</h1>
                <hr className="horizontal-line"/>
                <Posts
                    username={username}
                    posts={popularPosts}
                />

                <h1 className="food-category">More</h1>
                <hr className="horizontal-line"/>
                <Posts
                    username={username}
                    posts={posts}
                />

            </div>
        </div>
    );
}