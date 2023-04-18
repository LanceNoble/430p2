const React = require('react');
const ReactDOM = require('react-dom');
import { useEffect } from 'react';

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
                e.preventDefault();
                socket = io();
                const roomName = e.target.querySelector("#roomName").value;
                //socket.emit('join room', roomName);
                
                ReactDOM.render(<GamePage />, root);
                return false;
            }}>
                <label htmlFor="roomName">Room Name: </label>
                <input id="roomName" type="text"></input>
                <input type="submit" value="Join Room"></input>
            </form>
            <h1>Create Room</h1>
            <form onSubmit={(e) => {
                /*socket = io();
                const roomName = e.target.querySelector("#roomName").value;
                socket.emit('create room', roomName);
                return false;*/
            }}>
                <label htmlFor="newRoomName">New Room Name: </label>
                <input id="newRoomName" type="text"></input>
                <input type="submit" value="Create Room"></input>
            </form>
        </>
    );
}

function GamePage() {
    //https://daveceddia.com/react-hook-after-render/
    useEffect(() => {
        /* //https://stackoverflow.com/questions/26212792/convert-an-image-to-canvas-that-is-already-loaded
         let image = document.createElement('img');
         document.body.appendChild(image);
         image.setAttribute('style','display:none');
         image.setAttribute('alt','script div');
         image.setAttribute("src", drawing);
         ctx.drawImage(image,0,0,image.width,image.height);
         document.body.removeChild(image);
        socket.emit('drawing', image);*/
        // Setup canvas
        const cvs = document.querySelector("canvas");
        // Please try making the pixel size a proper divisor of the canvas
        const pixelSize = 20;
        const ctx = cvs.getContext("2d");
        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 0.125;
        // Make grid lines so user can anticipate where their pixel is being placed
        for (let i = 0; i < cvs.height / pixelSize; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * pixelSize);
            ctx.lineTo(cvs.width, i * pixelSize);
            ctx.closePath();
            ctx.stroke();
        }
        for (let i = 0; i < cvs.width / pixelSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * pixelSize, 0);
            ctx.lineTo(i * pixelSize, cvs.height);
            ctx.closePath();
            ctx.stroke();
        }
        // BORROWED CODE
        // workaround for events only firing once
        // simulates them firing multiple times
        // let's user continuously draw while holding down mouse button
        // instead of having to click everytime to place a pixel
        // https://stackoverflow.com/questions/41304737/why-onmousedown-event-occur-once-how-to-handle-mouse-hold-event
        let pixelX;
        let pixelY;
        let timer;
        cvs.addEventListener("mousemove", (e) => {
            // put canvas coords in global space
            const cvsPos = cvs.getBoundingClientRect();
            const cvsX = cvsPos.x;
            const cvsY = cvsPos.y;
            const canXAbs = cvsX + window.scrollX;
            const canYAbs = cvsY + window.scrollY;
            // put mouse coords relative to canvas space
            const cvsMouseX = e.pageX - canXAbs;
            const cvsMouseY = e.pageY - canYAbs;
            // Math.trunc ensures that pixel doesn't take up multiple gridboxes 
            // especially in the event of a pixel size that is not a proper divisor of the canvas dimensions
            pixelX = pixelSize * Math.trunc(cvsMouseX / pixelSize);
            pixelY = pixelSize * Math.trunc(cvsMouseY / pixelSize);
        });
        cvs.addEventListener("mousedown", () => {
            timer = setInterval(() => {
                ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
                socket.emit('drawing', cvs.toDataURL("image/png"));
            });
        });
        function mouseDone() {
            clearInterval(timer);
        }
        cvs.addEventListener("mouseup", mouseDone);
        cvs.addEventListener("mouseleave", mouseDone);
        // END OF BORROWED CODE
        socket.on('drawing', (drawing) => {
            //https://stackoverflow.com/questions/26212792/convert-an-image-to-canvas-that-is-already-loaded
            let image = document.createElement('img');
            document.body.appendChild(image);
            image.setAttribute('style','display:none');
            image.setAttribute('alt','script div');
            image.setAttribute("src", drawing);
            ctx.drawImage(image,0,0,image.width,image.height);
            document.body.removeChild(image);
        })
    });
    return (
        <>
            <canvas width="500" height="500"></canvas>
        </>
    );
}

window.onload = async () => {
    const res = await fetch('/session', { method: 'HEAD' });
    res.status === 200 ? ReactDOM.render(<HubPage />, root) : ReactDOM.render(<CredentialsPage />, root);

};