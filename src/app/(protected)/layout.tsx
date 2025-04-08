// src/app/(protected)/layout.tsx
"use client"; // This layout needs to be a Client Component to use hooks

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext"; // Adjust import path if needed
import { LoadingSpinner } from "@/components/ui/loadingSpinner";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname(); // Get the current path

    useEffect(() => {
        // Wait until the loading state is resolved
        if (!loading) {
            // If loading is finished and there's no user, redirect to login
            if (!user) {
                console.log(
                    `Protected route (${pathname}): No user found, redirecting to login.`,
                );
                // Redirect to login, preserving the intended destination
                router.replace(
                    `/login?redirect=${encodeURIComponent(pathname)}`,
                );
            } else {
                console.log(
                    `Protected route (${pathname}): User authenticated.`,
                );
                // User is logged in, allow access (component will render children)
            }
        }
    }, [user, loading, router, pathname]); // Dependencies for the effect

    // While loading, show a loading indicator (or null)
    if (loading) {
        return (
            <LoadingSpinner
                className={"flex items-center justify-center h-screen"}
                text={"Loading data..."}
                size={"xxlg"}
            />
        );
    }

    // If loading is done and user exists, render the requested page content
    if (!loading && user) {
        return <>{children}</>;
    }

    return <LoadingSpinner text="Redirecting..." />;
}
