"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    UserCircle,
    Package,
    CalendarDays,
    Pill,
    Users,
    ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { NavUser } from "@/components/shadcn/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { useUser } from "@/hooks/admin/useUsers";
import { useDepModuleAssignments } from "@/hooks/admin/useDepModuleAss";
import { useModulesByIds } from "@/hooks/admin/useModules";
import { Module } from "@/types/moduleTypes";
import { useOrg } from "@/hooks/admin/useOrgs";
import { useDep } from "@/hooks/admin/useDeps";

// --- Icon Mapping (Same as before) ---
const iconMap: Record<string, LucideIcon> = {
    Package,
    LayoutDashboard,
    UserCircle,
    CalendarDays,
    Pill,
    Users,
    ClipboardList,
    "weekly-rota": CalendarDays,
    "daily-workload": ClipboardList,
    "pharmacy-orders": Pill,
};
const DefaultModuleIcon = Package;

// Interface for Nav Link items
interface NavLinkItem {
    title: string;
    url: string;
    icon: LucideIcon;
    disabled?: boolean;
}

export function UserSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const { user: authUser, loading: authLoading } = useAuth();
    const {
        data: userProfile,
        isLoading: profileLoading,
        isError: profileError,
    } = useUser(authUser?.uid);
    const pathname = usePathname();

    const orgId = userProfile?.orgId;
    const depId = userProfile?.departmentId;

    const { data: org } = useOrg(orgId);
    const { data: dep } = useDep(depId);

    const userOrgName = org?.name;
    const userDepName = dep?.name;

    // --- Fetch Assignments and Modules ---
    const {
        data: assignments,
        isLoading: isLoadingAssignments,
        isError: isErrorAssignments,
    } = useDepModuleAssignments(depId);
    const assignedModuleIds = useMemo(
        () => assignments?.map((a) => a.moduleId) ?? [],
        [assignments],
    );
    const {
        data: assignedModules,
        isLoading: isLoadingModules,
        isError: isErrorModules,
    } = useModulesByIds(assignedModuleIds);

    // --- Loading and Error States ---
    const isLoadingContext = authLoading || profileLoading;
    const isLoadingNavData = isLoadingAssignments || isLoadingModules;
    const hasNavDataError = isErrorAssignments || isErrorModules;

    // --- Generate Navigation Links ---
    const navigationLinks = useMemo(() => {
        const staticLinks: NavLinkItem[] = [
            {
                title: "Dashboard",
                url: `/main`,
                icon: LayoutDashboard,
            },
            // { title: "My Profile", url: `/main/profile`, icon: UserCircle },
        ];

        if (isLoadingNavData || hasNavDataError || !assignedModules) {
            return staticLinks;
        }

        const moduleLinks = assignedModules
            .filter((module): module is Module => module !== null)
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map((module): NavLinkItem => {
                const iconKey = module.icon || module.urlPath;
                const IconComponent =
                    (iconKey && iconMap[iconKey]) || DefaultModuleIcon;
                return {
                    title: module.displayName,
                    url: `/main/module/${module.id}/${module.urlPath}`,
                    icon: IconComponent,
                    disabled: !module.active,
                };
            });

        return [...staticLinks, ...moduleLinks];
    }, [assignedModules, isLoadingNavData, hasNavDataError]);

    // --- Render Helper: Sidebar Header ---
    const renderSidebarHeader = () => {
        if (isLoadingContext) {
            return (
                <div className="p-4 h-[68px] flex items-center">
                    <Skeleton className="h-5 w-3/4" />
                </div>
            );
        }
        if (profileError || !userProfile || !depId) {
            return (
                <div className="p-4 text-xs text-destructive h-[68px]">
                    Error loading context.
                </div>
            );
        }
        return (
            <div className="p-4 border-b border-border space-y-0.5">
                {userOrgName && (
                    <p
                        className="text-xl font-semibold truncate"
                        title={userOrgName}
                    >
                        {userOrgName}
                    </p>
                )}
                {userDepName && (
                    <p
                        className="text-m text-muted-foreground truncate"
                        title={userDepName}
                    >
                        {userDepName}
                    </p>
                )}
            </div>
        );
    };

    // --- Render Helper: Navigation Links ---
    const renderNavLinks = () => {
        if (isLoadingContext || isLoadingNavData) {
            return (
                <nav className="grid items-start gap-1 px-2 py-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton
                            key={`skel-${i}`}
                            className="h-9 w-full rounded-md"
                        />
                    ))}
                </nav>
            );
        }
        if (hasNavDataError) {
            return (
                <nav className="grid items-start gap-1 px-2 py-4">
                    {navigationLinks.slice(0, 2).map((item) => (
                        <Link
                            key={item.url}
                            href={item.url}
                            className={cn(
                                buttonVariants({
                                    variant: "ghost",
                                    size: "sm",
                                }),
                                "justify-start gap-2",
                            )}
                        >
                            <item.icon className="h-4 w-4" /> {item.title}
                        </Link>
                    ))}
                    <div className="px-2 pt-2">
                        {" "}
                        <Alert variant="destructive">
                            {" "}
                            <AlertDescription className="text-xs">
                                Failed to load modules.
                            </AlertDescription>{" "}
                        </Alert>{" "}
                    </div>
                </nav>
            );
        }
        return (
            <nav className="grid items-start gap-1 px-2 py-4">
                {navigationLinks.map((item) => {
                    const linkUrl = item.url.endsWith("/")
                        ? item.url
                        : `/${item.url}/`;
                    const currentPath = pathname.endsWith("/")
                        ? pathname
                        : `${pathname}/`;
                    const isActive =
                        currentPath.startsWith(linkUrl) ||
                        pathname === item.url;

                    if (item.disabled) {
                        return (
                            <span
                                key={item.url}
                                className={cn(
                                    buttonVariants({
                                        variant: "ghost",
                                        size: "sm",
                                    }),
                                    "justify-start gap-2 text-muted-foreground opacity-60 cursor-not-allowed",
                                )}
                                title={`${item.title} (Inactive)`}
                            >
                                <item.icon className="h-4 w-4" /> {item.title}
                            </span>
                        );
                    }
                    return (
                        <Link
                            key={item.url}
                            href={item.url}
                            className={cn(
                                buttonVariants({
                                    variant: "ghost",
                                    size: "sm",
                                }),
                                isActive
                                    ? "bg-muted hover:bg-muted font-semibold"
                                    : "hover:bg-transparent hover:underline",
                                "justify-start gap-2",
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <item.icon className="h-4 w-4" /> {item.title}
                        </Link>
                    );
                })}
            </nav>
        );
    };

    // --- Main Sidebar Structure ---
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>{renderSidebarHeader()}</SidebarHeader>
            <SidebarContent className="p-0 flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
