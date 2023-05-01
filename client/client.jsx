const React = require('react')

import { createRoot } from 'react-dom/client'

import Credentials from './pages/Credentials.jsx'
import Hub from './pages/Hub.jsx'
import Account from './pages/Account.jsx'
import Judge from './pages/Judge.jsx'
import Draw from './pages/Draw.jsx'
import Leaderboard from './pages/Leaderboard.jsx'

const domNode = document.querySelector('#root')
const root = createRoot(domNode)
const socket = io()
// data-acc attribute was JSON.stringified (look at app.get('/') handler in app.js)
const acc = JSON.parse(domNode.dataset.acc)
acc.socket = socket

acc.user ? root.render(<Index init={'hub'} />) : root.render(<Index />)

function Index({ init = 'creds' }) {
    const [page, setPage] = React.useState(init)
    console.log(acc)
    switch (page) {
        case 'creds': return (<Credentials setPage={setPage} acc={acc} />)
        case 'hub': return (<Hub setPage={setPage} acc={acc} />)
        case 'acc': return (<Account setPage={setPage} acc={acc} />)
        case 'judge': return (<Judge setPage={setPage} acc={acc} />)
        case 'draw': return (<Draw setPage={setPage} acc={acc} />)
        case 'board': return (<Leaderboard setPage={setPage} />)
    }
}