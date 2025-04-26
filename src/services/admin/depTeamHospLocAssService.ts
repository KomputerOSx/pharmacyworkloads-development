import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    writeBatch,
    where,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { mapFirestoreDocToDepTeamHospLocAss } from "@/lib/firestoreUtil";
import { DepTeamHospLocAss } from "@/types/depTypes";

const assCollection = collection(db, "department_team_location_assignments");

/**
 * Retrieves all location assignments for a specific team.
 * @param teamId - The ID of the team.
 * @returns Promise<DepTeamHospLocAss[]>
 */
export async function getDepTeamHospLocAssignmentsByTeam(
    teamId: string,
): Promise<DepTeamHospLocAss[]> {
    if (!teamId) {
        console.error("grb7cDT9 - getAssignmentsByTeam: teamId is required.");
        return [];
    }
    try {
        const q = query(assCollection, where("teamId", "==", teamId));
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map((doc) =>
                mapFirestoreDocToDepTeamHospLocAss(doc.id, doc.data()),
            )
            .filter((ass): ass is DepTeamHospLocAss => ass !== null);
    } catch (error) {
        console.error(
            `w7NC4nq3 - Error getting assignments for team ${teamId}:`,
            error,
        );
        throw error;
    }
}

/**
 * Retrieves all team assignments for a specific location.
 * @param locationId - The ID of the location.
 * @returns Promise<DepTeamHospLocAss[]>
 */
export async function getDepTeamHospLocAssignmentsByLocation(
    locationId: string,
): Promise<DepTeamHospLocAss[]> {
    if (!locationId) {
        console.error(
            "y3FSVYrj - getAssignmentsByLocation: locationId is required.",
        );
        return [];
    }
    try {
        const q = query(assCollection, where("locationId", "==", locationId));
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map((doc) =>
                mapFirestoreDocToDepTeamHospLocAss(doc.id, doc.data()),
            )
            .filter((ass): ass is DepTeamHospLocAss => ass !== null);
    } catch (error) {
        console.error(
            `cPNX2f5X - Error getting assignments for location ${locationId}:`,
            error,
        );
        throw error;
    }
}

/**
 * Retrieves assignments potentially filtered by department (using denormalized depId).
 * Useful for showing all location assignments within a department context.
 * @param depId - The ID of the department.
 * @returns Promise<DepTeamHospLocAss[]>
 */
export async function getDepTeamHospLocAssignmentsByDepartment(
    depId: string,
): Promise<DepTeamHospLocAss[]> {
    if (!depId) {
        console.error(
            "sLsBqD2Y - getAssignmentsByDepartment: depId is required.",
        );
        return [];
    }
    try {
        const q = query(assCollection, where("depId", "==", depId));
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map((doc) =>
                mapFirestoreDocToDepTeamHospLocAss(doc.id, doc.data()),
            )
            .filter((ass): ass is DepTeamHospLocAss => ass !== null);
    } catch (error) {
        console.error(
            `FFvDbkT5 - Error getting assignments for department ${depId}:`,
            error,
        );
        throw error;
    }
}

/**
 * Retrieves a single assignment by its ID.
 * @param id - The unique ID of the assignment.
 * @returns Promise<DepTeamHospLocAss | null>
 */
