import Head from "next/head";
import Link from "next/link";
import { Component } from 'react';

export default class Header extends Component {
    render() : JSX.Element {
        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
                <div className="container-fluid">
                    <Link href="/">
                        <span className="navbar-brand">Home</span>
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle Navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link href="/projects">
                                    <span className="nav-link">Projekte</span>
                                </Link>
                            </li>
                        </ul>
                        <Link href="/login">
                            <span className="btn btn-dark d-flex">Login</span>
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }
}
