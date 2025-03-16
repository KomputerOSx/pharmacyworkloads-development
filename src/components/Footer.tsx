// src/components/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
    return (
        <footer className="footer mt-6">
            <div className="content has-text-centered">
                <p>
                    <strong>Pharmacy Workload Tracker</strong> by NHS Trust
                    Pharmacy
                    <br />
                    Copyright © {new Date().getFullYear()}
                </p>
                <p className="is-size-7">
                    <a href="#" className="has-text-grey">
                        Privacy Policy
                    </a>{" "}
                    •
                    <a href="#" className="has-text-grey mx-2">
                        Terms of Service
                    </a>{" "}
                    •
                    <a href="#" className="has-text-grey">
                        Support
                    </a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
