const React = require('react')
export default function Leaderboard({setPage}) {
    React.useEffect(async () => {
        const list = document.querySelector('ol')
        const res = await fetch('/account', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        })
        const resJSON = await res.json()
        for (let i = 0; i < resJSON.length; i++) {
            const li = document.createElement('li')
            li.innerHTML = `${resJSON[i].user} with ${resJSON[i].wins} wins`
            list.appendChild(li)
        }
    })
    return (
        <>
            <h1>Leaderboard</h1>
            <button onClick={() => setPage('hub')}>Hub</button>
            <ol>

            </ol>
        </>
    )
}