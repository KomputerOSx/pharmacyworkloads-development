import { Timestamp } from "firebase/firestore";

export type Organisation = {
    id: string;
    name: string;
    type: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    createdAt?: Timestamp | string | null;
    updatedAt?: Timestamp | string | null;
};
