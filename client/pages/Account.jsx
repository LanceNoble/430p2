const React = require('react')
export default function Account({ setPage }) {
    React.useEffect(() => {
        const winsCounter = document.querySelector("#wins")
    })
    return (
        <>
            <h1>Account Page</h1>
            <button onClick={() => setPage('hub')}>Hub</button>
            <button onClick={async () => {
                const res = await fetch('/account', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ premium: true }),
                })
                if (res.status === 200) alert('You are now premium!')
                else alert('Failed to pay for premium!')
            }}>Pay for Premium</button>
            <h2>Change Password</h2>
            <form onSubmit={async (e) => {
                e.preventDefault()
                const pass = e.target.querySelector('#newPass').value
                const newPassConfirm = e.target.querySelector('#newPassConfirm').value
                if (pass !== newPassConfirm) alert('Passwords do not match!')
                else {
                    const res = await fetch('/account', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pass }),
                    })
                    res.status === 200 ? alert('Password changed!') : alert('Password change ERROR!')
                }
                return false
            }}>
                <input id='newPass' type='password' placeholder='New Password' required />
                <input id='newPassConfirm' type='password' placeholder='Retype New Password' required />
                <input type='submit' value='Change Password'></input>
            </form>
            <h2 id="wins">Wins: </h2>
        </>
    )
}