const React = require('react')
export default function Credentials({ setPage, acc }) {
    return (
        <div class='content'>
            <section class='hero is-info'>
                <div class='hero-body'>
                    <h2 class='title'>Have an account? Login here</h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault()
                        const user = e.target.querySelector('input[type="text"]').value
                        const pass = e.target.querySelector('input[type="password"]').value
                        const res = await fetch('/session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                            body: JSON.stringify({ user, pass }),
                        })
                        if (res.status === 201) {
                            const resJSON = await res.json()
                            acc.user = resJSON.user
                            acc.wins = resJSON.wins
                            acc.premium = resJSON.premium
                            setPage('hub')
                        }
                        else alert('Wrong username or password!')
                    }}>
                        <input class='input is-inline' type='text' placeholder='Username' required />
                        <input class='input is-inline' type='password' placeholder='Password' required />
                        <input class='input is-inline' type='submit' value='Login' />
                    </form>
                </div>
            </section>
            <section class='hero is-link'>
                <div class='hero-body'>
                    <h2 class='title'>Don't have an account? Sign up here</h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault()
                        const pass = e.target.querySelector('#pass').value
                        const passConfirm = e.target.querySelector('#passConfirm').value
                        if (pass === passConfirm) {
                            const user = e.target.querySelector('input[type="text"]').value
                            const res = await fetch('/account', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                body: JSON.stringify({ user, pass }),
                            })
                            if (res.status === 201) {
                                const resJSON = await res.json()
                                acc.user = resJSON.user
                                acc.wins = resJSON.wins
                                acc.premium = resJSON.premium
                                setPage('hub')
                            }
                            else alert('Invalid username!')
                        }
                        else alert('Passwords do not match!')
                    }}>
                        <input class='input is-inline' type='text' placeholder='Username' required />
                        <input class='input is-inline' id='pass' type='password' placeholder='Password' required />
                        <input class='input is-inline' id='passConfirm' type='password' placeholder='Retype Password' required />
                        <input class='input is-inline' type='submit' value='Sign Up' />
                    </form>
                </div>
            </section>
        </div>
    )
}