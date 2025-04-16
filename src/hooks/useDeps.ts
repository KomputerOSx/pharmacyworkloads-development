import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createDep,
    deleteDep,
    getDep,
    getDeps,
    updateDep,
} from "@/services/depService";
import { Department } from "@/types/depTypes";
import { toast } from "sonner";

const depKeys = {
    all: ["deps"] as const,
    lists: () => [...depKeys.all, "list"] as const,
    listByOrg: (orgId: string) => [...depKeys.lists(), { orgId }] as const,
    details: () => [...depKeys.all, "detail"] as const,
    detail: (id: string) => [...depKeys.details(), id] as const,
};

export function useDeps(orgId: string) {
    return useQuery<Department[], Error>({
        queryKey: depKeys.listByOrg(orgId!),
        queryFn: () => getDeps(orgId),
        enabled: !!orgId,

        staleTime: 5 * 60 * 1000,
    });
}

export function useDep(id?: string) {
    return useQuery<Department | null, Error>({
        queryKey: depKeys.detail(id!),
        queryFn: () => getDep(id!),
        enabled: !!id,
    });
}

export function useCreateDep() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            departmentData: Partial<Department>;
            orgId: string;
            userId?: string;
        }) =>
            createDep(
                variables.departmentData,
                variables.orgId,
                variables.userId,
            ),

        // --- Success Handler ---
        onSuccess: async (newlyCreatedDepartment, variables) => {
            await queryClient.invalidateQueries({
                queryKey: depKeys.listByOrg(variables.orgId),
            });

            if (newlyCreatedDepartment) {
                queryClient.setQueryData(
                    depKeys.detail(newlyCreatedDepartment.id),
                    newlyCreatedDepartment,
                );
                console.log(
                    `YL3c45yz - Pre-populated cache for new Department detail: ${newlyCreatedDepartment.id}`,
                );
            }

            console.log(
                `BuyBC4Jd - Department creation successful for org ${variables.orgId}. Invalidated Department list query.`,
            );
            toast.success("Department created successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `rje7edWW - Error creating Department for org ${variables.orgId}:`,
                error,
            );
            toast.error(
                `Error(txPxSG6R): Failed to create Department: ${error.message}`,
            );
            throw error;
        },
    });
}

export function useUpdateDep() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string;
            orgId: string;
            data: Partial<Department>;
            userId?: string; //
        }) =>
            updateDep(
                variables.id, // Pass ID to the service
                variables.data, // Pass update data to the service
                variables.userId, // Pass user ID to the service
            ),

        // --- Success Handler ---
        onSuccess: async (updatedDepartment, variables) => {
            await queryClient.invalidateQueries({
                queryKey: depKeys.listByOrg(variables.orgId),
            });

            await queryClient.invalidateQueries({
                queryKey: depKeys.detail(variables.id),
            });

            if (updatedDepartment) {
                queryClient.setQueryData(
                    depKeys.detail(variables.id),
                    updatedDepartment,
                );
                console.log(
                    `JNg9rwHE - Cache updated directly for Department detail: ${variables.id}`,
                );
            } else {
                console.warn(
                    `EN7BGdnz - Update mutation returned no data for Department ${variables.id}. Detail cache not updated directly. Relying on invalidation.`,
                );
            }

            console.log(
                `b2jbhDXQ - Department update successful for ID ${variables.id}. Invalidated list for org ${variables.orgId} and detail query.`,
            );
            toast.success("Department updated successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `T5g5MbXq - Error updating Department ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(DBU35GdU): Failed to update Department: ${error.message}`,
            );
        },
    });
}

export function useDeleteDep() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: { id: string; orgId: string }) =>
            deleteDep(
                variables.id, // Pass the ID to the service function
            ),

        onSuccess: async (result, variables) => {
            console.log(
                `Fr4uTzLp - Deletion mutation succeeded for Department ${variables.id}. Result:`,
                result,
            );

            await queryClient.invalidateQueries({
                queryKey: depKeys.listByOrg(variables.orgId),
            });
            console.log(
                `hRAXyhT2 - Invalidated Department list cache for org: ${variables.orgId}`,
            );

            queryClient.removeQueries({
                queryKey: depKeys.detail(variables.id),
            });
            console.log(
                `3pKvJ9f3 - Removed Department detail cache for ID: ${variables.id}`,
            );

            toast.success("Department deleted successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `f8u7sRaK - Error Department hospital ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(kqLbev8Z): Failed to delete Department: ${error.message}`,
            );
        },
    });
}
