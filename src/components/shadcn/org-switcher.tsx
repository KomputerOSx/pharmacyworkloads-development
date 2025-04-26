"use client";

import * as React from "react";
import { ChevronsUpDown, Cog, House } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useParams } from "next/navigation";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useUser } from "@/hooks/admin/useUsers";

export function OrgSwitcher({
    orgs,
}: {
    orgs: {
        id: string;
        name: string;
        type: string;
    }[];
}) {
    const { isMobile } = useSidebar();

    const { orgId: currentOrgIdParam } = useParams(); // Renamed to avoid conflict

    const activeOrg = React.useMemo(() => {
        return orgs.find((org) => org.id === currentOrgIdParam);
    }, [orgs, currentOrgIdParam]);

    const [isLoading] = useState(false);

    const { user: authUser } = useAuth();
    const { data: userProfile } = useUser(authUser?.uid);

    // const handleOrgChange = (orgId: string) => {
    //     if (orgId === currentOrgIdParam) {
    //         return;
    //     }
    //
    //     setIsLoading(true);
    //
    //     router.push(`/admin/${orgId}`);
    // };

    if (isLoading) return <LoadingSpinner text={"Loading..."} />;

    if (!activeOrg) {
        console.warn(
            `No matching organization found for ID: ${currentOrgIdParam}`,
        );
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            {/*<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">*/}
                            {/*    <activeTeam.logo className="size-4" />*/}
                            {/*</div>*/}
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {activeOrg.name}
                                </span>
                                <span className="truncate text-xs">
                                    {activeOrg.type}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    {userProfile?.role === "admin" && (
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            {/*<DropdownMenuLabel className="text-muted-foreground text-xs">*/}
                            {/*    Organisations*/}
                            {/*</DropdownMenuLabel>*/}
                            {/*{orgs.sort().map((org, index) => (*/}
                            {/*    <DropdownMenuItem*/}
                            {/*        key={org.name}*/}
                            {/*        onClick={() => handleOrgChange(org.id)}*/}
                            {/*        className="gap-2 p-2"*/}
                            {/*    >*/}
                            {/*        {org.id === activeOrg.id ? (*/}
                            {/*            <strong>{org.name}</strong>*/}
                            {/*        ) : (*/}
                            {/*            org.name*/}
                            {/*        )}*/}
                            {/*        <DropdownMenuShortcut>*/}
                            {/*            ⌘{index + 1}*/}
                            {/*        </DropdownMenuShortcut>*/}
                            {/*    </DropdownMenuItem>*/}
                            {/*))}*/}
                            {/*<DropdownMenuSeparator />*/}

                            <Link
                                href="/admin/orgsConsole"
                                className="text-muted-foreground font-medium"
                            >
                                <DropdownMenuItem className="gap-2 p-2">
                                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                        <House className="size-4" />
                                    </div>
                                    Orgs Console
                                </DropdownMenuItem>
                            </Link>
                            <Link
                                href="/admin/moduleConsole"
                                className="text-muted-foreground font-medium"
                            >
                                <DropdownMenuItem className="gap-2 p-2">
                                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                        <Cog className="size-4" />
                                    </div>
                                    Module Console
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    )}
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
