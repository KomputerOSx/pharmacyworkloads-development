export type Organisation = {
    id: string;
    name: string;
    type: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
};
