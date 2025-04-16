// src/app/(protected)/admin/layout.tsx
"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext"; // Adjust path if needed
import { useUser } from "@/hooks/useUsers"; // Adjust path if needed
import { LoadingSpinner } from "@/components/ui/loadingSpinner"; // Adjust path if needed

export default function GeneralAdminLayout({
    // Renamed for clarity
    children,
}: {
    children: ReactNode;
}) {
    const { user: authUser, loading: authLoading } = useAuth();
    const {
        data: userProfile,
        isLoading: profileLoading,
        error: profileError,
    } = useUser(authUser?.uid);
    const router = useRouter();
    const isLoading = authLoading || (!!authUser && profileLoading);

    useEffect(() => {
        if (isLoading) return;

        if (!authUser) {
            console.log("GeneralAdminLayout: Not authenticated. Redirecting.");
            router.replace("/login?redirect=/admin"); // Redirect appropriately
            return;
        }
        if (profileError) {
            console.error(
                "GeneralAdminLayout: Profile fetch error:",
                profileError,
            );
            router.replace("/login?error=profile_fetch_failed");
            return;
        }
        if (!userProfile) {
            console.warn(
                `GeneralAdminLayout: Profile not found for ${authUser.uid}. Redirecting.`,
            );
            router.replace("/login?error=profile_missing");
            return;
        }
        if (userProfile.role?.toLowerCase() !== "admin") {
            console.warn(
                `GeneralAdminLayout: User ${authUser.uid} (Role: ${userProfile.role}) not admin. Redirecting.`,
            );
            router.replace("/login?error=unauthorized_admin");
            return;
        }
        console.log(
            `GeneralAdminLayout: Admin access verified for ${authUser.uid}.`,
        );
    }, [isLoading, authUser, userProfile, profileError, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner text="Verifying admin access..." />
            </div>
        );
    }

    // Only render children if checks passed (useEffect handles redirect otherwise)
    const isAuthorizedAdmin =
        authUser && userProfile?.role?.toLowerCase() === "admin";
    if (isAuthorizedAdmin) {
        return <>{children}</>; // Pass children through
    }

    // Fallback loading while redirecting
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner text="Redirecting..." />
        </div>
    );
}
