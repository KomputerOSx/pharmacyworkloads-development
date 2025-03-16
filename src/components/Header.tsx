// src/components/Header.tsx
import React from "react";
import Link from "next/link";

const Header: React.FC = () => {
    return (
        <section className="hero is-primary">
            <div className="hero-body py-5">
                <div className="container">
                    <div className="level">
                        <div className="level-left">
                            <div className="level-item">
                                <div>
                                    <h1 className="title is-3">
                                        Pharmacy Workload Tracker
                                    </h1>
                                    <h2 className="subtitle is-5">
                                        NHS Trust Pharmacy Management
                                    </h2>
                                </div>
                            </div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">
                                <div className="buttons">
                                    <Link
                                        href="/admin"
                                        className="button is-primary is-inverted"
                                    >
                                        <span className="icon">
                                            <i className="fas fa-user-shield"></i>
                                        </span>
                                        <span>Admin Portal</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation bar */}
            <div className="hero-foot">
                <nav className="tabs is-boxed container">
                    <ul>
                        <li className="is-active">
                            <Link href="/">Dashboard</Link>
                        </li>
                        <li>
                            <Link href="/directorates">Directorates</Link>
                        </li>
                        <li>
                            <Link href="/workload">Workload</Link>
                        </li>
                        <li>
                            <Link href="/reports">Reports</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </section>
    );
};

export default Header;
