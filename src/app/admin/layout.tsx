import type { Metadata } from "next";
import "../admin/styles/globals.css";
import Header from "../admin/components/Header";
import Footer from "../admin/components/Footer";
import React from "react";

export const metadata: Metadata = {
    title: "Pharmacy Workload Tracker - Admin",
    description: "NHS Trust Pharmacy Management System",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-layout">
            <Header />
            <main className="container is-fluid mt-4 mb-6">{children}</main>
            <Footer />
        </div>
    );
}
