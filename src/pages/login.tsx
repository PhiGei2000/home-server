import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getCsrfToken } from 'next-auth/react'

export default function login({csrfToken} : InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <form className="col-sm mx-auto" style={{ maxWidth: 300 }} action="/api/auth/signin/credentials">
            <input name="csrfToken" type='hidden' defaultValue={csrfToken} />
            <div className="mb-3">
                <label htmlFor="loginUsername" className="form-label">Benutzername</label>
                <input type="text" className="form-control" id="loginUsername" name="username" aria-describedby="usernameHelp" placeholder="Benutzername" />
            </div>
            <div className="mb-3">
                <label htmlFor="loginPassword" className="form-label">Passwort</label>
                <input type="password" className="form-control" id="loginPassword" name="password" />
            </div>
            <div className="mb-3">
                <button type="submit" className="btn btn-primary">Login</button>
            </div>
        </form>
    )
}

export async function getServerSideProps(context : GetServerSidePropsContext) {
    const csrfToken = await getCsrfToken(context)
    return {
        props: {csrfToken}
    }
}