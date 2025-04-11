import {
    addDoc,
    collection,
    deleteDoc,
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
} from "firebase/firestore";
import { db } from "@/config/firebase"; // Assuming your firebase config is here
import { User } from "@/types/userTypes"; // Assuming your User type is here
import { mapFirestoreDocToUser } from "@/lib/firestoreUtil";
import { deleteUserTeamAssignmentsByUser } from "@/services/userTeamAssService";

const UsersCollection = collection(db, "users");

export async function getUsers(orgId: string): Promise<User[]> {
    if (!orgId) {
        console.error("getUsers error: orgId cannot be empty.");
        return []; // Return empty array if orgId is missing
    }
    try {
        const userQuery = query(
            UsersCollection, // Use the specific collection reference
            where("orgId", "==", orgId),
        );

        const userSnapshot = await getDocs(userQuery);
        return userSnapshot.docs
            .map((doc) => {
                try {
                    return mapFirestoreDocToUser(doc.id, doc.data());
                } catch (mapError) {
                    console.error(
                        `Error mapping user document ${doc.id}:`,
                        mapError,
                    );
                    return null;
                }
            })
            .filter((u): u is User => u !== null);
    } catch (error) {
        console.error(`Error getting users for org ${orgId}:`, error);
        throw error; // Re-throw the error for handling upstream
    }
}

