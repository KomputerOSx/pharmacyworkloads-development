"use client";
// src/app/admin/[orgId]/layout.tsx
import React, { ReactNode } from "react";
import { AppSidebar } from "@/components/shadcn/app-sidebar";
import { SiteHeader } from "@/components/shadcn/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useParams } from "next/navigation";
import { useOrgs } from "@/hooks/useOrgs";
import { Redirector } from "@/components/shadcn/Redirector";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";

export default function OrgLayout({ children }: { children: ReactNode }) {
    const params = useParams();
    const orgId = params.orgId as string;

    // Destructure loading and error states from the hook
    const { data: orgs, isLoading, isError, error } = useOrgs();

    // 1. Handle Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner text="Verifying organisation access..." />
            </div>
        );
    }

    // 2. Handle Error State (Optional but Recommended)
    if (isError) {
        console.error("Error fetching organisations in layout:", error);
        return <Redirector to="/admin/orgsConsole?error=org_fetch_failed" />;
    }

    const isValidOrg = orgId && orgs && orgs.find((org) => org.id === orgId);

    if (!isValidOrg) {
        console.log(
            `bvY1FK69 - OrgLayout: Redirecting. Reason: orgId (${orgId}) not found in fetched orgs or orgs data unavailable/empty. Orgs data exists: ${!!orgs}`,
        );
        return <Redirector to="/admin/orgsConsole" />;
    }

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
                    <AppSidebar variant="inset" />
                    <SidebarInset>
                        <SiteHeader />
                        <main className="">{children}</main>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
}
