const React = require('react')

export default function Draw({ setPage, acc }) {
    const ctxRef = React.useRef(null)
    React.useEffect(() => {
        const cvs = document.querySelector('canvas')
        const ctx = cvs.getContext('2d')
        ctxRef.current = ctx
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
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
        <div class='content'>
            <section class='hero is-small is-primary'>
                <div class='hero-body container'>
                    <h1 class='title'>You are {acc.role} in Room '{acc.room}'</h1>
                    <canvas class='has-background-white' width='500' height='500'></canvas>
                    <button class='button is-inline-block' hidden={acc.premium} onClick={() => ctxRef.current.strokeStyle = 'black'}>Draw in Black</button>
                    <button class='button is-inline-block' hidden={acc.premium} onClick={() => ctxRef.current.strokeStyle = 'blue'}>Draw in Blue</button>
                    <button class='button is-block' onClick={(e) => {
                        e.preventDefault()
                        acc.socket.emit('end', acc.room, 'No one')
                        return false
                    }}>Leave</button>
                </div>
            </section>
        </div>
    )
}