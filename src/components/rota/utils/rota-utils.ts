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

// Find changes between two sets of assignments
export const findChangedStaff = (
    oldAssignments: Record<string, Assignment[]>,
    newAssignments: Record<string, Assignment[]>,
    staffMembers: { id: number; name: string; role: string }[],
    weekId: string,
): { id: number; name: string; role: string }[] => {
    const changedStaffIds = new Set<number>();

    // Helper function to get staff ID from key
    const getStaffIdFromKey = (key: string): number => {
        const parts = key.split("-");
        return Number.parseInt(parts[1], 10);
    };

    // Get all keys for the current week
    const oldKeys = Object.keys(oldAssignments).filter((key) =>
        key.startsWith(weekId),
    );
    const newKeys = Object.keys(newAssignments).filter((key) =>
        key.startsWith(weekId),
    );

    // Check for added or removed keys
    const allKeys = new Set([...oldKeys, ...newKeys]);

    allKeys.forEach((key) => {
        const staffId = getStaffIdFromKey(key);
        const oldAssignmentsForKey = oldAssignments[key] || [];
        const newAssignmentsForKey = newAssignments[key] || [];

        // If the number of assignments changed
        if (oldAssignmentsForKey.length !== newAssignmentsForKey.length) {
            changedStaffIds.add(staffId);
            return;
        }

        // Check if any assignment details changed
        const hasChanges = !areAssignmentsEqual(
            oldAssignmentsForKey,
            newAssignmentsForKey,
        );
        if (hasChanges) {
            changedStaffIds.add(staffId);
        }
    });

    // Return the staff members that have changes
    return staffMembers.filter((staff) => changedStaffIds.has(staff.id));
};

// Helper function to compare two arrays of assignments
const areAssignmentsEqual = (
    arr1: Assignment[],
    arr2: Assignment[],
): boolean => {
    if (arr1.length !== arr2.length) return false;

    // Sort both arrays to ensure consistent comparison
    const sortedArr1 = [...arr1].sort((a, b) => a.id.localeCompare(b.id));
    const sortedArr2 = [...arr2].sort((a, b) => a.id.localeCompare(b.id));

    for (let i = 0; i < sortedArr1.length; i++) {
        const a1 = sortedArr1[i];
        const a2 = sortedArr2[i];

        // Compare relevant properties
        if (
            a1.locationId !== a2.locationId ||
            a1.customLocation !== a2.customLocation ||
            a1.shiftType !== a2.shiftType ||
            a1.customStartTime !== a2.customStartTime ||
            a1.customEndTime !== a2.customEndTime ||
            a1.notes !== a2.notes
        ) {
            return false;
        }
    }

    return true;
};
