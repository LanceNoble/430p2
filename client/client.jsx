const React = require('react')

import { createRoot } from 'react-dom/client'

import Credentials from './pages/Credentials.jsx'
import Hub from './pages/Hub.jsx'
import Account from './pages/Account.jsx'
import Judge from './pages/Judge.jsx'
import Draw from './pages/Draw.jsx'

const domNode = document.querySelector('#root')
const root = createRoot(domNode)
const socket = io()

function Index({ init, premium }) {
    const roomNameRef = React.useRef(null)
    const playerTypeRef = React.useRef(null)
    const premiumRef = React.useRef(premium)

    const [page, setPage] = React.useState(init)

    switch (page) {
        case 'creds': return (<Credentials setPage={setPage} premiumRef={premiumRef}/>)
        case 'hub': return (<Hub setPage={setPage} roomNameRef={roomNameRef} playerTypeRef={playerTypeRef} socket={socket}/>)
        case 'acc': return (<Account setPage={setPage} premiumRef={premiumRef}/>)
        case 'judge': return (<Judge setPage={setPage} roomName={roomNameRef.current} socket={socket} />)
        case 'draw': return (<Draw setPage={setPage} roomName={roomNameRef.current} playerType={playerTypeRef.current} socket={socket} premium={premiumRef.current}/>)
    }
}

window.onload = async () => {
    const auth = domNode.getAttribute('data-auth')
    const premium = domNode.getAttribute('data-premium')
    auth ? root.render(<Index init={'hub'} premium={premium}/>) : root.render(<Index init={'creds'} premium={premium}/>)
}