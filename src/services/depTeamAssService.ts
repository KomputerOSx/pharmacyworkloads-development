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
    writeBatch, // Import writeBatch for potential bulk operations
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { mapFirestoreDocToDepTeamAss } from "@/lib/firestoreUtil";
import { DepTeamAss } from "@/types/depTypes";

const depTeamAssCollection = collection(db, "department_team_assignments");

/**
 * Retrieves all assignments for a specific department.
 * @param departmentId - The ID of the department.
 * @returns Promise<DepTeamAss[]> - An array of assignments.
 */
export async function getAssignmentsByDepartment(
    departmentId: string,
): Promise<DepTeamAss[]> {
    if (!departmentId) {
        console.error(
            "fG8hY2vK - getAssignmentsByDepartment: departmentId is required.",
        );
        return [];
    }
    try {
        const assQuery = query(
            depTeamAssCollection,
            where("departmentId", "==", departmentId),
        );
        const assSnapshot = await getDocs(assQuery);

        return assSnapshot.docs
            .map((doc) => {
                try {
                    return mapFirestoreDocToDepTeamAss(doc.id, doc.data());
                } catch (mapError) {
                    console.error(
                        `jM1nB4cP - Error mapping assignment document ${doc.id} for dep ${departmentId}:`,
                        mapError,
                    );
                    return null;
                }
            })
            .filter((ass): ass is DepTeamAss => ass !== null);
    } catch (error) {
        console.error(
            `kL5pW9sD - Error getting assignments for department ${departmentId}:`,
            error,
        );
        throw error;
    }
}

/**
 * Retrieves all assignments for a specific team.
 * @param teamId - The ID of the team.
 * @returns Promise<DepTeamAss[]> - An array of assignments.
 */
export async function getAssignmentsByTeam(
    teamId: string,
): Promise<DepTeamAss[]> {
    if (!teamId) {
        console.error("zX3cV7bR - getAssignmentsByTeam: teamId is required.");
        return [];
    }
    try {
        const assQuery = query(
            depTeamAssCollection,
            where("teamId", "==", teamId),
        );
        const assSnapshot = await getDocs(assQuery);

        return assSnapshot.docs
            .map((doc) => {
                try {
                    return mapFirestoreDocToDepTeamAss(doc.id, doc.data());
                } catch (mapError) {
                    console.error(
                        `vC9xR4zG - Error mapping assignment document ${doc.id} for team ${teamId}:`,
                        mapError,
                    );
                    return null;
                }
            })
            .filter((ass): ass is DepTeamAss => ass !== null);
    } catch (error) {
        console.error(
            `uN1pL6hT - Error getting assignments for team ${teamId}:`,
            error,
        );
        throw error;
    }
}

/**
 * Retrieves a single assignment by its ID.
 * @param id - The unique ID of the assignment.
 * @returns Promise<DepTeamAss | null> - The assignment object or null if not found.
 */
export async function getAssignmentById(
    id: string,
): Promise<DepTeamAss | null> {
    if (!id) {
        console.error(
            "wB4nT8kF - getAssignmentById: Assignment ID is required.",
        );
        return null;
    }
    try {
        const docRef: DocumentReference = doc(depTeamAssCollection, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapFirestoreDocToDepTeamAss(docSnap.id, docSnap.data());
        } else {
            console.warn(
                `pL8kR3vM - Assignment document with ID ${id} not found.`,
            );
            return null;
        }
    } catch (error) {
        console.error(
            `aF2dS7hN - Error fetching assignment with ID ${id}:`,
            error,
        );
        throw new Error(`Failed to retrieve assignment data for ID: ${id}.`);
    }
}

/**
 * Checks if a specific assignment already exists between a department and a team.
 * @param departmentId - The department ID.
 * @param teamId - The team ID.
 * @returns Promise<boolean> - True if the assignment exists, false otherwise.
 */
