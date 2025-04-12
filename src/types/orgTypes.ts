// src/types/orgTypes.ts
import { Timestamp } from "firebase/firestore";

export type Org = {
    id: string;
    name: string;
    type: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    createdAt?: Timestamp | null;
    updatedAt?: Timestamp | null;
    createdById: string;
    updatedById: string;
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
