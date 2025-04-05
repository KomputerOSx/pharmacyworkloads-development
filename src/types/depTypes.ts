import { Timestamp } from "firebase/firestore";

export type Department = {
    id: string;
    name: string;
    orgId: string;
    active: boolean;
    createdAt: Timestamp | string | null;
    updatedAt: Timestamp | string | null;
    createdById: string;
    updatedById: string;
};
