"use client";
import "../admin/styles/globals.css";
import Footer from "../admin/components/Footer";
import React from "react";
import { OrganisationProvider } from "@/context/OrganisationContext";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <body>
            <div className="admin-layout">
                <OrganisationProvider>{children}</OrganisationProvider>
            </div>
            <Footer />
        </body>
    );
}
