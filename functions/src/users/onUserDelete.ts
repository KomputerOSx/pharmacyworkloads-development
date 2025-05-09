// functions/src/users/onUserDelete.ts

import { onDocumentDeleted } from "firebase-functions/v2/firestore"; // Use V2 trigger
import * as logger from "firebase-functions/logger"; // Use V2 logger
import * as admin from "firebase-admin";
import { User } from "../models/user"; // Import the User type

const auth = admin.auth();

export const autoDeleteAuthUser = onDocumentDeleted(
    "users/{userId}", // Listen to document deletions in 'users'
    async (event) => {
        // The snapshot here contains the data *before* the document was deleted
        const snapshot = event.data;
        if (!snapshot) {
            logger.error(
                "No data found in the snapshot for deleted user event.",
                {
                    params: event.params,
                },
            );
            return;
        }

        const firestoreUserId = event.params.userId;
        const deletedUser = snapshot.data() as User;

        logger.info(
            `V2: User document deleted with ID: ${firestoreUserId}. Checking for corresponding Auth user to delete.`,
            { email: deletedUser.email },
        );

        // --- 1. Check if we have an Auth UID to target ---
        // This relies on the onCreate function having successfully stored the authUid previously.
        if (!deletedUser.authUid) {
            logger.warn(
                `V2: Deleted Firestore user ${firestoreUserId} did not have an authUid stored. Cannot delete Auth user. This might be expected if Auth creation failed previously.`,
                { firestoreUserId: firestoreUserId },
            );
            return; // Nothing to delete
        }

        const authUidToDelete = deletedUser.authUid;

        logger.info(
            `V2: Attempting to delete Auth user with UID: ${authUidToDelete} corresponding to deleted Firestore user: ${firestoreUserId}`,
        );

        // --- 2. Delete the User from Firebase Authentication ---
        try {
            await auth.deleteUser(authUidToDelete);
            logger.info(
                `V2: Successfully deleted Auth user with UID: ${authUidToDelete}`,
                { firestoreUserId: firestoreUserId },
            );
        } catch (error: any) {
            // Log the error, but there's no Firestore doc to update anymore.
            // Consider sending a notification or logging to an error tracking service if this failure is critical.
            logger.error(
                `V2: Failed to delete Auth user with UID: ${authUidToDelete} for deleted Firestore user ${firestoreUserId}:`,
                error,
            );

            // Specifically check if the user was already gone
            if (error.code === "auth/user-not-found") {
                logger.warn(
                    `V2: Auth user with UID ${authUidToDelete} not found. It might have been deleted manually or previously.`,
                    { firestoreUserId: firestoreUserId },
                );
            }
        }
    },
);
