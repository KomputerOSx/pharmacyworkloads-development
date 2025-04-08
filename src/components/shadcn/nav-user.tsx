"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "sonner";

export function NavUser() {
    const { isMobile } = useSidebar();

    const { user, logout, isProcessingAuthAction } = useAuth();
    const router = useRouter();

    const handleLogout = async (event: Event) => {
        // Prevent default behavior if necessary (though onSelect might not need it)
        event.preventDefault();
        try {
            console.log("Logging out...");
            await logout();
            console.log("Logout successful, redirecting to login.");
            toast.success("Logout successful.");
            // Redirect to login page after successful logout
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            // Optional: Show an error toast to the user
            toast.error("Logout failed. Please try again.");
        }
    };

    const displayName = user?.displayName || "User";
    const displayEmail = user?.email || "No email provided";
    const avatarUrl = user?.photoURL || "";
    const fallbackInitial = displayName?.charAt(0)?.toUpperCase() || "U";

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            // Disable the trigger if an action is processing? Optional.
                            disabled={isProcessingAuthAction}
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={avatarUrl} // Use derived avatarUrl
                                    alt={displayName} // Use derived displayName
                                />
                                <AvatarFallback className="rounded-lg">
                                    {fallbackInitial}{" "}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {displayName}{" "}
                                    {/* Use derived displayName */}
                                </span>
                                <span className="truncate text-xs">
                                    {displayEmail}{" "}
                                    {/* Use derived displayEmail */}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={avatarUrl}
                                        alt={displayName}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {fallbackInitial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {displayName}
                                    </span>
                                    <span className="truncate text-xs">
                                        {displayEmail}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        {/*<DropdownMenuSeparator />*/}
                        {/*<DropdownMenuGroup>*/}
                        {/*  <DropdownMenuItem>*/}
                        {/*    <Sparkles />*/}
                        {/*    Upgrade to Pro*/}
                        {/*  </DropdownMenuItem>*/}
                        {/*</DropdownMenuGroup>*/}
                        {/*<DropdownMenuSeparator />*/}
                        {/*<DropdownMenuGroup>*/}
                        {/*  <DropdownMenuItem>*/}
                        {/*    <BadgeCheck />*/}
                        {/*    Account*/}
                        {/*  </DropdownMenuItem>*/}
                        {/*  <DropdownMenuItem>*/}
                        {/*    <CreditCard />*/}
                        {/*    Billing*/}
                        {/*  </DropdownMenuItem>*/}
                        {/*  <DropdownMenuItem>*/}
                        {/*    <Bell />*/}
                        {/*    Notifications*/}
                        {/*  </DropdownMenuItem>*/}
                        {/*</DropdownMenuGroup>*/}
                        <DropdownMenuItem
                            onSelect={handleLogout}
                            disabled={isProcessingAuthAction}
                            className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                        >
                            <LogOut className="mr-2 h-4 w-4" />{" "}
                            <span>
                                {isProcessingAuthAction
                                    ? "Logging out..."
                                    : "Log out"}
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
