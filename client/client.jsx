const React = require('react');

import { createRoot } from 'react-dom/client';

import Credentials from './pages/Credentials.jsx';
import Draw from './pages/Draw.jsx';
import Hub from './pages/Hub.jsx';
import Judge from './pages/Judge.jsx';
import NotFound from './pages/NotFound.jsx';

const domNode = document.querySelector("#root");
const root = createRoot(domNode);

const socket = io();

function Index({ init, room = "", player = -1, socket }) {
    const [page, setPage] = React.useState(init);
    const [gameContextValue, setGameContextValue] = React.useState({ room, player, socket });
    const gameContext = React.createContext(gameContextValue);
    switch (page) {
        case "creds": return (<Credentials setPage={setPage} />);
        case "hub": return (<Hub setPage={setPage} setGameContextValue={setGameContextValue} />);
        case "draw": return (<gameContext.Provider value={gameContextValue}><Draw setPage={setPage} gameContext={gameContext} /></gameContext.Provider>);
        case "judge": return (<gameContext.Provider value={gameContextValue}><Judge setPage={setPage} gameContext={gameContext} /></gameContext.Provider>);
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