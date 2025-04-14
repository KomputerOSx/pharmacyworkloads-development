// src/services/rotaWeekStatusService.ts
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    DocumentReference,
    collection,
    // query, where, getDocs // Needed if you add query functions later
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { mapFirestoreDocToWeekStatus } from "@/lib/firestoreUtil";
import { WeekStatus } from "@/types/rotaTypes";

const statusCollection = collection(db, "rota_week_statuses");

// Helper function to generate the document ID
const getWeekStatusDocId = (weekId: string, teamId: string): string => {
    if (!weekId || !teamId)
        throw new Error(
            "4SgSQ2AR - Week ID and Team ID are required to generate doc ID",
        );
    return `${weekId}_${teamId}`; // Combine week and team for unique ID
};

/**
 * Gets the status document for a specific week and team.
 * @param weekId The week identifier (e.g., "2024-W15").
 * @param teamId The team identifier.
 * @returns Promise<WeekStatus | null> The status object or null if not found/not set.
 */
export async function getWeekStatus(
    weekId: string,
    teamId: string,
): Promise<WeekStatus | null> {
    if (!weekId || !teamId) {
        console.error(
            "RKt2RZ12 - getWeekStatus: weekId and teamId are required.",
        );
        return null;
    }

    try {
        const docId = getWeekStatusDocId(weekId, teamId);
        const docRef: DocumentReference = doc(statusCollection, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapFirestoreDocToWeekStatus(docSnap.data());
            // If you need the ID in the object:
            // return mapFirestoreDocToWeekStatus(docSnap.data(), docSnap.id);
        } else {
            console.log(
                `3XgjfHUu - No status document found for ${docId}. Assuming 'draft'.`,
            );
            return null; // Return null if no status has been explicitly set yet
        }
    } catch (error) {
        console.error(
            `W69dXcW8 - Error fetching status for ${weekId}_${teamId}:`,
            error,
        );
        throw new Error(
            `Failed to retrieve status for week ${weekId}, team ${teamId}.`,
        );
    }
}

/**
 * Sets (creates or overwrites) the status for a specific week and team.
 * @param weekId The week identifier.
 * @param teamId The team identifier.
 * @param orgId The organization identifier.
 * @param status The status to set ('draft' or 'published').
 * @param userId The ID of the user making the change.
 * @returns Promise<void>
 */
export async function setWeekStatus(
    weekId: string,
    teamId: string,
    orgId: string,
    status: "draft" | "published",
    userId: string,
): Promise<void> {
    if (!weekId || !teamId || !orgId) {
        throw new Error(
            "sUsvJ3ye - setWeekStatus: weekId, teamId, and orgId are required.",
        );
    }
    if (status !== "draft" && status !== "published") {
        throw new Error(
            "TR4AbpCT - setWeekStatus: status must be 'draft' or 'published'.",
        );
    }
    if (!userId) {
        console.warn(
            "c59f6hCX - No userId provided for setWeekStatus, using 'system'.",
        );
        userId = "system";
    }

    try {
        const docId = getWeekStatusDocId(weekId, teamId);
        const docRef = doc(statusCollection, docId);

        const dataToSet = {
            weekId: weekId,
            teamId: teamId,
            orgId: orgId,
            status: status,
            lastModified: serverTimestamp(), // Update timestamp on every set
            lastModifiedById: userId,
        };

        // Use setDoc with merge:false (default) to overwrite or create
        await setDoc(docRef, dataToSet);
        console.log(
            `rAyf4b5F - Status successfully set to '${status}' for ${docId}.`,
        );
    } catch (error) {
        console.error(
            `49TCNTNf - Error setting status for ${weekId}_${teamId}:`,
            error,
        );
        throw new Error(
            `Failed to set status for week ${weekId}, team ${teamId}. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

// Add deleteWeekStatus if needed (e.g., when a team or week is deleted)
// Add query functions like getStatusesByOrg or getStatusesByTeam if needed elsewhere.
