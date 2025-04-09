// src/app/admin/orgsConsole/layout.tsx
"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext"; // Adjust path
import { useUser } from "@/hooks/useUsers"; // Adjust path
import { LoadingSpinner } from "@/components/ui/loadingSpinner"; // Adjust path

export default function AdminOrgConsoleLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { user: authUser, loading: authLoading } = useAuth();
    const {
        data: userProfile,
        isLoading: profileLoading,
        error: profileError,
    } = useUser(authUser?.uid); // Fetch profile using auth user's uid

    const router = useRouter();

    // Combined loading state
    const isLoading = authLoading || (!!authUser && profileLoading);

    useEffect(() => {
        // Wait for loading to complete
        if (isLoading) {
            return;
        }

        // 1. Redirect if not authenticated
        if (!authUser) {
            console.log(
                "AdminOrgConsoleLayout: User not authenticated. Redirecting to login.",
            );
            router.replace("/login?redirect=/admin/orgsConsole");
            return;
        }

        // 2. Handle profile fetch errors
        if (profileError) {
            console.error(
                "AdminOrgConsoleLayout: Error fetching user profile:",
                profileError,
            );
            // Redirect on profile error - maybe back to login or a generic error page
            router.replace("/login?error=profile_fetch_failed");
            return;
        }

        // 3. Handle missing profile data
        if (!userProfile) {
            console.warn(
                `AdminOrgConsoleLayout: User ${authUser.uid} authenticated but profile data not found. Redirecting.`,
            );
            // Redirect on missing profile - indicates a potential data inconsistency
            router.replace("/login?error=profile_missing");
            return;
        }

        // 4. Authorization Check: Only allow 'admin' role
        const profileRole = userProfile.role?.toLowerCase(); // Ensure case-insensitive comparison

        if (profileRole !== "admin") {
            console.warn(
                `AdminOrgConsoleLayout: User ${authUser.uid} (Role: ${userProfile.role}) is not an admin. Redirecting to login.`,
            );
            // Redirect non-admins (including managers) back to login or an 'unauthorized' page
            router.replace("/login?error=unauthorized_admin");
            return;
        }

        // 5. User is authenticated and is an admin - allow access
        console.log(
            `AdminOrgConsoleLayout: User ${authUser.uid} is an admin. Access granted.`,
        );
    }, [
        isLoading,
        authUser,
        userProfile,
        profileError,
        router,
        authLoading, // Include individual flags if needed for specific checks
        profileLoading,
    ]);

    // --- Render Logic ---

    // Show loading spinner while checks are in progress
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner text="Verifying admin access..." />
            </div>
        );
    }

    // Render children ONLY if authenticated AND profile loaded AND user is admin
    // We rely on the useEffect to redirect otherwise, but add a check here for clarity
    const isAuthorizedAdmin =
        authUser && userProfile?.role?.toLowerCase() === "admin";

    if (isAuthorizedAdmin) {
        return (
            // Your original simple layout structure, or enhance as needed
            <div className="">
                <main className="">{children}</main>
            </div>
        );
    }

    // If not loading and not authorized, show spinner while redirect happens
    // This covers the brief moment before the useEffect redirect kicks in
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner text="Redirecting..." />
        </div>
    );
}