export async function getAssignmentById(
    id: string,
): Promise<DepTeamHospLocAss | null> {
    if (!id) {
        console.error("RV6SQtyD - getAssignmentById: Assignment ID required.");
        return null;
    }
    try {
        const docRef = doc(assCollection, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists()
            ? mapFirestoreDocToDepTeamHospLocAss(docSnap.id, docSnap.data())
            : null;
    } catch (error) {
        console.error(`Yw8sUWAn - Error fetching assignment ${id}:`, error);
        throw error;
    }
}

/**
 * Checks if a specific assignment already exists between a team and a location.
 * @param teamId - The team ID.
 * @param locationId - The location ID.
 * @returns Promise<boolean> - True if the assignment exists, false otherwise.
 */
export async function checkAssignmentExists(
    teamId: string,
    locationId: string,
): Promise<boolean> {
    if (!teamId || !locationId) {
        console.error(
            "4ds2pkMd - checkAssignmentExists: Both teamId and locationId required.",
        );
        return false; // Or throw error? Returning false might be safer default
    }
    try {
        const q = query(
            assCollection,
            where("teamId", "==", teamId),
            where("locationId", "==", locationId),
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error(
            `XeU1CK2z - Error checking assignment for team ${teamId} and loc ${locationId}:`,
            error,
        );
        throw new Error(`Failed to check for existing assignment.`);
    }
}

/**
 * Creates a new team-location assignment.
 * @param teamId - The ID of the team.
 * @param locationId - The ID of the location.
 * @param orgId - The Organization ID.
 * @param depId - The Department ID (denormalized).
 * @param userId - The ID of the user creating the assignment.
 * @returns Promise<DepTeamHospLocAss> - The newly created assignment object.
 */
export async function createDepTeamHospLocAssignment(
    teamId: string,
    locationId: string,
    orgId: string,
    depId: string,
    userId = "system",
): Promise<DepTeamHospLocAss> {
    if (!teamId || !locationId || !orgId || !depId) {
        throw new Error(
            "w4Gx5JXZ - createAssignment: teamId, locationId, orgId, and depId are required.",
        );
    }

    try {
        const exists = await checkAssignmentExists(teamId, locationId);
        if (exists) {
            throw new Error(
                `Assignment already exists between team ${teamId} and location ${locationId}.`,
            );
        }

        const dataToAdd: DocumentData = {
            teamId,
            locationId,
            orgId,
            depId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const newDocRef = await addDoc(assCollection, dataToAdd);
        const newAssDoc = await getDoc(newDocRef);

        if (!newAssDoc.exists()) {
            throw new Error(
                `Qup6eC8v - Failed fetch new assignment ${newDocRef.id}.`,
            );
        }
        const createdAssignment = mapFirestoreDocToDepTeamHospLocAss(
            newAssDoc.id,
            newAssDoc.data(),
        );
        if (!createdAssignment) {
            throw new Error(
                `grb7cDT9 - Failed map new assignment ${newDocRef.id}.`,
            );
        }

        console.log(
            `dEWwS6zT - Team-Location Assignment created: ${createdAssignment.id}`,
        );
        return createdAssignment;
    } catch (error) {
        console.error(
            `MBsn2kUj - Error creating assignment T:${teamId} L:${locationId} D:${depId} O:${orgId}:`,
            error,
        );
        if (
            error instanceof Error &&
            error.message.includes("already exists")
        ) {
            throw error; // Re-throw specific known error
        }
        throw new Error(
            `Failed to create assignment. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

/**
 * Deletes a team-location assignment by its ID.
 * @param id - The ID of the assignment to delete.
 * @returns Promise<void>
 */
export async function deleteDepTeamHospLocAssignment(
    id: string,
): Promise<void> {
    if (!id) {
        throw new Error("22MQM7un - deleteAssignment: Assignment ID required.");
    }
    console.log(`tzW5XyBJ - Attempting delete assignment: ${id}`);
    try {
        const docRef = doc(assCollection, id);
        // Optional: check existence first
        const checkSnap = await getDoc(docRef);
        if (!checkSnap.exists()) {
            console.warn(
                `49FsGKQZ - Assignment ${id} not found. Delete skipped.`,
            );
            return;
        }
        await deleteDoc(docRef);
        console.log(`Tr5KSuv3 - Deleted assignment: ${id}`);
    } catch (error) {
        console.error(`Vkaebs3G - Error deleting assignment ${id}:`, error);
        throw new Error(
            `Failed to delete assignment ${id}. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

// --- Bulk Deletion Functions ---

/**
 * Deletes all assignments associated with a specific team.
 * @param teamId - The ID of the team.
 * @returns Promise<void>
 */
export async function deleteTeamHospLocAssignmentsByTeam(
    teamId: string,
): Promise<void> {
    if (!teamId)
        throw new Error(
            "eeT6VBZq - deleteAssignmentsByTeam: Team ID required.",
        );
    console.warn(`vbEJgLT8 - Deleting ALL assignments for team: ${teamId}`);
    const q = query(assCollection, where("teamId", "==", teamId));
    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log(`ahWKrkx5 - No assignments found for team ${teamId}.`);
            return;
        }
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log(
            `VBvkE5SA - Deleted ${snapshot.size} assignments for team ${teamId}.`,
        );
    } catch (error) {
        console.error(
            `D5Y5b2CD - Error bulk deleting assignments for team ${teamId}:`,
            error,
        );
        throw new Error(`Failed bulk delete assignments for team ${teamId}.`);
    }
}

/**
 * Deletes all assignments associated with a specific department.
 * @param depId - The ID of the department.
 * @returns Promise<void>
 */
export async function deleteDepTeamHospLocAssignmentsByDepartment(
    depId: string,
): Promise<void> {
    if (!depId)
        throw new Error(
            "Fk13Rjwf - deleteAssignmentsByDepartment: Department ID required.",
        );
    console.warn(
        `Uj5W5bsd - Deleting ALL assignments for department: ${depId}`,
    );
    const q = query(assCollection, where("depId", "==", depId)); // Query using the denormalized depId
    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log(
                `QumnXk81 - No assignments found for department ${depId}.`,
            );
            return;
        }
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log(
            `x4575Ltq - Deleted ${snapshot.size} assignments for department ${depId}.`,
        );
    } catch (error) {
        console.error(
            `eF9dN3kM - Error bulk deleting assignments for department ${depId}:`,
            error,
        );
        throw new Error(
            `Failed bulk delete assignments for department ${depId}.`,
        );
    }
}

/**
 * Deletes all assignments associated with a specific location.
 * (Use if locations can be deleted independently and need cleanup).
 * @param locationId - The ID of the location.
 * @returns Promise<void>
 */
export async function deleteAssignmentsByLocation(
    locationId: string,
): Promise<void> {
    if (!locationId)
        throw new Error(
            "UyChVT83 - deleteAssignmentsByLocation: Location ID required.",
        );
    console.warn(
        `eEtdP2WX - Deleting ALL assignments for location: ${locationId}`,
    );
    const q = query(assCollection, where("locationId", "==", locationId));
    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log(
                `X12z4Unj - No assignments found for location ${locationId}.`,
            );
            return;
        }
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log(
            `gP5rT9wE - Deleted ${snapshot.size} assignments for location ${locationId}.`,
        );
    } catch (error) {
        console.error(
            `qL2mS8dN - Error bulk deleting assignments for location ${locationId}:`,
            error,
        );
        throw new Error(
            `Failed bulk delete assignments for location ${locationId}.`,
        );
    }
}
