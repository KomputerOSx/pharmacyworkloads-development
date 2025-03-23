// src/app/layout.tsx

"use client";

import "bulma/css/bulma.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

import { OrganisationProvider } from "@/context/OrganisationContext";

import React from "react";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={"theme-light"}>
            <body>
                <OrganisationProvider>{children}</OrganisationProvider>
            </body>
        </html>
    );
}
