import {
    getHospLocs,
    getHospLoc,
    createHospLoc,
    updateHospLoc,
    deleteHospLoc,
} from "@/services/hospLocService";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HospLoc } from "@/types/hosLocTypes";
import { toast } from "sonner";

export const hospLocKeys = {
    all: ["hospLocs"],
    byId: (id: string) => [...hospLocKeys.all, id],
    details: () => [...hospLocKeys.all, "detail"],
    detail: (id: string) => [...hospLocKeys.details(), id],
    listByOrg: (orgId: string) => [...hospLocKeys.all, orgId],
    byHosp: (hospId: string) => [...hospLocKeys.all, hospId],
    byHospAndType: (hospId: string, type: string) => [
        ...hospLocKeys.all,
        hospId,
        type,
    ],
};

export function useHospLocs(orgId: string) {
    return useQuery<HospLoc[], Error>({
        queryKey: hospLocKeys.listByOrg(orgId),
        queryFn: () => getHospLocs(orgId),
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useHospLoc(id?: string) {
    return useQuery<HospLoc | null, Error>({
        queryKey: hospLocKeys.byId(id!),
        queryFn: () => getHospLoc(id!),
        enabled: !!id,
    });
}

export function useCreateHospLoc() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            hospLocData: Partial<HospLoc>;
            orgId: string;
            hospId: string;
            userId?: string;
        }) =>
            createHospLoc(
                variables.hospLocData,
                variables.orgId,
                variables.hospId,
                variables.userId,
            ),
        onSuccess: async (newlyCreatedHospLoc, variables) => {
            await queryClient.invalidateQueries({
                queryKey: hospLocKeys.listByOrg(variables.orgId),
            });

            if (newlyCreatedHospLoc) {
                queryClient.setQueryData(
                    hospLocKeys.detail(newlyCreatedHospLoc.id),
                    newlyCreatedHospLoc,
                );
                console.log(
                    "VDdSUQ9M - Pre-populated cache for new hospLoc detail:",
                    newlyCreatedHospLoc.id,
                );
            }

            console.log(
                "8LrDDD64 - HospLoc creation successful for org",
                variables.orgId,
                ". Invalidated hospLoc list query.",
            );
            toast.success("Hospital Location created successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `sb2ChZY8 - Error creating hospital for org ${variables.orgId}:`,
                error,
            );
            toast.error(
                `Error(Zmvu3F2k): Failed to create hospital: ${error.message}`,
            );
        },
    });
}

export function useUpdateHospLoc() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string;
            hospLocData: Partial<HospLoc>;
            orgId: string;
            userId?: string;
        }) =>
            updateHospLoc(
                variables.id,
                variables.hospLocData,
                variables.userId,
            ),
        onSuccess: async (updatedHospLoc, variables) => {
            await queryClient.invalidateQueries({
                queryKey: hospLocKeys.listByOrg(variables.orgId),
            });

            await queryClient.invalidateQueries({
                queryKey: hospLocKeys.detail(variables.id),
            });

            if (updatedHospLoc) {
                queryClient.setQueryData(
                    hospLocKeys.detail(variables.id),
                    updatedHospLoc,
                );
                console.log(
                    `kqzrSX88 - Cache updated directly for hospital location detail: ${variables.id}`,
                );
            } else {
                console.warn(
                    `a8xPHXBH - Update mutation returned no data for hospital location ${variables.id}. Detail cache not updated directly. Relying on invalidation.`,
                );
            }

            console.log(
                `Fk13Rjwf - Hospital Location update successful for ID ${variables.id}. Invalidated list for org ${variables.orgId} and detail query.`,
            );
            toast.success("Hospital Location updated successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `Uj5W5bsd - Error updating hospital location ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(QumnXk81): Failed to update hospital location: ${error.message}`,
            );
        },
    });
}

export function useDeleteHospLoc() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string; // ID of the hospital to delete
            orgId: string; // Org ID needed to invalidate the correct list cache
        }) =>
            deleteHospLoc(
                variables.id, // Pass the ID to the service function
            ),

        onSuccess: async (result, variables) => {
            console.log(
                `x4575Ltq - Deletion mutation succeeded for hospital location ${variables.id}. Result:`,
                result,
            );

            await queryClient.invalidateQueries({
                queryKey: hospLocKeys.listByOrg(variables.orgId),
            });
            console.log(
                `eF9dN3kM - Invalidated hospital location list cache for org: ${variables.orgId}`,
            );

            queryClient.removeQueries({
                queryKey: hospLocKeys.detail(variables.id),
            });
            console.log(
                `UyChVT83 - Removed hospital location detail cache for ID: ${variables.id}`,
            );

            toast.success("Hospital Location deleted successfully!");
        },

        onError: (error, variables) => {
            console.error(
                `eEtdP2WX - Error deleting hospital location ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(X12z4Unj): Failed to delete hospital location: ${error.message}`,
            );
        },
    });
}
