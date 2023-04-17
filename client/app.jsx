const React = require('react');
const ReactDOM = require('react-dom');

const root = document.querySelector('#content');
let socket;


function CredentialsPage() {
    return (
        <>
            <h1>Login</h1>
            <form id="loginForm"
                name="loginForm"
                onSubmit={async (e) => {
                    e.preventDefault();
                    const url = e.target.getAttribute('action');
                    const httpMethod = e.target.getAttribute('method');
                    const user = e.target.querySelector('#user').value;
                    const pass = e.target.querySelector('#pass').value;
                    const res = await fetch(url, {
                        method: httpMethod,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user, pass })
                    });
                    res.status === 200 ? ReactDOM.render(<HubPage />, root) : console.log("login failed");    
                    return false;
                }}
                action="/login"
                method="POST"
                className="mainForm">
                <label htmlFor="user">Username: </label>
                <input id="user" type="text" name="user" placeholder="username" />
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="password" />
                <input className="formSubmit" type="submit" value="Login" />
            </form>
            <h1>Sign Up</h1>
            <form id="signupForm"
                name="signupForm"
                onSubmit={async (e) => {
                    e.preventDefault();
                    const url = e.target.getAttribute('action');
                    const httpMethod = e.target.getAttribute('method');
                    const user = e.target.querySelector('#newUser').value;
                    const pass = e.target.querySelector('#newPass').value;
                    const pass2 = e.target.querySelector('#newPass2').value;
                    if (pass !== pass2 || !user || !pass || !pass2) {
                        console.log("signup failed");
                    }
                    else {
                        const res = await fetch(url, {
                            method: httpMethod,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user, pass })
                        });
                        res.status === 201 ? ReactDOM.render(<HubPage />, root) : console.log("signup failed");    
                    }
                    return false;
                }}
                action="/signup"
                method="POST"
                className="mainForm">
                <label htmlFor="newUser">Username: </label>
                <input id="newUser" type="text" name="username" placeholder="username" />
                <label htmlFor="newPass">Password: </label>
                <input id="newPass" type="password" name="pass" placeholder="password" />
                <label htmlFor="newPass2">Password: </label>
                <input id="newPass2" type="password" name="pass2" placeholder="retype password" />
                <input className="formSubmit" type="submit" value="Sign up" />
            </form>
        </>
    );
}

function HubPage() {
    return (
        <>
            <h1>Hub Page</h1>
            <a href="/logout">Logout</a>
            <h1>Join Room</h1>
            <form onSubmit={(e) => {
                const roomName = e.target.querySelector("#roomName").value;
                socket = io();
            }}>
                <label htmlFor="roomName">Room Name: </label>
                <input id="roomName" type="text"></input>
                <input type="submit" value="Join Room"></input>
            </form>
            <h1>Create Room</h1>
            <form onSubmit={(e) => {
                const roomName = e.target.querySelector("#roomName").value;
                socket = io();
            }}>
                <label htmlFor="newRoomName">New Room Name: </label>
                <input id="newRoomName" type="text"></input>
                <input type="submit" value="Create Room"></input>
            </form>
        </>
    );
}

/*function GamePage() {
    return (
        <button></button>
    );
}*/

window.onload = async () => {
    const res = await fetch('/session', {method: 'HEAD'});
    res.status === 200 ? ReactDOM.render(<HubPage/>, root) : ReactDOM.render(<CredentialsPage/>, root);
};