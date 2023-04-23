const React = require('react');

export default function Hub({ setPage, roomRef, playerRef }) {
    return (
        <>
            <h1>Hub Page</h1>
            <button onClick={async (e) => {
                e.preventDefault();
                await fetch('/session', { method: 'DELETE' })
                setPage("creds");
                return false;
            }} type="button">Logout</button>
            <h2>Join Room</h2>
            <p>If the room doesn't exist, it will be created for you.</p>
            <form id="roomForm" onSubmit={async (e) => {
                e.preventDefault();
                roomRef.current = e.target.querySelector('input[type="text"]').value;
                playerRef.current = e.target.querySelector('select').value;
                playerRef.current === "2" ? setPage("judge") : setPage("draw")
                return false;
            }}>
                <input type="text" placeholder='Room Name' required></input>
                <select>
                    <option value="0" selected="selected">Drawer 1</option>
                    <option value="1">Drawer 2</option>
                    <option value="2">Judge</option>
                </select>
                <input type="submit" value="Join Room"></input>
            </form>
            <h2>Rooms</h2>
            <ul>

            </ul>
            <h2>Errors</h2>
        </>
    );
}