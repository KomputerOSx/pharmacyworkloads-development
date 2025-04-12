// src/hooks/useRotaAssignments.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    getAssignmentsByWeek,
    getAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
} from "@/services/rotaAssignmentsService";

import { StoredAssignment } from "@/types/rotaTypes";

export const assignmentKeys = {
    all: ["assignments"] as const,
    lists: () => [...assignmentKeys.all, "list"] as const,
    listByWeek: (weekId: string) =>
        [...assignmentKeys.lists(), { weekId }] as const,
    details: () => [...assignmentKeys.all, "detail"] as const,
    detail: (assignmentId: string) =>
        [...assignmentKeys.details(), assignmentId] as const,
};

export function useAssignmentsByWeek(weekId?: string | null) {
    return useQuery<StoredAssignment[], Error>({
        queryKey: assignmentKeys.listByWeek(weekId!),
        queryFn: () => getAssignmentsByWeek(weekId!),
        enabled: !!weekId,
        staleTime: 5 * 60 * 1000,
        // keepPreviousData: true, // Consider if needed for your UX
    });
}

export function useAssignmentDetail(assignmentId?: string | null) {
    return useQuery<StoredAssignment | null, Error>({
        queryKey: assignmentKeys.detail(assignmentId!),
        queryFn: () => getAssignment(assignmentId!),
        enabled: !!assignmentId,
        staleTime: 15 * 60 * 1000,
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

        onError: (error, variables) => {
            console.error(
                `1TxhJHwu - Error updating assignment ${variables.assignmentId}:`,
                error,
            );
            toast.error(
                `Error: Failed to update assignment - ${error.message}`,
            );
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
