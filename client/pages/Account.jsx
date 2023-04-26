const React = require('react')
export default function Account() {
    return (
        <>
            <h1>Account Page</h1>
            <h2>Change Password</h2>
            <form onSubmit={async (e) => {
                e.preventDefault()
                const newPass = e.target.querySelector('#newPass').value
                const newPassConfirm = e.target.querySelector('#newPassConfirm').value
                if (newPass !== newPassConfirm) alert('Passwords do not match!')
                else {
                    const res = await fetch('/account', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ newPass }),
                    })
                    if (res.status === 204) alert('You have successfully changed your password!')
                }
                return false
            }}>
                <input id='newPass' type='password' placeholder='New Password' required />
                <input id='newPassConfirm' type='password' placeholder='Retype New Password' required />
            </form>
            <h2>Pay for Premium</h2>
        </>
    )
}