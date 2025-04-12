"use client";

// src/app/(protected)/manager/[orgId]/layout.tsx
import React, { ReactNode, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// --- Your Existing Imports ---
import { ManagerSidebar } from "@/components/shadcn/manager-sidebar";
import { SiteHeader } from "@/components/shadcn/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useOrgs } from "@/hooks/useOrgs";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";

import { useAuth } from "@/lib/context/AuthContext";
import { useUser } from "@/hooks/useUsers";

export default function ManagerOrgLayout({
    children,
}: {
    children: ReactNode;
}) {
    const params = useParams();
    const router = useRouter();
    const requestedOrgId = params.orgId as string;

    const { user: authUser, loading: authLoading } = useAuth();

    const {
        data: userProfile,
        isLoading: profileLoading,
        error: profileError,
    } = useUser(authUser?.uid);

    const {
        data: orgs,
        isLoading: orgsLoading,
        isError: orgsIsError,
        error: orgsError,
    } = useOrgs();

    const isLoading =
        authLoading || (!!authUser && profileLoading) || orgsLoading;

    const authorizationStatus = useMemo(() => {
        if (isLoading || !authUser || !userProfile || !orgs) {
            return "loading"; // Or 'pending'
        }

        // Check 1: Is the requested orgId valid?
        const isValidOrg = orgs.some((org) => org.id === requestedOrgId);
        if (!isValidOrg) {
            console.warn(
                `sbQR5P1x - ManagerOrgLayout: Org ID (${requestedOrgId}) not found in fetched orgs.`,
            );
            return "invalid_org";
        }

        // Check 2: Role-based authorization
        const isAdmin = userProfile.role === "admin";
        const isManagerForThisOrg =
            userProfile.role === "manager" &&
            userProfile.orgId === requestedOrgId;

        if (isAdmin || isManagerForThisOrg) {
            return "authorized";
        } else {
            console.warn(
                `xhu2jYXm - ManagerOrgLayout: User ${authUser.uid} (Role: ${userProfile.role}, Org: ${userProfile.orgId}) not authorized for manager section of Org ${requestedOrgId}.`,
            );
            return "unauthorized";
        }
    }, [isLoading, authUser, userProfile, orgs, requestedOrgId]);

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.replace(`/login?redirect=/manager/${requestedOrgId}`);
            return;
        }

        if (!isLoading) {
            if (profileError) {
                console.error("Error fetching user profile:", profileError);
                router.replace("/login?error=profile_fetch_failed");
                return;
            }
            if (orgsIsError) {
                console.error("Error fetching organisations:", orgsError);
                router.replace("/login?error=org_fetch_failed");
                return;
            }

            switch (authorizationStatus) {
                case "invalid_org":
                    router.replace("/login?error=invalid_org");
                    break;
                case "unauthorized":
                    router.replace("/login?error=unauthorized");
                    break;
                case "authorized":
                case "loading":
                default:
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

    if (isLoading || (authUser && authorizationStatus !== "authorized")) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner text="Verifying access..." />
            </div>
        );
    }

    if (!isLoading && authUser && authorizationStatus === "authorized") {
        return (
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
                        <ManagerSidebar variant="inset" />
                        <SidebarInset>
                            <SiteHeader />
                            <main className="">{children}</main>
                        </SidebarInset>
                    </SidebarProvider>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner text="Verifying access..." />
        </div>
    );
}
