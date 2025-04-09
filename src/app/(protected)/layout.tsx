// src/app/(protected)/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                console.log(
                    `Protected route (${pathname}): No user found, redirecting to login.`,
                );
                router.replace(
                    `/login?redirect=${encodeURIComponent(pathname)}`,
                );
            } else {
                console.log(
                    `Protected route (${pathname}): User authenticated.`,
                );
            }
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <LoadingSpinner
                className={"flex items-center justify-center h-screen"}
                text={"Loading data..."}
                size={"xxlg"}
            />
        );
    }

    if (!loading && user) {
        return <>{children}</>;
    }

    return <LoadingSpinner text="Redirecting..." />;
}
