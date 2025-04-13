// src/hooks/useRotaAssignments.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    getAssignmentsByWeek,
    getAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    saveWeekAssignmentsBatch,
    getAssignmentsByWeekAndTeam,
} from "@/services/rotaAssignmentsService";

import { StoredAssignment } from "@/types/rotaTypes";

export const assignmentKeys = {
    all: ["assignments"] as const,
    lists: () => [...assignmentKeys.all, "list"] as const,
    listByWeek: (weekId: string) =>
        [...assignmentKeys.lists(), { weekId }] as const,
    listByWeekAndTeam: (
        weekId: string,
        teamId: string, // New key structure
    ) => [...assignmentKeys.lists(), { weekId, teamId }] as const,
    details: () => [...assignmentKeys.all, "detail"] as const,
    detail: (assignmentId: string) =>
        [...assignmentKeys.details(), assignmentId] as const,
};

export function useAssignmentsByWeek(weekId?: string | null) {
    return useQuery<StoredAssignment[], Error>({
        queryKey: assignmentKeys.listByWeek(weekId!),
        queryFn: () => {
            if (!weekId) throw new Error("Week ID is required");
            return getAssignmentsByWeek(weekId);
        },
        enabled: !!weekId,
        staleTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

export function useRotaAssignmentsByWeekAndTeam(
    weekId?: string | null,
    teamId?: string | null,
) {
    const queryKey = assignmentKeys.listByWeekAndTeam(weekId!, teamId!);

    return useQuery<StoredAssignment[], Error>({
        queryKey: queryKey,
        queryFn: () => {
            // Ensure both IDs are present before calling service
            if (!weekId || !teamId) {
                console.warn("Attempted fetch without weekId or teamId", {
                    weekId,
                    teamId,
                });
                // Returning empty array when disabled might be cleaner for initial state
                return Promise.resolve([]);
                // Or throw: throw new Error("Week ID and Team ID are required");
            }
            return getAssignmentsByWeekAndTeam(weekId, teamId); // Call updated service fn
        },
        // Enable only when BOTH weekId and teamId are valid strings
        enabled: !!weekId && !!teamId,
        staleTime: 5 * 60 * 1000, // Example: 5 minutes
        retry: 1, // Example: retry once on error
        // Keep previous data while loading new week/team data for smoother transitions
        // keepPreviousData: true, // Consider adding this
    });
}

export function useAssignmentDetail(assignmentId?: string | null) {
    return useQuery<StoredAssignment | null, Error>({
        queryKey: assignmentKeys.detail(assignmentId!),
        queryFn: () => getAssignment(assignmentId!),
        enabled: !!assignmentId,
        staleTime: 15 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

export function useCreateAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            assignmentData: Omit<
                StoredAssignment,
                "id" | "createdAt" | "updatedAt"
            >;
            userId: string;
        }) => createAssignment(variables.assignmentData, variables.userId),

        onSuccess: async (newlyCreatedAssignment, variables) => {
            console.log(
                "Assignment creation successful:",
                newlyCreatedAssignment.id,
            );
            await queryClient.invalidateQueries({
                queryKey: assignmentKeys.listByWeek(
                    variables.assignmentData.weekId,
                ),
            });
            console.log(
                `Invalidated assignment list cache for week: ${variables.assignmentData.weekId}`,
            );

            queryClient.setQueryData(
                assignmentKeys.detail(newlyCreatedAssignment.id),
                newlyCreatedAssignment,
            );
            console.log(
                `Pre-populated cache for new assignment detail: ${newlyCreatedAssignment.id}`,
            );

            toast.success("Assignment created successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `W5aEvjRc - Error creating assignment for week ${variables.assignmentData.weekId}:`,
                error,
            );
            toast.error(
                `Error: Failed to create assignment - ${error.message}`,
            );
        },
    });
}

export function useUpdateAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            assignmentId: string;
            dataToUpdate: Partial<
                Omit<StoredAssignment, "id" | "createdAt" | "createdById">
            >;
            userId: string;
            weekId: string;
        }) =>
            updateAssignment(
                variables.assignmentId,
                variables.dataToUpdate,
                variables.userId,
            ),

        onMutate: async (variables) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: assignmentKeys.listByWeek(variables.weekId),
            });

            // Snapshot the previous value
            const previousAssignments = queryClient.getQueryData(
                assignmentKeys.listByWeek(variables.weekId),
            );

            // Optimistically update the cache
            queryClient.setQueryData<StoredAssignment[]>(
                assignmentKeys.listByWeek(variables.weekId),
                (old) => {
                    if (!old) return [];
                    return old.map((assignment) =>
                        assignment.id === variables.assignmentId
                            ? { ...assignment, ...variables.dataToUpdate }
                            : assignment,
                    );
                },
            );

            // Return context with the previous value
            return { previousAssignments };
        },

        onSuccess: async (updatedAssignment, variables) => {
            console.log(
                "Assignment update successful:",
                variables.assignmentId,
            );
            await queryClient.invalidateQueries({
                queryKey: assignmentKeys.listByWeek(variables.weekId),
            });
            console.log(
                `Invalidated assignment list cache for week: ${variables.weekId}`,
            );

            await queryClient.invalidateQueries({
                queryKey: assignmentKeys.detail(variables.assignmentId),
            });
            // Optionally update detail cache immediately:
            // queryClient.setQueryData(assignmentKeys.detail(variables.assignmentId), updatedAssignment);
            console.log(
                `Invalidated assignment detail cache for: ${variables.assignmentId}`,
            );

            toast.success("Assignment updated successfully!");
        },

        onError: (err, variables, context) => {
            if (context?.previousAssignments) {
                queryClient.setQueryData(
                    assignmentKeys.listByWeek(variables.weekId),
                    context.previousAssignments,
                );
            }
        },
    });
}

