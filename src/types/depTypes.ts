import { Timestamp } from "firebase/firestore";

export type Department = {
    id: string;
    name: string;
    orgId: string;
    active: boolean;
    createdAt: Timestamp | Date | null;
    updatedAt: Timestamp | Date | null;
    createdById: string;
    updatedById: string;
};

export type DepHospLocAss = {
    id: string;
    departmentId: string;
    locationId: string;
    createdAt: Timestamp | Date | null;
    updatedAt: Timestamp | Date | null;
    createdById: string;
    updatedById: string;
};
