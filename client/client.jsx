const React = require('react')

import { createRoot } from 'react-dom/client'

import Credentials from './pages/Credentials.jsx'
import Hub from './pages/Hub.jsx'
import Account from './pages/Account.jsx'
import Judge from './pages/Judge.jsx'
import Draw from './pages/Draw.jsx'
import NotFound from './pages/NotFound.jsx'

let socket = io()

const domNode = document.querySelector('#root')
const root = createRoot(domNode)

function Index({ init }) {
    const [page, setPage] = React.useState(init)
    const roomNameRef = React.useRef(null)
    const playerTypeRef = React.useRef(null)

    switch (page) {
        case 'creds': return (<Credentials setPage={setPage} />)
        case 'hub': return (<Hub setPage={setPage} roomNameRef={roomNameRef} playerTypeRef={playerTypeRef} socket={socket} />)
        case 'acc': return (<Account setPage={setPage} />)
        case 'judge': return (<Judge setPage={setPage} roomName={roomNameRef.current} playerType={playerTypeRef.current} socket={socket} />)
        case 'draw': return (<Draw setPage={setPage} roomName={roomNameRef.current} playerType={playerTypeRef.current} socket={socket} />)
        default: return (<NotFound setPage={setPage} />)
    }
}

window.onload = async () => {
    const res = await fetch('/session', { method: 'HEAD' })
    res.status === 404 ? root.render(<Index init={'creds'} />) : root.render(<Index init={'hub'} />)
}