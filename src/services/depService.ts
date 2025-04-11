import {
    addDoc,
    collection,
    doc,
    DocumentData,
    documentId,
    DocumentReference,
    getDoc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { mapFirestoreDocToDep } from "@/lib/firestoreUtil";
import { Department } from "@/types/depTypes";
import { deleteAssignmentsByDepartment } from "@/services/depTeamAssService";

const DepartmentsCollection = collection(db, "departments");

export async function getDeps(orgId: string): Promise<Department[]> {
    try {
        const departmentQuery = query(
            collection(db, "departments"),
            where("orgId", "==", orgId),
        );

        const departmentSnapshot = await getDocs(departmentQuery);
        return departmentSnapshot.docs
            .map((doc) => {
                try {
                    return mapFirestoreDocToDep(doc.id, doc.data());
                } catch (mapError) {
                    console.error(
                        `uRNgg62F - Error mapping department document ${doc.id}:`,
                        mapError,
                    );
                    return null;
                }
            })
            .filter((h): h is Department => h !== null);
    } catch (error) {
        console.error(
            `PL4Ep5hM - Error getting departments  for org ${orgId}:`,
            error,
        );
        throw error;
    }
}

export async function getDep(id: string): Promise<Department | null> {
    if (!id) {
        console.error(
            "344hGjFL - getDep error: Attempted to fetch with an invalid ID.",
        );
        return null;
    }

    try {
        const docRef: DocumentReference = doc(db, "departments", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapFirestoreDocToDep(docSnap.id, docSnap.data());
        } else {
            console.warn(
                `eUetb8Q1 - Department document with ID ${id} not found.`,
            );
            return null;
        }
    } catch (error) {
        console.error(
            `Nu6nrpLk - Error fetching Department with ID ${id}:`,
            error,
        );
        throw new Error(`Failed to retrieve Department data for ID: ${id}.`);
    }
}

// export async function createDep(
//     // Input data, explicitly excluding fields we will set automatically
//     departmentData: Omit<
//         Partial<Department>,
//         "id" | "orgId" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
//     >,
//     orgId: string,
//     userId = "system",
// ): Promise<Department> {
//     // 1. Validate essential inputs
//     if (!orgId) {
//         throw new Error(
//             "2kQYNajj - Organization ID  are required to create a Department.",
//         );
//     }
//
//     if (!departmentData.name) {
//         throw new Error("eQgDj7gv - Department name cannot be empty.");
//     }
//
//     try {
//         // 2. Prepare data for creation
//         const dataToAdd: DocumentData = {
//             ...departmentData, // Spread the provided data (like address, etc.)
//             name: departmentData.name,
//             orgId: orgId,
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             createdBy: userId,
//             updatedBy: userId,
//         };
//
//         // 3. Add the document to the collection - Firestore generates the ID
//         const newDocRef: DocumentReference = await addDoc(
//             DepartmentsCollection,
//             dataToAdd,
//         );
//
//         // 4. Fetch the newly created document using the reference returned by addDoc
//         const newDepartmentDoc = await getDoc(newDocRef);
//
//         if (!newDepartmentDoc.exists()) {
//             // This is highly unexpected if addDoc succeeded
//             throw new Error(
//                 `CREATE_DEP_ERR_FETCH_FAIL - Failed to retrieve newly created Department (ID: ${newDocRef.id}) immediately after creation.`,
//             );
//         }
//
//         // 5. Map the Firestore document data (including the auto-generated ID)
//         const createdDepartment = mapFirestoreDocToDep(
//             newDepartmentDoc.id, // Use the ID from the snapshot
//             newDepartmentDoc.data(),
//         );
//
//         if (!createdDepartment) {
//             throw new Error(
//                 `CREATE_DEP_ERR_FETCH_FAIL - Failed to map newly created department data (ID: ${newDepartmentDoc.id}). Check mapper logic and Firestore data.`,
//             );
//         }
//
//         console.log(
//             `Department created successfully with ID: ${createdDepartment.id}`,
//         );
//         return createdDepartment; // Return the complete mapped object
//     } catch (error) {
//         // Updated error log message - no custom ID to reference here
//         console.error(
//             `Gnb5y7ej - Error during Department creation process (OrgID: ${orgId}):`,
//             error,
//         );
//
//         // Re-throw specific internal errors or a generic one
//         if (
//             error instanceof Error &&
//             error.message.startsWith("CREATE_DEP_ERR")
//         ) {
//             throw error;
//         } else {
//             throw new Error(
//                 `Failed to create department. Reason: ${error instanceof Error ? error.message : String(error)}`,
//             );
//         }
//     }
// }

export async function createDep(
    // Input data, explicitly excluding fields we will set automatically
    departmentData: Omit<
        Partial<Department>,
        "id" | "orgId" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
    >,
    orgId: string,
    userId = "system",
): Promise<Department> {
    // 1. Validate essential inputs
    if (!orgId) {
        throw new Error(
            "2kQYNajj - Organization ID is required to create a Department.",
        );
    }

    // Trim the name before validation and use
    const departmentName = departmentData.name?.trim();

    if (!departmentName) {
        throw new Error("eQgDj7gv - Department name cannot be empty.");
    }

    try {
        // 2. Check for existing department with the same name in the same org
        const duplicateCheckQuery = query(
            DepartmentsCollection,
            where("orgId", "==", orgId),
            where("name", "==", departmentName), // Use the trimmed name for comparison
            limit(1), // We only need to know if at least one exists
        );

        const querySnapshot = await getDocs(duplicateCheckQuery);

        if (!querySnapshot.empty) {
            // Found a duplicate
            throw new Error(
                `DUPLICATE_DEPT_NAME - A department with the name "${departmentName}" already exists in this organization (Org ID: ${orgId}).`,
            );
        }

        // 3. Prepare data for creation (if no duplicate found)
        const dataToAdd: DocumentData = {
            ...departmentData, // Spread the provided data (like address, etc.)
            name: departmentName, // Use the trimmed name
            orgId: orgId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            updatedBy: userId,
        };

        // 4. Add the document to the collection - Firestore generates the ID
        const newDocRef: DocumentReference = await addDoc(
            DepartmentsCollection,
            dataToAdd,
        );

        // 5. Fetch the newly created document using the reference returned by addDoc
        const newDepartmentDoc = await getDoc(newDocRef);

        if (!newDepartmentDoc.exists()) {
            // This is highly unexpected if addDoc succeeded
            throw new Error(
                `CREATE_DEP_ERR_FETCH_FAIL - Failed to retrieve newly created Department (ID: ${newDocRef.id}) immediately after creation.`,
            );
        }

        // 6. Map the Firestore document data (including the auto-generated ID)
        const createdDepartment = mapFirestoreDocToDep(
            newDepartmentDoc.id, // Use the ID from the snapshot
            newDepartmentDoc.data(),
        );

        if (!createdDepartment) {
            throw new Error(
                `CREATE_DEP_ERR_MAP_FAIL - Failed to map newly created department data (ID: ${newDepartmentDoc.id}). Check mapper logic and Firestore data.`, // Renamed error code slightly
            );
        }

        console.log(
            `Department created successfully with ID: ${createdDepartment.id}`,
        );
        return createdDepartment; // Return the complete mapped object
    } catch (error) {
        // Log specific duplicate error differently if desired, otherwise use generic logging
        if (
            error instanceof Error &&
            error.message.startsWith("DUPLICATE_DEPT_NAME")
        ) {
            console.warn(
                // Use warn for known validation failures like duplicates
                `Gnb5y7ej - Attempt to create duplicate Department (OrgID: ${orgId}, Name: "${departmentName}"):`,
                error.message,
            );
        } else {
            console.error(
                `Gnb5y7ej - Error during Department creation process (OrgID: ${orgId}, Name: "${departmentName}"):`,
                error,
            );
        }

        // Re-throw specific internal errors or a generic one
        if (
            error instanceof Error &&
            (error.message.startsWith("CREATE_DEP_ERR") ||
                error.message.startsWith("DUPLICATE_DEPT_NAME")) // Include our new specific error
        ) {
            throw error; // Re-throw the specific error (duplicate or creation failure)
        } else {
            // Fallback generic error
            throw new Error(
                `Failed to create department. Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function updateDep(
    id: string,
    // Data contains the fields to potentially update
    data: Omit<Partial<Department>, "id" | "orgId" | "createdAt" | "createdBy">,
    userId = "system",
): Promise<Department> {
    // 1. Validate Inputs
    if (!id) {
        throw new Error(
            "UPDATE_DEP_ERR_NO_ID - Department ID is required for update.",
        );
    }

    // Trim the incoming name if it exists, handle potential non-string input just in case
    const trimmedNewName =
        typeof data.name === "string" ? data.name.trim() : undefined;
    const isNameBeingUpdated = trimmedNewName !== undefined; // Is name present in the input?

    // Create a mutable copy of data for potential modification (using trimmed name)
    const inputData = { ...data };

    if (isNameBeingUpdated) {
        // If name is being updated, ensure it's not empty after trimming
        if (!trimmedNewName) {
            throw new Error(
                "eQgDj7gv - Department name cannot be empty when updating.",
            );
        }
        // Use the trimmed name for the update payload
        inputData.name = trimmedNewName;
    } else if ("name" in data && data.name === undefined) {
        console.warn(
            `Attempting to set department ${id} name to undefined. Field will likely be ignored by Firestore update.`,
        );
    }

    const updatableFields = { ...inputData };
    delete updatableFields.name; // Remove name temporarily for this check
    if (Object.keys(updatableFields).length === 0 && !isNameBeingUpdated) {
        console.warn(
            `g3u2aESf - updateDepartment warning: No specific fields provided for update on department ${id}. Only timestamps/audit fields will be updated.`,
        );
    }

    try {
        const departmentRef: DocumentReference = doc(DepartmentsCollection, id); // Use collection ref

        // 2. Fetch Existing Document to get OrgID and current name
        const checkSnap = await getDoc(departmentRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `UPDATE_DEP_ERR_NOT_FOUND - Department with ID ${id} not found. Cannot update.`,
            );
        }
        const currentData = checkSnap.data();
        const orgId = currentData?.orgId; // Get orgId from existing doc
        const currentName = currentData?.name;

        // Essential check: We need orgId for the duplicate validation
        if (!orgId) {
            throw new Error(
                `UPDATE_DEP_ERR_MISSING_ORGID - Cannot perform update check. Existing Department (ID: ${id}) is missing the required 'orgId' field. Data integrity issue.`,
            );
        }

        // 3. Perform Duplicate Check *only if* the name is present in input AND is different from the current name
        if (isNameBeingUpdated && trimmedNewName !== currentName) {
            console.log(
                `Performing duplicate name check for new name "${trimmedNewName}" in org ${orgId} (excluding self: ${id})`,
            );
            const duplicateCheckQuery = query(
                DepartmentsCollection,
                where("orgId", "==", orgId),
                where("name", "==", trimmedNewName), // Check against the new trimmed name
                where(documentId(), "!=", id), // Exclude the document being updated itself
                limit(1), // We only need one conflicting doc
            );

            const duplicateSnapshot = await getDocs(duplicateCheckQuery);

            if (!duplicateSnapshot.empty) {
                // Found another document with the same new name in the same org
                throw new Error(
                    `DUPLICATE_DEPT_NAME_UPDATE - Cannot update Department ${id}. Another department with the name "${trimmedNewName}" already exists in organization ${orgId}.`,
                );
            }
            // If we reach here, the new name is unique (or wasn't changed)
        } else if (isNameBeingUpdated && trimmedNewName === currentName) {
            console.log(
                `Department ${id} name update skipped: new name "${trimmedNewName}" is the same as the current name.`,
            );
        }

        // 4. Prepare final data for Firestore update
        // We use inputData which already includes the trimmed name if it was updated
        const dataToUpdate: DocumentData = {
            ...inputData,
            updatedAt: serverTimestamp(),
            updatedBy: userId, // Use 'updatedBy' for consistency
        };

        // Clean undefined fields before update (Firestore `updateDoc` ignores them, but explicit is clearer)
        Object.keys(dataToUpdate).forEach((key) => {
            if (dataToUpdate[key] === undefined) {
                delete dataToUpdate[key];
            }
        });

        // Ensure there's something to update besides audit fields if required
        const finalUpdateKeys = Object.keys(dataToUpdate).filter(
            (k) => !["updatedAt", "updatedBy"].includes(k),
        );
        if (finalUpdateKeys.length === 0) {
            console.warn(
                `Department ${id}: Update operation skipped as no fields changed besides audit info.`,
            );
            // Return the current, unchanged department data to avoid unnecessary fetch/map
            const currentDepartment = mapFirestoreDocToDep(
                checkSnap.id,
                currentData,
            );
            if (!currentDepartment) {
                // Should not happen if checkSnap existed
                throw new Error(
                    `UPDATE_DEP_ERR_MAP_FAIL - Failed to map *current* data for ID ${id} after skipped update.`,
                );
            }
            return currentDepartment;
        }

        // 5. Perform the Firestore Update
        await updateDoc(departmentRef, dataToUpdate);
        console.log(`Firestore update initiated for Department ID: ${id}`);

        // 6. Fetch the Updated Document to return
        const updatedDepartmentDoc = await getDoc(departmentRef);

        // This check is less likely to fail after updateDoc succeeds, but good for consistency
        if (!updatedDepartmentDoc.exists()) {
            throw new Error(
                `UPDATE_DEP_ERR_FETCH_FAIL - Consistency error: Department with ID ${id} not found immediately after a successful update call. This is unexpected.`,
            );
        }

        // 7. Map the result
        const updatedDepartment = mapFirestoreDocToDep(
            updatedDepartmentDoc.id,
            updatedDepartmentDoc.data(),
        );

        if (!updatedDepartment) {
            // This implies the mapper function failed or data is corrupt post-update
            throw new Error(
                `UPDATE_DEP_ERR_MAP_FAIL - Data integrity error: Failed to map updated department data for ID: ${id} after successful update. Check mapper logic and Firestore data.`,
            );
        }

        console.log(`Department ${id} updated successfully by user ${userId}.`);
        return updatedDepartment; // Return the complete, updated object
    } catch (error) {
        // Log specific errors differently if needed
        if (
            error instanceof Error &&
            error.message.startsWith("DUPLICATE_DEPT_NAME_UPDATE")
        ) {
            console.warn(
                `g3u2aESf - Failed Update Department ${id}: ${error.message}`,
            );
        } else {
            console.error(
                `g3u2aESf - Generic error updating department with ID ${id}:`,
                error,
            );
        }

        // Re-throw specific internal errors or a generic one for the caller (e.g., React Query hook)
        if (
            error instanceof Error &&
            (error.message.startsWith("UPDATE_DEP_ERR") ||
                error.message.startsWith("DUPLICATE_DEPT_NAME") || // Catch both types
                error.message.startsWith("eQgDj7gv")) // Catch empty name error
        ) {
            throw error; // Re-throw specific known errors
        } else {
            // Fallback generic error
            throw new Error(
                `Failed to update department (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

// export async function deleteDep(id: string): Promise<void> {
//     if (!id) {
//         throw new Error(
//             "deleteDep error: Department ID is required for deletion.",
//         );
//     }
//
//     console.log("fpBqeu8X - Attempting to delete Department with ID:", id);
//
//     const hasAssignments = await checkDepHasAssignments(id);
//     if (hasAssignments) {
//         throw new Error(
//             `Cannot delete a department with assigned locations. All Location Assignments must be deleted first.`,
//         );
//     }
//
//     try {
//         const departmentRef = doc(db, "departments", id);
//         console.log("Cq2CkYZb - Deleting Department document:", id);
//         await deleteDoc(departmentRef);
//         console.log("wegdXKD3 - Successfully deleted Department document:", id);
//     } catch (error) {
//         console.error(
//             `mC7eUQT6 - Error deleting Department with ID ${id}:`,
//             error,
//         );
//         throw new Error(
//             `Failed to delete Department (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
//         );
//     }
// }

export async function deleteDep(id: string): Promise<void> {
    if (!id) {
        throw new Error(
            "hY2gT6dS - deleteDep error: Department ID is required for deletion.",
        );
    }

    console.log("fpBqeu8X - Attempting to delete Department with ID:", id);

    // 1. Safety Check: Ensure no locations are assigned to this department
    const hasLocationAssignments = await checkDepHasAssignments(id);
    if (hasLocationAssignments) {
        console.error(
            `mJ4bF8wP - Cannot delete department ${id}: It has assigned locations.`,
        );
        throw new Error(
            `Cannot delete a department with assigned locations. All Location Assignments must be deleted first.`,
        );
    }

    // --- Optional Step: Delete Department-Team Assignments ---
    try {
        console.log(
            `rG2sN8vC - Deleting team assignments for department ${id}...`,
        );
        await deleteAssignmentsByDepartment(id); // Requires importing this function
        console.log(
            `eP3dN7hJ - Successfully deleted team assignments for department ${id}.`,
        );
    } catch (assError) {
        if (assError instanceof Error) {
            console.error(
                `tY5bV8wE - Failed to delete team assignments for department ${id}:`,
                assError,
            );
            throw new Error(
                `Failed to clean up team assignments before deleting department ${id}. Reason: ${assError.message}`,
            );
        } else {
            console.error(
                `tY5bV8wE - Failed to delete team assignments for department ${id}:`,
                assError,
            );
            throw new Error(
                `Failed to clean up team assignments before deleting department ${id}. Reason: Unknown error`,
            );
        }
    }

    // 2. Prepare Batch Deletion for Department and its Teams
    const batch = writeBatch(db);
    const departmentRef = doc(db, "departments", id);
    const teamsCollectionRef = collection(db, "department_teams");

    try {
        // Find teams associated with this department
        const teamsQuery = query(teamsCollectionRef, where("depId", "==", id));
        const teamsSnapshot = await getDocs(teamsQuery);

        let teamCount = 0;
        if (!teamsSnapshot.empty) {
            teamsSnapshot.forEach((teamDoc) => {
                console.log(
                    `yU7cF2mS - Queuing deletion for associated team: ${teamDoc.id}`,
                );
                batch.delete(teamDoc.ref); // Add team deletion to the batch
                teamCount++;
            });
            console.log(
                `zX1gH9oL - Found ${teamCount} associated team(s) to delete.`,
            );
        } else {
            console.log(
                `wB4nT6kF - No associated teams found for department ${id}.`,
            );
        }

        // Add the main department deletion to the batch
        console.log("Cq2CkYZb - Queuing deletion for Department document:", id);
        batch.delete(departmentRef);

        // 3. Commit the Batch Operation
        console.log(
            `qZ8vB3nW - Committing batch deletion for department ${id} and ${teamCount} team(s)...`,
        );
        await batch.commit();
        console.log(
            `jM6fD1yX - Successfully deleted Department document ${id} and ${teamCount} associated team(s).`,
        );
    } catch (error) {
        console.error(
            `mC7eUQT6 - Error during batch deletion process for Department ID ${id}:`,
            error,
        );
        // The error could be from querying teams or committing the batch
        throw new Error(
            `Failed to delete Department (ID: ${id}) and/or its associated teams. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

async function checkDepHasAssignments(departmentId: string): Promise<boolean> {
    const depAssCollection = collection(db, "department_location_assignments");

    const assignmentsQuery = query(
        depAssCollection,
        where("departmentId", "==", departmentId),
    );
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    return !assignmentsSnapshot.empty;
}
