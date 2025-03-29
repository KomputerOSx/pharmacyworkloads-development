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
import { useOrgContext } from "@/context/OrgContext";

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
    const { orgs } = useOrgContext();
    const router = useRouter();

    const handleNavigation = (url: string) => {
        if (orgId && url) {
            router.push(`/admin/${orgId}/${url}`); // Construct the URL and navigate
        } else {
            console.warn("orgId is not available.  Cannot navigate.");
        }
    };

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <TeamSwitcher orgs={orgs} />
            </SidebarHeader>
            <SidebarContent>
                <NavProjects
                    projects={data.sections}
                    onNavigate={handleNavigation}
                />
                {/*<NavMain items={data.navMain} />*/}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
