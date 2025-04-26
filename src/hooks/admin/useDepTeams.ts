import {
    getDepTeams,
    getDepTeam,
    createDepTeam,
    updateDepTeam,
    deleteDepTeam,
    getAllOrgTeams,
} from "@/services/admin/depTeamsService";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DepTeam } from "@/types/subDepTypes";

// --- Query Keys Factory ---
export const depTeamKeys = {
    all: ["depTeams"] as const, // Base key
    lists: () => [...depTeamKeys.all, "list"] as const, // Distinguisher for lists
    listByOrg: (orgId: string) =>
        [...depTeamKeys.lists(), { scope: "org", orgId }] as const,
    listByOrgAndDep: (orgId: string, depId: string) =>
        [
            ...depTeamKeys.lists(),
            { orgId, depId }, // Object for clarity and order independence
        ] as const,
    details: () => [...depTeamKeys.all, "detail"] as const, // Distinguisher for details
    detail: (id: string) => [...depTeamKeys.details(), id] as const, // Specific detail
};

/**
 * Hook to fetch a list of department teams for a given organization and department.
 * @param orgId - The organization ID.
 * @param depId - The department ID.
 */
export function useDepTeams(orgId?: string, depId?: string) {
    return useQuery<DepTeam[], Error>({
        queryKey: depTeamKeys.listByOrgAndDep(orgId!, depId!),
        queryFn: () => getDepTeams(orgId!, depId!),
        enabled: !!orgId && !!depId, // Only run query if both IDs are provided
        staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    });
}

/**
 * Hook to fetch a single department team by its ID.
 * @param id - The ID of the department team.
 */
export function useDepTeam(id?: string) {
    return useQuery<DepTeam | null, Error>({
        queryKey: depTeamKeys.detail(id!),
        queryFn: () => getDepTeam(id!),
        enabled: !!id, // Only run query if ID is provided
    });
}

export function useAllOrgTeams(orgId?: string) {
    return useQuery<DepTeam[], Error>({
        queryKey: depTeamKeys.listByOrg(orgId!),
        queryFn: () => getAllOrgTeams(orgId!),
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook for creating a new department team.
 */
export function useCreateDepTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            teamData: Omit<
                Partial<DepTeam>,
                | "id"
                | "createdAt"
                | "updatedAt"
                | "createdById"
                | "updatedById"
                | "orgId"
                | "depId"
            >;
            orgId: string;
            depId: string;
            userId?: string;
        }) =>
            createDepTeam(
                variables.teamData,
                variables.orgId,
                variables.depId,
                variables.userId,
            ),
        onSuccess: async (newlyCreatedTeam, variables) => {
            // Invalidate the cache for the list this team belongs to
            await queryClient.invalidateQueries({
                queryKey: depTeamKeys.listByOrgAndDep(
                    variables.orgId,
                    variables.depId,
                ),
            });

            // Optionally, directly update the cache for the new team's detail
            if (newlyCreatedTeam) {
                queryClient.setQueryData(
                    depTeamKeys.detail(newlyCreatedTeam.id),
                    newlyCreatedTeam,
                );
                console.log(
                    `kL9mJ3pW - Cache populated for new team detail: ${newlyCreatedTeam.id}`,
                );
            }

            console.log(
                `bH5fD1zQ - Team creation successful for org ${variables.orgId}, dep ${variables.depId}. Invalidated list query.`,
            );
            toast.success("Department Team created successfully!");
        },
        onError: (error, variables) => {
            console.error(
                `rG2sN8vC - Error creating team for org ${variables.orgId}, dep ${variables.depId}:`,
                error,
            );
            toast.error(
                `Error(pY7bV3xE): Failed to create team: ${error.message}`,
            );
        },
    });
}

/**
 * Hook for updating an existing department team.
 */
export function useUpdateDepTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string;
            teamData: Omit<
                Partial<DepTeam>,
                | "id"
                | "createdAt"
                | "updatedAt"
                | "createdById"
                | "updatedById"
                | "orgId"
                | "depId"
            >;
            orgId: string; // Needed to invalidate the correct list cache
            depId: string; // Needed to invalidate the correct list cache
            userId?: string;
        }) => updateDepTeam(variables.id, variables.teamData, variables.userId),
        onSuccess: async (updatedTeam, variables) => {
            // Invalidate both the list and the specific detail query
            await queryClient.invalidateQueries({
                queryKey: depTeamKeys.listByOrgAndDep(
                    variables.orgId,
                    variables.depId,
                ),
            });
            await queryClient.invalidateQueries({
                queryKey: depTeamKeys.detail(variables.id),
            });

            // Optionally, update the detail cache directly
            if (updatedTeam) {
                queryClient.setQueryData(
                    depTeamKeys.detail(variables.id),
                    updatedTeam,
                );
                console.log(
                    `fD1zQ9wB - Cache updated directly for team detail: ${variables.id}`,
                );
            } else {
                console.warn(
                    `sK4jP8vN - Update mutation returned no data for team ${variables.id}. Detail cache not updated directly. Relying on invalidation.`,
                );
            }

            console.log(
                `uN6pL2hT - Team update successful for ID ${variables.id}. Invalidated list for org ${variables.orgId}, dep ${variables.depId} and detail query.`,
            );
            toast.success("Department Team updated successfully!");
        },
        onError: (error, variables) => {
            console.error(
                `wB9nT1kF - Error updating team ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(qZ3vB7nM): Failed to update team: ${error.message}`,
            );
        },
    });
}

/**
 * Hook for deleting a department team.
 */
export function useDeleteDepTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string; // ID of the team to delete
            orgId: string; // Org ID needed to invalidate the list cache
            depId: string; // Dep ID needed to invalidate the list cache
        }) => deleteDepTeam(variables.id), // Service function only needs the ID

        onSuccess: async (result, variables) => {
            console.log(
                `aF7dS2hN - Deletion mutation succeeded for team ${variables.id}. Result:`,
                result, // Result from deleteDoc is usually undefined
            );

            // Invalidate the list cache
            await queryClient.invalidateQueries({
                queryKey: depTeamKeys.listByOrgAndDep(
                    variables.orgId,
                    variables.depId,
                ),
            });
            console.log(
                `eP5dN3kM - Invalidated team list cache for org: ${variables.orgId}, dep: ${variables.depId}`,
            );

            // Remove the specific team's detail query from the cache
            queryClient.removeQueries({
                queryKey: depTeamKeys.detail(variables.id),
            });
            console.log(
                `yG8bN1wQ - Removed team detail cache for ID: ${variables.id}`,
            );

            toast.success("Department Team deleted successfully!");
        },
        onError: (error, variables) => {
            console.error(
                `nC1xT8dR - Error deleting team ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(LUy4qd8r): Failed to delete team: ${error.message}`,
            );
        },
    });
}
