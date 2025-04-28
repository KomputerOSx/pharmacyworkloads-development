"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useAuth } from "@/lib/context/AuthContext";
import { useUser } from "@/hooks/admin/useUsers";
import { useDepModuleAssignments } from "@/hooks/admin/useDepModuleAss";
import { useModulesByIds } from "@/hooks/admin/useModules";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CalendarDays,
    ClipboardList,
    LogOut,
    LucideIcon,
    Package,
    Pill,
    Terminal,
    User,
    Users,
} from "lucide-react";
import { useDep } from "@/hooks/admin/useDeps";

const iconMap: Record<string, LucideIcon> = {
    Package: Package,
    CalendarDays: CalendarDays,
    Pill: Pill,
    Users: Users,
    User: User,
    ClipboardList: ClipboardList,
    "weekly-rota": CalendarDays,
    pharmacy: Pill,
    "my-rota": User,
};

export default function UserPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const {
        data: userProfile,
        isLoading: profileLoading,
        isError: profileError,
        error: profileErrorDetails,
    } = useUser(authUser?.uid);

    // --- State Derivation ---
    const { orgId, depId } = useMemo(() => {
        if (!authLoading && !profileLoading && userProfile) {
            return {
                orgId: userProfile.orgId,
                depId: userProfile.departmentId,
            };
        }
        return { orgId: undefined, depId: undefined };
    }, [authLoading, profileLoading, userProfile]);

    const {
        data: assignments,
        isLoading: isLoadingAssignments,
        isError: isErrorAssignments,
        error: errorAssignments,
    } = useDepModuleAssignments(depId);

    const assignedModuleIds = useMemo(() => {
        if (!assignments) return [];
        return assignments.map((a) => a.moduleId);
    }, [assignments]);

    const {
        data: assignedModules,
        isLoading: isLoadingModules,
        isError: isErrorModules,
        error: errorModules,
    } = useModulesByIds(assignedModuleIds);

    const isLoadingUserProfile = authLoading || profileLoading;
    const isLoadingModulesData = isLoadingAssignments || isLoadingModules;
    const isErrorLoadingData = isErrorAssignments || isErrorModules;
    const dataError = errorAssignments || errorModules;

    const { data: dep } = useDep(userProfile?.departmentId);

    // 1. Handle User Profile Loading/Error (Critical Path)
    if (isLoadingUserProfile) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Loading your workspace..." />
            </div>
        );
    }

    if (profileError || !userProfile) {
        return (
            <div className="container mx-auto py-10 px-4 text-center">
                <Alert variant="destructive" className="max-w-md mx-auto">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Profile</AlertTitle>
                    <AlertDescription>
                        Could not load your user details. Please try logging out
                        and back in.
                        {profileErrorDetails instanceof Error
                            ? ` (${profileErrorDetails.message})`
                            : ""}
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => signOut(auth)}
                            className="mt-4"
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // 2. Handle Missing orgId or depId (Configuration Error)
    if (!orgId || !depId) {
        return (
            <div className="container mx-auto py-10 px-4 text-center">
                <Alert variant="destructive" className="max-w-md mx-auto">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Configuration Error</AlertTitle>
                    <AlertDescription>
                        Your profile is incomplete (missing organization or
                        department). Please contact support.
                        <br />
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => signOut(auth)}
                            className="mt-4"
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                        {userProfile.role === "admin" && (
                            <Link href={"/admin"}>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="mt-4 ml-4"
                                >
                                    <Users className="mr-2 h-4 w-4" /> Admin
                                    Dashboard
                                </Button>
                            </Link>
                        )}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // --- Render Main Content ---
    return (
        <div className="container mx-auto py-8 px-4">
            {/* ... Welcome Header and Logout Button ... */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome, {userProfile.firstName || "User"}!
                </h1>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut(auth)}
                >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>

            <div className="mb-8 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                    Your Assigned Modules
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                    Access your tools and workflows assigned to the{" "}
                    {/* Use department name from profile or fetched data */}
                    {dep?.name ? `'${dep.name}'` : "your"} department.
                </p>

                {/* Loading State for Modules */}
                {isLoadingModulesData && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-24 w-full rounded-lg"
                            /> // Adjusted height
                        ))}
                    </div>
                )}

                {/* Error State for Modules */}
                {isErrorLoadingData && !isLoadingModulesData && (
                    <Alert variant="destructive">
                        {/* ... Error content ... */}
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error Loading Modules</AlertTitle>
                        <AlertDescription>
                            Could not load assigned modules. Please try
                            refreshing.
                            {dataError instanceof Error
                                ? ` (${dataError.message})`
                                : ""}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Module Cards/Buttons - Data Ready */}
                {!isLoadingModulesData &&
                    !isErrorLoadingData &&
                    (assignedModules && assignedModules.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {assignedModules
                                .sort((a, b) =>
                                    a.displayName.localeCompare(b.displayName),
                                ) // Sort by displayName
                                .map((module) => {
                                    // Define base classes for consistent styling
                                    const cardBaseClasses =
                                        "h-24 w-full rounded-lg border p-4 flex flex-col items-center justify-center text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

                                    const IconComponent =
                                        module.icon && iconMap[module.icon]
                                            ? iconMap[module.icon]
                                            : Package;

                                    // Active Module: Render as a Link
                                    if (module.active) {
                                        const modulePath = `/main/module/${module.id}/${module.urlPath}`;
                                        const activeClasses =
                                            "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer";

                                        return (
                                            <Link
                                                key={module.id}
                                                href={modulePath}
                                                passHref
                                                title={module.displayName}
                                            >
                                                <div
                                                    className={`${cardBaseClasses} ${activeClasses}`}
                                                >
                                                    {/* Use the selected IconComponent */}
                                                    <IconComponent className="mb-1.5 h-6 w-6" />
                                                    <span className="text-sm font-semibold truncate w-full">
                                                        {module.displayName}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    }
                                    // Inactive Module: Render as a styled Div
                                    else {
                                        const inactiveClasses =
                                            "bg-muted text-muted-foreground opacity-60 cursor-not-allowed";
                                        return (
                                            <div
                                                key={module.id}
                                                className={`${cardBaseClasses} ${inactiveClasses}`}
                                                aria-disabled="true"
                                                title={`${module.displayName} (Inactive)`}
                                            >
                                                {/* Use the selected IconComponent */}
                                                <IconComponent className="mb-1.5 h-6 w-6" />
                                                <span className="text-sm font-semibold truncate w-full">
                                                    {module.displayName}
                                                </span>
                                                <span className="text-xs mt-0.5">
                                                    (Inactive)
                                                </span>
                                            </div>
                                        );
                                    }
                                })}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">
                            No modules are currently assigned to your
                            department.
                        </p>
                    ))}
            </div>

            {/* Optional: Add other dashboard widgets or sections here */}
        </div>
    );
}
