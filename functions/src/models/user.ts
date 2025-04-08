import { Timestamp } from "firebase-admin/firestore";

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    orgId: string;
    departmentId: string;
    role: string;
    jobTitle: string;
    specialty: string;
    active: boolean;
    lastLogin: Timestamp | null;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
    authUid?: string | null;
    authCreationFailed?: boolean;
    authError?: string | null;
};
