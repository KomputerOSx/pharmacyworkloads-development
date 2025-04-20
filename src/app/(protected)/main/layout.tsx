// src/app/(protected)/main/layout.tsx
"use client";

import React from "react";
import { UserSidebar } from "@/components/shadcn/user-sidebar";
import { SiteHeader } from "@/components/shadcn/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function MainUserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex flex-1">
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 64)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    {/* User Sidebar */}
                    <UserSidebar
                        className="hidden lg:flex lg:flex-col lg:w-64 border-r"
                        collapsible="offcanvas"
                    />

                    {/* Main Content Area */}
                    <SidebarInset className="flex-1 flex flex-col">
                        <SiteHeader />

                        {/* Page Content */}
                        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
}
