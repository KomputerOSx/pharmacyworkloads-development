"use client";

// src/app/admin/[orgId]/layout.tsx
import React, { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { useOrgContext } from "@/context/OrgContext";

export default function OrgLayout({ children }: { children: ReactNode }) {
    const { isLoading } = useOrgContext();

    if (isLoading) {
        return (
            <LoadingSpinner
                className={"flex items-center justify-center h-screen"}
                text={"Loading..."}
                size={"xxlg"}
            />
        );
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
                        <main className="flex-1">{children}</main>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
}
