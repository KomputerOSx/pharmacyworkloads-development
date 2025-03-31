"use client";

import * as React from "react";
import {
    Bed,
    BookOpen,
    Bot,
    Frame,
    Hospital,
    PersonStanding,
    Settings2,
    SquareTerminal,
} from "lucide-react";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { useParams, useRouter } from "next/navigation";
import { useOrgs } from "@/hooks/useOrgs";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "https://github.com/shadcn.png",
    },
    sections: [
        {
            name: "Dashboard",
            url: "/",
            icon: SquareTerminal,
        },
        {
            name: "Hospitals",
            url: "hospitals",
            icon: Hospital,
        },
        {
            name: "Departments",
            url: "departments",
            icon: Frame,
        },
        {
            name: "Wards",
            url: "wards",
            icon: Bed,
        },
        {
            name: "Staff",
            url: "staff",
            icon: PersonStanding,
        },
    ],
    navMain: [
        {
            title: "Hospitals",
            url: "/hospitals",
            icon: SquareTerminal,
            isActive: true,
        },
        {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Genesis",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
                {
                    title: "Quantum",
                    url: "#",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { orgId } = useParams();
    const { data: orgs, isLoading, isError } = useOrgs();
    const router = useRouter();

    const handleNavigation = (url: string) => {
        if (orgId && url) {
            router.push(`/admin/${orgId}/${url}`);
        } else {
            console.warn("vWVn17Xq - orgId is not available. Cannot navigate.");
        }
    };

    let headerContent;
    if (isLoading) {
        // Show a loading state in the header area
        headerContent = (
            <div className="p-4">
                <LoadingSpinner size="sm" />
            </div>
        );
    } else if (isError || !orgs) {
        // Show an error state or handle case where orgs is still undefined after loading
        headerContent = (
            <div className="p-4 text-xs text-destructive">
                Error loading orgs.
            </div>
        );
    } else {
        // Only render TeamSwitcher when data is loaded and valid
        headerContent = <TeamSwitcher orgs={orgs} />;
    }
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                {headerContent}{" "}
                {/* Render the conditionally determined content */}
            </SidebarHeader>
            <SidebarContent>
                {/* You might also want to conditionally render this based on loading/error */}
                <NavProjects
                    projects={data.sections}
                    onNavigate={handleNavigation}
                />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
