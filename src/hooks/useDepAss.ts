import {
    getDepHospLocAssignments,
    getDepHospLocAssignment,
    createDepHospLocAssignment,
    updateDepHospLocAssignment,
    deleteDepHospLocAssignment,
} from "@/services/depAssService"; // Adjust path if needed
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DepHospLocAss } from "@/types/depTypes"; // Adjust path if needed
import { toast } from "sonner";

// --- Query Keys ---

export const depAssKeys = {
    all: ["depAss"],
    byId: (id: string) => [...depAssKeys.all, "id", id],
    details: () => [...depAssKeys.all, "detail"],
    detail: (id: string) => [...depAssKeys.details(), id], // Alias for byId
    lists: () => [...depAssKeys.all, "list"],
    listByDept: (departmentId: string) => [
        ...depAssKeys.lists(),
        "department",
        departmentId,
    ],
};

// --- Query Hooks (useQuery) ---

/**
 * Hook to fetch department-location assignments for a specific department.
 * @param departmentId - The ID of the department whose assignments are needed.
 */
export function useDepHospLocAssignments(departmentId: string) {
    return useQuery<DepHospLocAss[], Error>({
        queryKey: depAssKeys.listByDept(departmentId),
        queryFn: () => getDepHospLocAssignments(departmentId),
        enabled: !!departmentId,
    });
}

/**
 * Hook to fetch a single department-location assignment by its ID.
 * @param id - The unique ID of the assignment document (optional).
 */
export function useDepHospLocAssignment(id?: string) {
    return useQuery<DepHospLocAss | null, Error>({
        queryKey: depAssKeys.byId(id!),
        queryFn: () => getDepHospLocAssignment(id!),
        enabled: !!id,
    });
}

// --- Mutation Hooks (useMutation) ---

/**
 * Hook to create a new department-location assignment.
 */
export function useCreateDepHospLocAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            departmentId: string;
            locationId: string;
            userId?: string;
        }) =>
            createDepHospLocAssignment(
                variables.departmentId,
                variables.locationId,
                variables.userId,
            ),
        onSuccess: async (newAssignment, variables) => {
            await queryClient.invalidateQueries({
                queryKey: depAssKeys.listByDept(variables.departmentId),
            });

            if (newAssignment) {
                queryClient.setQueryData(
                    depAssKeys.byId(newAssignment.id),
                    newAssignment,
                );
                console.log(
                    "bN7sFpA2 - Pre-populated cache for new dep assignment detail:",
                    newAssignment.id,
                );
            }

            console.log(
                "gH3jKvY8 - Dep assignment creation successful for department",
                variables.departmentId,
            );
            toast.success("Department assignment created successfully!");
        },
        onError: (error: Error, variables) => {
            console.error(
                `zX9dRqW1 - Error creating assignment for department ${variables.departmentId} & location ${variables.locationId}:`,
                error,
            );
        },
    });
}

/**
 * Hook to update a department-location assignment.
 */
export function useUpdateDepHospLocAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string; // Assignment ID to update
            departmentId: string; // Needed to invalidate the correct list cache
            data: Partial<
                Omit<
                    DepHospLocAss,
                    | "id"
                    | "createdAt"
                    | "createdById"
                    | "department"
                    | "location"
                >
            >;
            userId?: string;
        }) =>
            updateDepHospLocAssignment(
                variables.id,
                variables.data,
                variables.userId,
            ),
        onSuccess: async (updatedAssignment, variables) => {
            await queryClient.invalidateQueries({
                queryKey: depAssKeys.listByDept(variables.departmentId),
            });
            await queryClient.invalidateQueries({
                queryKey: depAssKeys.byId(variables.id),
            });

            if (updatedAssignment) {
                queryClient.setQueryData(
                    depAssKeys.byId(variables.id),
                    updatedAssignment,
                );
                console.log(
                    `mY1tGhC5 - Cache updated directly for assignment detail: ${variables.id}`,
                );
            }

            console.log(
                `vB6nLpX0 - Assignment update successful for ID ${variables.id}.`,
            );
            toast.success("Department assignment updated successfully!");
        },
        onError: (error: Error, variables) => {
            console.error(
                `sW3zMhK4 - Error updating assignment ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(hN8mZsB1): Failed to update assignment: ${error.message}`,
            );
        },
    });
}

/**
 * Hook to delete a department-location assignment.
 */
export function useDeleteDepHospLocAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string; // ID of the assignment to delete
            departmentId: string; // Needed to invalidate the correct list cache
        }) => deleteDepHospLocAssignment(variables.id),
        onSuccess: async (_, variables) => {
            // result is void, so use _
            console.log(
                `zP1jKbV9 - Deletion mutation succeeded for assignment ${variables.id}.`,
            );

            await queryClient.invalidateQueries({
                queryKey: depAssKeys.listByDept(variables.departmentId),
            });
            console.log(
                `eR5sYdN6 - Invalidated assignment list cache for department: ${variables.departmentId}`,
            );

            queryClient.removeQueries({
                queryKey: depAssKeys.byId(variables.id),
            });
            console.log(
                `qF2wXcT0 - Removed assignment detail cache for ID: ${variables.id}`,
            );

            toast.success("Department assignment deleted successfully!");
        },
        onError: (error: Error, variables) => {
            console.error(
                `NZHbF26F - Error deleting assignment ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(X12z4Unj): Failed to delete assignment: ${error.message}`,
            );
        },
    });
}
