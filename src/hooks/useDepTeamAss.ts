import {
    getAssignmentsByDepartment,
    getAssignmentsByTeam,
    getAssignmentById,
    createAssignment,
    deleteAssignment,
} from "@/services/depTeamAssService";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DepTeamAss } from "@/types/depTypes";

export const depTeamAssKeys = {
    all: ["depTeamAssignments"] as const,
    lists: () => [...depTeamAssKeys.all, "list"] as const,
    listByDepartment: (departmentId: string) =>
        [
            ...depTeamAssKeys.lists(),
            { type: "department", departmentId },
        ] as const,
    listByTeam: (teamId: string) =>
        [...depTeamAssKeys.lists(), { type: "team", teamId }] as const,
    details: () => [...depTeamAssKeys.all, "detail"] as const,
    detail: (id: string) => [...depTeamAssKeys.details(), id] as const,
};

export function useAssignmentsByDepartment(departmentId?: string) {
    return useQuery<DepTeamAss[], Error>({
        queryKey: depTeamAssKeys.listByDepartment(departmentId!),
        queryFn: () => getAssignmentsByDepartment(departmentId!),
        enabled: !!departmentId,
        staleTime: 3 * 60 * 1000, // Cache for 3 minutes
    });
}

/**
 * Hook to fetch assignments for a specific team.
 * @param teamId - The team ID.
 */
export function useAssignmentsByTeam(teamId?: string) {
    return useQuery<DepTeamAss[], Error>({
        queryKey: depTeamAssKeys.listByTeam(teamId!),
        queryFn: () => getAssignmentsByTeam(teamId!),
        enabled: !!teamId,
        staleTime: 3 * 60 * 1000, // Cache for 3 minutes
    });
}

/**
 * Hook to fetch a single assignment by its ID.
 * @param id - The assignment ID.
 */
export function useAssignmentById(id?: string) {
    return useQuery<DepTeamAss | null, Error>({
        queryKey: depTeamAssKeys.detail(id!),
        queryFn: () => getAssignmentById(id!),
        enabled: !!id,
    });
}

/**
 * Hook for creating a new department-team assignment.
 */
export function useCreateAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            departmentId: string;
            teamId: string;
            userId?: string;
        }) =>
            createAssignment(
                variables.departmentId,
                variables.teamId,
                variables.userId,
            ),
        onSuccess: async (newAssignment, variables) => {
            // Invalidate lists associated with both the department and the team
            await queryClient.invalidateQueries({
                queryKey: depTeamAssKeys.listByDepartment(
                    variables.departmentId,
                ),
            });
            await queryClient.invalidateQueries({
                queryKey: depTeamAssKeys.listByTeam(variables.teamId),
            });

            // Optionally pre-populate detail cache
            if (newAssignment) {
                queryClient.setQueryData(
                    depTeamAssKeys.detail(newAssignment.id),
                    newAssignment,
                );
                console.log(
                    `eF9dN3kM - Cache populated for new assignment detail: ${newAssignment.id}`,
                );
            }

            console.log(
                `UyChVT83 - Assignment created between dep ${variables.departmentId} and team ${variables.teamId}. Caches invalidated.`,
            );
            toast.success("Team assigned to department successfully!");
        },
        onError: (error, variables) => {
            console.error(
                `eEtdP2WX - Error creating assignment between dep ${variables.departmentId} and team ${variables.teamId}:`,
                error,
            );
            // Check for specific "already exists" error if thrown by service
            if (error.message.includes("already exists")) {
                toast.warning(error.message);
            } else {
                toast.error(
                    `Error(X12z4Unj): Failed to assign team: ${error.message}`,
                );
            }
        },
    });
}

/**
 * Hook for deleting a department-team assignment.
 */
export function useDeleteAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        // Variables need the IDs for cache invalidation, even if service only needs `id`
        mutationFn: (variables: {
            id: string; // ID of the assignment to delete
            departmentId: string; // Needed to invalidate department list
            teamId: string; // Needed to invalidate team list
        }) => deleteAssignment(variables.id),

        onSuccess: async (result, variables) => {
            console.log(
                `gP5rT9wE - Deletion mutation succeeded for assignment ${variables.id}.`,
            );

            // Invalidate relevant lists
            await queryClient.invalidateQueries({
                queryKey: depTeamAssKeys.listByDepartment(
                    variables.departmentId,
                ),
            });
            await queryClient.invalidateQueries({
                queryKey: depTeamAssKeys.listByTeam(variables.teamId),
            });
            console.log(
                `qL2mS8dN - Invalidated assignment lists for dep ${variables.departmentId} and team ${variables.teamId}.`,
            );

            // Remove detail query from cache
            queryClient.removeQueries({
                queryKey: depTeamAssKeys.detail(variables.id),
            });
            console.log(
                `xY7cZ1vB - Removed assignment detail cache for ID: ${variables.id}`,
            );

            toast.success("Team unassigned from department successfully!");
        },
        onError: (error, variables) => {
            console.error(
                `wE3rT9uJ - Error deleting assignment ${variables.id} (Dep: ${variables.departmentId}, Team: ${variables.teamId}):`,
                error,
            );
            toast.error(
                `Error(fG8hY2vK): Failed to unassign team: ${error.message}`,
            );
        },
    });
}
