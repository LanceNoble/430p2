const React = require('react')

export default function Credentials({ setPage }) {
    return (
        <>
            <h1>Credentials Page</h1>
            <h2>Login</h2>
            <form onSubmit={async (e) => {
                e.preventDefault()
                const user = e.target.querySelector('input[type="text"]').value
                const pass = e.target.querySelector('input[type="password"]').value
                const res = await fetch('/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ user, pass }),
                })
                res.status === 204 ? setPage('hub') : alert('Wrong username or password!')
                return false
            }}>
                <input type='text' placeholder='Username' required />
                <input type='password' placeholder='Password' required />
                <input type='submit' value='Login' />
            </form>
            <h2>Sign Up</h2>
            <form onSubmit={async (e) => {
                e.preventDefault()
                const pass = e.target.querySelector('#pass').value
                const passConfirm = e.target.querySelector('#passConfirm').value
                if (pass === passConfirm) {
                    const user = e.target.querySelector('input[type="text"]').value
                    const res = await fetch('/account', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user, pass }),
                    })
                    res.status === 201 ? setPage('hub') : alert('Invalid username!')
                }
                else alert('Passwords do not match!')
                return false
            }}>
                <input type='text' placeholder='Username' required />
                <input id='pass' type='password' placeholder='Password' required />
                <input id='passConfirm' type='password' placeholder='Retype Password' required />
                <input type='submit' value='Sign Up' />
            </form>
        </>
    )
}