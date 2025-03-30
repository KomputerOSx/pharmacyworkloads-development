export type Hosp = {
    id: string;
    name: string;
    address: string;
    city: string;
    postCode: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    createdAt: string | null;
    updatedAt: string | null;
    createdById: string;
    updatedById: string;
};

export type HospContextType = {
    hosps: Hosp[];
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    error: Error | null;
    refetchHosps: () => Promise<void>; // Function to manually refetch
};
