import { getHospital, getHospitals } from "@/services/hospitalService";
import { useQuery } from "@tanstack/react-query";
import { Hosp } from "@/types/hospTypes";

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
