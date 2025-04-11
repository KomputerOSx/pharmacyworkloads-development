import {
    getUserTeamAssignmentsByUser,
    getUserTeamAssignmentsByTeam,
    createUserTeamAssignment,
    deleteUserTeamAssignment,
    updateUserTeamAssignmentDates,
} from "@/services/userTeamAssService";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserTeamAss } from "@/types/userTypes";

// --- Query Keys Factory ---
export const userTeamAssKeys = {
    all: ["userTeamAssignments"] as const,
    lists: () => [...userTeamAssKeys.all, "list"] as const,
    listByUser: (userId: string) =>
        [...userTeamAssKeys.lists(), { type: "user", userId }] as const,
    listByTeam: (teamId: string) =>
        [...userTeamAssKeys.lists(), { type: "team", teamId }] as const,
    details: () => [...userTeamAssKeys.all, "detail"] as const,
    detail: (id: string) => [...userTeamAssKeys.details(), id] as const,
};

/** Hook to fetch team assignments for a specific user. */
export function useUserTeamAssignmentsByUser(userId?: string) {
    return useQuery<UserTeamAss[], Error>({
        queryKey: userTeamAssKeys.listByUser(userId!),
        queryFn: () => getUserTeamAssignmentsByUser(userId!),
        enabled: !!userId,
        staleTime: 3 * 60 * 1000,
    });
}

/** Hook to fetch user assignments for a specific team. */
export function useUserTeamAssignmentsByTeam(teamId?: string) {
    return useQuery<UserTeamAss[], Error>({
        queryKey: userTeamAssKeys.listByTeam(teamId!),
        queryFn: () => getUserTeamAssignmentsByTeam(teamId!),
        enabled: !!teamId,
        staleTime: 3 * 60 * 1000,
    });
}

// Add useAssignmentsByOrg / useAssignmentsByDep if needed

/** Hook for creating a new user-team assignment. */
export function useCreateUserTeamAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: {
            userIdToAssign: string;
            teamId: string;
            orgId: string;
            depId: string;
            startDate?: Date | null;
            endDate?: Date | null;
            createdById?: string;
        }) =>
            createUserTeamAssignment(
                variables.userIdToAssign,
                variables.teamId,
                variables.orgId,
                variables.depId,
                variables.startDate,
                variables.endDate,
                variables.createdById,
            ),
        onSuccess: async (newAssignment, variables) => {
            // Invalidate lists related to the specific user and team
            await queryClient.invalidateQueries({
                queryKey: userTeamAssKeys.listByUser(variables.userIdToAssign),
            });
            await queryClient.invalidateQueries({
                queryKey: userTeamAssKeys.listByTeam(variables.teamId),
            });
            // Invalidate org/dep lists if those queries exist and are used
            // await queryClient.invalidateQueries({ queryKey: userTeamAssKeys.listByDep(variables.depId) });
            // await queryClient.invalidateQueries({ queryKey: userTeamAssKeys.listByOrg(variables.orgId) });

            if (newAssignment) {
                queryClient.setQueryData(
                    userTeamAssKeys.detail(newAssignment.id),
                    newAssignment,
                );
            }
            console.log(
                `eF9dN3kM - User-Team Assignment created U:${variables.userIdToAssign} T:${variables.teamId}. Caches invalidated.`,
            );
            toast.success("User assigned to team successfully!");
        },
        onError: (error: Error) => {
            console.error(
                `UyChVT83 - Error creating user-team assignment:`,
                error,
            );
            if (error.message.includes("already assigned")) {
                toast.warning(error.message);
            } else {
                toast.error(
                    `Error(eEtdP2WX): Failed to assign user: ${error.message}`,
                );
            }
        },
    });
}

/** Hook for deleting a user-team assignment. */
export function useDeleteUserTeamAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: {
            id: string; // Assignment ID to delete
            // Include related IDs for invalidation
            userId: string;
            teamId: string;
            // depId: string; // Include if dep list query exists
            // orgId: string; // Include if org list query exists
        }) => deleteUserTeamAssignment(variables.id),

        onSuccess: async (_, variables) => {
            console.log(
                `X12z4Unj - Deletion mutation succeeded for assignment ${variables.id}.`,
            );
            // Invalidate relevant lists
            await queryClient.invalidateQueries({
                queryKey: userTeamAssKeys.listByUser(variables.userId),
            });
            await queryClient.invalidateQueries({
                queryKey: userTeamAssKeys.listByTeam(variables.teamId),
            });
            // await queryClient.invalidateQueries({ queryKey: userTeamAssKeys.listByDep(variables.depId) });
            // await queryClient.invalidateQueries({ queryKey: userTeamAssKeys.listByOrg(variables.orgId) });

            queryClient.removeQueries({
                queryKey: userTeamAssKeys.detail(variables.id),
            });
            console.log(
                `gP5rT9wE - Invalidated caches & removed detail for assignment ${variables.id}.`,
            );
            toast.success("User unassigned from team successfully!");
        },
        onError: (error: Error, variables) => {
            console.error(
                `qL2mS8dN - Error deleting assignment ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(xY7cZ1vB): Failed to unassign user: ${error.message}`,
            );
        },
    });
}

/** Hook for updating user-team assignment dates. */
export function useUpdateUserTeamAssignmentDates() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: {
            id: string;
            startDate: Date | null;
            endDate: Date | null;
            updatedBy: string;
            userId: string;
            teamId: string;
        }) =>
            updateUserTeamAssignmentDates(
                variables.id,
                variables.startDate,
                variables.endDate,
                variables.updatedBy,
            ),
        onSuccess: (updatedAssignment, variables) => {
            // --- Direct Cache Update for the List by Team ---
            queryClient.setQueryData<UserTeamAss[]>(
                userTeamAssKeys.listByTeam(variables.teamId),
                (oldData) => {
                    if (!oldData) {
                        console.warn(
                            `Cache for listByTeam ${variables.teamId} not found during update.`,
                        );
                        return [];
                    }
                    return oldData.map((item) =>
                        item.id === updatedAssignment.id
                            ? updatedAssignment
                            : item,
                    );
                },
            );

            queryClient.setQueryData(
                userTeamAssKeys.detail(variables.id),
                updatedAssignment,
            );

            queryClient
                .invalidateQueries({
                    queryKey: userTeamAssKeys.listByUser(variables.userId),
                })
                .catch((err) =>
                    console.error("Failed to invalidate listByUser:", err),
                );

            console.log(
                `wE3rT9uJ - Dates updated for assignment ${variables.id}. Cache updated directly.`,
            );
            toast.success("Assignment dates updated.");
        },
        onError: (error: Error, variables) => {
            console.error(
                `fG8hY2vK - Error updating dates for assignment ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(jM1nB4cP): Failed to update assignment dates: ${error.message}`,
            );
        },
    });
}
