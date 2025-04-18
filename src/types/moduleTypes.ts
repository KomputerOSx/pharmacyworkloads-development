import { Timestamp } from "firebase/firestore";

export type ModuleAccessLevel = "admin" | "manager" | "all"; // Or use an enum

export interface Module {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    urlPath: string;
    icon: string | null;
    accessLevel: ModuleAccessLevel;
    active: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
    createdBy: string;
    updatedBy: string;
}

export type DepModuleAssignment = {
    id: string;
    moduleId: string;
    depId: string;
    orgId: string;
    createdAt: Timestamp | null;
    createdBy: string;
};

export interface ModuleAssignmentWithDetails extends DepModuleAssignment {
    departmentName?: string;
    organizationName?: string; // If you fetch org names too
}
