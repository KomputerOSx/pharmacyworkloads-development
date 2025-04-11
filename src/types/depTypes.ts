import { Timestamp } from "firebase/firestore";

export type Department = {
    id: string;
    name: string;
    orgId: string;
    active: boolean;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
};

export type DepHospLocAss = {
    id: string;
    departmentId: string;
    locationId: string;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
};

export type DepTeamHospLocAss = {
    id: string;
    orgId: string;
    depId: string;
    teamId: string;
    locationId: string;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    createdById: string;
    updatedById: string;
};

export interface AssignedLocationData
    extends Omit<
        DepHospLocAss,
        "departmentId" | "locationId" | "createdById" | "updatedById"
    > {
    assignmentId: string; // Use a distinct name for the assignment's ID
    locationId: string;
    locationName: string | null; // Location name (can be null if not found)
    hospId: string | null;
    assignedAt: Timestamp | null; // Use Date object for easier sorting/formatting
    // Add any other fields from HospLoc you might want to display indirectly
}
