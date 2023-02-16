import Head from "next/head";
import Link from "next/link";
import { Component } from 'react';
import { useSession, getSession } from "next-auth/react";

export default function Header(): JSX.Element {
    const { data: session, status } = useSession();
    const authenticated = status == 'authenticated';

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
            <div className="container">
                <Link href="/" className="navbar-brand">Home</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle Navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" href="/projects">Projekte</Link>
                        </li>
                        {authenticated && <li className="nav-item">
                            <Link className="nav-link" href="/files">Dateien</Link>
                        </li>}
                    </ul>
                    <div className="nav-item ">
                        {authenticated ?
                            <Link className="nav-link text-primary" href="/logout">Abmelden</Link>
                            :
                            <Link className="nav-link text-primary" href="/login" passHref={true}>Anmelden</Link>
                        }
                    </div>
                </div>
            </div>
        </nav>
    );
}
