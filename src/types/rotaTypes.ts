// src/types/rotaTypes.ts
import { Timestamp } from "firebase/firestore";

export type Assignment = {
    id: string;
    locationId: string | null;
    customLocation?: string;
    shiftType: string | null;
    customStartTime?: string;
    customEndTime?: string;
    notes?: string;
};

export type StoredAssignment = Assignment & {
    userId: string;
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
    userId: string;
    dayIndex: number;
    assignmentId: string;
};

export const shiftPresets: ShiftPreset[] = [
    {
        id: "normal",
        name: "NORMAL",
        startTime: "08:30",
        endTime: "17:00",
        description: "8:30am - 5pm",
    },
    {
        id: "am",
        name: "AM",
        startTime: "08:30",
        endTime: "12:00",
        description: "8:30am - 12pm",
    },
    {
        id: "pm",
        name: "PM",
        startTime: "12:00",
        endTime: "17:00",
        description: "12pm - 5pm",
    },
    {
        id: "late",
        name: "LATE",
        startTime: "12:00",
        endTime: "20:00",
        description: "12pm - 8pm",
    },
    {
        id: "longday",
        name: "LONG DAY",
        startTime: "08:30",
        endTime: "20:00",
        description: "8:30am - 8pm",
    },
    {
        id: "custom",
        name: "CUSTOM",
        startTime: "",
        endTime: "",
        description: "Custom hours",
    },
];
