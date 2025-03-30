export type Org = {
    id: string;
    name: string;
    type: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
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
