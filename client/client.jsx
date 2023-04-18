const React = require('react');
const ReactDOM = require('react-dom');

const root = document.querySelector('#content');
let socket;

function CredentialsPage() {
    const errorBox = React.useRef(null);
    async function post(e, url, code) {
        e.preventDefault()
        const user = e.target.querySelector('input[type="text"]').value;
        const pass = e.target.querySelector('input[type="password"]').value;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });
        res.status === code ? ReactDOM.render(<HubPage />, root) : errorBox.current.innerHTML = res.error;
        return false
    }
    return (
        <>
            <h1>Credentials Page</h1>
            <h2>Login</h2>
            <form id="login" onSubmit={(e) => post(e, "/login", 204)}>
                <input type="text" placeholder="Username" required/>
                <input type="password" placeholder="Password" required/>
                <input type="submit" value="Login" />
            </form>
            <h2>Sign Up</h2>
            <form id="signup" onSubmit={(e) => {
                const pass = e.target.querySelector("#pass").value
                const passConfirm = e.target.querySelector("#passConfirm").value
                pass === passConfirm ? post(e, "/signup", 201) : errorBox.current.innerHTML = "Passwords do not match"
            }}>
                <input type="text" placeholder="Username" required/>
                <input id="pass" type="password" placeholder="Password" required/>
                <input id="passConfirm" type="password" placeholder="Retype Password" required/>
                <input type="submit" value="Sign Up" />
            </form>
            <h2>Errors</h2>
            <p ref={errorBox}></p>
        </>
    );
}

function HubPage() {
    socket = io();
    return (
        <>
            <h1>Hub Page</h1>
            <a href="/logout">Logout</a>
            <h1>Join Room</h1>
            <form onSubmit={(e) => {
                e.preventDefault();
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
            image.setAttribute('style', 'display:none');
            image.setAttribute('alt', 'script div');
            image.setAttribute("src", drawing);
            ctx.drawImage(image, 0, 0, image.width, image.height);
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
    const res = await fetch('/session', { method: 'HEAD' })
    res.status === 204 ? ReactDOM.render(<HubPage />, root) : ReactDOM.render(<CredentialsPage/>, root)
}