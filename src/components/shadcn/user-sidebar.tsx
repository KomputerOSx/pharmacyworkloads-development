"use client";

import * as React from "react";
import { Building, Frame, PersonStanding, SquareTerminal } from "lucide-react";

// Remove NavProjects and NavMain imports if no longer used elsewhere
// import { NavProjects } from "@/components/nav-projects";
// import { NavMain } from "@/components/nav-main";
import { CombinedNav } from "@/components/shadcn/CombinedNav"; // <-- Import the new component
import { NavUser } from "@/components/shadcn/nav-user";
import { OrgSwitcher } from "@/components/shadcn/org-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    // SidebarMenuSub, // Likely not needed with Accordion
    SidebarRail,
} from "@/components/ui/sidebar";
import { useParams, useRouter } from "next/navigation";
import { useOrgs } from "@/hooks/useOrgs";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
// Import the types if defined here, or from a shared file
export interface NavLinkItem {
    type: "link";
    title: string;
    url: string;
    icon: React.ElementType;
    disabled?: boolean;
}
export interface NavMenuItem {
    type: "menu";
    title: string;
    url?: string;
    icon: React.ElementType;
    items: {
        title: string;
        url: string;
        disabled?: boolean;
    }[];
    disabled?: boolean;
}
export type CombinedNavItem = NavLinkItem | NavMenuItem;

// Updated sidebarLayout using the combined structure
const sidebarLayout = {
    user: {
        /* ... user data ... */ name: "shadcn",
        email: "m@example.com",
        avatar: "https://github.com/shadcn.png",
    },
    navigationItems: [
        {
            type: "link",
            title: "My Rota",
            url: "/",
            icon: SquareTerminal,
        } as NavLinkItem,
        {
            type: "link",
            title: "Department Rota",
            url: "departments",
            icon: Frame,
        } as NavLinkItem,
        {
            type: "link",
            title: "My Workload",
            url: "locations",
            icon: Building,
        } as NavLinkItem,
        {
            type: "link",
            title: "Department Workload",
            url: "users",
            icon: PersonStanding,
        } as NavLinkItem,
    ] as CombinedNavItem[],
};

export function ManagerSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const { orgId } = useParams();
    const { data: orgs, isLoading, isError } = useOrgs();
    const router = useRouter();

    const handleNavigation = (url: string) => {
        if (orgId && url !== undefined) {
            // Check url is defined
            // Handle root navigation explicitly if needed
            if (url === "/") {
                router.push(`/manager/${orgId}`);
            } else {
                router.push(`/manager/${orgId}/${url.replace(/^\//, "")}`); // Ensure no leading slash from url
            }
        } else {
            console.warn(
                "vWVn17Xq - orgId or URL is not available. Cannot navigate.",
                { orgId, url },
            );
        }
    };

    // --- Header loading/error logic remains the same ---
    let headerContent;
    if (isLoading) {
        headerContent = (
            <div className="p-4">
                <LoadingSpinner size="sm" />
            </div>
        );
    } else if (isError || !orgs) {
        headerContent = (
            <div className="p-4 text-xs text-destructive">
                Error loading orgs.
            </div>
        );
    } else {
        headerContent = <OrgSwitcher orgs={orgs} />;
    }

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>{headerContent}</SidebarHeader>
            <SidebarContent>
                {/* Render the new combined navigation component */}
                <CombinedNav
                    items={sidebarLayout.navigationItems}
                    onNavigate={handleNavigation}
                />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
