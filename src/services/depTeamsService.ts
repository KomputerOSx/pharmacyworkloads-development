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
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { mapFirestoreDocToDepTeam } from "@/lib/firestoreUtil";
import { DepTeam } from "@/types/subDepTypes";
import { deleteAssignmentsByTeam } from "@/services/depTeamHospLocAssService";

const depTeamsCollection = collection(db, "department_teams");

export async function getDepTeams(
    orgId: string,
    depId: string,
): Promise<DepTeam[]> {
    if (!orgId || !depId) {
        console.error("sZ9kL1wP - getDepTeams: orgId and depId are required.");
        return [];
    }
    try {
        const teamsQuery = query(
            depTeamsCollection,
            where("orgId", "==", orgId),
            where("depId", "==", depId),
        );

        const teamsSnapshot = await getDocs(teamsQuery);

        return teamsSnapshot.docs
            .map((doc) => {
                try {
                    return mapFirestoreDocToDepTeam(doc.id, doc.data());
                } catch (mapError) {
                    console.error(
                        `eR4tG7bN - Error mapping department team document ${doc.id}:`,
                        mapError,
                    );
                    return null;
                }
            })
            .filter((team): team is DepTeam => team !== null);
    } catch (error) {
        console.error(
            `aP1oX3zQ - Error getting department teams for org ${orgId}, dep ${depId}:`,
            error,
        );
        throw error;
    }
}

export async function getDepTeam(id: string): Promise<DepTeam | null> {
    if (!id) {
        console.error(
            "bN5hY8uJ - getDepTeam error: Attempted to fetch with an invalid or empty ID.",
        );
        return null;
    }

    try {
        const docRef: DocumentReference = doc(depTeamsCollection, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapFirestoreDocToDepTeam(docSnap.id, docSnap.data());
        } else {
            console.warn(
                `kL9pW2sC - Department team document with ID ${id} not found.`,
            );
            return null;
        }
    } catch (error) {
        console.error(
            `fD7zV1xR - Error fetching department team with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to retrieve department team data for ID: ${id}.`,
        );
    }
}

