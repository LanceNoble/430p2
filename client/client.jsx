const React = require('react');

import { createRoot } from 'react-dom/client';

import Credentials from './pages/Credentials.jsx';
import Draw from './pages/Draw.jsx';
import Hub from './pages/Hub.jsx';
import Judge from './pages/Judge.jsx';
import NotFound from './pages/NotFound.jsx';

let socket = io();

const domNode = document.querySelector("#root");
const root = createRoot(domNode);

function Index({ init }) {
    const [page, setPage] = React.useState(init);
    const roomRef = React.useRef(null);
    const playerRef = React.useRef(null);

    switch (page) {
        case "creds": return (<Credentials setPage={setPage} />);
        case "hub" : return (<Hub setPage={setPage} roomRef={roomRef} playerRef={playerRef} />);
        case "draw": return (<Draw setPage={setPage} room={roomRef.current} player={playerRef.current} socket={socket} />);
        case "judge": return (<Judge setPage={setPage} room={roomRef.current} socket={socket}/>);
        default: return (<NotFound setPage={setPage} />);
    }
}

window.onload = async () => {
    const res = await fetch('/session', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
    });
    res.status === 404 ? root.render(<Index init={"creds"} />) : root.render(<Index init={"hub"} />)
}