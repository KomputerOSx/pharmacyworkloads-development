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

export type ShiftPreset = {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    description: string;
};

// Add hasChanges to WeekStatus
export type WeekStatus = {
    weekId: string;
    status: "draft" | "published" | null;
    hasChanges?: boolean;
    lastModified?: Date;
};

// Add new types for clipboard functionality
export type ClipboardItem = {
    assignment: Assignment;
};

export type ContextMenuPosition = {
    x: number;
    y: number;
    staffId: number;
    dayIndex: number;
    assignmentId?: string;
};
