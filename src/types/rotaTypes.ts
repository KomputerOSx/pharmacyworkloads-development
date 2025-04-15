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
    colorClasses?: {
        bg: string;
        border: string;
        text: string;
    };
};

// Add hasChanges to WeekStatus
export type WeekStatus = {
    weekId: string; // e.g., "2024-W15"
    teamId: string; // ID of the team this status belongs to
    orgId: string; // To scope status by organization
    status: "draft" | "published"; // Explicitly only these two states
    lastModified: Timestamp | null; // Firestore Timestamp
    lastModifiedById: string | null; // User ID
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

export const defaultShiftColor = {
    bg: "bg-gray-50",
    border: "border-l-gray-300",
    text: "text-gray-600",
};
export const shiftPresets: ShiftPreset[] = [
    {
        id: "normal",
        name: "NORMAL",
        startTime: "08:30",
        endTime: "17:00",
        description: "8:30am - 5pm",
        colorClasses: {
            bg: "bg-sky-100",
            border: "border-l-sky-400",
            text: "text-sky-800",
        },
    },
    {
        id: "am",
        name: "AM",
        startTime: "08:30",
        endTime: "12:00",
        description: "8:30am - 12pm",
        colorClasses: {
            bg: "bg-emerald-100",
            border: "border-l-emerald-400",
            text: "text-emerald-800",
        },
    },
    {
        id: "pm",
        name: "PM",
        startTime: "12:00",
        endTime: "17:00",
        description: "12pm - 5pm",
        colorClasses: {
            bg: "bg-amber-100",
            border: "border-l-amber-400",
            text: "text-amber-800",
        },
    },

    {
        id: "late",
        name: "LATE",
        startTime: "12:00",
        endTime: "20:00",
        description: "12pm - 8pm",
        colorClasses: {
            bg: "bg-blue-100",
            border: "border-l-blue-400",
            text: "text-blue-800",
        },
    },
    {
        id: "longday",
        name: "LONG DAY",
        startTime: "08:30",
        endTime: "20:00",
        description: "8:30am - 8pm",
        colorClasses: {
            bg: "bg-purple-100",
            border: "border-l-purple-400",
            text: "text-purple-800",
        },
    },
    {
        id: "custom",
        name: "CUSTOM",
        startTime: "",
        endTime: "",
        description: "Custom hours",
        colorClasses: {
            bg: "bg-gray-100",
            border: "border-l-gray-400",
            text: "text-gray-700",
        },
    },
];
