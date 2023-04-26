const React = require('react')

export default function Hub({ setPage, roomNameRef, playerTypeRef, socketRef }) {
    socketRef.current = io()
    React.useEffect(() => {
        const roomList = document.querySelector('ul')
        socketRef.current.emit('room join', 'hub')
        socketRef.current.emit(`rooms request`)
        socketRef.current.once(`rooms sent`, (rooms) => {
            for (const room of rooms) {
                const li = document.createElement('li')
                li.innerHTML = `Room Name: ${room.roomName} <br> Drawers: ${room.drawerCount}/2 <br> Judges: ${room.judgeCount}/1 <br>`
                roomList.appendChild(li)
            }
        })
        socketRef.current.on('room join error', (msg) => {
            alert(`${msg}`)
            return false
        })
        socketRef.current.on('room join success', () => {
            playerTypeRef.current === 'Judge' ? setPage('judge') : setPage('draw')
        })
    })
    return (
        <>
            <h1>Hub Page</h1>
            <button onClick={async (e) => {
                e.preventDefault()
                await fetch('/session', { method: 'DELETE' })
                socketRef.current.disconnect();
                setPage('creds')
                return false
            }} type='button'>Logout</button>
            <h2>Join Room</h2>
            <p>If the room doesn't exist, it will be created for you.</p>
            <form id='roomForm' onSubmit={async (e) => {
                e.preventDefault()
                roomNameRef.current = e.target.querySelector('input[type="text"]').value
                playerTypeRef.current = e.target.querySelector('select').value
                socketRef.current.emit('room join', roomNameRef.current, playerTypeRef.current)
                return false
            }}>
                <input type='text' placeholder='Room Name' required></input>
                <select>
                    <option value='Drawer 1' selected='selected'>Drawer 1</option>
                    <option value='Drawer 2'>Drawer 2</option>
                    <option value='Judge'>Judge</option>
                </select>
                <input type='submit' value='Join Room'></input>
            </form>
            <h2>Rooms</h2>
            <ul>

            </ul>
        </>
    )
}