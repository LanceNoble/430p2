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
        <div class='content'>
            <section class='hero is-small is-primary'>
                <div class='hero-body'>
                    <h1 class='title'>Hub</h1>
                    <button class='button' onClick={() => setPage('acc')}>Account</button>
                    <button class='button' onClick={() => setPage('board')}>Leaderboard</button>
                    <button class='button' onClick={async () => {
                        await fetch('/session', { method: 'DELETE' })
                        setPage('creds')
                    }}>Logout</button>
                </div>
            </section>
            <section class='hero is-small is-success'>
                <div class='hero-body'>
                    <h2 class='title'>Join</h2>
                    <p class='subtitle'>If the room doesn't exist, it will be created for you.</p>
                    <form hidden={isInRoom} onSubmit={(e) => {
                        e.preventDefault()
                        acc.room = e.target.querySelector('input[type="text"]').value
                        acc.role = e.target.querySelector('select').value
                        acc.socket.emit('room join', acc.room, acc.role)
                    }}>
                        <div class='select'>
                            <select class='is-inline'>
                                <option value='Drawer 1' selected='selected'>Drawer 1</option>
                                <option value='Drawer 2'>Drawer 2</option>
                                <option value='Judge'>Judge</option>
                            </select>
                        </div>
                        <input class='input is-inline' type='text' placeholder='Room Name' required></input>
                        <input class='input is-inline' type='submit' value='Join Room'></input>
                    </form>
                    <div class='notification is-info' hidden={!isInRoom}>
                        You joined room "{acc.room}"<br />
                        Waiting for other players before starting... <br />
                        <button class='button' onClick={() => {
                            acc.socket.emit('room leave', acc.room)
                            setIsInRoom(false)
                        }}>Leave</button>
                    </div>
                </div>
            </section>
            <section class='hero is-small is-link'>
                <div class='hero-body'>
                    <h2 class='title'>Rooms</h2>
                    <ul>

                    </ul>
                </div>
            </section>
        </div>
    )
}