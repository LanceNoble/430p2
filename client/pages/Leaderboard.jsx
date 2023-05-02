const React = require('react')
export default function Leaderboard({ setPage }) {
    React.useEffect(() => {
        const list = document.querySelector('ol')
        fetch('/account', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        }).then(res => res.json()).then(resJSON => {
            // Sort users from highest to lowest wins
            let highest = resJSON[0];
            let indexHighest = 0;
            let locked = 0;
            while (locked < resJSON.length) {
                for (let i = locked; i < resJSON.length; i++) {
                    if (resJSON[i].wins > highest.wins) {
                        highest = resJSON[i];
                        indexHighest = i;
                    }
                }

                let copy = resJSON[locked]
                resJSON[locked] = highest
                resJSON[indexHighest] = copy
                locked++
                highest = resJSON[locked]
                indexHighest = locked
            }
            for (let i = 0; i < resJSON.length; i++) {
                const li = document.createElement('li')
                li.innerHTML = `${resJSON[i].user} - ${resJSON[i].wins} wins`
                list.appendChild(li)
            }
        })
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