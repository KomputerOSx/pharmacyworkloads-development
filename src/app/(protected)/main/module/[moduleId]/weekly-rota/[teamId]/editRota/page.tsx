//src/app/(protected)/main/[orgId]/weeklyRota/[teamId]/editRota/page.tsx
"use client";

import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import { UserRotaManager } from "@/components/rota/user-rota-manager";
import { useUser, useUsers } from "@/hooks/admin/useUsers";
import { useHospLocs } from "@/hooks/admin/useHospLoc";
import { useDepTeam } from "@/hooks/admin/useDepTeams";
import { useDepHospLocAssignments } from "@/hooks/admin/useDepHospLocAss";
import { useUserTeamAssignmentsByTeam } from "@/hooks/admin/useUserTeamAss";
import { useAuth } from "@/lib/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CalendarDays, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditRota() {
    const params = useParams();
    const moduleId = params.moduleId as string;
    const teamId = params.teamId as string;

    const { user: authUser, loading: authLoading } = useAuth();
    const {
        data: userProfile,
        isLoading: profileLoading,
        isError: profileError,
        error: profileErrorDetails,
    } = useUser(authUser?.uid);

    // --- State Derivation ---
    // Derive both orgId and depId after profile is loaded
    const { orgId } = useMemo(() => {
        if (!authLoading && !profileLoading && userProfile) {
            return {
                orgId: userProfile.orgId,
                depId: userProfile.departmentId,
            };
        }
        return { orgId: undefined };
    }, [authLoading, profileLoading, userProfile]);

    // 1. Get Authenticated User (for currentUserId prop)
    const { user: currentAuth } = useAuth();
    const currentUserId = currentAuth?.uid;

    // 2. Fetch the Specific Team being edited to get its departmentId
    const {
        data: team,
        isLoading: isLoadingTeam,
        isError: isErrorTeam,
    } = useDepTeam(teamId);

    const teamDepId = team?.depId;

    // 3. Fetch ALL Users in the Org (needed for mapping later)
    const {
        data: allOrgUsers,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
    } = useUsers(orgId!);

    // 4. Fetch User IDs assigned SPECIFICALLY to this Team
    const {
        data: teamUserAssignments,
        isLoading: isLoadingAssignments,
        isError: isErrorAssignments,
    } = useUserTeamAssignmentsByTeam(teamId);

    // 5. Fetch Location IDs assigned to the Team's Department
    // This hook is enabled only AFTER we have the team's depId

    const {
        data: depLocationAssignments,
        isLoading: isLoadingDepLocs,
        isError: isErrorDepLocs,
    } = useDepHospLocAssignments(teamDepId || "");

    // 6. Fetch ALL Locations in the Org (needed for mapping later)
    const {
        data: allOrgLocations,
        isLoading: isLoadingOrgLocs,
        isError: isErrorOrgLocs,
    } = useHospLocs(orgId!);

    // 7. Memoize the list of Users assigned to the team
    const usersForTeam = useMemo(() => {
        if (!teamUserAssignments || !allOrgUsers) return undefined; // Return undefined if data isn't ready
        const assignedUserIds = new Set(
            teamUserAssignments.map((a) => a.userId),
        );
        return allOrgUsers.filter((user) => assignedUserIds.has(user.id));
    }, [teamUserAssignments, allOrgUsers]);

    // 8. Memoize the list of Locations assigned to the team's department
    const locationsForDepartment = useMemo(() => {
        if (!depLocationAssignments || !allOrgLocations) return undefined; // Return undefined if data isn't ready
        const assignedLocationIds = new Set(
            depLocationAssignments.map((a) => a.locationId),
        );

        return allOrgLocations.filter((loc) => assignedLocationIds.has(loc.id));
    }, [depLocationAssignments, allOrgLocations]);

    // --- Loading and Error Handling ---
    const isLoading =
        isLoadingTeam ||
        isLoadingUsers ||
        isLoadingAssignments ||
        isLoadingDepLocs ||
        isLoadingOrgLocs ||
        profileError;

    const isError =
        isErrorTeam ||
        isErrorUsers ||
        isErrorAssignments ||
        isErrorDepLocs ||
        isErrorOrgLocs ||
        profileErrorDetails;

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Skeleton className="h-[400px] w-full" />{" "}
                {/* Placeholder for the manager */}
            </div>
        );
    }

    if (
        isError ||
        !team ||
        !currentUserId ||
        !usersForTeam ||
        !locationsForDepartment
    ) {
        // Handle crucial data missing after loading attempt
        let errorMsg = "Failed to load required data for the rota editor.";
        if (!team) errorMsg = "Could not load team details.";
        else if (!currentUserId) errorMsg = "Could not identify current user.";
        else if (!usersForTeam) errorMsg = "Could not load users for the team.";
        else if (!locationsForDepartment)
            errorMsg = "Could not load locations for the department.";

        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
            </div>
        );
    }

    // --- Render StaffRotaManager with Correct Data ---
    return (
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold mb-4">
                Edit Rota for Team:{" "}
                <span className="text-primary">{team.name}</span>
                <span className="flex justify-end">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/main/module/${moduleId}/weekly-rota/${teamId}/viewRota`}
                            passHref
                        >
                            <Button variant="outline">
                                <CalendarDays className="mr-2 h-4 w-4" /> View
                                Rota
                            </Button>
                        </Link>
                        <Link
                            href={`/main/module/${moduleId}/weekly-rota/`}
                            passHref
                        >
                            <Button variant="default" size={"sm"}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Go back
                            </Button>
                        </Link>
                    </div>
                </span>
            </h1>

            <div className="mt-6">
                <UserRotaManager
                    users={usersForTeam}
                    locations={locationsForDepartment}
                    teamId={teamId}
                    orgId={orgId!}
                    allOrgUsers={allOrgUsers}
                    currentUserId={currentUserId}
                />
            </div>
        </div>
    );
}
