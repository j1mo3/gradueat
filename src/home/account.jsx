import React from 'react';
import './home.css';

export function Account({username, notSignedIn, handleSignIn, handleSignOut, schools}) {
    const [loginName, updateLoginName] = React.useState('LOGIN');
    const [signUpName, updateSignUpName] = React.useState('SIGN UP');
    const [showLoginForm, setShowLoginForm] = React.useState(false);
    const [showSignUpForm, setShowSignUpForm] = React.useState(false);

    const [loginError, updateLoginError] = React.useState('');
    const [signUpError, updateSignUpError] = React.useState('');

    const [loginUsername, updateLoginUsername] = React.useState('');
    const [loginPassword, updateLoginPassword] = React.useState('');
    const [signUpUsername, updateSignUpUsername] = React.useState('');
    const [signUpPassword, updateSignUpPassword] = React.useState('');

    const [selectedSchool, setSelectedSchool] = React.useState(schools[0]);

    // const [username, updateUsername] = React.useState(localStorage.getItem('username'));
    // const [notSignedIn, updateSignIn] = React.useState(!Boolean(username));

    async function loginClick() {
        if (!showLoginForm) {
            updateLoginName('LOG IN');
            updateSignUpName('SIGN UP')
            setShowLoginForm(true);
            setShowSignUpForm(false); // Hide sign-up form
        } else {
            //login database
            await signIn();
        }
    }

    async function signUpClick() {
        if (!showSignUpForm) {
            updateSignUpName('CREATE ACCOUNT');
            updateLoginName('LOGIN');
            setShowSignUpForm(true);
            setShowLoginForm(false);
        } else {
            //login database
            updateLoginError('');
            updateSignUpError('');
            await signUp();
        }
        
    }

    async function signIn() {
        let creds = {username: loginUsername, password: loginPassword};
        if (!loginUsername || !loginPassword) {
            updateLoginError(`Missing username or password`);
            return false;
        }
    
        const response = await fetch('api/auth/login', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(creds)
        });
        
        if (response.ok) {
            // localStorage.setItem("username", loginUsername);
            // updateUsername(loginUsername);
            // updateSignIn(false);
            updateLoginError('');
            updateSignUpError('');
            handleSignIn(loginUsername)
        } else {
            updateLoginError(`Invalid username or password`);
        }
    }
    
    async function signUp() {
        let creds = {username: signUpUsername, password: signUpPassword, school: selectedSchool};
        if (!signUpUsername || !signUpPassword) {
            updateSignUpError(`Missing username or password`);
            return false;
        }
        if (signUpPassword.length < 5) {
            updateSignUpError(`Password must be at least 5 characters`);
            return false;
        }
    
        const response = await fetch('api/user', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(creds)
        });
    
        if (response.ok) {
            // localStorage.setItem("username", signUpUsername);
            // updateUsername(signUpUsername);
            // updateSignIn(false);
            handleSignIn(signUpUsername);
        } else {
            updateSignUpError(`'${signUpUsername}' already exists`);
        }
    }

    function signOut() {
        // localStorage.setItem("username", '');
        // updateSignIn(true);
        handleSignOut()
    }

    return (
        
        <div>
            {notSignedIn && (
                <div className="account-creation">
                    <h5 id="welcome-msg">Log in to post!</h5>
                    {showLoginForm && (
                        <div>
                            <input type="text" placeholder="Username" onChange={(e) => updateLoginUsername(e.target.value)}/>
                            <input type="password" placeholder="Password" onChange={(e) => updateLoginPassword(e.target.value)}/>
                            <h5 className="error-msg">{loginError}</h5>
                        </div>
                    )}
                    
                    <button className="accent-button" onClick={loginClick}>{loginName}</button>

                    {showSignUpForm && (
                        <div>
                            <input type="text" placeholder="Create Username" onChange={(e) => updateSignUpUsername(e.target.value)}/>
                            <input type="password" placeholder="Create Password" onChange={(e) => updateSignUpPassword(e.target.value)}/>
                            <select id="school-select" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                                {schools.map((school, index) => (
                                    <option key={index} value={school}>{school}</option>
                                ))}
                            </select>
                            <h5 className="error-msg">{signUpError}</h5>
                        </div>
                    )}
                    
                    <button className="solid-button" onClick={signUpClick}>{signUpName}</button>
                </div>
            )}

            {!notSignedIn && (
                <div className="post-creation">
                    <h5 id="welcome-msg">Welcome {username}</h5>
                    <button className="accent-button" onClick={signOut}>SIGN OUT</button>
                </div>
            )}
            <h6 id="mission-statement">Gradueat is your go-to online platform for discovering free food available on your campus.</h6>
            <hr></hr>
        </div>
    );
}