import { Timestamp } from "firebase/firestore";

export type Module = {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdBy: string;
    updatedBy: string;
};

export type DepModuleAssignment = {
    id: string;
    moduleId: string;
    depId: string;
    orgId: string;
    createdAt: Timestamp | null;
    createdBy: string;
};
