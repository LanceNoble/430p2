const React = require('react')

export default function Judge({ setPage, acc }) {
    React.useEffect(() => {
        const drawer1CVS = document.querySelector('#drawer1')
        const drawer1CTX = drawer1CVS.getContext('2d')
        drawer1CTX.lineWidth = 5
        drawer1CTX.lineCap = 'round'

        const drawer2CVS = document.querySelector('#drawer2')
        const drawer2CTX = drawer2CVS.getContext('2d')
        drawer2CTX.lineWidth = 5
        drawer2CTX.lineCap = 'round'

        acc.socket.on('draw', (x, y, lastX, lastY, playerType, strokeStyle) => {
            let activeCTX
            playerType === 'Drawer 1' ? activeCTX = drawer1CTX : activeCTX = drawer2CTX
            activeCTX.strokeStyle = strokeStyle
            activeCTX.beginPath()
            activeCTX.moveTo(lastX, lastY)
            activeCTX.lineTo(x, y)
            activeCTX.stroke()
        })

        const handleJudgeEnd = async (winner) => {
            alert(`${winner} wins!`)
            acc.socket.emit('room leave', acc.room)
            setPage('hub')
        }

        acc.socket.on('end', handleJudgeEnd)

        return () => {
            acc.socket.off('draw')
            acc.socket.off('end', handleJudgeEnd)
        }
    })
    return (
        <>
            <h1>You are a Judge in Room '{acc.room}'</h1>
            <canvas id='drawer1' width='500' height='500'></canvas>
            <canvas id='drawer2' width='500' height='500'></canvas>
            <h2>Vote Who Wins!</h2>
            <form onSubmit={(e) => {
                e.preventDefault()
                const winner = e.target.querySelector('select').value
                acc.socket.emit('end', acc.room, winner)
            }}>
                <select>
                    <option value='Drawer 1' selected='selected'>Drawer 1</option>
                    <option value='Drawer 2'>Drawer 2</option>
                </select>
                <input type='submit' value='Vote' />
            </form>
            <button onClick={() => {
                acc.socket.emit('end', acc.room, 'No one')
            }} type='button'>Leave</button>
        </>
    )
}