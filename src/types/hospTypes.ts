// src/types/hospTypes.ts
import { Timestamp } from "firebase/firestore";

export type Hosp = {
    id: string;
    name: string;
    orgId: string;
    address: string;
    city: string;
    postCode: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
};
