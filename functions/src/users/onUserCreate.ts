// functions/src/users/onUserCreate.ts

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { User } from "../models/user";

const auth = admin.auth();

export const autoCreateAuthUser = onDocumentCreated(
    // <-- Use onDocumentCreated
    "users/{userId}",
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) {
            logger.error("No data associated with the event!");
            return;
        }
        const firestoreUserId = event.params.userId;
        const newUser = snapshot.data() as User;

        logger.info(
            `V2: New user document created with ID: ${firestoreUserId}, attempting to create Auth user for email: ${newUser.email}`,
        );

        // --- 1. Input Validation ---
        if (!newUser.email) {
            logger.error(
                "V2: User document missing email, cannot create Auth user.",
                { firestoreUserId: firestoreUserId },
            );
            await snapshot.ref.set(
                {
                    authCreationFailed: true,
                    authError: "Missing email",
                },
                { merge: true },
            );
            return;
        }

        // --- 2. Prepare Auth User Properties ---
        const temporaryPassword = "password123"; // !! Placeholder - Use a secure method !!

        const userProps: admin.auth.CreateRequest = {
            uid: firestoreUserId,
            email: newUser.email,
            emailVerified: false,
            password: temporaryPassword,
            displayName: `${newUser.firstName} ${newUser.lastName}`,
            disabled: !newUser.active,
        };

        // if (newUser.phoneNumber) {
        //     userProps.phoneNumber = newUser.phoneNumber;
        // }

        // --- 3. Create User in Firebase Authentication ---
        try {
            const userRecord = await auth.createUser(userProps);
            logger.info(
                `V2: Successfully created Auth user: ${userRecord.uid} for email: ${userRecord.email}`,
            );

            // --- 4. Update Firestore doc with Auth UID ---
            await snapshot.ref.set(
                {
                    authUid: userRecord.uid,
                    authCreationFailed: false,
                    authError: null,
                },
                { merge: true },
            );

            logger.info(
                `V2: Successfully updated Firestore user ${firestoreUserId} with Auth UID ${userRecord.uid}.`,
            );
        } catch (error: any) {
            logger.error(
                `V2: Error creating Auth user for ${newUser.email} (Firestore ID: ${firestoreUserId}):`,
                error,
            );

            let errorMessage = `Failed to create Auth user: ${error.message}`;
            let authUidToSet: string | null = null;

            if (error.code === "auth/email-already-exists") {
                errorMessage = `Auth user with email ${newUser.email} already exists. Attempting to link.`;
                logger.warn(errorMessage, { firestoreUserId: firestoreUserId });

                try {
                    const existingUser = await auth.getUserByEmail(
                        newUser.email,
                    );
                    authUidToSet = existingUser.uid;
                    errorMessage = `Linked existing Auth user: ${existingUser.uid}`;
                    logger.info(
                        `V2: Linking existing Auth user ${existingUser.uid} to Firestore doc ${firestoreUserId}.`,
                    );
                } catch (linkError: any) {
                    errorMessage = `Auth user exists but linking failed: ${linkError.message}`;
                    logger.error(
                        `V2: Failed to link existing Auth user for ${newUser.email}:`,
                        linkError,
                    );
                    authUidToSet = null;
                }
            }

            // --- 5. Update Firestore doc with Error Status ---
            await snapshot.ref.set(
                {
                    authUid: authUidToSet,
                    authCreationFailed: true,
                    authError: errorMessage,
                },
                { merge: true },
            );
        }
    },
);
