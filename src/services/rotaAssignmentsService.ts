// src/services/assignmentService.ts (or lib/firestore-service.ts as per guide)

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase"; // Adjust path as needed
import { mapFirestoreDocToStoredAssignment } from "@/lib/firestoreUtil"; // Adjust path
import { StoredAssignment } from "@/types/rotaTypes"; // Adjust path

// Define the collection reference for assignments
const assignmentsCollection = collection(db, "rota_assignments");

/**
 * Fetches all assignments for a specific week.
 * @param weekId The week identifier (e.g., "2023-W45")
 * @returns Promise<StoredAssignment[]> An array of assignments for that week.
 */
export async function getAssignmentsByWeek(
    weekId: string,
): Promise<StoredAssignment[]> {
    if (!weekId) {
        console.error("4cKYMPzu - getAssignmentsByWeek: weekId is required.");
        return []; // Return empty array if no weekId provided
    }
    try {
        const assignmentsQuery = query(
            assignmentsCollection,
            where("weekId", "==", weekId),
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);

        return assignmentsSnapshot.docs
            .map((doc) => {
                try {
                    // Use the specific mapper for assignments
                    return mapFirestoreDocToStoredAssignment(
                        doc.id,
                        doc.data(),
                    );
                } catch (mapError) {
                    console.error(
                        `3rRhM6Rt - Error mapping assignment document ${doc.id}:`,
                        mapError,
                    );
                    return null; // Skip problematic documents
                }
            })
            .filter((a): a is StoredAssignment => a !== null); // Type guard to filter out nulls
    } catch (error) {
        console.error(
            `DY52ZrvN - Error fetching assignments for week ${weekId}:`,
            error,
        );
        throw new Error(`Failed to retrieve assignments for week ${weekId}.`); // Re-throw or handle as needed
    }
}

export async function getAssignmentsByWeekAndTeam( // Renamed for clarity
    weekId: string,
    teamId: string, // Added teamId parameter
): Promise<StoredAssignment[]> {
    // Validate inputs
    if (!weekId || !teamId) {
        console.error(
            "51BV4dcn - getAssignmentsByWeekAndTeam: weekId and teamId are required.",
        );
        return [];
    }
    try {
        // Add 'where' clause for teamId
        const assignmentsQuery = query(
            assignmentsCollection,
            where("weekId", "==", weekId),
            where("teamId", "==", teamId), // Filter by teamId
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);

        console.log(
            `Fetched ${assignmentsSnapshot.docs.length} assignments for ${weekId} / ${teamId}`,
        ); // Add log

        return assignmentsSnapshot.docs
            .map((doc) => {
                try {
                    return mapFirestoreDocToStoredAssignment(
                        doc.id,
                        doc.data(),
                    );
                } catch (mapError) {
                    console.error(
                        `dqqvBdY4 - Error mapping assignment document ${doc.id}:`,
                        mapError,
                    );
                    return null;
                }
            })
            .filter((a): a is StoredAssignment => a !== null);
    } catch (error) {
        console.error(
            `n45NRujy - Error fetching assignments for week ${weekId}, team ${teamId}:`,
            error,
        );
        throw new Error(
            `Failed to retrieve assignments for week ${weekId}, team ${teamId}.`,
        );
    }
}

/**
 * Fetches a single assignment by its unique document ID.
 * @param assignmentId The unique Firestore document ID of the assignment.
 * @returns Promise<StoredAssignment | null> The assignment object or null if not found.
 */
export async function getAssignment(
    assignmentId: string,
): Promise<StoredAssignment | null> {
    if (!assignmentId) {
        console.error(
            "anEcq4jy - getAssignment: Attempted to fetch with an invalid ID.",
        );
        return null;
    }

    try {
        const docRef: DocumentReference = doc(db, "assignments", assignmentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapFirestoreDocToStoredAssignment(
                docSnap.id,
                docSnap.data(),
            );
        } else {
            console.warn(
                `25Yz53fs - Assignment document with ID ${assignmentId} not found.`,
            );
            return null;
        }
    } catch (error) {
        console.error(
            `a2xmH7QZ - Error fetching assignment with ID ${assignmentId}:`,
            error,
        );
        throw new Error(
            `Failed to retrieve assignment data for ID: ${assignmentId}.`,
        );
    }
}

/**
 * Creates a new assignment document in Firestore.
 * Expects data conforming to StoredAssignment, excluding fields set automatically.
 * @param assignmentData The data for the new assignment. Must include staffId, weekId, dayIndex.
 * @param userId The ID of the user performing the creation.
 * @returns Promise<StoredAssignment> The newly created assignment object, including its Firestore ID.
 */
