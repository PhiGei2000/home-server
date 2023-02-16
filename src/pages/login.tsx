import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

export default function Login() : JSX.Element {
    const [userInfo, setUserInfo] = useState({ password: '' });
    const router = useRouter();

    const callbackUrl = router.query.callbackUrl ? router.query.callbackUrl as string : process.env.NEXT_PUBLIC_BASE_URL;

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        const result = await signIn('credentials', {
            password: userInfo.password,
            callbackUrl: callbackUrl
        });

        console.log(result);
    }

    return (
        <div className="col-sm mx-auto authentication-form">
            <h3>Login</h3>
            <form onSubmit={handleSubmit} >
                <div className="mb-3">
                    <label htmlFor="loginPassword" className="form-label">Passwort</label>
                    <input type="password" className="form-control" id="loginPassword" name="password" onChange={({ target }) => setUserInfo({ password: target.value })} />
                </div>
                <div className="mb-3">
                    <button type="submit" className="btn btn-primary">Login</button>
                </div>
            </form>
        </div>
    )
}
