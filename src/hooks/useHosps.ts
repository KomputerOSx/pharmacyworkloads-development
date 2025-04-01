import {
    createHospital,
    deleteHospital,
    getHospital,
    getHospitals,
    updateHospital,
} from "@/services/hospitalService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Hosp } from "@/types/hospTypes";
import { toast } from "sonner";

const hospKeys = {
    all: ["hosps"] as const, // Base key for hospital queries
    lists: () => [...hospKeys.all, "list"] as const, // Key for general lists (if any)
    listByOrg: (orgId: string) => [...hospKeys.lists(), { orgId }] as const, // Key for lists filtered by org
    details: () => [...hospKeys.all, "detail"] as const, // Key for general details
    detail: (id: string) => [...hospKeys.details(), id] as const, // Key for specific hospital detail
};

export function useHosps(orgId: string) {
    return useQuery<Hosp[], Error>({
        queryKey: hospKeys.listByOrg(orgId!),

        // The queryFn now receives the context, including the queryKey
        queryFn: async ({ queryKey }) => {
            // Extract the orgId from the queryKey object structure
            const keyObj = queryKey[2] as { orgId: string };
            const currentOrgId = keyObj.orgId;

            if (!currentOrgId) {
                // Should not happen if 'enabled' is used correctly, but good practice
                throw new Error(
                    "5jgBg9Zc - Organisation ID is required but was not provided to queryFn.",
                );
            }
            return getHospitals(currentOrgId);
        },
        enabled: !!orgId,

        staleTime: 5 * 60 * 1000,
    });
}

export function useHosp(id?: string) {
    return useQuery<Hosp | null, Error>({
        queryKey: hospKeys.detail(id!),
        queryFn: () => getHospital(id!),
        enabled: !!id,
    });
}

export function useCreateHosp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            hospitalData: Partial<Hosp>; // The data for the new hospital
            orgId: string; // The organisation to assign it to
            userId?: string; // Optional user ID for auditing
        }) =>
            createHospital(
                variables.hospitalData,
                variables.orgId,
                variables.userId,
            ),

        // --- Success Handler ---
        onSuccess: async (newlyCreatedHospital, variables) => {
            await queryClient.invalidateQueries({
                queryKey: hospKeys.listByOrg(variables.orgId),
            });

            if (newlyCreatedHospital) {
                queryClient.setQueryData(
                    hospKeys.detail(newlyCreatedHospital.id),
                    newlyCreatedHospital,
                );
                console.log(
                    `jK8dG4fV - Pre-populated cache for new hospital detail: ${newlyCreatedHospital.id}`,
                );
            }

            console.log(
                `qZ1xV9sE - Hospital creation successful for org ${variables.orgId}. Invalidated hospital list query.`,
            );
            toast.success("Hospital created successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `aP5nB3rT - Error creating hospital for org ${variables.orgId}:`,
                error,
            );
            toast.error(
                `Error(eH7yL1nM): Failed to create hospital: ${error.message}`,
            );
            throw error;
        },
    });
}

export function useUpdateHosp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string; // ID of the hospital to update
            orgId: string; // Org ID needed to invalidate the correct list cache
            data: Partial<Hosp>; // The fields to update
            userId?: string; // Optional user ID for auditing
        }) =>
            updateHospital(
                variables.id, // Pass ID to the service
                variables.data, // Pass update data to the service
                variables.userId, // Pass user ID to the service
            ),

        // --- Success Handler ---
        onSuccess: async (updatedHospital, variables) => {
            await queryClient.invalidateQueries({
                queryKey: hospKeys.listByOrg(variables.orgId),
            });

            await queryClient.invalidateQueries({
                queryKey: hospKeys.detail(variables.id),
            });

            if (updatedHospital) {
                queryClient.setQueryData(
                    hospKeys.detail(variables.id),
                    updatedHospital,
                );
                console.log(
                    `mN9sF2gH - Cache updated directly for hospital detail: ${variables.id}`,
                );
            } else {
                console.warn(
                    `wP3rT6kL - Update mutation returned no data for hospital ${variables.id}. Detail cache not updated directly. Relying on invalidation.`,
                );
            }

            console.log(
                `rY8xW4bN - Hospital update successful for ID ${variables.id}. Invalidated list for org ${variables.orgId} and detail query.`,
            );
            toast.success("Hospital updated successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `zK1jV7cD - Error updating hospital ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(gB5uN9pM): Failed to update hospital: ${error.message}`,
            );
        },
    });
}

export function useDeleteHosp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string; // ID of the hospital to delete
            orgId: string; // Org ID needed to invalidate the correct list cache
        }) =>
            deleteHospital(
                variables.id, // Pass the ID to the service function
            ),

        onSuccess: async (result, variables) => {
            console.log(
                `hT2rW5sP - Deletion mutation succeeded for hospital ${variables.id}. Result:`,
                result,
            );

            await queryClient.invalidateQueries({
                queryKey: hospKeys.listByOrg(variables.orgId),
            });
            console.log(
                `eF9dN3kM - Invalidated hospital list cache for org: ${variables.orgId}`,
            );

            queryClient.removeQueries({
                queryKey: hospKeys.detail(variables.id),
            });
            console.log(
                `yL7pG1cV - Removed hospital detail cache for ID: ${variables.id}`,
            );

            toast.success("Hospital deleted successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `vC4mX8bJ - Error deleting hospital ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(kR1zV6qF): Failed to delete hospital: ${error.message}`,
            );
        },
    });
}