export async function createAssignment(
    // Input data needs all required fields for storage, minus auto-generated ones
    assignmentData: Omit<StoredAssignment, "id" | "createdAt" | "updatedAt">,
    userId: string, // Assume userId is passed for tracking
): Promise<StoredAssignment> {
    // 1. Validate essential inputs (can add more specific checks as needed)
    if (
        !assignmentData.userId ||
        !assignmentData.weekId ||
        assignmentData.dayIndex === undefined ||
        assignmentData.dayIndex === null
    ) {
        throw new Error(
            "w6xeBAPx - staffId, weekId, and dayIndex are required to create an assignment.",
        );
    }
    if (!userId) {
        console.warn(
            "YJnBh3Xe - No userId provided for createAssignment, using 'system'.",
        );
        userId = "system"; // Defaulting userId if not provided
    }

    try {
        // 2. Prepare data for Firestore, adding timestamps and audit fields
        const dataToAdd: DocumentData = {
            ...assignmentData, // Spread the provided assignment details
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        // 3. Add the document - Firestore generates the ID
        const newDocRef: DocumentReference = await addDoc(
            assignmentsCollection,
            dataToAdd,
        );

        // 4. Fetch the newly created document to get all fields (including server timestamp)
        const newAssignmentDoc = await getDoc(newDocRef);

        if (!newAssignmentDoc.exists()) {
            throw new Error(
                `Kt9sc5TV - Failed to retrieve newly created assignment (ID: ${newDocRef.id}) immediately after creation.`,
            );
        }

        // 5. Map the Firestore document to our StoredAssignment type
        const createdAssignment = mapFirestoreDocToStoredAssignment(
            newAssignmentDoc.id,
            newAssignmentDoc.data(),
        );

        if (!createdAssignment) {
            // This indicates a problem with the mapping or data consistency
            throw new Error(
                `aBky1SE5 - Failed to map newly created assignment data (ID: ${newAssignmentDoc.id}). Check mapper logic and Firestore data.`,
            );
        }

        console.log(
            `Assignment created successfully with ID: ${createdAssignment.id}`,
        );
        return createdAssignment; // Return the complete object
    } catch (error) {
        console.error(
            `h7Ffcesh - Error during assignment creation process:`,
            error,
        );
        // Re-throw specific internal errors or a generic one
        if (
            error instanceof Error &&
            error.message.startsWith("CREATE_ASSIGN_ERR")
        ) {
            throw error;
        } else {
            throw new Error(
                `Failed to create assignment. Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

/**
 * Updates an existing assignment document in Firestore.
 * @param assignmentId The ID of the assignment document to update.
 * @param dataToUpdate Partial data containing fields to update. Excludes non-updatable fields.
 * @param userId The ID of the user performing the update.
 * @returns Promise<StoredAssignment> The updated assignment object.
 */
export async function updateAssignment(
    assignmentId: string,
    // Allow updating any field except id, createdAt, createdById
    dataToUpdate: Partial<
        Omit<StoredAssignment, "id" | "createdAt" | "createdById">
    >,
    userId: string,
): Promise<StoredAssignment> {
    if (!assignmentId) {
        throw new Error("ezy3C683 - Assignment ID is required for update.");
    }
    if (!userId) {
        console.warn(
            "XnL59LzZ - No userId provided for updateAssignment, using 'system'.",
        );
        userId = "system";
    }
    if (!dataToUpdate || Object.keys(dataToUpdate).length === 0) {
        console.warn(
            `3nSu2Fzd - No specific fields provided for update on assignment ${assignmentId}. Only timestamps/audit fields will be updated.`,
        );
        // Decide if you want to throw an error or proceed to only update timestamps
        // throw new Error("No data provided for assignment update.");
    }

    try {
        const assignmentRef: DocumentReference = doc(
            db,
            "assignments",
            assignmentId,
        );

        // Prepare the payload, ensuring updatedAt and updatedById are set
        const updatePayload = {
            ...dataToUpdate,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        // Optional: Check if document exists before attempting update
        const checkSnap = await getDoc(assignmentRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `ED8BWcDq - Assignment with ID ${assignmentId} not found. Cannot update.`,
            );
        }

        // Perform the update
        await updateDoc(assignmentRef, updatePayload);

        // Fetch the updated document to return the latest state
        const updatedAssignmentDoc = await getDoc(assignmentRef);

        if (!updatedAssignmentDoc.exists()) {
            // Should not happen if updateDoc succeeded without error
            throw new Error(
                `xSDy7xp7 - Consistency error: Assignment with ID ${assignmentId} not found immediately after successful update.`,
            );
        }

        // Map the updated data
        const updatedAssignment = mapFirestoreDocToStoredAssignment(
            updatedAssignmentDoc.id,
            updatedAssignmentDoc.data(),
        );

        if (!updatedAssignment) {
            throw new Error(
                `R3JsypaU - Data integrity error: Failed to map updated assignment data for ID: ${assignmentId}. Check mapper logic and Firestore data.`,
            );
        }

        console.log(`Assignment updated successfully: ${assignmentId}`);
        return updatedAssignment;
    } catch (error) {
        console.error(
            `68D7eECE - Error updating assignment with ID ${assignmentId}:`,
            error,
        );
        throw new Error(
            `Failed to update assignment (ID: ${assignmentId}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

/**
 * Deletes an assignment document from Firestore.
 * WARNING: This performs a hard delete without safety checks as requested.
 * @param assignmentId The ID of the assignment document to delete.
 * @returns Promise<void>
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
    if (!assignmentId) {
        throw new Error("1T7EvQFh - Assignment ID is required for deletion.");
    }

    console.log(
        `b7mSSjNQ - Attempting to delete assignment with ID: ${assignmentId}`,
    );

    try {
        const assignmentRef = doc(db, "assignments", assignmentId);

        // --- NO SAFETY CHECKS ---
        // Directly delete the document.

        console.log(`2tY5GdUf- Deleting assignment document: ${assignmentId}`);
        await deleteDoc(assignmentRef);
        console.log(
            `mp2bjV1d - Successfully deleted assignment document: ${assignmentId}`,
        );
    } catch (error) {
        console.error(
            `Y1YfqaMb - Error deleting assignment with ID ${assignmentId}:`,
            error,
        );
        throw new Error(
            `Failed to delete assignment (ID: ${assignmentId}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

export async function saveWeekAssignmentsBatch(
    weekId: string,
    teamId: string,
    assignmentsToSave: Omit<
        StoredAssignment,
        "id" | "createdAt" | "updatedAt"
    >[], // Data before saving
    userId: string,
): Promise<void> {
    if (!weekId || !teamId) {
        throw new Error(
            "6DgSdb18 - weekId and teamId are required for batch save.",
        );
    }
    if (!userId) {
        console.warn(
            "b7XdJrUt - No userId provided for saveWeekAssignmentsBatch, using 'system'.",
        );
        userId = "system";
    }

    console.log(
        `Pgb7vjF1 - Starting batch save for Week: ${weekId}, Team: ${teamId}. ${assignmentsToSave.length} assignments.`,
    );

    const batch = writeBatch(db);

    try {
        // 1. Find existing assignments for this week and team to delete
        const q = query(
            assignmentsCollection,
            where("weekId", "==", weekId),
            where("teamId", "==", teamId),
        );
        const existingSnapshot = await getDocs(q);

        let deletedCount = 0;
        if (!existingSnapshot.empty) {
            existingSnapshot.docs.forEach((doc) => {
                console.log(
                    `zyZRGas2 -> Queuing delete for existing assignment: ${doc.id}`,
                );
                batch.delete(doc.ref);
                deletedCount++;
            });
            console.log(
                `5maSwbvb -> Queued ${deletedCount} existing assignments for deletion.`,
            );
        } else {
            console.log(
                `pF39cNSV -> No existing assignments found for Week: ${weekId}, Team: ${teamId} to delete.`,
            );
        }

        // 2. Add new assignments to the batch
        assignmentsToSave.forEach((assignmentData) => {
            if (
                !assignmentData.userId ||
                assignmentData.dayIndex === undefined ||
                assignmentData.dayIndex === null
            ) {
                console.warn(
                    "56KmFkpt -> Skipping invalid assignment data during batch save:",
                    assignmentData,
                );
                return; // Skip invalid data points
            }
            // Create a new document reference *within the batch*
            const newAssignmentRef = doc(assignmentsCollection); // Auto-generates ID locally for the batch operation

            const dataToAdd: DocumentData = {
                // Include required fields explicitly first
                userId: assignmentData.userId,
                teamId: assignmentData.teamId,
                weekId: assignmentData.weekId,
                dayIndex: assignmentData.dayIndex,
                locationId: assignmentData.locationId ?? null,
                shiftType: assignmentData.shiftType ?? null,

                // Convert other optional fields from undefined to null
                customLocation: assignmentData.customLocation ?? null,
                customStartTime: assignmentData.customStartTime ?? null,
                customEndTime: assignmentData.customEndTime ?? null,
                notes: assignmentData.notes ?? null,

                // Add audit fields and timestamps
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdById: userId,
                updatedById: userId,
            };

            console.log(
                `5HXun3V5 -> Queuing create for assignment for User: ${assignmentData.userId}, Day: ${assignmentData.dayIndex}`,
            );
            batch.set(newAssignmentRef, dataToAdd);
        });
        console.log(
            `esd1H4JC -> Queued ${assignmentsToSave.length} new assignments for creation.`,
        );

        // 3. Commit the batch
        console.log(`FYe8svUc - Committing batch save...`);
        await batch.commit();
        console.log(
            `Q3Cxq3By - Batch save completed successfully for Week: ${weekId}, Team: ${teamId}.`,
        );
    } catch (error) {
        console.error(
            `4Fns4LDV - Error during batch save for Week ${weekId}, Team ${teamId}:`,
            error,
        );
        throw new Error(
            `Failed to save assignments for week ${weekId}. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}
