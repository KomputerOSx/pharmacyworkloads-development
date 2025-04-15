//src/app/(protected)/admin/[orgId]/weeklyRota/[teamId]/editRota/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react"; // Import useMemo
import { UserRotaManager } from "@/components/rota/user-rota-manager";
import { useUsers } from "@/hooks/useUsers"; // Gets specific user and all users
import { useHospLocs } from "@/hooks/useHospLoc"; // Gets all locations in Org
import { useDepTeam } from "@/hooks/useDepTeams"; // Gets SPECIFIC team details
import { useDepHospLocAssignments } from "@/hooks/useDepHospLocAss"; // ASSUMED HOOK: Gets Loc IDs for a Dep
import { useUserTeamAssignmentsByTeam } from "@/hooks/useUserTeamAss"; // Gets User IDs for a Team
import { useAuth } from "@/lib/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For error state
import { Terminal } from "lucide-react";

export default function EditRota() {
    const params = useParams();
    const orgId = params.orgId as string;
    const teamId = params.teamId as string;

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
    } = useUsers(orgId);

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
    } = useHospLocs(orgId);

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
        isLoadingOrgLocs;

    const isError =
        isErrorTeam ||
        isErrorUsers ||
        isErrorAssignments ||
        isErrorDepLocs ||
        isErrorOrgLocs;

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
            </h1>
            <div className="mt-6">
                <UserRotaManager
                    users={usersForTeam}
                    locations={locationsForDepartment}
                    teamId={teamId}
                    orgId={orgId}
                    allOrgUsers={allOrgUsers}
                    currentUserId={currentUserId}
                />
            </div>
        </div>
    );
}
