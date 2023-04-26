const React = require('react')

export default function Judge({ setPage, roomName, playerType, socket }) {
    React.useEffect(() => {
        const drawer1CVS = document.querySelector('#drawer1')
        const drawer1CTX = drawer1CVS.getContext('2d')
        drawer1CTX.strokeStyle = 'black'
        drawer1CTX.lineWidth = 5
        drawer1CTX.lineCap = 'round'

        const drawer2CVS = document.querySelector('#drawer2')
        const drawer2CTX = drawer2CVS.getContext('2d')
        drawer2CTX.strokeStyle = 'black'
        drawer2CTX.lineWidth = 5
        drawer2CTX.lineCap = 'round'

        let activeCTX

        socket.on('draw start', (playerType, cvsMousePos) => {
            playerType === 'Drawer 1' ? activeCTX = drawer1CTX : activeCTX = drawer2CTX
            activeCTX.beginPath()
            activeCTX.moveTo(cvsMousePos.x, cvsMousePos.y)
        })

        socket.on('draw', (cvsMousePos) => {
            activeCTX.lineTo(cvsMousePos.x, cvsMousePos.y)
            activeCTX.stroke()
        })
    })
    return (
        <>
            <h1>You are the {playerType} in Room '{roomName}'</h1>
            <canvas id='drawer1' width='500' height='500'></canvas>
            <canvas id='drawer2' width='500' height='500'></canvas>
            <button onClick={async (e) => {
                e.preventDefault()
                socket.emit('room leave', roomName)
                setPage('hub')
                return false
            }} type='button'>Leave</button>
        </>
    )
}