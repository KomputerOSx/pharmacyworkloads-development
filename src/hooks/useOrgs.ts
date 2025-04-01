// src/hooks/useOrganisations.js

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    // Import your service functions
    getOrgs,
    getOrg,
    addOrg,
    updateOrg,
    deleteOrg,
    // Assuming Org type is exported from orgTypes.ts
} from "@/services/orgService";
import { Org } from "@/types/orgTypes";
import { toast } from "sonner"; // Adjust path if needed

// --- Query Keys ---
// Central place for keys, makes invalidation easier
const orgKeys = {
    all: ["orgs"] as const, // Base key for the list of all orgs
    detail: (id: string) => [...orgKeys.all, id] as const, // Key for a single org detail
};

// --- Hook to fetch ALL Organisations ---
export function useOrgs() {
    return useQuery<Org[], Error>({
        queryKey: orgKeys.all, // Unique key for this query
        queryFn: getOrgs, // Function that fetches the data
        staleTime: 5 * 60 * 1000, // Optional: Data is considered fresh for 5 mins
    });
}

// --- Hook to fetch a SINGLE Organisation ---
export function useOrg(id?: string) {
    return useQuery<Org | null, Error>({
        queryKey: orgKeys.detail(id!), // Use the specific key + id
        queryFn: () => getOrg(id!), // Fetcher needs the id
        enabled: !!id, // VERY IMPORTANT: Only run query if id is truthy
    });
}

// --- Hook for ADDING an Organisation ---
export function useAddOrg() {
    const queryClient = useQueryClient(); // Get client instance

    return useMutation({
        // The mutation function now expects an object with orgData and optionally userId
        mutationFn: (variables: {
            orgData: Omit<
                Org,
                "id" | "createdAt" | "updatedAt" | "createdById" | "updatedById"
            >;
            userId?: string;
        }) => addOrg(variables.orgData, variables.userId),
        onSuccess: async () => {
            // When add succeeds, invalidate the 'orgs' list query
            // This tells React Query the list data is stale and needs refetching
            await queryClient.invalidateQueries({ queryKey: orgKeys.all });
            console.log("SHmXt56q - Add successful, invalidated orgs list.");
            toast.success("Organisation added successfully!");
        },
        onError: (error) => {
            // Handle errors (e.g., show toast notification)
            console.error("FBH7qTf7 - Error adding organisation:", error);
            // You might want to use a notification library here (like sonner)
            toast.error(
                `Error(C6NTmYDj): Failed to add organisation: ${error.message}`,
            );
        },
    });
}

export function useUpdateOrg() {
    const queryClient = useQueryClient();

    return useMutation({
        // Expects an object with id, data to update, and optional userId
        mutationFn: (variables: {
            id: string;
            orgData: Partial<Org>;
            userId?: string;
        }) => updateOrg(variables.id, variables.orgData, variables.userId),
        onSuccess: async (data, variables) => {
            // Invalidate both the list and the specific detail query for this org
            await queryClient.invalidateQueries({ queryKey: orgKeys.all });
            await queryClient.invalidateQueries({
                queryKey: orgKeys.detail(variables.id),
            });
            console.log(
                "U6BUCyra -Update successful, invalidated orgs list and detail.",
            );

            if (data) {
                queryClient.setQueryData(
                    orgKeys.detail(variables.id),
                    data, // Replace the cache entry with the new, complete Org object
                );
                console.log(
                    `xCmqKr7T - Cache updated for ${variables.id} using mutation result.`,
                );
            } else {
                console.warn(
                    `eUJk26x4 - Cache not updated for ${variables.id} as mutation returned null.`,
                );
                // May still want to invalidate to force refetch
                await queryClient.invalidateQueries({
                    queryKey: orgKeys.detail(variables.id),
                });
            }

            queryClient.setQueryData(
                orgKeys.detail(variables.id),
                (oldData) => {
                    if (typeof oldData === "object" && oldData !== null) {
                        return { ...oldData, ...variables.orgData };
                    } else {
                        return variables.orgData;
                    }
                },
            );
        },
        onError: (error, variables) => {
            console.error(
                `aaT5NK7C - Error updating organisation ${variables.id}:`,
                error,
            );
            toast.error(
                `Error(BRQkR59t): Failed to update organisation: ${error.message}`,
            );
        },
    });
}

// --- Hook for DELETING an Organisation ---
export function useDeleteOrg() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteOrg(id), // Takes only the id

        onSuccess: async (_data, id) => {
            // Invalidate the list
            await queryClient.invalidateQueries({ queryKey: orgKeys.all });
            // Also, remove the detail query from cache if it exists
            queryClient.removeQueries({ queryKey: orgKeys.detail(id) });

            console.log(
                `adu2FRsm - Delete successful for ${id}, invalidated orgs list, removed detail cache.`,
            );
            toast.success("Organisation deleted successfully");
        },
        onError: (error, id) => {
            console.error(
                `kdMv7keF - Error deleting organisation ${id}:`,
                error,
            );
            toast.error(
                `Error(7ecNdV2W): Failed to delete organisation: ${error.message}`,
            );
        },
    });
}
