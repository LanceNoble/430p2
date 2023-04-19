const React = require('react');
const ReactDOM = require('react-dom');

const root = document.querySelector('#content');
let socket;

function CredentialsPage() {
    const errorBox = React.useRef(null);
    return (
        <>
            <h1>Credentials Page</h1>
            <h2>Login</h2>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const user = e.target.querySelector('input[type="text"]').value;
                const pass = e.target.querySelector('input[type="password"]').value;
                const res = await fetch('/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user, pass }),
                });
                res.status === 204 ? ReactDOM.render(<HubPage />, root) : errorBox.current.innerHTML = res.error;
                return false;
            }}>
                <input type="text" placeholder="Username" required />
                <input type="password" placeholder="Password" required />
                <input type="submit" value="Login" />
            </form>
            <h2>Sign Up</h2>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const pass = e.target.querySelector("#pass").value
                const passConfirm = e.target.querySelector("#passConfirm").value
                if (pass === passConfirm) {
                    const user = e.target.querySelector('input[type="text"]').value;
                    const res = await fetch('/account', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user, pass }),
                    })
                    res.status === 201 ? ReactDOM.render(<HubPage />, root) : errorBox.current.innerHTML = res.error;
                }
                else {
                    errorBox.current.innerHTML = "Passwords do not match"
                }
                return false;
            }}>
                <input type="text" placeholder="Username" required />
                <input id="pass" type="password" placeholder="Password" required />
                <input id="passConfirm" type="password" placeholder="Retype Password" required />
                <input type="submit" value="Sign Up" />
            </form>
            <h2>Errors</h2>
            <p ref={errorBox}></p>
        </>
    );
}

function HubPage() {
    const roomList = React.useRef(null);
    React.useEffect(() => {
        socket.on('room create', (room) => {

        })
    })
    socket = io();
    return (
        <>
            <h1>Hub Page</h1>
            <button onClick={async (e) => {
                e.preventDefault();
                await fetch('/session', { method: 'DELETE' })
                ReactDOM.render(<CredentialsPage />, root)
                return false;
            }} type="button">Logout</button>
            <h2>Join Room</h2>
            <p>If the room doesn't exist, it will be created for you.</p>
            <form id="roomForm" onSubmit={async (e) => {
                e.preventDefault();
                const player = e.target.querySelector('select').value;
                const room = e.target.querySelector('input[type="text"]').value;
                await fetch('/session', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ player, room }),
                })
                socket.emit('room join', room);
                player === "2" ? ReactDOM.render(<JudgePage />, root) : ReactDOM.render(<DrawPage player={player} room={room} />, root)
                return false;
            }}>
                <input type="text" placeholder='Room Name' required></input>
                <select>
                    <option value="0" selected="selected">Drawer 1</option>
                    <option value="1">Drawer 2</option>
                    <option value="2">Judge</option>
                </select>
                <input type="submit" value="Join Room"></input>
            </form>
            <h2>Rooms</h2>
            <ul ref={roomList}>

            </ul>
            <h2>Errors</h2>
        </>
    );
}

function DrawPage({ player, room }) {
    React.useEffect(() => {
        console.log(room);
        // Reusing drawing code from pooxle project (with slight tweaks)
        const cvs = document.querySelector("canvas");
        const ctx = cvs.getContext("2d");
        ctx.strokeStyle = "black";
        let radius = 5;
        let x;
        let y;
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
            x = cvsMouseX;
            y = cvsMouseY;
        });
        cvs.addEventListener("mousedown", () => {
            timer = setInterval(() => {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fill();
                socket.emit(`player ${player} drawing`, { roomName: room, url: cvs.toDataURL("image/png") });
            });
        });
        function mouseDone() {
            clearInterval(timer);
        }
        cvs.addEventListener("mouseup", mouseDone);
        cvs.addEventListener("mouseleave", mouseDone);
    })
    return (
        <>
            <h1>Draw Page</h1>
            <canvas width="500" height="500"></canvas>
        </>
    );
}

function JudgePage() {
    React.useEffect(() => {
        socket.on('player 0 drawing', (drawing) => {
            document.querySelector("#p0").setAttribute("src", drawing);
        })
        socket.on('player 1 drawing', (drawing) => {
            document.querySelector("#p1").setAttribute("src", drawing);
        })
    })
    return (
        <>
            <h1>Judge Page</h1>
            <img id="p0" />
            <img id="p1" />
        </>
    )
}

window.onload = async () => {
    const res = await fetch('/session', { method: 'HEAD' })
    res.status === 204 ? ReactDOM.render(<HubPage />, root) : ReactDOM.render(<CredentialsPage />, root)
}