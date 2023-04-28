const React = require('react')

export default function Judge({ setPage, roomName, socket }) {
    React.useEffect(() => {
        const drawer1CVS = document.querySelector('#drawer1')
        const drawer1CTX = drawer1CVS.getContext('2d')
        drawer1CTX.lineWidth = 5
        drawer1CTX.lineCap = 'round'

        const drawer2CVS = document.querySelector('#drawer2')
        const drawer2CTX = drawer2CVS.getContext('2d')
        drawer2CTX.lineWidth = 5
        drawer2CTX.lineCap = 'round'

        socket.on('draw', (x, y, lastX, lastY, playerType, strokeStyle) => {
            let activeCTX
            playerType === 'Drawer 1' ? activeCTX = drawer1CTX : activeCTX = drawer2CTX
            activeCTX.strokeStyle = strokeStyle
            activeCTX.moveTo(lastX, lastY)
            activeCTX.lineTo(x, y)
            activeCTX.stroke()
        })
    })
    return (
        <>
            <h1>You are a Judge in Room '{roomName}'</h1>
            <canvas id='drawer1' width='500' height='500'></canvas>
            <button id="voteDrawer1" onClick={async (e) => {
                await fetch('/account', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ winIncrement: 1 }),
                })
            }}>Vote Drawer 1</button>
            <canvas id='drawer2' width='500' height='500'></canvas>
            <button id="voteDrawer2" onClick={async (e) => {

            }}>Vote Drawer 2</button>
            <button onClick={async (e) => {
                e.preventDefault()
                socket.emit('room leave', roomName)
                setPage('hub')
                return false
            }} type='button'>Leave</button>
        </>
    )
}