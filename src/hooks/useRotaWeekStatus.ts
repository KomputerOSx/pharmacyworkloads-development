// src/hooks/useRotaWeekStatus.ts
import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
    deleteWeekStatus,
    getWeekStatus,
    setWeekStatus,
} from "@/services/rotaWeekStatusService"; // Adjust path
import { WeekStatus } from "@/types/rotaTypes"; // Adjust path

// --- Query Keys ---
export const rotaWeekStatusKeys = {
    all: ["rotaWeekStatuses"] as const,
    details: () => [...rotaWeekStatusKeys.all, "detail"] as const,
    detail: (weekId: string, teamId: string) =>
        [...rotaWeekStatusKeys.details(), { weekId, teamId }] as const,
};

// --- Types ---
type WeekStatusQueryKey = ReturnType<typeof rotaWeekStatusKeys.detail>;
type UseWeekStatusOptions = Omit<
    UseQueryOptions<
        WeekStatus | null,
        Error,
        WeekStatus | null,
        WeekStatusQueryKey
    >,
    "queryKey" | "queryFn"
>;

export function useWeekStatus(
    weekId?: string | null,
    teamId?: string | null,
    options?: UseWeekStatusOptions,
): UseQueryResult<WeekStatus | null, Error> {
    const queryKey = rotaWeekStatusKeys.detail(weekId!, teamId!);

    return useQuery<
        WeekStatus | null,
        Error,
        WeekStatus | null,
        WeekStatusQueryKey
    >({
        queryKey: queryKey,
        queryFn: () => {
            if (!weekId || !teamId) {
                return Promise.resolve(null);
            }
            return getWeekStatus(weekId, teamId);
        },
        enabled: !!weekId && !!teamId && options?.enabled !== false,
        staleTime: 1 * 60 * 1000,
        retry: 1,
        placeholderData: null,
        ...options,
    });
}

/**
 * Hook to set (create or update) the status for a specific week and team.
 */
export function useSetWeekStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: {
            weekId: string;
            teamId: string;
            orgId: string;
            status: "draft" | "published";
            userId: string;
        }) =>
            setWeekStatus(
                variables.weekId,
                variables.teamId,
                variables.orgId,
                variables.status,
                variables.userId,
            ),

        onSuccess: async (data, variables) => {
            toast.success(`Rota status updated to ${variables.status}.`);
            await queryClient.invalidateQueries({
                queryKey: rotaWeekStatusKeys.detail(
                    variables.weekId,
                    variables.teamId,
                ),
            });
            console.log(
                `Invalidated week status cache for ${variables.weekId}_${variables.teamId}`,
            );
        },
        onError: (error: Error, variables) => {
            console.error(
                `qZ8vB3nW - Error setting status to ${variables.status} for ${variables.weekId}_${variables.teamId}:`,
                error,
            );
            toast.error(`Failed to update status: ${error.message}`);
        },
    });
}

export function useDeleteWeekStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: { weekId: string; teamId: string }) =>
            deleteWeekStatus(variables.weekId, variables.teamId),
        onSuccess: async (_, variables) => {
            toast.info(`Rota status reset for week ${variables.weekId}.`);
            // Invalidate the specific status query
            await queryClient.invalidateQueries({
                queryKey: rotaWeekStatusKeys.detail(
                    variables.weekId,
                    variables.teamId,
                ),
            });
            // Optional: Set cache to null immediately for faster UI update
            queryClient.setQueryData(
                rotaWeekStatusKeys.detail(variables.weekId, variables.teamId),
                null,
            );
        },
        onError: (error: Error, variables) => {
            console.error(
                `yG5bN1wQ - Error deleting status for ${variables.weekId}_${variables.teamId}:`,
                error,
            );
            toast.error(`Failed to reset status: ${error.message}`);
        },
    });
}
