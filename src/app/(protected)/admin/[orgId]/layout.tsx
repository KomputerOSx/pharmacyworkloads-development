// src/app/admin/[orgId]/layout.tsx
"use client";

import React, { ReactNode, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// --- Your Existing Imports ---
import { AdminSidebar } from "@/components/shadcn/admin-sidebar";
import { SiteHeader } from "@/components/shadcn/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useOrgs } from "@/hooks/useOrgs";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";

// --- Imports for Authorization ---
import { useAuth } from "@/lib/context/AuthContext";
import { useUser } from "@/hooks/useUsers";

export default function AdminOrgLayout({ children }: { children: ReactNode }) {
    // --- Hooks ---
    const params = useParams();
    const router = useRouter();
    const requestedOrgId = params.orgId as string;

    // Authentication Hook
    const { user: authUser, loading: authLoading } = useAuth();

    // User Profile Hook
    const {
        data: userProfile,
        isLoading: profileLoading,
        error: profileError,
    } = useUser(authUser?.uid);

    // Organizations Hook
    const {
        data: orgs,
        isLoading: orgsLoading,
        isError: orgsIsError,
        error: orgsError,
    } = useOrgs();

    // --- Combined Loading State ---
    const isLoading =
        authLoading || (!!authUser && profileLoading) || orgsLoading;

    // --- Authorization Status (Calculated) ---
    const authorizationStatus = useMemo(() => {
        // Can't determine status if still loading core data
        if (isLoading || !authUser || !userProfile || !orgs) {
            return "loading";
        }

        // Check 1: Is the requested orgId valid?
        const isValidOrg = orgs.some((org) => org.id === requestedOrgId);
        if (!isValidOrg) {
            console.warn(
                `AdminOrgSpecificLayout: Org ID (${requestedOrgId}) not found in fetched orgs.`,
            );
            return "invalid_org";
        }

        // Check 2: Is the user an admin? (Case-insensitive)
        const isAdmin = userProfile.role?.toLowerCase() === "admin";
        if (isAdmin) {
            return "authorized";
        } else {
            // User is authenticated, org is valid, but user is NOT admin
            console.warn(
                `AdminOrgSpecificLayout: User ${authUser.uid} (Role: ${userProfile.role}) is not authorized for admin section of Org ${requestedOrgId}.`,
            );
            return "unauthorized";
        }
    }, [isLoading, authUser, userProfile, orgs, requestedOrgId]);

    // --- Side Effects (Redirects) ---
    useEffect(() => {
        // 1. Redirect if not authenticated (once auth check is done)
        if (!authLoading && !authUser) {
            router.replace(`/login?redirect=/admin/${requestedOrgId}`);
            return;
        }

        // Only proceed with other checks if initial loading is complete
        if (!isLoading) {
            // 2. Handle critical data fetching errors
            if (profileError) {
                console.error(
                    "AdminOrgSpecificLayout: Error fetching user profile:",
                    profileError,
                );
                router.replace("/login?error=profile_fetch_failed");
                return;
            }
            if (orgsIsError) {
                console.error(
                    "AdminOrgSpecificLayout: Error fetching organisations:",
                    orgsError,
                );
                router.replace("/admin/orgsConsole?error=org_fetch_failed"); // Go back to console on org fetch error
                return;
            }

            // 3. Redirect based on calculated authorization status
            switch (authorizationStatus) {
                case "invalid_org":
                    console.log(
                        "AdminOrgSpecificLayout: Redirecting due to invalid org.",
                    );
                    // Org doesn't exist, send back to the main admin console
                    router.replace("/admin/orgsConsole?error=invalid_org_id");
                    break;
                case "unauthorized":
                    console.log(
                        "AdminOrgSpecificLayout: Redirecting due to unauthorized (non-admin) role.",
                    );
                    // User is logged in, org is valid, but user is not admin. Send to login.
                    router.replace("/login?error=unauthorized_admin");
                    break;
                case "authorized":
                case "loading": // Don't redirect if authorized or still loading
                default:
                    // Do nothing, allow rendering or wait for loading spinner
                    break;
            }
        }
    }, [
        authLoading,
        authUser,
        isLoading,
        profileError,
        orgsIsError,
        orgsError,
        authorizationStatus,
        requestedOrgId,
        router,
    ]);

    // --- Render Logic ---

    // Show loading spinner if data is loading OR if checks resulted in a non-authorized state (while redirecting)
    if (isLoading || (authUser && authorizationStatus !== "authorized")) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner text="Verifying admin access..." />
            </div>
        );
    }

    // Render the protected layout and children ONLY if loading is complete AND user is authorized admin
    if (!isLoading && authUser && authorizationStatus === "authorized") {
        return (
            // Your existing layout structure
            <div className="flex min-h-screen flex-col">
                <div className="flex flex-1">
                    <SidebarProvider
                        style={
                            {
                                "--sidebar-width": "calc(var(--spacing) * 72)",
                                "--header-height": "calc(var(--spacing) * 12)",
                            } as React.CSSProperties
                        }
                    >
                        <AdminSidebar variant="inset" />
                        <SidebarInset>
                            <SiteHeader />
                            <main className="">{children}</main>
                        </SidebarInset>
                    </SidebarProvider>
                </div>
            </div>
        );
    }

    // Fallback: Should generally be covered by the loading/redirect logic
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner text="Verifying access..." />
        </div>
    );
}
