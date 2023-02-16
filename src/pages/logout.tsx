import { signOut } from "next-auth/react";

export default function Logout(): JSX.Element {
    return (
        <div className="col-sm mx-auto authentication-form">
            <h3>Abmelden</h3>
            <button type="button" className="btn btn-primary" onClick={() => signOut({callbackUrl: process.env.NEXT_PUBLIC_BASE_URL})}>Abmelden</button>
        </div>
    );
}