export function useDeleteAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: { assignmentId: string; weekId: string }) =>
            deleteAssignment(variables.assignmentId),

        onSuccess: async (result, variables) => {
            console.log(
                `Deletion mutation succeeded for assignment ${variables.assignmentId}`,
            );
            await queryClient.invalidateQueries({
                queryKey: assignmentKeys.listByWeek(variables.weekId),
            });
            console.log(
                `Invalidated assignment list cache for week: ${variables.weekId}`,
            );

            queryClient.removeQueries({
                queryKey: assignmentKeys.detail(variables.assignmentId),
            });
            console.log(
                `Removed assignment detail cache for ID: ${variables.assignmentId}`,
            );

            toast.success("Assignment deleted successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `LxB7YyJJ - Error deleting assignment ${variables.assignmentId}:`,
                error,
            );
            toast.error(
                `Error: Failed to delete assignment - ${error.message}`,
            );
        },
    });
}

export function useSaveWeekAssignments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            weekId: string;
            teamId: string;
            assignmentsToSave: Omit<
                StoredAssignment,
                "id" | "createdAt" | "updatedAt"
            >[];
            userId: string;
        }) =>
            saveWeekAssignmentsBatch(
                variables.weekId,
                variables.teamId,
                variables.assignmentsToSave,
                variables.userId,
            ),

        onSuccess: async (data, variables) => {
            console.log(
                `Batch save successful for week ${variables.weekId}, team ${variables.teamId}`,
            );
            toast.success(
                `Rota for week ${variables.weekId} saved successfully!`,
            );

            await queryClient.invalidateQueries({
                queryKey: assignmentKeys.listByWeek(variables.weekId),
            });
            console.log(
                `Invalidated assignment list cache post-batch save for week: ${variables.weekId}`,
            );
        },
        onError: (error: Error, variables) => {
            console.error(
                `u9P57eNe - Error batch saving assignments for week ${variables.weekId}, team ${variables.teamId}:`,
                error,
            );
            toast.error(`Error saving rota: ${error.message}`);
        },
    });
}
