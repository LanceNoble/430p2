const React = require('react')

export default function Draw({ setPage, acc }) {
    React.useEffect(() => {
        const cvs = document.querySelector('canvas')
        const ctx = cvs.getContext('2d')
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        if (acc.premium) {
            const div = document.querySelector('div')
            const changeColor = document.createElement('button')
            changeColor.innerHTML = `Change Color`
            div.appendChild(changeColor)
            changeColor.onClick = () => ctx.strokeStyle == 'blue' ? ctx.strokeStyle = 'black' : ctx.strokeStyle = 'blue'
        }
        let drawing
        cvs.addEventListener('mousemove', (e) => {
            if (drawing) {
                const cvsPos = cvs.getBoundingClientRect()
                const x = e.pageX - (cvsPos.x + window.scrollX)
                const y = e.pageY - (cvsPos.y + window.scrollY)
                const lastX = x - e.movementX
                const lastY = y - e.movementY
                ctx.beginPath()
                ctx.moveTo(lastX, lastY)
                ctx.lineTo(x, y)
                ctx.stroke()
                acc.socket.emit('draw', acc.room, x, y, lastX, lastY, acc.role, ctx.strokeStyle)
            }
        })
        cvs.addEventListener('mousedown', () => drawing = true)
        cvs.addEventListener('mouseup', () => drawing = false)
        cvs.addEventListener('mouseleave', () => drawing = false)

        const handleDrawEnd = async (winner) => {
            alert(`${winner} wins!`)
            if (acc.role == winner) {
                acc.wins++
                await fetch('/account', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ wins: acc.wins })
                })
            }
            acc.socket.emit('room leave', acc.room)
            setPage('hub')
        }

        acc.socket.on('end', handleDrawEnd)

        return () => acc.socket.off('end', handleDrawEnd)
    })
    return (
        <>
            <h1>You are {acc.role} in Room '{acc.room}'</h1>
            <canvas width='500' height='500'></canvas>
            <div></div>
            <button onClick={(e) => {
                e.preventDefault()
                acc.socket.emit('room leave', acc.room)
                setPage('hub')
                return false
            }}>Leave</button>
        </>
    )
}