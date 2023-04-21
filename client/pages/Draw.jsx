const React = require('react');

export default function Draw({ gameContext, setPage }) {
    const game = React.useContext(gameContext);
    React.useEffect(() => {
        // Reusing drawing code from pooxle project (with slight tweaks)
        const cvs = document.querySelector("canvas");
        const ctx = cvs.getContext("2d");
        ctx.strokeStyle = "black";
        let radius = 5;
        let x;
        let y;
        let timer;
        let req;
        function paint() {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
            game.socket.emit('draw', { room: game.room, num: game.player, src: cvs.toDataURL() });
            req = window.requestAnimationFrame(paint);
        }
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
            req = window.requestAnimationFrame(paint);
            /*timer = setInterval(() => {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fill();
                game.socket.emit('draw', { room: game.room, num: game.player, src: cvs.toDataURL() });
            });*/
        });
        function mouseDone() {
            //clearInterval(timer);
            window.cancelAnimationFrame(req);
        }
        cvs.addEventListener("mouseup", mouseDone);
        cvs.addEventListener("mouseleave", mouseDone);
    })
    return (
        <>
            <h1>You are Drawer {game.player} in Room "{game.room}"</h1>
            <canvas width="500" height="500"></canvas>
            <button onClick={async (e) => {
                e.preventDefault();
                game.socket.emit('room leave', game.room);
                await fetch('/session', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ room: "", player: "-1" }),
                });
                setPage("hub");
                return false;
            }} type="button">Leave Game</button>
        </>
    );
}