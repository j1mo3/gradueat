import React from 'react';
import './home.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { websocket } from './websocket';

export function CreatePost({username}) {
    //const [username, updateUsername] = React.useState(localStorage.getItem('username'));
    const [school, updateSchool] = React.useState('');

    const [food, updateFood] = React.useState('');
    const [sponsor, updateSponsor] = React.useState('');
    const [date, updateDate] = React.useState('');
    const [startTime, updateStartTime] = React.useState('');
    const [endTime, updateEndTime] = React.useState('');
    const [location, updateLocation] = React.useState('');

    const [secondLineVisible, updateSecondLineVisibility] = React.useState(false);

    // Update secondLineVisible when food or sponsor changes
    React.useEffect(() => {
        updateSecondLineVisibility(food || sponsor);
    }, [food, sponsor]);

    React.useEffect(() => {
        if (username) {
            fetch(`/api/user/${username}`)
            .then((response) => response.json())
            .then((data) => {
                updateSchool(data['school']);
            })
            .catch(error => console.error('Error fetching posts:', error));
        } 
    }, []);

    async function createPost() {
        if (!food || !location || !date || !startTime || !endTime) {
            toast.error("Missing fields!", {
                position: "top-right",
                autoClose: 2000, // milliseconds until the toast automatically closes
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return false;
        }
        let postInformation = {
            createdBy: username,
            school: school,
            food: food,
            sponsor: sponsor,
            location: location,
            date: date,
            startTime: startTime,
            endTime: endTime,
            likes: [],
            dislikes: [],
            reports: [],
        };
    
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(postInformation)
        });
        let p = await response.json();
        const broadcastedPost = p['post'];
    
        if (response.ok) {
            console.log('Created!');
            toast.success("Post created", {
                position: "top-right",
                autoClose: 2000, // milliseconds until the toast automatically closes
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            clearPostFields();
            websocket.broadcastPost(broadcastedPost);
        } else {
            console.log('Created!');
            toast.error("Unable to post!", {
                position: "top-right",
                autoClose: 2000, // milliseconds until the toast automatically closes
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            console.log('An error occured creating a post');
        }
    }

    function clearPostFields() {
        console.log('Clearing');
        updateFood('');
        updateSponsor('');
        updateDate('');
        updateStartTime('');
        updateEndTime('');
        updateLocation('');
    }

    return (
        <div>
            <ToastContainer />
        {username && (
            <div className="create-post">
                <div id="create-post-first-line">
                    <input type="text" className="create-post-input" id="enter-food" placeholder="New Food Item" maxLength="60" value={food} onChange={(e) => updateFood(e.target.value)}/>
                    <input type="text" className="create-post-input" id="enter-sponsor" placeholder="Sponsor" maxLength="60" value={sponsor} onChange={(e) => updateSponsor(e.target.value)}/>
                </div>
            
                {secondLineVisible && (
                <div id='next-lines'>
                    <div id="create-post-second-line">
                        <div className="create-post-input-container">
                            <label htmlFor="enter-date" className="create-post-label">Date</label>
                            <input type="date" className="create-post-input" id="enter-date" placeholder="Date" value={date} onChange={(e) => updateDate(e.target.value)}/>
                        </div>
                
                        <div className="create-post-input-container">
                            <label htmlFor="enter-start-time" className="create-post-label">Start Time</label>
                            <input type="time" className="create-post-input" id="enter-start-time" placeholder="Start" value={startTime} onChange={(e) => updateStartTime(e.target.value)}/>
                        </div>
                
                        <div className="create-post-input-container">
                            <label htmlFor="enter-end-time" className="create-post-label">End Time</label>
                            <input type="time" className="create-post-input" id="enter-end-time" placeholder="End" value={endTime} onChange={(e) => updateEndTime(e.target.value)}/>
                        </div>
                    </div>
                    <div>
                        <div className="create-post-input-container">
                            <input type="location" className="create-post-input" id="enter-location" placeholder="Location" maxLength="60" value={location} onChange={(e) => updateLocation(e.target.value)}/>
                            <button type="submit" id="create-post-button" onClick={createPost}>SUBMIT</button>
                        </div>  
                    </div>
                </div>
                )}
            </div>
        )}
        </div>    
    );
}