import { Timestamp } from "firebase/firestore";

export type Assignment = {
    id: string;
    locationId: number | null;
    customLocation?: string;
    shiftType: string | null;
    customStartTime?: string;
    customEndTime?: string;
    notes?: string;

    //other fields
    createdById: string;
    updatedById: string;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
};

export type StoredAssignment = Assignment & {
    staffId: number;
    weekId: string;
    dayIndex: number;
};
