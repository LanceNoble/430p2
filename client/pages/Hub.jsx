const React = require('react')

export default function Hub({ setPage, acc }) {
    const [isInRoom, setIsInRoom] = React.useState(false)
    React.useEffect(() => {
        const roomList = document.querySelector('ul')
        acc.socket.emit('rooms request')

        acc.socket.on('rooms sent', (rooms) => {
            roomList.innerHTML = ''
            for (const room of rooms) {
                const li = document.createElement('li')
                li.innerHTML = `Room Name: ${room.room} <br> Drawer 1: ${room.drawer1Count}/1 <br> Drawer 2: ${room.drawer2Count}/1 <br> Judges: ${room.judgeCount}/1 <br>`
                roomList.appendChild(li)
            }
        })
        acc.socket.on('spot taken', () => alert(`The role you chose is already taken`))
        acc.socket.on('wait', () => setIsInRoom(true))
        acc.socket.on('start', () => acc.role === 'Judge' ? setPage('judge') : setPage('draw'))

        return () => {
            acc.socket.off('rooms sent')
            acc.socket.off('spot taken')
            acc.socket.off('wait')
            acc.socket.off('start')
        }
    })
    return (
        <>
            <h1>Hub Page</h1>
            <button onClick={() => setPage('acc')}>Account</button>
            <button onClick={() => setPage('board')}>Leaderboard</button>
            <button onClick={async () => {
                await fetch('/session', { method: 'DELETE' })
                setPage('creds')
            }}>Logout</button>
            <h2>Join Room</h2>
            <p>If the room doesn't exist, it will be created for you.</p>
            <form hidden={isInRoom} onSubmit={(e) => {
                e.preventDefault()
                acc.room = e.target.querySelector('input[type="text"]').value
                acc.role = e.target.querySelector('select').value
                acc.socket.emit('room join', acc.room, acc.role)
            }}>
                <input type='text' placeholder='Room Name' required></input>
                <select>
                    <option value='Drawer 1' selected='selected'>Drawer 1</option>
                    <option value='Drawer 2'>Drawer 2</option>
                    <option value='Judge'>Judge</option>
                </select>
                <input type='submit' value='Join Room'></input>
            </form>
            <section hidden={!isInRoom}>
                You are now in room {acc.room} <br />
                Waiting for other players before starting...
                <button onClick={() => {
                    acc.socket.emit('room leave', acc.room)
                    setIsInRoom(false)
                }}>Leave room</button>
            </section>
            <h2>Rooms</h2>
            <ul>

            </ul>
        </>
    )
}