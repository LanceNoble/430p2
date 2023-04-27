const React = require('react')

export default function Draw({ setPage, roomName, playerType, socket }) {
    React.useEffect(async () => {
        const res = await fetch('/session', { method: 'GET' })
        const acc = await res.json()
        const cvs = document.querySelector('canvas')
        const ctx = cvs.getContext('2d')
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        if (acc.premium) {
            const div = document.querySelector('div')
            const changeColor = document.createElement('button')
            div.appendChild(changeColor)
            changeColor.onclick = () => {
                ctx.strokeStyle = 'blue'
            }
        }
        let cvsPos = cvs.getBoundingClientRect()
        let cvsMousePos
        let drawing
        function getCVSMousePos(e) {
            const x = e.pageX - (cvsPos.x + window.scrollX)
            const y = e.pageY - (cvsPos.y + window.scrollY)
            return { x, y }
        }
        window.addEventListener('resize', () => cvsPos = cvs.getBoundingClientRect())
        cvs.addEventListener('mousemove', (e) => {
            if (drawing) {
                cvsMousePos = getCVSMousePos(e)
                ctx.lineTo(cvsMousePos.x, cvsMousePos.y)
                ctx.stroke()
                socket.emit('draw', roomName, cvsMousePos)
            }
        })
        cvs.addEventListener('mousedown', (e) => {
            drawing = true
            ctx.beginPath()
            cvsMousePos = getCVSMousePos(e)
            ctx.moveTo(cvsMousePos.x, cvsMousePos.y)
            socket.emit('draw start', roomName, playerType, cvsMousePos)
        })
        cvs.addEventListener('mouseup', () => drawing = false)
        cvs.addEventListener('mouseleave', () => drawing = false)
    })
    return (
        <>
            <h1>You are {playerType} in Room '{roomName}'</h1>
            <canvas width='500' height='500'></canvas>
            <div></div>
            <button onClick={async (e) => {
                e.preventDefault()
                socket.emit('room leave', roomName)
                setPage('hub')
                return false
            }} type='button'>Leave</button>
        </>
    )
}