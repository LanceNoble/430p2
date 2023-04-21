const React = require('react');

export default function Judge({ gameContext }) {
    console.log(gameContext);
    const game = React.useContext(gameContext);

    const p0 = React.useRef(null)
    const p1 = React.useRef(null)
    React.useEffect(() => {
        // Instead of pasting an entire giant image every time, try just mimicing the drawing action bit by bit
        // https://wesbos.com/html5-canvas-websockets-nodejs
        game.socket.on('draw', (p) => p.num === "0" ? p0.current.setAttribute("src", p.src) : p1.current.setAttribute("src", p.src))
    })
    return (
        <>
            <h1>Judge Page</h1>
            <img id="p0" ref={p0} />
            <img id="p1" ref={p1} />
        </>
    )
}