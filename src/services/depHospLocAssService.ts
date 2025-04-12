// Define the collection reference
import { DepHospLocAss } from "@/types/depTypes";
import {
    addDoc,
    collection,
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
import { mapFirestoreDocToDepHospLocAss } from "@/lib/firestoreUtil";
import { db } from "@/config/firebase";

const depHospLocAssCollection = collection(
    db,
    "department_location_assignments",
);
const depTeamLocAssCollection = collection(
    db,
    "department_team_location_assignments",
);
export async function getDepHospLocAssignments(
    departmentId: string,
): Promise<DepHospLocAss[]> {
    if (!departmentId) {
        console.error(
            "a9sK3mFp - getDepHospLocAssignments: Department ID is required.",
        );
        return [];
    }

    try {
        // *** VERIFY THIS QUERY ***
        const assignmentsQuery = query(
            depHospLocAssCollection,
            where("departmentId", "==", departmentId), // Is the field name "departmentId"? Is the comparison correct?
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);

        return assignmentsSnapshot.docs
            .map((doc) => {
                try {
                    return mapFirestoreDocToDepHospLocAss(doc.id, doc.data());
                } catch (mapError) {
                    console.error(
                        `zX7dRq1v - Error mapping department assignment document ${doc.id}:`,
                        mapError,
                    );
                    return null;
                }
            })
            .filter((ass): ass is DepHospLocAss => ass !== null); // Type guard filter
    } catch (error) {
        console.error(
            `jH4nBvY9 - Error getting department assignments for department ${departmentId}:`,
            error,
        );
        throw error; // Re-throw the error to be handled by the caller
    }
}

export async function getDepHospLocAssignment(
    id: string,
): Promise<DepHospLocAss | null> {
    if (!id) {
        console.error(
            "pL8sWqZ1 - getDepHospLocAssignment error: Attempted to fetch with an invalid ID.",
        );
        return null;
    }

    try {
        const docRef: DocumentReference = doc(depHospLocAssCollection, id); // Use the specific collection
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Use the specific mapper
            return mapFirestoreDocToDepHospLocAss(docSnap.id, docSnap.data());
        } else {
            console.warn(
                `rE2wVbN5 - Department assignment document with ID ${id} not found.`,
            );
            return null;
        }
    } catch (error) {
        console.error(
            `kF9xSzA7 - Error fetching department assignment with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to retrieve department assignment data for ID: ${id}.`,
        );
    }
}

