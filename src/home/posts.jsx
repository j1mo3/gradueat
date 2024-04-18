import React from 'react';
import './home.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { websocket } from './websocket';
import { Votes } from './votes';

export function Posts({username, posts}) {
    // const [username, setUsername] = React.useState(localStorage.getItem('username'));
    // const [notSignedIn, setNotSignedIn] = React.useState(!Boolean(username));
    const [_posts, updatePosts] = React.useState(posts);

    React.useEffect(() => {
        updatePosts(posts);
    }, [posts]);

    const formatTime = (time) => {
        const timeString = String(time)
        const [hours, minutes] = timeString.split(':');
        const formattedHours = parseInt(hours) % 12 || 12;
        const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
        return `${formattedHours}:${minutes} ${period}`;
    };

    const formatDate = (date) => {
        const dateString = String(date)
        const [year, month, day] = dateString.split('-');
        const _date = new Date(year, month - 1, day); // Month is zero-based, so subtract 1
        return _date.toDateString();
    }

    async function report(_id) {
      if (!username) {
        toast.error("Login to report!", {
            position: "top-right",
            autoClose: 500, // milliseconds until the toast automatically closes
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        return false;
      }

      const response = await fetch(`api/posts/${_id}/report`, {
          method: 'post',
          body: JSON.stringify({username: username}),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
      });
      if (response.ok) {
        toast.success("Reported!", {
          position: "top-right",
          autoClose: 500, // milliseconds until the toast automatically closes
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
      });
      } else {
        console.log("Couldn't report")
      }
    }



    return (
        <div>
        {_posts.length === 0 && (
            <div className="post-grouping">No food found yet!</div>
        )}

        {_posts.length !== 0 && _posts.map((post, index) => (
            <div key={index} className="food-posting" id="top-line">
                
                <div className="food-info" id="food-sponsor-info">
                    <h1 className="food-type">{post.food}</h1>
                    <div id="sponsor-and-flag">
                      <h2 className="food-sponsor">{post.sponsor}</h2>
                      <img id="report-icon" src="report.svg" alt="report" onClick={() => report(post._id)}/>
                    </div>
                </div>
                
                <div className="food-info" id="rsvp">
                    <img id="date-icon" src="date.svg" alt="date"/>
                    <h2>{formatDate(post.dateString)}</h2>
                    <img id="time-icon" src="time.svg" alt="time"/>
                    <h2>{formatTime(post.startTimeString)} - {formatTime(post.endTimeString)}</h2>
                    <img id="location-icon" src="location.svg" alt="location"/>
                    <h2>{post.location}</h2>

                    <Votes
                        _id={post._id}
                        username={username}
                        likes={post.likes}
                        dislikes={post.dislikes}
                        />
                    
                </div>
                <hr className="horizontal-line post-divider"/>
            </div>
        ))}
        </div>
    );
}