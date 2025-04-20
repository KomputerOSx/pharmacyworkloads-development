import ProtectedLayoutComponent from "@/app/(protected)/ProtectedLayout";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pharmacy Workloads",
    description: "Manage your pharmacy workloads",
};

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProtectedLayoutComponent>{children}</ProtectedLayoutComponent>;
}
