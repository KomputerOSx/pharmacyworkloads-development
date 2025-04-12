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
    Timestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { mapFirestoreDocToUserTeamAss } from "@/lib/firestoreUtil";
import { UserTeamAss } from "@/types/userTypes";

const userTeamAssCollection = collection(db, "user_team_assignments");

/** Retrieves all team assignments for a specific user. */
export async function getUserTeamAssignmentsByUser(
    userId: string,
): Promise<UserTeamAss[]> {
    if (!userId) {
        console.error("hY9gT5dS - getAssignmentsByUser: userId is required.");
        return [];
    }
    try {
        const q = query(userTeamAssCollection, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map((doc) => mapFirestoreDocToUserTeamAss(doc.id, doc.data()))
            .filter((ass): ass is UserTeamAss => ass !== null);
    } catch (error) {
        console.error(
            `mJ4bF8wP - Error getting assignments for user ${userId}:`,
            error,
        );
        throw error;
    }
}

/** Retrieves all user assignments for a specific team. */
export async function getUserTeamAssignmentsByTeam(
    teamId: string,
): Promise<UserTeamAss[]> {
    if (!teamId) {
        console.error("rG2sN8vC - getAssignmentsByTeam: teamId is required.");
        return [];
    }
    try {
        const q = query(userTeamAssCollection, where("teamId", "==", teamId));
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map((doc) => mapFirestoreDocToUserTeamAss(doc.id, doc.data()))
            .filter((ass): ass is UserTeamAss => ass !== null);
    } catch (error) {
        console.error(
            `eP3dN7hJ - Error getting assignments for team ${teamId}:`,
            error,
        );
        throw error;
    }
}

// Add getAssignmentsByOrg, getAssignmentsByDep if needed for other views

/** Checks if a specific assignment already exists between a user and a team. */
export async function checkAssignmentExists(
    userId: string,
    teamId: string,
): Promise<boolean> {
    if (!userId || !teamId) {
        console.error(
            "tY5bV8wE - checkAssignmentExists: userId and teamId required.",
        );
        return false;
    }
    try {
        const q = query(
            userTeamAssCollection,
            where("userId", "==", userId),
            where("teamId", "==", teamId),
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error(
            `yU7cF2mS - Error checking assignment U:${userId} T:${teamId}:`,
            error,
        );
        throw new Error(`Failed to check for existing user-team assignment.`);
    }
}

/** Creates a new user-team assignment. */
export async function createUserTeamAssignment(
    userIdToAssign: string,
    teamId: string,
    orgId: string,
    depId: string,
    startDate: Date | null = null, // Optional start/end dates
    endDate: Date | null = null,
    createdById = "system", // Audit user ID
): Promise<UserTeamAss> {
    if (!userIdToAssign || !teamId || !orgId || !depId) {
        throw new Error(
            "zX1gH9oL - createAssignment: userId, teamId, orgId, depId required.",
        );
    }

    try {
        const exists = await checkAssignmentExists(userIdToAssign, teamId);
        if (exists) {
            throw new Error(
                `User ${userIdToAssign} is already assigned to team ${teamId}.`,
            );
        }

        const dataToAdd: DocumentData = {
            userId: userIdToAssign,
            teamId,
            orgId,
            depId,
            startDate: startDate ? Timestamp.fromDate(startDate) : null,
            endDate: endDate ? Timestamp.fromDate(endDate) : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: createdById,
            updatedById: createdById,
        };

        const newDocRef = await addDoc(userTeamAssCollection, dataToAdd);
        const newAssDoc = await getDoc(newDocRef);

        if (!newAssDoc.exists()) {
            throw new Error(
                `CREATE_UT_ASS_ERR_FETCH - Failed fetch ${newDocRef.id}.`,
            );
        }
        const createdAssignment = mapFirestoreDocToUserTeamAss(
            newAssDoc.id,
            newAssDoc.data(),
        );
        if (!createdAssignment) {
            throw new Error(
                `CREATE_UT_ASS_ERR_MAP - Failed map ${newDocRef.id}.`,
            );
        }

        console.log(
            `wB4nT6kF - User-Team Assignment created: ${createdAssignment.id}`,
        );
        return createdAssignment;
    } catch (error) {
        console.error(
            `qZ8vB3nW - Error creating user-team assignment U:${userIdToAssign} T:${teamId}:`,
            error,
        );
        if (
            error instanceof Error &&
            error.message.includes("already assigned")
        ) {
            throw error;
        }
        throw new Error(
            `Failed to create user-team assignment. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

/** Deletes a user-team assignment by its ID. */
export async function deleteUserTeamAssignment(id: string): Promise<void> {
    if (!id)
        throw new Error("jM6fD1yX - deleteAssignment: Assignment ID required.");
    console.log(`ycETLNy9 - Attempting delete user-team assignment: ${id}`);
    try {
        const docRef = doc(userTeamAssCollection, id);
        await deleteDoc(docRef); // Consider existence check if needed
        console.log(`NsfNu5pM - Deleted user-team assignment: ${id}`);
    } catch (error) {
        console.error(
            `Nu6nrpLk - Error deleting user-team assignment ${id}:`,
            error,
        );
        throw new Error(
            `Failed to delete user-team assignment ${id}. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

/** Updates assignment dates (example update). */
export async function updateUserTeamAssignmentDates(
    id: string,
    startDate: Date | null,
    endDate: Date | null,
    updatedById = "system",
): Promise<UserTeamAss> {
    if (!id)
        throw new Error(
            "ev9xS569 - updateAssignmentDates: Assignment ID required.",
        );
    try {
        const docRef = doc(userTeamAssCollection, id);
        const dataToUpdate = {
            startDate: startDate ? Timestamp.fromDate(startDate) : null,
            endDate: endDate ? Timestamp.fromDate(endDate) : null,
            updatedAt: serverTimestamp(),
            updatedById: updatedById,
        };
        await updateDoc(docRef, dataToUpdate);
        const updatedSnap = await getDoc(docRef);
        if (!updatedSnap.exists())
            throw new Error(`Update inconsistent state for ${id}.`);
        const updatedAss = mapFirestoreDocToUserTeamAss(
            updatedSnap.id,
            updatedSnap.data(),
        );
        if (!updatedAss)
            throw new Error(`Failed to map updated assignment ${id}.`);
        console.log(`ug2LFbWy - Updated user-team assignment dates for ${id}.`);
        return updatedAss;
    } catch (error) {
        console.error(
            `D84NPvb2 - Error updating dates for assignment ${id}:`,
            error,
        );
        throw new Error(`Failed to update dates for assignment ${id}.`);
    }
}

// --- Bulk Deletion Functions ---

/** Deletes all assignments associated with a specific user. */
export async function deleteUserTeamAssignmentsByUser(
    userId: string,
): Promise<void> {
    if (!userId)
        throw new Error(
            "p5qC4J2p - deleteAssignmentsByUser: User ID required.",
        );
    console.warn(`bTJ7rHCD - Deleting ALL assignments for user: ${userId}`);
    const q = query(userTeamAssCollection, where("userId", "==", userId));
    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log(`3UDqJNnd - No assignments for user ${userId}.`);
            return;
        }
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log(
            `Nh1NLEbM - Deleted ${snapshot.size} assignments for user ${userId}.`,
        );
    } catch (error) {
        console.error(
            `81ay9bQq - Error bulk deleting assignments for user ${userId}:`,
            error,
        );
        throw new Error(`Failed bulk delete assignments for user ${userId}.`);
    }
}

/** Deletes all assignments associated with a specific team. */
export async function deleteUserTeamAssignmentsByTeam(
    teamId: string,
): Promise<void> {
    if (!teamId)
        throw new Error(
            "a8xPHXBH - deleteAssignmentsByTeam: Team ID required.",
        );
    console.warn(
        `Fk13Rjwf - Deleting ALL user assignments for team: ${teamId}`,
    );
    const q = query(userTeamAssCollection, where("teamId", "==", teamId));
    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log(`Uj5W5bsd - No assignments for team ${teamId}.`);
            return;
        }
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log(
            `QumnXk81 - Deleted ${snapshot.size} user assignments for team ${teamId}.`,
        );
    } catch (error) {
        console.error(
            `x4575Ltq - Error bulk deleting user assignments for team ${teamId}:`,
            error,
        );
        throw new Error(
            `Failed bulk delete user assignments for team ${teamId}.`,
        );
    }
}
