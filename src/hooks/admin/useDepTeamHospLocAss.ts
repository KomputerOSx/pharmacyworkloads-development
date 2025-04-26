import {
    getDepTeamHospLocAssignmentsByTeam,
    getDepTeamHospLocAssignmentsByLocation,
    getDepTeamHospLocAssignmentsByDepartment,
    createDepTeamHospLocAssignment,
    deleteDepTeamHospLocAssignment,
} from "@/services/admin/depTeamHospLocAssService";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DepTeamHospLocAss } from "@/types/depTypes";

// --- Query Keys Factory ---
export const depTeamHospLocAssKeys = {
    all: ["depTeamHospLocAssignments"] as const,
    lists: () => [...depTeamHospLocAssKeys.all, "list"] as const,
    listByTeam: (teamId: string) =>
        [...depTeamHospLocAssKeys.lists(), { type: "team", teamId }] as const,
    listByLocation: (locationId: string) =>
        [
            ...depTeamHospLocAssKeys.lists(),
            { type: "location", locationId },
        ] as const,
    listByDepartment: (depId: string) =>
        [
            ...depTeamHospLocAssKeys.lists(),
            { type: "department", depId },
        ] as const, // Key for department query
    details: () => [...depTeamHospLocAssKeys.all, "detail"] as const,
    detail: (id: string) => [...depTeamHospLocAssKeys.details(), id] as const,
};

/** Hook to fetch location assignments for a specific team. */
export function useAssignmentsByTeam(teamId?: string) {
    return useQuery<DepTeamHospLocAss[], Error>({
        queryKey: depTeamHospLocAssKeys.listByTeam(teamId!),
        queryFn: () => getDepTeamHospLocAssignmentsByTeam(teamId!),
        enabled: !!teamId,
        staleTime: 3 * 60 * 1000,
    });
}

/** Hook to fetch team assignments for a specific location. */
export function useAssignmentsByLocation(locationId?: string) {
    return useQuery<DepTeamHospLocAss[], Error>({
        queryKey: depTeamHospLocAssKeys.listByLocation(locationId!),
        queryFn: () => getDepTeamHospLocAssignmentsByLocation(locationId!),
        enabled: !!locationId,
        staleTime: 3 * 60 * 1000,
    });
}

/** Hook to fetch all location assignments across teams for a specific department. */
export function useAssignmentsByDepartment(depId?: string) {
    return useQuery<DepTeamHospLocAss[], Error>({
        queryKey: depTeamHospLocAssKeys.listByDepartment(depId!),
        queryFn: () => getDepTeamHospLocAssignmentsByDepartment(depId!),
        enabled: !!depId,
        staleTime: 3 * 60 * 1000,
    });
}

/** Hook for creating a new team-location assignment. */
export function useCreateTeamLocAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: {
            teamId: string;
            locationId: string;
            orgId: string;
            depId: string;
            userId?: string;
        }) =>
            createDepTeamHospLocAssignment(
                variables.teamId,
                variables.locationId,
                variables.orgId,
                variables.depId,
                variables.userId,
            ),
        onSuccess: async (newAssignment, variables) => {
            // Invalidate lists related to the specific team, location, and department
            await queryClient.invalidateQueries({
                queryKey: depTeamHospLocAssKeys.listByTeam(variables.teamId),
            });
            await queryClient.invalidateQueries({
                queryKey: depTeamHospLocAssKeys.listByLocation(
                    variables.locationId,
                ),
            });
            await queryClient.invalidateQueries({
                queryKey: depTeamHospLocAssKeys.listByDepartment(
                    variables.depId,
                ),
            });

            // Optionally pre-populate detail cache
            if (newAssignment) {
                queryClient.setQueryData(
                    depTeamHospLocAssKeys.detail(newAssignment.id),
                    newAssignment,
                );
            }
            console.log(
                `xY7cZ1vB - Assignment created T:${variables.teamId} L:${variables.locationId}. Caches invalidated.`,
            );
            toast.success("Location assigned to team successfully!");
        },
        onError: (error: Error) => {
            console.error(
                `wE3rT9uJ - Error creating team-location assignment:`,
                error,
            );
            if (error.message.includes("already exists")) {
                toast.warning(error.message);
            } else {
                toast.error(
                    `Error(fG8hY2vK): Failed to assign location: ${error.message}`,
                );
            }
        },
    });
}

/** Hook for deleting a team-location assignment. */
export function useDeleteTeamLocAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: {
            id: string; // ID of the assignment to delete
            // Include related IDs for invalidation
            teamId: string;
            locationId: string;
            depId: string;
        }) => deleteDepTeamHospLocAssignment(variables.id),

        onSuccess: async (_, variables) => {
            console.log(
                `jM1nB4cP - Deletion mutation succeeded for assignment ${variables.id}.`,
            );
            // Invalidate relevant lists
            await queryClient.invalidateQueries({
                queryKey: depTeamHospLocAssKeys.listByTeam(variables.teamId),
            });
            await queryClient.invalidateQueries({
                queryKey: depTeamHospLocAssKeys.listByLocation(
                    variables.locationId,
                ),
            });
            await queryClient.invalidateQueries({
                queryKey: depTeamHospLocAssKeys.listByDepartment(
                    variables.depId,
                ),
            });

            // Remove detail query from cache
            queryClient.removeQueries({
                queryKey: depTeamHospLocAssKeys.detail(variables.id),
            });
            console.log(
                `kL5pW9sD - Invalidated caches & removed detail for assignment ${variables.id}.`,
            );
            toast.success("Location unassigned from team successfully!");
        },
        onError: (error: Error, variables) => {
            console.error(
                `zX3cV7bR - Error deleting assignment ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(vC9xR4zG): Failed to unassign location: ${error.message}`,
            );
        },
    });
}
