"use client";

import React, { useMemo } from "react";
import Link from "next/link";
// Removed useDeps hook
import { useDep } from "@/hooks/useDeps";
import { useDepTeams } from "@/hooks/useDepTeams";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Terminal,
    CalendarDays,
    Pencil,
    RefreshCw,
    Users, // Example icon
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useUser } from "@/hooks/useUsers";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useParams } from "next/navigation";

export default function MyDepartmentTeamRotasPage() {
    const params = useParams();
    const moduleId = params.moduleId;

    const { user: authUser, loading: authLoading } = useAuth();
    const {
        data: userProfile,
        isLoading: profileLoading,
        isError: profileError,
        error: profileErrorDetails,
    } = useUser(authUser?.uid);

    // --- State Derivation ---
    // Derive both orgId and depId after profile is loaded
    const { orgId, depId } = useMemo(() => {
        if (!authLoading && !profileLoading && userProfile) {
            return {
                orgId: userProfile.orgId,
                depId: userProfile.departmentId, // Assuming it's named departmentId on profile
            };
        }
        return { orgId: undefined, depId: undefined };
    }, [authLoading, profileLoading, userProfile]);

    // Fetch current user's department details (optional, for display)
    const {
        data: currentDepartment,
        isLoading: isLoadingDep,
        isError: isErrorDep,
        error: errorDep,
        refetch: refetchDep,
        isRefetching: isRefetchingDep,
    } = useDep(depId); // Fetch by depId, enabled below

    // Fetch teams ONLY for the user's department
    const {
        data: departmentTeams, // Directly get the teams for this department
        isLoading: isLoadingTeams,
        isError: isErrorTeams,
        error: errorTeams,
        refetch: refetchTeams,
        isRefetching: isRefetchingTeams,
    } = useDepTeams(orgId!, depId!);

    // --- Combined Loading and Error States ---
    const isLoadingUserProfile = authLoading || profileLoading;
    // Include loading state for the specific department details fetch
    const isLoadingPageData = isLoadingDep || isLoadingTeams;
    const isRefetchingPageData = isRefetchingDep || isRefetchingTeams;

    // No need for teamsByDepartment memoization anymore

    // --- Handlers ---
    const handleRefresh = () => {
        if (orgId && depId) {
            void refetchDep();
            void refetchTeams();
        }
    };

    // --- Render Logic ---

    // 1. Handle User Profile Loading/Error First (Same as before)
    if (isLoadingUserProfile) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Loading user context..." />
            </div>
        );
    }
    if (profileError || !userProfile) {
        // Same error handling for profile
        return (
            <div className="container mx-auto py-6 px-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Could not load user profile. Please try logging in
                        again.
                        {profileErrorDetails instanceof Error
                            ? ` (${profileErrorDetails.message})`
                            : ""}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // 2. Handle Missing orgId or depId *after* profile load
    if (!orgId || !depId) {
        console.error(
            "User profile loaded, but orgId or depId is missing:",
            userProfile,
        );
        return (
            <div className="container mx-auto py-6 px-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Configuration Error</AlertTitle>
                    <AlertDescription>
                        Your user profile is not fully configured (missing
                        organization or department assignment). Please contact
                        support.
                        <Button
                            variant="destructive"
                            onClick={() => signOut(auth)}
                            className="ml-4 mt-2"
                        >
                            Logout
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // 3. Handle Department/Team Data Loading (orgId and depId are guaranteed)
    if (isLoadingPageData && !isRefetchingPageData) {
        // Simplified skeleton for loading one department's teams
        return (
            <div className="container mx-auto py-6 px-4 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Skeleton for Title (might use department name later) */}
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-9 w-24" /> {/* Refresh button */}
                </div>
                <div className="space-y-3 p-4 border rounded-lg shadow-sm">
                    <Skeleton className="h-6 w-1/4 mb-4" />{" "}
                    {/* Department Name skeleton */}
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>
        );
    }

    // 4. Handle Department/Team Fetch Error
    if (isErrorDep || isErrorTeams) {
        const error = errorDep || errorTeams; // Prioritize which error to show?
        const errorSource = isErrorDep ? "department details" : "team list";
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    {/* Try to show department name if available, otherwise generic title */}
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {currentDepartment
                            ? `${currentDepartment.name} - `
                            : ""}{" "}
                        Team Rotas
                    </h1>
                    <Button
                        variant={"outline"}
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefetchingPageData}
                    >
                        {isRefetchingPageData ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        {isRefetchingPageData ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Data</AlertTitle>
                    <AlertDescription>
                        Could not load {errorSource}.{" "}
                        {error instanceof Error
                            ? error.message
                            : "An unknown error occurred."}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRefresh}
                            className="ml-4 mt-2"
                            disabled={isRefetchingPageData}
                        >
                            {isRefetchingPageData ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : null}
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // 5. Data is Ready (Profile, Department, Teams) - Render the list for the user's department
    const departmentName = currentDepartment?.name ?? "Your Department"; // Fallback name
    const sortedTeams =
        departmentTeams?.sort((a, b) => a.name.localeCompare(b.name)) ?? [];

    return (
        <div className="container mx-auto py-6 px-4 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />{" "}
                    {/* Example Icon */}
                    {departmentName} - Team Rotas
                </h1>
                <Button
                    variant={"outline"}
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefetchingPageData}
                >
                    {isRefetchingPageData ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {isRefetchingPageData ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            {/* Section for the single department */}
            <section aria-labelledby="dept-teams-heading">
                <h2 id="dept-teams-heading" className="sr-only">
                    {departmentName} Teams
                </h2>{" "}
                {/* Screen reader heading */}
                {sortedTeams.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No teams found in your assigned department.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {sortedTeams.map((team) => {
                            // Construct path using confirmed orgId and module structure
                            const basePath = `/main/module/${moduleId}/weekly-rota`; // Adjust if needed

                            return (
                                <li
                                    key={team.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                >
                                    <span
                                        className="font-medium text-sm flex-1 truncate mr-4"
                                        title={team.name}
                                    >
                                        {team.name}
                                    </span>
                                    <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
                                        <Link
                                            href={`${basePath}/${team.id}/viewRota`}
                                            passHref
                                        >
                                            <Button variant="outline" size="sm">
                                                <CalendarDays className="mr-1.5 h-4 w-4" />
                                                View Rota
                                            </Button>
                                        </Link>
                                        {/* Optional: Add role-based check for edit button */}
                                        {userProfile?.role === "manager" && (
                                            <Link
                                                href={`${basePath}/${team.id}/editRota`}
                                                passHref
                                            >
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                >
                                                    <Pencil className="mr-1.5 h-4 w-4" />
                                                    Edit Rota
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
