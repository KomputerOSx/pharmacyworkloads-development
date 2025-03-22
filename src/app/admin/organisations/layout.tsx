"use client";

import React from "react";
import { OrganisationProvider } from "@/context/OrganisationContext";
import "../styles/organisations.css";

export default function OrganisationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <OrganisationProvider>
            <div className="organisations-layout">
                <div className="container">{children}</div>
            </div>
        </OrganisationProvider>
    );
}