export async function checkAssignmentExists(
    departmentId: string,
    teamId: string,
): Promise<boolean> {
    if (!departmentId || !teamId) {
        console.error(
            "yG5bN1wQ - checkAssignmentExists: Both departmentId and teamId are required.",
        );
        // Depending on requirements, you might want to return true to prevent potential duplicates if IDs are missing
        return false;
    }
    try {
        const q = query(
            depTeamAssCollection,
            where("departmentId", "==", departmentId),
            where("teamId", "==", teamId),
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty; // Return true if any documents match
    } catch (error) {
        console.error(
            `sK3jP9zV - Error checking for existing assignment between dep ${departmentId} and team ${teamId}:`,
            error,
        );
        // Re-throw error as this check is critical for create operations
        throw new Error(`Failed to check for existing assignment.`);
    }
}

/**
 * Creates a new department-team assignment.
 * @param departmentId - The ID of the department.
 * @param teamId - The ID of the team.
 * @param userId - The ID of the user creating the assignment.
 * @returns Promise<DepTeamAss> - The newly created assignment object.
 */
export async function createAssignment(
    departmentId: string,
    teamId: string,
    userId = "system",
): Promise<DepTeamAss> {
    if (!departmentId || !teamId) {
        throw new Error(
            "bH7wE2sR - Department ID and Team ID are required to create an assignment.",
        );
    }

    try {
        // Prevent duplicate assignments
        const exists = await checkAssignmentExists(departmentId, teamId);
        if (exists) {
            console.warn(
                `hY9gT5dS - Assignment between department ${departmentId} and team ${teamId} already exists.`,
            );
            // Decide how to handle: throw error or return existing? Throwing is safer usually.
            throw new Error(
                `Assignment already exists between department ${departmentId} and team ${teamId}.`,
            );
        }

        const dataToAdd: DocumentData = {
            departmentId: departmentId,
            teamId: teamId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const newDocRef: DocumentReference = await addDoc(
            depTeamAssCollection,
            dataToAdd,
        );
        const newAssDoc = await getDoc(newDocRef);

        if (!newAssDoc.exists()) {
            throw new Error(
                `CREATE_ASS_ERR_FETCH_FAIL - Failed to retrieve newly created assignment (ID: ${newDocRef.id}) after creation.`,
            );
        }

        const createdAssignment = mapFirestoreDocToDepTeamAss(
            newAssDoc.id,
            newAssDoc.data(),
        );

        if (!createdAssignment) {
            throw new Error(
                `CREATE_ASS_ERR_MAP_FAIL - Failed to map newly created assignment data (ID: ${newAssDoc.id}).`,
            );
        }

        console.log(
            `mJ4bF8wP - Assignment created successfully with ID: ${createdAssignment.id}`,
        );
        return createdAssignment;
    } catch (error) {
        console.error(
            `rG2sN8vC - Error creating assignment between dep ${departmentId} and team ${teamId}:`,
            error,
        );
        if (
            error instanceof Error &&
            error.message.startsWith("CREATE_ASS_ERR")
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
 * Updates an assignment (primarily audit fields).
 * Simple join tables often don't have other updatable fields.
 * @param id - The ID of the assignment to update.
 * @param userId - The ID of the user performing the update.
 * @returns Promise<DepTeamAss> - The updated assignment object.
 */
export async function updateAssignment(
    id: string,
    userId = "system",
): Promise<DepTeamAss> {
    if (!id) {
        throw new Error(
            "eP3dN7hJ - updateAssignment: Assignment ID is required.",
        );
    }

    try {
        const assRef: DocumentReference = doc(depTeamAssCollection, id);

        // Check if document exists before attempting update
        const checkSnap = await getDoc(assRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `tY5bV8wE - updateAssignment error: Assignment with ID ${id} not found.`,
            );
        }

        const dataToUpdate = {
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        await updateDoc(assRef, dataToUpdate);
        const updatedAssDoc = await getDoc(assRef); // Fetch again to get server timestamp

        if (!updatedAssDoc.exists()) {
            // Should not happen if update succeeded
            throw new Error(
                `yU7cF2mS - Consistency error: Assignment ${id} not found after successful update.`,
            );
        }

        const updatedAssignment = mapFirestoreDocToDepTeamAss(
            updatedAssDoc.id,
            updatedAssDoc.data(),
        );

        if (!updatedAssignment) {
            throw new Error(
                `zX1gH9oL - Data integrity error: Failed to map updated Assignment data for ID: ${id}.`,
            );
        }

        console.log(
            `wB4nT6kF - Assignment ${id} updated successfully (audit fields).`,
        );
        return updatedAssignment;
    } catch (error) {
        console.error(`qZ8vB3nW - Error updating assignment ${id}:`, error);
        throw new Error(
            `Failed to update assignment (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

/**
 * Deletes a department-team assignment by its ID.
 * @param id - The ID of the assignment to delete.
 * @returns Promise<void>
 */
export async function deleteAssignment(id: string): Promise<void> {
    if (!id) {
        throw new Error(
            "jM6fD1yX - deleteAssignment: Assignment ID is required.",
        );
    }
    console.log(`ycETLNy9 - Attempting to delete assignment with ID: ${id}`);

    try {
        const assRef: DocumentReference = doc(depTeamAssCollection, id);

        // Optional: Check existence before deleting
        const checkSnap = await getDoc(assRef);
        if (!checkSnap.exists()) {
            console.warn(
                `NsfNu5pM - Assignment with ID ${id} not found. Deletion skipped.`,
            );
            return; // Or throw new Error(`Assignment with ID ${id} not found.`);
        }

        await deleteDoc(assRef);
        console.log(
            `Nu6nrpLk - Successfully deleted assignment document: ${id}`,
        );
    } catch (error) {
        console.error(
            `ev9xS569 - Error deleting assignment with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to delete assignment (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

/**
 * Deletes all assignments associated with a specific department.
 * Use with caution!
 * @param departmentId - The ID of the department whose assignments should be deleted.
 * @returns Promise<void>
 */
export async function deleteAssignmentsByDepartment(
    departmentId: string,
): Promise<void> {
    if (!departmentId) {
        throw new Error(
            "ug2LFbWy - deleteAssignmentsByDepartment: Department ID required.",
        );
    }
    console.warn(
        `D84NPvb2 - Preparing to delete ALL assignments for department: ${departmentId}`,
    );
    try {
        const assignments = await getAssignmentsByDepartment(departmentId);
        if (assignments.length === 0) {
            console.log(
                `p5qC4J2p - No assignments found for department ${departmentId}. Nothing to delete.`,
            );
            return;
        }

        const batch = writeBatch(db);
        assignments.forEach((ass) => {
            const assRef = doc(depTeamAssCollection, ass.id);
            batch.delete(assRef);
            console.log(`bTJ7rHCD - Queued deletion for assignment ${ass.id}`);
        });

        await batch.commit();
        console.log(
            `3UDqJNnd - Successfully deleted ${assignments.length} assignments for department ${departmentId}.`,
        );
    } catch (error) {
        console.error(
            `Nh1NLEbM - Error deleting assignments for department ${departmentId}:`,
            error,
        );
        throw new Error(
            `Failed to delete assignments for department ${departmentId}.`,
        );
    }
}

/**
 * Deletes all assignments associated with a specific team.
 * Use with caution!
 * @param teamId - The ID of the team whose assignments should be deleted.
 * @returns Promise<void>
 */
export async function deleteAssignmentsByTeam(teamId: string): Promise<void> {
    if (!teamId) {
        throw new Error(
            "kqzrSX88 - deleteAssignmentsByTeam: Team ID required.",
        );
    }
    console.warn(
        `a8xPHXBH - Preparing to delete ALL assignments for team: ${teamId}`,
    );
    try {
        const assignments = await getAssignmentsByTeam(teamId);
        if (assignments.length === 0) {
            console.log(
                `Fk13Rjwf - No assignments found for team ${teamId}. Nothing to delete.`,
            );
            return;
        }

        const batch = writeBatch(db);
        assignments.forEach((ass) => {
            const assRef = doc(depTeamAssCollection, ass.id);
            batch.delete(assRef);
            console.log(`Uj5W5bsd - Queued deletion for assignment ${ass.id}`);
        });

        await batch.commit();
        console.log(
            `QumnXk81 - Successfully deleted ${assignments.length} assignments for team ${teamId}.`,
        );
    } catch (error) {
        console.error(
            `x4575Ltq - Error deleting assignments for team ${teamId}:`,
            error,
        );
        throw new Error(`Failed to delete assignments for team ${teamId}.`);
    }
}
