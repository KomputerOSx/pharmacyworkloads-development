import { Timestamp } from "firebase/firestore";

export type Org = {
    id: string;
    name: string;
    type: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    createdAt?: Timestamp | string | null;
    updatedAt?: Timestamp | string | null;
    createdById: string;
    updatedById: string;
};

export type OrgContextType = {
    orgs: Org[];
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    error: Error | null;
    refetchOrgs: () => Promise<void>; // Function to manually refetch
};
// Get Organisation types (for dropdowns)
export const getOrganisationTypes = () => {
    return [
        { id: "NHS Trust", name: "NHS Trust" },
        { id: "NHS Foundation Trust", name: "NHS Foundation Trust" },
        { id: "Private Healthcare", name: "Private Healthcare" },
        { id: "Community Healthcare", name: "Community Healthcare" },
    ];
};