export async function getUser(id: string): Promise<User | null> {
    if (!id) {
        console.error("getUser error: Attempted to fetch with an invalid ID.");
        return null;
    }

    try {
        const docRef: DocumentReference = doc(UsersCollection, id); // Use specific collection
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapFirestoreDocToUser(docSnap.id, docSnap.data());
        } else {
            console.warn(`User document with ID ${id} not found.`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching User with ID ${id}:`, error);
        throw new Error(`Failed to retrieve User data for ID: ${id}.`);
    }
}

export async function createUser(
    // Exclude fields set automatically or derived
    userData: Omit<
        Partial<User>,
        | "id"
        | "orgId"
        | "createdAt"
        | "updatedAt"
        | "lastLogin"
        | "createdById"
        | "updatedById"
    >,
    orgId: string,
    creatorUserId = "system", // ID of the user performing the creation
): Promise<User> {
    // 1. Validate essential inputs
    if (!orgId) {
        throw new Error("Organization ID is required to create a User.");
    }

    const userEmail = userData.email?.trim().toLowerCase(); // Standardize email
    if (!userEmail) {
        throw new Error("User email cannot be empty.");
    }
    if (!userData.firstName?.trim()) {
        throw new Error("User first name cannot be empty.");
    }
    if (!userData.lastName?.trim()) {
        throw new Error("User last name cannot be empty.");
    }

    try {
        // 2. Check for existing user with the same email in the same org
        const duplicateCheckQuery = query(
            UsersCollection,
            where("orgId", "==", orgId),
            where("email", "==", userEmail),
            limit(1),
        );

        const querySnapshot = await getDocs(duplicateCheckQuery);

        if (!querySnapshot.empty) {
            throw new Error(
                `DUPLICATE_USER_EMAIL - A user with the email "${userEmail}" already exists in this organization (Org ID: ${orgId}).`,
            );
        }

        // 3. Prepare data for creation (if no duplicate found)
        const dataToAdd: DocumentData = {
            ...userData, // Spread provided data (role, deptId, phone, etc.)
            firstName: userData.firstName.trim(),
            lastName: userData.lastName.trim(),
            email: userEmail, // Use standardized email
            orgId: orgId,
            active: userData.active ?? true, // Default to active if not provided
            lastLogin: null, // Explicitly set lastLogin to null on creation
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: creatorUserId,
            updatedById: creatorUserId,
        };

        // Clean undefined fields before adding
        Object.keys(dataToAdd).forEach((key) => {
            if (dataToAdd[key] === undefined) {
                delete dataToAdd[key];
            }
        });

        // 4. Add the document
        const newDocRef: DocumentReference = await addDoc(
            UsersCollection,
            dataToAdd,
        );

        // 5. Fetch the newly created document
        const newUserDoc = await getDoc(newDocRef);

        if (!newUserDoc.exists()) {
            throw new Error(
                `CREATE_USER_ERR_FETCH_FAIL - Failed to retrieve newly created User (ID: ${newDocRef.id}) immediately after creation.`,
            );
        }

        // 6. Map and return
        const createdUser = mapFirestoreDocToUser(
            newUserDoc.id,
            newUserDoc.data(),
        );

        if (!createdUser) {
            throw new Error(
                `CREATE_USER_ERR_MAP_FAIL - Failed to map newly created user data (ID: ${newUserDoc.id}).`,
            );
        }

        console.log(`User created successfully with ID: ${createdUser.id}`);
        return createdUser;
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.startsWith("DUPLICATE_USER_EMAIL")
        ) {
            console.warn(
                `Attempt to create duplicate User (OrgID: ${orgId}, Email: "${userEmail}"):`,
                error.message,
            );
        } else {
            console.error(
                `Error during User creation process (OrgID: ${orgId}, Email: "${userEmail}"):`,
                error,
            );
        }

        if (
            error instanceof Error &&
            (error.message.startsWith("CREATE_USER_ERR") ||
                error.message.startsWith("DUPLICATE_USER_EMAIL"))
        ) {
            throw error; // Re-throw specific errors
        } else {
            throw new Error(
                `Failed to create user. Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function updateUser(
    id: string,
    // Data contains fields to update
    data: Omit<
        Partial<User>,
        "id" | "orgId" | "createdAt" | "lastLogin" | "createdById" // Usually shouldn't change
    >,
    updaterUserId = "system", // ID of the user performing the update
): Promise<User> {
    // 1. Validate ID
    if (!id) {
        throw new Error(
            "UPDATE_USER_ERR_NO_ID - User ID is required for update.",
        );
    }

    // Standardize email if present in update data
    const newEmail = data.email?.trim().toLowerCase();
    const isEmailBeingUpdated = newEmail !== undefined;

    // Create a mutable copy to potentially modify email or trim names
    const inputData = { ...data };
    if (isEmailBeingUpdated) {
        inputData.email = newEmail; // Use standardized email
    }
    if (typeof inputData.firstName === "string") {
        inputData.firstName = inputData.firstName.trim();
        if (!inputData.firstName) {
            throw new Error("User first name cannot be empty when updating.");
        }
    }
    if (typeof inputData.lastName === "string") {
        inputData.lastName = inputData.lastName.trim();
        if (!inputData.lastName) {
            throw new Error("User last name cannot be empty when updating.");
        }
    }

    // Prevent updating with no actual changes (besides audit fields)
    const updatableFields = { ...inputData };
    // These are handled separately or shouldn't be in typical 'update' payload
    delete (updatableFields as Partial<User>).updatedAt;
    delete (updatableFields as Partial<User>).updatedById;

    if (Object.keys(updatableFields).length === 0) {
        console.warn(
            `updateUser warning: No fields provided for update on user ${id}. Fetching current data.`,
        );
        // Fetch and return current user data if no changes are requested
        const currentUser = await getUser(id);
        if (!currentUser) {
            throw new Error(
                `UPDATE_USER_ERR_NOT_FOUND - User with ID ${id} not found when attempting no-op update.`,
            );
        }
        return currentUser;
    }

    try {
        const userRef: DocumentReference = doc(UsersCollection, id);

        // 2. Fetch Existing Document to get OrgID and current email (needed for checks)
        const checkSnap = await getDoc(userRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `UPDATE_USER_ERR_NOT_FOUND - User with ID ${id} not found. Cannot update.`,
            );
        }
        const currentData = checkSnap.data();
        const orgId = currentData?.orgId;
        const currentEmail = currentData?.email;

        if (!orgId) {
            throw new Error(
                `UPDATE_USER_ERR_MISSING_ORGID - Cannot perform update check. Existing User (ID: ${id}) is missing 'orgId'.`,
            );
        }

        // 3. Perform Duplicate Email Check *only if* email is present and different from current
        if (isEmailBeingUpdated && newEmail !== currentEmail) {
            if (!newEmail) {
                // Should be caught earlier by validation if email was the *only* field,
                // but check again if email is explicitly set to empty string
                throw new Error("User email cannot be empty when updating.");
            }

            console.log(
                `Performing duplicate email check for new email "${newEmail}" in org ${orgId} (excluding self: ${id})`,
            );
            const duplicateCheckQuery = query(
                UsersCollection,
                where("orgId", "==", orgId),
                where("email", "==", newEmail),
                where(documentId(), "!=", id), // Exclude the current user
                limit(1),
            );

            const duplicateSnapshot = await getDocs(duplicateCheckQuery);

            if (!duplicateSnapshot.empty) {
                throw new Error(
                    `DUPLICATE_USER_EMAIL_UPDATE - Cannot update User ${id}. Another user with the email "${newEmail}" already exists in organization ${orgId}.`,
                );
            }
        } else if (isEmailBeingUpdated && newEmail === currentEmail) {
            console.log(
                `User ${id} email update skipped: new email "${newEmail}" is the same as the current email.`,
            );
            // If email was the *only* thing in inputData, we might have nothing left to update
            delete inputData.email; // Remove it so it's not part of the update payload
            if (Object.keys(inputData).length === 0) {
                console.warn(
                    `User ${id}: Update operation skipped as only unchanged email was provided.`,
                );
                const currentUser = mapFirestoreDocToUser(
                    checkSnap.id,
                    currentData,
                );
                if (!currentUser)
                    throw new Error(
                        `UPDATE_USER_ERR_MAP_FAIL - Failed to map current data for ID ${id} after skipped update.`,
                    );
                return currentUser;
            }
        }

        // 4. Prepare final data for Firestore update
        const dataToUpdate: DocumentData = {
            ...inputData, // Use potentially modified inputData (trimmed names, standardized email)
            updatedAt: serverTimestamp(),
            updatedById: updaterUserId,
        };

        // Clean undefined fields before update
        Object.keys(dataToUpdate).forEach((key) => {
            if (dataToUpdate[key] === undefined) {
                delete dataToUpdate[key];
            }
        });

        // Final check if anything substantial is left to update
        const finalUpdateKeys = Object.keys(dataToUpdate).filter(
            (k) => !["updatedAt", "updatedById"].includes(k),
        );
        if (finalUpdateKeys.length === 0) {
            console.warn(
                `User ${id}: Update operation effectively skipped as no fields changed besides audit info.`,
            );
            const currentUser = mapFirestoreDocToUser(
                checkSnap.id,
                currentData,
            );
            if (!currentUser)
                throw new Error(
                    `UPDATE_USER_ERR_MAP_FAIL - Failed to map current data for ID ${id} after skipped update.`,
                );
            return currentUser;
        }

        // 5. Perform the Firestore Update
        await updateDoc(userRef, dataToUpdate);
        console.log(`Firestore update initiated for User ID: ${id}`);

        // 6. Fetch the Updated Document
        const updatedUserDoc = await getDoc(userRef);

        if (!updatedUserDoc.exists()) {
            // Extremely unlikely if updateDoc succeeded
            throw new Error(
                `UPDATE_USER_ERR_FETCH_FAIL - Consistency error: User ${id} not found immediately after successful update.`,
            );
        }

        // 7. Map and return the result
        const updatedUser = mapFirestoreDocToUser(
            updatedUserDoc.id,
            updatedUserDoc.data(),
        );

        if (!updatedUser) {
            throw new Error(
                `UPDATE_USER_ERR_MAP_FAIL - Failed to map updated user data for ID: ${id}.`,
            );
        }

        console.log(
            `User ${id} updated successfully by user ${updaterUserId}.`,
        );
        return updatedUser;
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.startsWith("DUPLICATE_USER_EMAIL_UPDATE")
        ) {
            console.warn(`Failed Update User ${id}: ${error.message}`);
        } else {
            console.error(`Error updating user with ID ${id}:`, error);
        }

        if (
            error instanceof Error &&
            (error.message.startsWith("UPDATE_USER_ERR") ||
                error.message.startsWith("DUPLICATE_USER_EMAIL"))
        ) {
            throw error; // Re-throw specific known errors
        } else {
            throw new Error(
                `Failed to update user (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function updateLastLogin(id: string): Promise<void> {
    try {
        const userRef = doc(UsersCollection, id);
        await updateDoc(userRef, { lastLogin: serverTimestamp() });
        console.log("Last login updated for user with ID:", id);
    } catch (error) {
        console.error(
            `Error updating last login for user with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to update last login for user (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}
//
// export async function deleteUser(id: string): Promise<void> {
//     if (!id) {
//         throw new Error("deleteUser error: User ID is required for deletion.");
//     }
//
//     console.log("Attempting to delete User with ID:", id);
//
//     try {
//         const userRef = doc(UsersCollection, id);
//
//         // Optional: Check if user exists before deleting
//         const docSnap = await getDoc(userRef);
//         if (!docSnap.exists()) {
//             console.warn(`User with ID ${id} not found. Skipping deletion.`);
//             // Depending on desired behaviour, could throw an error or just return.
//             // throw new Error(`Cannot delete. User with ID ${id} not found.`);
//             return; // Exit gracefully if not found
//         }
//
//         console.log("Deleting User document:", id);
//         await deleteDoc(userRef);
//         console.log("Successfully deleted User document:", id);
//     } catch (error) {
//         console.error(`Error deleting User with ID ${id}:`, error);
//         throw new Error(
//             `Failed to delete User (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
//         );
//     }
// }

export async function deleteUser(id: string): Promise<void> {
    if (!id) {
        throw new Error(
            "eEtdP2WX - deleteUser error: User ID is required for deletion.",
        );
    }

    console.log(
        "X12z4Unj - Attempting to delete User and associated assignments with ID:",
        id,
    );

    // 1. Delete associated User-Team assignments FIRST
    try {
        console.log(
            `gP5rT9wE - Deleting user-team assignments for user ID: ${id}`,
        );
        await deleteUserTeamAssignmentsByUser(id); // Call the cleanup function
        console.log(
            `qL2mS8dN - Successfully deleted user-team assignments for user ID: ${id}.`,
        );
    } catch (assignmentError) {
        console.error(
            `xY7cZ1vB - Critical Error: Failed to delete associated team assignments for user ID ${id}. Aborting user deletion.`,
            assignmentError,
        );
        // Throw a specific error indicating cleanup failure
        throw new Error(
            `Failed to clean up team assignments for user (ID: ${id}) before deletion. Reason: ${assignmentError instanceof Error ? assignmentError.message : String(assignmentError)}`,
        );
    }

    // 2. Proceed to delete the User document itself
    try {
        const userRef = doc(UsersCollection, id); // Use your actual collection reference

        // Optional: Check if user exists before deleting (good practice)
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
            console.warn(
                `wE3rT9uJ - User with ID ${id} not found after assignment cleanup (or never existed). Skipping user document deletion.`,
            );
            // If assignments were deleted, this might be okay.
            // If assignments failed, the error above would have stopped execution.
            return; // Exit gracefully
        }

        console.log(`fG8hY2vK - Deleting User document: ${id}`);
        await deleteDoc(userRef);
        console.log(`jM1nB4cP - Successfully deleted User document: ${id}`);
    } catch (userDeleteError) {
        console.error(
            `kL5pW9sD - Error deleting User document with ID ${id} (assignments might have been deleted):`,
            userDeleteError,
        );
        // Even if user delete fails, assignments might be gone. This error indicates inconsistency potential.
        throw new Error(
            `Failed to delete User document (ID: ${id}) after assignment cleanup. Reason: ${userDeleteError instanceof Error ? userDeleteError.message : String(userDeleteError)}`,
        );
    }
}
