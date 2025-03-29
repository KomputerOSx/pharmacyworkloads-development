"use client";

import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
    useCallback,
} from "react";
import { getOrgs } from "@/services/orgService";

interface Org {
    id: string;
    name: string;
    type: string;
    active: boolean;
    contactEmail: string;
    contactPhone: string;
    createdAt: string | null;
    updatedAt: string | null;
    createdById: string;
    updatedById: string;
}

interface OrgContextType {
    orgs: Org[];
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    error: Error | null;
    refetchOrgs: () => Promise<void>; // Function to manually refetch
}

const OrgContext = createContext<OrgContextType | null>(null);

interface OrgProviderProps {
    children: ReactNode;
}

export const OrgProvider: React.FC<OrgProviderProps> = ({ children }) => {
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially
    const [error, setError] = useState<Error | null>(null);

    // Function to fetch organisations
    const fetchOrgs = useCallback(async () => {
        // console.log("OrgContext: Starting fetch...");
        setIsLoading(true);
        setError(null);
        try {
            const fetchedOrgs = await getOrgs();
            setOrgs(fetchedOrgs || []); // Handle potential null/undefined return
        } catch (err) {
            console.error(
                "fWbP4EUL - OrgContext: Error fetching organisations:",
                err,
            );
            setError(
                err instanceof Error
                    ? err
                    : new Error("8LRc9n8B - Failed to fetch organisations"),
            );
            setOrgs([]); // Clear orgs on error
        } finally {
            // console.log("OrgContext: Fetch finished.");
            setIsLoading(false);
        }
    }, []);

    // Fetch data when the provider mounts
    useEffect(() => {
        fetchOrgs().then((orgs) => {
            console.log("ALL3JC6s - OrgContext: Fetched organisations:", orgs);
        });
    }, [fetchOrgs]);

    const contextValue: OrgContextType = {
        orgs,
        isLoading,
        setIsLoading,
        error,
        refetchOrgs: fetchOrgs,
    };

    return (
        <OrgContext.Provider value={contextValue}>
            {children}
        </OrgContext.Provider>
    );
};

// Create a custom hook for easy consumption
export const useOrgContext = (): OrgContextType => {
    const context = useContext(OrgContext);
    if (!context) {
        throw new Error(
            "84dwmX2B - useOrgContext must be used within an OrgProvider",
        );
    }
    return context;
};
