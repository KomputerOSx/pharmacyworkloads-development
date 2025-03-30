"use client";

import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { Hosp, HospContextType } from "@/types/hospTypes";
import { getHospitals } from "@/services/hospitalService";
import { useParams } from "next/navigation";

const HospContext = createContext<HospContextType | null>(null);

interface HospProviderProps {
    children: ReactNode;
}

export const HospProvider: React.FC<HospProviderProps> = ({ children }) => {
    const [hosps, setHosps] = useState<Hosp[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially
    const [error, setError] = useState<Error | null>(null);
    const { orgId } = useParams();

    // Function to fetch organisations
    const fetchHosps = useCallback(async () => {
        // console.log("OrgContext: Starting fetch...");
        setIsLoading(true);
        setError(null);
        try {
            const fetchedHosps = await getHospitals(orgId);
            setHosps(fetchedHosps || []); // Handle potential null/undefined return
        } catch (err) {
            console.error(
                "3De2EZVR - HospContext: Error fetching hospitals:",
                err,
            );
            setError(
                err instanceof Error
                    ? err
                    : new Error("8b7JuTSw - Failed to fetch hospitals"),
            );
            setHosps([]); // Clear orgs on error
        } finally {
            // console.log("OrgContext: Fetch finished.");
            setIsLoading(false);
        }
    }, [orgId]);

    // Fetch data when the provider mounts
    useEffect(() => {
        fetchHosps().then((orgs) => {
            console.log("vnrJRm44 - HospContext: Fetched Hospitals:", orgs);
        });
    }, [fetchHosps]);

    const contextValue: HospContextType = {
        hosps,
        isLoading,
        setIsLoading,
        error,
        refetchHosps: fetchHosps,
    };

    return (
        <HospContext.Provider value={contextValue}>
            {children}
        </HospContext.Provider>
    );
};

export const useHospContext = (): HospContextType => {
    const context = useContext(HospContext);
    if (!context) {
        throw new Error(
            "2wKk5BSc - useHospContext must be used within an HospProvider",
        );
    }
    return context;
};