export async function createDepTeam(
    teamData: Omit<
        Partial<DepTeam>,
        | "id"
        | "orgId"
        | "depId"
        | "createdAt"
        | "updatedAt"
        | "createdById"
        | "updatedById"
    >,
    orgId: string,
    depId: string,
    userId = "system",
): Promise<DepTeam> {
    if (!orgId || !depId) {
        throw new Error(
            "hY2gT6dS - Organization ID and Department ID are required to create a department team.",
        );
    }
    if (!teamData.name || teamData.name.trim() === "") {
        throw new Error("mJ4bF8wP - Department team name cannot be empty.");
    }

    try {
        const dataToAdd: DocumentData = {
            ...teamData,
            name: teamData.name.trim(),
            orgId: orgId,
            depId: depId,
            description: teamData.description ?? null,
            active: teamData.active ?? true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const newDocRef: DocumentReference = await addDoc(
            depTeamsCollection,
            dataToAdd,
        );

        const newTeamDoc = await getDoc(newDocRef);

        if (!newTeamDoc.exists()) {
            console.error(
                `CREATE_TEAM_ERR_FETCH_FAIL - Failed to retrieve newly created team (ID: ${newDocRef.id}) after creation.`,
            );
            throw new Error(
                `Consistency Error: Failed to fetch team ${newDocRef.id} immediately after creation.`,
            );
        }

        const createdTeam = mapFirestoreDocToDepTeam(
            newTeamDoc.id,
            newTeamDoc.data(),
        );

        if (!createdTeam) {
            console.error(
                `CREATE_TEAM_ERR_MAP_FAIL - Failed to map newly created team data (ID: ${newTeamDoc.id}). Check mapper function and Firestore data structure.`,
            );
            throw new Error(
                `Data Mapping Error: Failed to map created team ${newTeamDoc.id}.`,
            );
        }

        console.log(
            `vC5xR9zG - Department Team created successfully with ID: ${createdTeam.id}`,
        );
        return createdTeam;
    } catch (error) {
        console.error(
            `uN1pL4hT - Error during department team creation (OrgID: ${orgId}, DepID: ${depId}):`,
            error,
        );

        if (
            error instanceof Error &&
            error.message.startsWith("CREATE_TEAM_ERR")
        ) {
            throw error;
        } else {
            throw new Error(
                `Failed to create department team. Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function updateDepTeam(
    id: string,
    data: Omit<
        Partial<DepTeam>,
        | "id"
        | "orgId"
        | "depId"
        | "createdAt"
        | "createdById"
        | "updatedAt"
        | "updatedById"
    >,
    userId = "system",
): Promise<DepTeam> {
    if (!id) {
        throw new Error(
            "qZ8vB3nW - updateDepTeam error: Department Team ID is required for update.",
        );
    }
    if (!data || Object.keys(data).length === 0) {
        console.warn(
            `jM6fD1yX - updateDepTeam warning: No specific fields provided for update on Team ${id}. Only timestamps/audit fields will be updated.`,
        );
    }
    if (data.name !== undefined && data.name.trim() === "") {
        throw new Error(
            "rG9sK4zQ - Department team name cannot be updated to empty.",
        );
    }

    try {
        const teamRef: DocumentReference = doc(depTeamsCollection, id);

        const dataToUpdate = {
            ...data,
            ...(data.name && { name: data.name.trim() }),
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        const checkSnap = await getDoc(teamRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `eP3dN7hJ - updateDepTeam error: Department Team with ID ${id} not found. Cannot update.`,
            );
        }

        await updateDoc(teamRef, dataToUpdate);

        const updatedTeamDoc = await getDoc(teamRef);

        if (!updatedTeamDoc.exists()) {
            throw new Error(
                `tY5bV8wE - Consistency error: Department Team with ID ${id} not found immediately after successful update.`,
            );
        }

        const updatedTeam = mapFirestoreDocToDepTeam(
            updatedTeamDoc.id,
            updatedTeamDoc.data(),
        );

        if (!updatedTeam) {
            throw new Error(
                `yU7cF2mS - Data integrity error: Failed to map updated Department Team data for ID: ${id}. Check mapper function and Firestore data.`,
            );
        }

        console.log(`zX1gH9oL - Department Team ${id} updated successfully.`);
        return updatedTeam;
    } catch (error) {
        console.error(
            `wB4nT6kF - Error updating Department Team with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to update Department Team (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

export async function deleteDepTeam(id: string): Promise<void> {
    if (!id)
        throw new Error("pL8kR3vM - deleteDepTeam error: Team ID required.");
    console.log(`aF2dS7hN - Attempting delete Department Team: ${id}`);

    // 1. Clean up NEW Team-Location assignments linked to this team
    try {
        console.log(
            `yG5bN1wQ - Deleting team-location assignments for team ${id}...`,
        );
        await deleteAssignmentsByTeam(id); // Use the new service function
        console.log(
            `sK3jP9zV - Deleted team-location assignments for team ${id}.`,
        );
    } catch (assError) {
        console.error(
            `bH7wE2sR - Failed to delete team-location assignments for team ${id}:`,
            assError,
        );
        let reason = "Unknown assignment cleanup error.";
        if (assError instanceof Error) reason = assError.message;
        throw new Error(
            `Cleanup failed before deleting team ${id}. Reason: ${reason}`,
        );
    }

    // 2. Delete the Team document itself
    try {
        const teamRef: DocumentReference = doc(db, "department_teams", id); // Ensure correct collection name
        const checkSnap = await getDoc(teamRef);
        if (!checkSnap.exists()) {
            console.warn(`nC1xT8dR - Team ${id} not found. Deletion skipped.`);
            return;
        }

        console.log(`hY9gT5dS - Deleting Department Team document: ${id}`);
        await deleteDoc(teamRef);
        console.log(
            `mJ4bF8wP - Successfully deleted Department Team document: ${id}`,
        );
    } catch (error) {
        console.error(
            `rG2sN8vC - Error deleting Department Team ${id}:`,
            error,
        );
        let reason = "Unknown team deletion error.";
        if (error instanceof Error) reason = error.message;
        throw new Error(
            `Failed to delete Department Team ${id}. Reason: ${reason}`,
        );
    }
}
