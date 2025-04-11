// Define the collection reference
import { DepHospLocAss } from "@/types/depTypes";
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
import { mapFirestoreDocToDepHospLocAss } from "@/lib/firestoreUtil";
import { db } from "@/config/firebase";

const depAssCollection = collection(db, "department_location_assignments");

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
            depAssCollection,
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
        const docRef: DocumentReference = doc(depAssCollection, id); // Use the specific collection
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
            depAssCollection,
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
        const assignmentRef: DocumentReference = doc(depAssCollection, id); // Use specific collection

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

export async function deleteDepHospLocAssignment(id: string): Promise<void> {
    if (!id) {
        throw new Error(
            "deleteDepHospLocAssignment error: Assignment ID is required for deletion.",
        );
    }

    console.log(
        `zP4jKbV7 - Attempting to delete department assignment with ID: ${id}`,
    );

    try {
        const assignmentRef = doc(depAssCollection, id); // Use specific collection
        console.log(
            `eR8sYdN2 - Deleting department assignment document: ${id}`,
        );
        await deleteDoc(assignmentRef);
        console.log(
            `qF1wXcT6 - Successfully deleted department assignment document: ${id}`,
        );
    } catch (error) {
        console.error(
            `hN5mZsA9 - Error deleting department assignment with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to delete department assignment (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}
