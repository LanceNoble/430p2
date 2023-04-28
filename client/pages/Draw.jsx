const React = require('react')

export default function Draw({ setPage, roomName, playerType, socket, premium }) {
    React.useEffect(() => {
        const cvs = document.querySelector('canvas')
        const ctx = cvs.getContext('2d')
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        if (premium) {
            const div = document.querySelector('div')
            const changeColor = document.createElement('button')
            changeColor.innerHTML = `Change Color`
            div.appendChild(changeColor)
            changeColor.onclick = () => {
                ctx.strokeStyle = 'blue'
            }
        }
        let drawing
        cvs.addEventListener('mousemove', (e) => {
            if (drawing) {
                const cvsPos = cvs.getBoundingClientRect()
                const x = e.pageX - (cvsPos.x + window.scrollX)
                const y = e.pageY - (cvsPos.y + window.scrollY)
                const lastX = x - e.movementX
                const lastY = y - e.movementY
                ctx.moveTo(lastX, lastY)
                ctx.lineTo(x, y)
                ctx.stroke()
                socket.emit('draw', roomName, x, y, lastX, lastY, playerType, ctx.strokeStyle)
            }
        })
        cvs.addEventListener('mousedown', (e) => drawing = true)
        cvs.addEventListener('mouseup', () => drawing = false)
        cvs.addEventListener('mouseleave', () => drawing = false)
    })
    return (
        <>
            <h1>You are {playerType} in Room '{roomName}'</h1>
            <canvas width='500' height='500'></canvas>
            <div></div>
            <button onClick={(e) => {
                e.preventDefault()
                socket.emit('room leave', roomName)
                setPage('hub')
                return false
            }}>Leave</button>
        </>
    )
}