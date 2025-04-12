import type { Assignment, ShiftPreset } from "@/types/rotaTypes";
import { shiftPresets } from "@/types/rotaTypes";

// Generate a unique ID for a new assignment
export const generateAssignmentId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get shift preset by ID
export const getShiftPreset = (shiftId: string | null): ShiftPreset | null => {
    if (!shiftId) return null;
    return shiftPresets.find((s) => s.id === shiftId) || null;
};

// Format time for display
export const formatShiftTime = (assignment: Assignment): string => {
    if (!assignment.shiftType) return "";

    if (assignment.shiftType === "custom") {
        const start = assignment.customStartTime || "";
        const end = assignment.customEndTime || "";
        if (!start || !end) return "Custom hours";
        return `${formatTimeDisplay(start)} - ${formatTimeDisplay(end)}`;
    }

    const preset = getShiftPreset(assignment.shiftType);
    return preset ? preset.description : "";
};

// Format time for display (convert 24h to 12h with am/pm)
export const formatTimeDisplay = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours, 10);
    const ampm = hour >= 12 ? "pm" : "am";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
};
