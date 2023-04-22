const React = require('react');

export default function Draw({ gameContext, setPage }) {
    const game = React.useContext(gameContext);
    React.useEffect(() => {
        // Reusing drawing code from pooxle project (with slight tweaks)
        const cvs = document.querySelector("canvas");
        const ctx = cvs.getContext("2d");
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        let cvsPos = cvs.getBoundingClientRect();
        let cvsMousePos;
        let isDrawing;
        function getCVSMousePos(e) {
            const x = e.pageX - (cvsPos.x + window.scrollX);
            const y = e.pageY - (cvsPos.y + window.scrollY);
            return {x, y};
        }
        window.addEventListener('resize', () => cvsPos = cvs.getBoundingClientRect());
        cvs.addEventListener("mousemove", (e) => {
            if (isDrawing) {
                cvsMousePos = getCVSMousePos(e);
                ctx.lineTo(cvsMousePos.x, cvsMousePos.y);
                ctx.stroke();
                game.socket.emit('draw', { room: game.room, num: game.player, src: cvs.toDataURL() });
            }
        });
        cvs.addEventListener("mousedown", (e) => {
            isDrawing = true;
            ctx.beginPath();
            cvsMousePos = getCVSMousePos(e);
            ctx.moveTo(cvsMousePos.x, cvsMousePos.y);
        });
        cvs.addEventListener("mouseup", () => isDrawing = false);
        cvs.addEventListener("mouseleave", () => isDrawing = false);
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