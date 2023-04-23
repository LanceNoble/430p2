const React = require('react');

export default function Draw({ setPage, room, player, socket }) {
    React.useEffect(() => {
        socket.emit("room join", room);
        const cvs = document.querySelector("canvas");
        const ctx = cvs.getContext("2d");
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        let cvsPos = cvs.getBoundingClientRect();
        let cvsMousePos;
        let drawing;
        function getCVSMousePos(e) {
            const x = e.pageX - (cvsPos.x + window.scrollX);
            const y = e.pageY - (cvsPos.y + window.scrollY);
            return {x, y};
        }
        window.addEventListener('resize', () => cvsPos = cvs.getBoundingClientRect());
        cvs.addEventListener("mousemove", (e) => {
            if (drawing) {
                cvsMousePos = getCVSMousePos(e);
                ctx.lineTo(cvsMousePos.x, cvsMousePos.y);
                ctx.stroke();
                socket.emit('draw', room, cvsMousePos );
            }
        });
        cvs.addEventListener("mousedown", (e) => {
            drawing = true;
            ctx.beginPath();
            cvsMousePos = getCVSMousePos(e);
            ctx.moveTo(cvsMousePos.x, cvsMousePos.y);
            socket.emit('draw start', room, player, cvsMousePos );
        });
        cvs.addEventListener("mouseup", () => drawing = false);
        cvs.addEventListener("mouseleave", () => drawing = false);
    })
    return (
        <>
            <h1>You are Drawer {player} in Room "{room}"</h1>
            <canvas width="500" height="500"></canvas>
            <button onClick={async (e) => {
                e.preventDefault();
                socket.emit('room leave', room);
                setPage("hub");
                return false;
            }} type="button">Leave</button>
        </>
    );
}