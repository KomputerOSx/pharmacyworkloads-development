// src/types/rotaTypes.ts
import { Timestamp } from "firebase/firestore";

export type Assignment = {
    id: string;
    locationId: number | null;
    customLocation?: string;
    shiftType: string | null;
    customStartTime?: string;
    customEndTime?: string;
    notes?: string;
};

export type StoredAssignment = Assignment & {
    staffId: number;
    teamId: string;
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
    lastModified?: Timestamp;
    lastModifiedById?: string;
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