export async function createDepHospLocAssignment(
    departmentId: string,
    locationId: string,
    userId = "system",
): Promise<DepHospLocAss> {
    // 1. Validate essential inputs
    if (!departmentId || !locationId) {
        throw new Error(
            "mY6tGhB3 - Department ID and Location ID are required to create an assignment.",
        );
    }

    try {
        const dataToAdd: DocumentData = {
            departmentId: departmentId,
            locationId: locationId,
            createdAt: serverTimestamp(),
            createdBy: userId,
            updatedAt: serverTimestamp(),
            updatedBy: userId,
        };

        // 3. Add the document to the collection - Firestore generates the ID
        const newDocRef: DocumentReference = await addDoc(
            depHospLocAssCollection,
            dataToAdd,
        );

        // 4. Fetch the newly created document to get server-generated timestamps
        const newAssignmentDoc = await getDoc(newDocRef);

        if (!newAssignmentDoc.exists()) {
            // This is highly unexpected if addDoc succeeded
            throw new Error(
                `CREATE_DEP_ASS_ERR_FETCH_FAIL - Failed to retrieve newly created assignment (ID: ${newDocRef.id}) immediately after creation.`,
            );
        }

        // 5. Map the Firestore document data (including the auto-generated ID and timestamps)
        const createdAssignment = mapFirestoreDocToDepHospLocAss(
            newAssignmentDoc.id,
            newAssignmentDoc.data(),
        );

        if (!createdAssignment) {
            // Check if mapping was successful
            throw new Error(
                `CREATE_DEP_ASS_ERR_MAP_FAIL - Failed to map newly created assignment data (ID: ${newAssignmentDoc.id}). Check mapper logic and Firestore data.`,
            );
        }

        console.log(
            `Department-Location Assignment created successfully with ID: ${createdAssignment.id}`,
        );
        return createdAssignment; // Return the complete mapped object
    } catch (error) {
        console.error(
            `vB1nLpW8 - Error during department assignment creation (DeptID: ${departmentId}, LocID: ${locationId}):`,
            error,
        );

        // Re-throw specific internal errors or a generic one
        if (
            error instanceof Error &&
            error.message.startsWith("CREATE_DEP_ASS_ERR")
        ) {
            throw error;
        } else {
            throw new Error(
                `Failed to create department assignment. Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function updateDepHospLocAssignment(
    id: string,
    // Data type allows for potential future fields, but currently only updates audit info
    data: Partial<
        Omit<
            DepHospLocAss,
            "id" | "createdAt" | "createdById" | "department" | "location"
        >
    >,
    userId = "system",
): Promise<DepHospLocAss> {
    if (!id) {
        throw new Error(
            "updateDepHospLocAssignment error: Assignment ID is required for update.",
        );
    }

    if (!data || Object.keys(data).length === 0) {
        console.warn(
            `gT5rDcX3 - updateDepHospLocAssignment warning: No specific fields provided for update on assignment ${id}. Only timestamps/audit fields will be updated.`,
        );
    }

    try {
        const assignmentRef: DocumentReference = doc(
            depHospLocAssCollection,
            id,
        ); // Use specific collection

        const dataToUpdate = {
            ...data, // Spread any other updatable fields if they exist
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        // Check if document exists before updating (optional but good practice)
        const checkSnap = await getDoc(assignmentRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `updateDepHospLocAssignment error: Assignment with ID ${id} not found.`,
            );
        }

        await updateDoc(assignmentRef, dataToUpdate);

        // Fetch the updated document to get server-generated timestamps
        const updatedAssignmentDoc = await getDoc(assignmentRef);

        if (!updatedAssignmentDoc.exists()) {
            // Should not happen if updateDoc succeeded without error
            throw new Error(
                `Consistency error: Assignment with ID ${id} not found immediately after successful update.`,
            );
        }

        // Map the updated data
        const updatedAssignment = mapFirestoreDocToDepHospLocAss(
            updatedAssignmentDoc.id,
            updatedAssignmentDoc.data(),
        );

        if (!updatedAssignment) {
            throw new Error(
                `Data integrity error: Failed to map updated assignment data for ID: ${id}. Check mapper logic and Firestore data.`,
            );
        }

        console.log(`Department Assignment ${id} updated successfully.`);
        return updatedAssignment;
    } catch (error) {
        console.error(
            `sW9zMhK1 - Error updating department assignment with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to update department assignment (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

// export async function deleteDepHospLocAssignment(id: string): Promise<void> {
//     if (!id) {
//         throw new Error(
//             "deleteDepHospLocAssignment error: Assignment ID is required for deletion.",
//         );
//     }
//
//     console.log(
//         `zP4jKbV7 - Attempting to delete department assignment with ID: ${id}`,
//     );
//
//     try {
//         const assignmentRef = doc(depHospLocAssCollection, id);
//         console.log(
//             `eR8sYdN2 - Deleting department assignment document: ${id}`,
//         );
//         await deleteDoc(assignmentRef);
//         console.log(
//             `qF1wXcT6 - Successfully deleted department assignment document: ${id}`,
//         );
//     } catch (error) {
//         console.error(
//             `hN5mZsA9 - Error deleting department assignment with ID ${id}:`,
//             error,
//         );
//         throw new Error(
//             `Failed to delete department assignment (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
//         );
//     }
// }

/**
 * Deletes a department-location assignment AND all associated
 * team-location assignments for that same department and location.
 * @param id - The ID of the department_location_assignment document to delete.
 * @returns Promise<void>
 */
export async function deleteDepHospLocAssignment(id: string): Promise<void> {
    if (!id) {
        throw new Error(
            "vC9xR4zG - deleteDepHospLocAssignment error: Assignment ID required.",
        );
    }

    console.log(`zP4jKbV7 - Cascade delete initiated for DepLocAss ID: ${id}`);

    const mainAssignmentRef = doc(depHospLocAssCollection, id);
    const batch = writeBatch(db); // Initialize the batch

    try {
        // 1. Fetch the main assignment to get details
        const mainAssignmentSnap = await getDoc(mainAssignmentRef);
        if (!mainAssignmentSnap.exists()) {
            console.warn(
                `uN1pL6hT - DepLocAss document with ID ${id} not found. Cannot cascade delete.`,
            );
            return;
        }

        const assignmentData = mainAssignmentSnap.data();
        const departmentId = assignmentData.departmentId as string | undefined;
        const locationId = assignmentData.locationId as string | undefined;

        // Validate required data for cascading
        if (!departmentId || !locationId) {
            throw new Error(
                `wB4nT8kF - Missing departmentId or locationId in DepLocAss document ${id}. Cannot cascade delete.`,
            );
        }

        console.log(
            `pL8kR3vM - Found DepLocAss: DepID=${departmentId}, LocID=${locationId}. Preparing cascade.`,
        );

        // 2. Find associated Team-Location assignments
        const teamAssignmentsQuery = query(
            depTeamLocAssCollection,
            where("depId", "==", departmentId),
            where("locationId", "==", locationId),
        );

        const teamAssignmentsSnapshot = await getDocs(teamAssignmentsQuery);

        let teamAssignCount = 0;
        if (!teamAssignmentsSnapshot.empty) {
            teamAssignmentsSnapshot.forEach((doc) => {
                console.log(
                    `aF2dS7hN - Queuing deletion for DepTeamLocAss ID: ${doc.id}`,
                );
                batch.delete(doc.ref); // Add team assignment deletion to batch
                teamAssignCount++;
            });
            console.log(
                `yG5bN1wQ - Found ${teamAssignCount} associated team assignment(s) to delete.`,
            );
        } else {
            console.log(`sK3jP9zV - No associated team assignments found.`);
        }

        // 3. Add the main assignment deletion to the batch
        console.log(
            `bH7wE2sR - Queuing deletion for main DepLocAss document: ${id}`,
        );
        batch.delete(mainAssignmentRef);

        // 4. Commit the batch operation
        console.log(`nC1xT8dR - Committing batch delete...`);
        await batch.commit();
        console.log(
            `hY9gT5dS - Successfully deleted DepLocAss ${id} and ${teamAssignCount} associated team assignments.`,
        );
    } catch (error) {
        console.error(
            `bmvF7Udk - Error during cascade delete process for DepLocAss ID ${id}:`,
            error,
        );
        // Determine if error came from fetching/querying or committing
        throw new Error(
            `Failed cascade delete for DepLocAss (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}
