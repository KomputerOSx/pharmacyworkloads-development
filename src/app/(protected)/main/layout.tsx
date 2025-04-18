// src/app/(protected)/main/layout.tsx
"use client";

import React from "react";
import { UserSidebar } from "@/components/shadcn/user-sidebar"; // Import the UserSidebar component
import { SiteHeader } from "@/components/shadcn/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"; // Use SidebarProvider if needed for state/context

// Potentially import auth/user hooks if header needs them directly, otherwise they are handled in UserSidebar
// import { useAuth } from "@/lib/context/AuthContext";
// import { useUser } from "@/hooks/useUsers";

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
                            // Define CSS variables if your layout depends on them
                            "--sidebar-width": "calc(var(--spacing) * 64)", // Example: smaller width for user sidebar
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    {/* User Sidebar */}
                    <UserSidebar
                        className="hidden lg:flex lg:flex-col lg:w-64 border-r" // Example classes for desktop view
                        // Adjust collapsible prop based on needs: 'desktop', 'offcanvas', 'none'
                        collapsible="offcanvas"
                    />

                    {/* Main Content Area */}
                    <SidebarInset className="flex-1 flex flex-col">
                        {/* Site Header (Optional - adjust props as needed) */}
                        {/* Pass userProfile if header needs it for user menu etc. */}
                        {/* <SiteHeader userProfile={userProfile} /> */}
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
