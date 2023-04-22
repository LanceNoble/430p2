const React = require('react');

export default function Judge({ gameContext, setPage }) {
    const game = React.useContext(gameContext);
    const drawer1Canvas = React.useRef(null);
    const drawer2Canvas = React.useRef(null);
    React.useEffect(() => {
        const drawer1CTX = drawer1Canvas.current.getContext('2d');
        drawer1CTX.strokeStyle = "black";
        drawer1CTX.lineWidth = 5;
        drawer1CTX.lineCap = 'round';

        const drawer2CTX = drawer2Canvas.current.getContext('2d');
        drawer2CTX.strokeStyle = "black";
        drawer2CTX.lineWidth = 5;
        drawer2CTX.lineCap = 'round';

        let activeCTX;

        game.socket.on('draw start', (player, cvsMousePos) => {
            player === "0" ? activeCTX = drawer1CTX : activeCTX = drawer2CTX;
            activeCTX.beginPath();
            activeCTX.moveTo(cvsMousePos.x, cvsMousePos.y);
        });

        game.socket.on('draw', (cvsMousePos) => {
            activeCTX.lineTo(cvsMousePos.x, cvsMousePos.y);
            activeCTX.stroke();
        });
    })
    return (
        <>
            <h1>You are the Judge in Room "{game.room}"</h1>
            <canvas ref={drawer1Canvas} width="500" height="500"></canvas>
            <canvas ref={drawer2Canvas} width="500" height="500"></canvas>
            <button onClick={async (e) => {
                e.preventDefault();
                game.socket.emit('room leave', game.room);
                await fetch('/session', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ room: "", player: "-1"}),
                });
                setPage("hub");
                return false;
            }} type="button">Leave Game</button>
        </>
    )
}