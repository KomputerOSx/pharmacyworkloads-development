// functions/src/users/onUserUpdate.ts

import { onDocumentUpdated } from "firebase-functions/v2/firestore"; // Use V2 trigger
import * as logger from "firebase-functions/logger"; // Use V2 logger
import * as admin from "firebase-admin";
import { User } from "../models/user"; // Import the User type

const auth = admin.auth();

export const syncUserChangesToAuth = onDocumentUpdated(
    "users/{userId}",
    async (event) => {
        // Get the data snapshots before and after the update
        const beforeSnapshot = event.data?.before;
        const afterSnapshot = event.data?.after;

        // Check if snapshots exist
        if (!beforeSnapshot?.exists || !afterSnapshot?.exists) {
            logger.warn("Update event missing before or after snapshot.", {
                params: event.params,
            });
            return;
        }

        const firestoreUserId = event.params.userId; // ID of the Firestore doc that was updated
        const beforeData = beforeSnapshot.data() as User;
        const afterData = afterSnapshot.data() as User;

        logger.info(
            `V2: User document ${firestoreUserId} updated. Checking for Auth changes (excluding phone number).`,
            { email: afterData.email },
        );

        // --- 1. Get the Auth UID to target ---
        const authUidToUpdate = afterData.authUid;
        if (!authUidToUpdate) {
            logger.warn(
                `V2: Updated Firestore user ${firestoreUserId} does not have an authUid. Cannot sync changes to Auth. This might be expected if Auth creation failed previously.`,
                { firestoreUserId: firestoreUserId },
            );
            return;
        }

        // --- 2. Determine what needs to be updated in Auth ---
        const updatesToMake: admin.auth.UpdateRequest = {};
        let needsUpdate = false;

        // Check Email change
        if (beforeData.email !== afterData.email) {
            if (afterData.email && afterData.email.includes("@")) {
                updatesToMake.email = afterData.email;
                logger.info(
                    `User ${authUidToUpdate}: Email changed to ${afterData.email}`,
                );
                needsUpdate = true;
            } else {
                logger.warn(
                    `User ${authUidToUpdate}: Invalid email format in update: "${afterData.email}". Not updating email.`,
                );
                await afterSnapshot.ref.set(
                    {
                        authUpdateWarning:
                            "Invalid email format, not updated in Auth",
                    },
                    { merge: true },
                );
            }
        }

        // Check Display Name change (derived from first/last name)
        const beforeDisplayName = `${beforeData.firstName} ${beforeData.lastName}`;
        const afterDisplayName = `${afterData.firstName} ${afterData.lastName}`;
        if (beforeDisplayName !== afterDisplayName) {
            updatesToMake.displayName = afterDisplayName;
            logger.info(
                `User ${authUidToUpdate}: DisplayName changed to "${afterDisplayName}"`,
            );
            needsUpdate = true;
        }

        // Check Active/Disabled change
        const isActiveAfter = afterData.active;
        const isDisabledAfter = !isActiveAfter;
        const isDisabledBefore = !beforeData.active;

        if (isDisabledBefore !== isDisabledAfter) {
            updatesToMake.disabled = isDisabledAfter;
            logger.info(
                `User ${authUidToUpdate}: Disabled status changed to ${isDisabledAfter}`,
            );
            needsUpdate = true;
        }

        // --- Phone Number check removed ---

        // --- 3. Perform the Auth Update (if changes were detected) ---
        if (!needsUpdate) {
            logger.info(
                `User ${authUidToUpdate}: No relevant changes detected for Auth sync.`,
            );
            // Clear any previous error status if no update needed now
            // Keep authUpdateWarning clearing in case an invalid email was previously logged
            await afterSnapshot.ref.set(
                {
                    authUpdateError: null,
                    authUpdateFailed: false,
                    authUpdateWarning: null,
                },
                { merge: true },
            );
            return;
        }

        logger.info(
            `User ${authUidToUpdate}: Attempting to apply updates to Auth:`,
            updatesToMake,
        );

        try {
            await auth.updateUser(authUidToUpdate, updatesToMake);
            logger.info(
                `User ${authUidToUpdate}: Successfully updated Auth user.`,
            );

            // Clear any previous error/warning status on success
            await afterSnapshot.ref.set(
                {
                    authUpdateError: null,
                    authUpdateFailed: false,
                    authUpdateWarning: null,
                },
                { merge: true },
            );
        } catch (error: any) {
            logger.error(
                `V2: Failed to update Auth user ${authUidToUpdate} for Firestore user ${firestoreUserId}:`,
                error,
            );

            // Update Firestore doc with error status
            await afterSnapshot.ref.set(
                {
                    authUpdateFailed: true,
                    authUpdateError: `Failed to update Auth: ${error.message}`,
                },
                { merge: true },
            );

            // Handle specific errors if needed
            if (error.code === "auth/email-already-exists") {
                logger.error(
                    `User ${authUidToUpdate}: Email "${updatesToMake.email}" already in use by another Auth user.`,
                );
            } else if (error.code === "auth/user-not-found") {
                logger.error(
                    `User ${authUidToUpdate}: Auth user not found during update attempt.`,
                );
            }
        }
    },
);
