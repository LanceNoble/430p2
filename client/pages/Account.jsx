const React = require('react')
export default function Account({ setPage, acc }) {
    return (
        <div class='content'>
            <section class='hero is-small is-primary'>
                <div class='hero-body'>
                    <h1 class='title'>Account</h1>
                    <button class='button' onClick={() => setPage('hub')}>Hub</button>
                    <button class='button' onClick={async () => {
                        const res = await fetch('/account', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ premium: true }),
                        })
                        if (res.status === 200) {
                            const resJSON = await res.json()
                            acc.premium = resJSON.premium
                            alert('You are now premium!')
                        }
                        else alert('Failed to pay for premium!')
                    }}>Pay for Premium</button>
                </div>
            </section>
            <section class='hero is-small is-success'>
                <div class='hero-body'>
                    <h2 class='title'>User: {acc.user}</h2>
                    <p class='subtitle'>You have {acc.wins} wins</p>
                </div>
            </section>
            <section class='hero is-small is-warning'>
                <div class='hero-body'>
                    <h2 class='title'>Change Password</h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault()
                        const pass = e.target.querySelector('#newPass').value
                        const newPassConfirm = e.target.querySelector('#newPassConfirm').value
                        if (pass !== newPassConfirm) alert('Passwords do not match!')
                        else {
                            const res = await fetch('/account', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ pass }),
                            })
                            res.status === 200 ? alert('Password changed!') : alert('Password change ERROR!')
                        }
                        return false
                    }}>
                        <input class='input is-inline' id='newPass' type='password' placeholder='New Password' required />
                        <input class='input is-inline' id='newPassConfirm' type='password' placeholder='Retype New Password' required />
                        <input class='input is-inline' type='submit' value='Change Password'></input>
                    </form>
                </div>
            </section>

        </div>
    )
}