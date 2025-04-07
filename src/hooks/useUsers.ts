import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createUser,
    deleteUser,
    getUser,
    getUsers,
    updateUser,
} from "@/services/userService";
import { User } from "@/types/userTypes";
import { toast } from "sonner";

// --- Query Keys ---
const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    listByOrg: (orgId: string) => [...userKeys.lists(), { orgId }] as const,
    details: () => [...userKeys.all, "detail"] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(orgId: string) {
    return useQuery<User[], Error>({
        queryKey: userKeys.listByOrg(orgId),
        queryFn: () => getUsers(orgId),
        enabled: !!orgId, // Only run query if orgId is provided
        staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    });
}

export function useUser(id?: string) {
    return useQuery<User | null, Error>({
        queryKey: userKeys.detail(id!), // React Query handles the enabled flag
        queryFn: () => getUser(id!),
        enabled: !!id, // Only run query if id is provided
        // staleTime could be added if desired, often shorter for specific items
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            userData: Omit<
                Partial<User>,
                | "id"
                | "orgId"
                | "createdAt"
                | "updatedAt"
                | "lastLogin"
                | "createdById"
                | "updatedById"
            >;
            orgId: string;
            creatorUserId?: string;
        }) =>
            createUser(
                variables.userData,
                variables.orgId,
                variables.creatorUserId,
            ),

        onSuccess: async (newUser, variables) => {
            // Invalidate the list query for the relevant organization
            await queryClient.invalidateQueries({
                queryKey: userKeys.listByOrg(variables.orgId),
            });

            // Optionally, pre-populate the cache for the newly created user's detail
            if (newUser) {
                queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
            }

            toast.success("User created successfully!");
        },

        onError: (error: Error, variables) => {
            console.error(
                `Error creating user for org ${variables.orgId}:`,
                error,
            );
            toast.error(`Failed to create user: ${error.message}`);
            // Consider re-throwing or further handling if needed upstream
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string;
            orgId: string;
            data: Omit<
                Partial<User>,
                "id" | "orgId" | "createdAt" | "lastLogin" | "createdById"
            >;
            updaterUserId?: string;
        }) => updateUser(variables.id, variables.data, variables.updaterUserId),

        onSuccess: async (updatedUser, variables) => {
            // Invalidate both the list and the specific user's detail query
            await queryClient.invalidateQueries({
                queryKey: userKeys.listByOrg(variables.orgId),
            });

            if (updatedUser) {
                queryClient.setQueryData(
                    userKeys.detail(variables.id),
                    updatedUser,
                );
            } else {
                // If update somehow didn't return data, still invalidate detail
                await queryClient.invalidateQueries({
                    queryKey: userKeys.detail(variables.id),
                });
                console.warn(
                    `User update for ${variables.id} returned no data. Relying on invalidation.`,
                );
            }

            toast.success("User updated successfully!");
        },

        onError: (error: Error, variables) => {
            console.error(`Error updating user ${variables.id}:`, error);
            toast.error(`Failed to update user: ${error.message}`);
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            id: string;
            orgId: string; // Needed for list invalidation
        }) => deleteUser(variables.id),

        onSuccess: async (result, variables) => {
            // Invalidate the list query
            await queryClient.invalidateQueries({
                queryKey: userKeys.listByOrg(variables.orgId),
            });

            // Remove the deleted user's detail query from the cache
            queryClient.removeQueries({
                queryKey: userKeys.detail(variables.id),
            });

            toast.success("User deleted successfully!");
        },

        onError: (error: Error, variables) => {
            console.error(`Error deleting user ${variables.id}:`, error);
            toast.error(`Failed to delete user: ${error.message}`);
        },
    });
}
