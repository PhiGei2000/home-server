import { Component } from 'react';
import * as crypto from 'crypto';

export default class Login extends Component {
    async handleLogin(event) {
        event.preventDefault();

        const data = {
            username: event.target.loginUsername.value,
            password: event.target.loginPassword.value
        };

        const endpoint = '/api/login';

        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(data)
        };

        await fetch(endpoint, options);
    }

    render() {
        return (
            <div className="mt-4">
                <form className="col-sm mx-auto" style={{ maxWidth: 300 }} action="/api/login" method='post'>
                    <div className="mb-3">
                        <label htmlFor="loginUsername" className="form-label">Benutzername</label>
                        <input type="text" className="form-control" id="loginUsername" name="username" aria-describedby="usernameHelp" placeholder="Benutzername" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="loginPassword" className="form-label">Passwort</label>
                        <input type="password" className="form-control" id="loginPassword" name="password"/>
                    </div>
                    <div className="mb-3">
                        <button type="submit" className="btn btn-primary">Login</button>
                    </div>
                </form>
            </div>
        )
    }
}
