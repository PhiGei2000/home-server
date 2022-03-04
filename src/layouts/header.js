import Head from "next/head";
import Link from "next/link";
import { Component } from 'react';

export default class Header extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <Link href="/">
                        <a className="navbar-brand">Home</a>
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle Navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link href="/projects">
                                    <a className="nav-link">Projekte</a>
                                </Link>
                            </li>
                        </ul>
                        <Link href="/login">
                            <a className="btn btn-dark d-flex">Login</a>
                        </Link>
                    </div>
                </div>
            </nav>
        )
    }
}
