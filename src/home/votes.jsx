import React from 'react';
import './home.css';
import { websocket } from './websocket';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Votes({_id, username, likes, dislikes}) {
    const [upvotes, updateUpvotes] = React.useState(likes);
    const [downvotes, updateDownvotes] = React.useState(dislikes);
    const [likeCount, updateLikeCount] = React.useState(upvotes.length - downvotes.length);

    React.useEffect(() => {
        updateLikeCount(upvotes.length - downvotes.length);
    }, [upvotes, downvotes]);


    async function upvote() {
        //update database
        //display change
        if (!username) {
            toast.error("Login to vote!", {
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

        const response = await fetch(`api/posts/${_id}/like`, {
            method: 'post',
            body: JSON.stringify({username: username}),
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
            },
          });
          const j = await response.json();


          if (response?.status === 200) {
            console.log(`api/post/${j._id}`);
            const response2 = await fetch(`api/post/${j._id}`);
            const updatedPost = await response2.json();
            websocket.broadcastVote(updatedPost['likes'], updatedPost['dislikes'], _id);
          } else {
            console.log('Oops')
          }
    }

    async function downvote() {
        if (!username) {
            toast.error("Login to vote!", {
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

        const response = await fetch(`api/posts/${_id}/dislike`, {
            method: 'post',
            body: JSON.stringify({username: username}),
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
            },
          });

          if (response?.status === 200) {
            const j = await response.json();
            const response2 = await fetch(`api/post/${j._id}`);
            const updatedPost = await response2.json();
            websocket.broadcastVote(updatedPost['likes'], updatedPost['dislikes'], _id);
          } else {
            console.log('Oops')
          }
    }

    const formatVoteCount = (u, d) => {
        return u.length - d.length;
    }

    //websocket
    React.useEffect(() => {
        websocket.addHandler(handleNewVote);
    
        return () => {
          websocket.removeHandler(handleNewVote);
        };
      });
    
      function handleNewVote(event) {
        if (event.type === 'vote' && event.postId === _id) {
            console.log('votes.jsx', event)
            updateUpvotes(event['upvotes'])
            updateDownvotes(event['downvotes']);
        }
        
      }
    
    return (
        <div className="vote">
            <img className="vote-icon" id="upvote" src="upvote.svg" alt="upvote" onClick={() => upvote()}/>
            <img className="vote-icon" id="downvote" src="downvote.svg" alt="downvote" onClick={() => downvote()}/>
            <h2 id="vote-display">{likeCount}</h2> {/* Placeholder for displaying vote count */}
        </div>
        //
    );
}