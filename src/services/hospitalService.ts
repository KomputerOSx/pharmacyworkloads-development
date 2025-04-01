// src/services/hospitalService.js
// noinspection ExceptionCaughtLocallyJS

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentReference,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import {
    assignHospitalToOrganisation,
    getHospitalOrganisationAssignment,
    removeHospitalAssignment,
} from "./hospitalAssignmentService";
import { mapFirestoreDocToHosp } from "@/utils/firestoreUtil";
import { Hosp, HospOrgAss } from "@/types/hospTypes";

const hospitalsCollection = collection(db, "hospitals");

// Helper function to safely format Firestore timestamps

export async function getHospitals(orgId: string): Promise<Hosp[]> {
    try {
        const organisationRef = doc(db, "organisations", orgId);

        const assignmentsQuery = query(
            collection(db, "hospital_organisation_assignments"),
            where("organisation", "==", organisationRef),
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);

        const hospitalPromises = assignmentsSnapshot.docs.map(
            async (assignmentDoc) => {
                const data = assignmentDoc.data();
                // Add type assertion or check for hospitalRef type
                const hospitalRef = data.hospital as
                    | DocumentReference
                    | undefined;
                if (hospitalRef) {
                    try {
                        // Add inner try-catch for individual hospital fetch/map errors
                        const hospitalDoc = await getDoc(hospitalRef);

                        if (hospitalDoc.exists()) {
                            // Ensure the hospital document actually exists
                            const hospitalData = hospitalDoc.data();

                            // Call the CORRECT mapping function and let TS infer Hosp | null
                            // mapFirestoreDocToHosp returns Hosp | null, so we return it directly
                            return mapFirestoreDocToHosp(
                                hospitalDoc.id,
                                hospitalData,
                            );
                        } else {
                            console.warn(
                                `Hospital document referenced in assignment ${assignmentDoc.id} (path: ${hospitalRef.path}) does not exist.`,
                            );
                            return null; // Hospital doc not found
                        }
                    } catch (hospitalError) {
                        console.error(
                            `Error fetching/mapping hospital with ref ${hospitalRef.path}:`,
                            hospitalError,
                        );
                        return null; // Return null if fetching/mapping this specific hospital fails
                    }
                } else {
                    console.warn(
                        `Assignment document ${assignmentDoc.id} is missing the hospital reference.`,
                    );
                    return null; // No hospital reference found in the assignment
                }
            },
        );

        const resolvedHospitals = await Promise.all(hospitalPromises);

        // Filter out any null results (from missing refs, non-existent docs, or mapping failures)
        // Use a type predicate 'h is Hosp' to satisfy TypeScript that the result is Hosp[]
        return resolvedHospitals.filter((h): h is Hosp => h !== null);
    } catch (error) {
        console.error("rsr8WJdQ - Error getting hospitals:", error);
        throw error;
    }
}

// Get a single hospital by ID
export async function getHospital(id: string): Promise<Hosp | null> {
    if (!id) {
        console.error(
            "getHospital error: Attempted to fetch with an invalid ID.",
            { id },
        );
        return null;
    }

    try {
        const docRef: DocumentReference = doc(db, "hospitals", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapFirestoreDocToHosp(docSnap.id, docSnap.data());
        } else {
            console.warn(`Hospital document with ID ${id} not found.`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching hospital with ID ${id}:`, error);
        throw new Error(`Failed to retrieve hospital data for ID: ${id}.`);
    }
}

// Add a new hospital
// create the hospital
// create a new organisation assignment
export async function createHospital(
    hospitalData: Partial<Hosp>,
    orgId: string,
    userId = "system",
): Promise<Hosp> {
    // Validate organization is provided
    if (!orgId) {
        throw new Error(
            "1Gv4Jn6x - Organization is required to create a hospital",
        );
    }

    let hospitalId: string | null = null;

    try {
        // 2. Prepare data with timestamps and audit fields
        const dataToAdd = {
            ...hospitalData, // Directly spread the input data
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef: DocumentReference = await addDoc(
            hospitalsCollection,
            dataToAdd,
        );
        hospitalId = docRef.id;

        try {
            await assignHospitalToOrganisation(hospitalId, orgId, userId);
        } catch (assignmentError) {
            // 5. ROLLBACK: Assignment failed, delete the created hospital
            console.error(
                `sWWY9LQh - Error assigning hospital ${hospitalId} to org ${orgId}. Rolling back hospital creation.`,
                assignmentError,
            );
            // Attempt to delete the orphaned hospital document
            if (hospitalId) {
                // Ensure we have an ID before trying to delete
                await deleteDoc(doc(db, "hospitals", hospitalId));
            }
            // Throw a specific error indicating the assignment failure
            throw new Error(
                `Ab7LLjje - Failed to assign hospital to organization (ID: ${orgId}). Hospital creation aborted.`,
            );
        }

        const newHospitalDoc = await getDoc(docRef); // Use the docRef we already have
        if (!newHospitalDoc.exists()) {
            // This should be extremely rare if addDoc succeeded, but handle defensively
            throw new Error(
                `Wd9fGj4k - Failed to retrieve newly created hospital (ID: ${hospitalId}) immediately after creation.`,
            );
        }

        const createdHospital = mapFirestoreDocToHosp(
            newHospitalDoc.id,
            newHospitalDoc.data(),
        );

        if (!createdHospital) {
            // This implies the mapper function failed even though the doc exists
            throw new Error(
                `Pq2sRz8m - Failed to map newly created hospital (ID: ${hospitalId}) data.`,
            );
        }

        return createdHospital;
    } catch (error) {
        // 8. Handle any other errors (e.g., from initial addDoc, getDoc, or re-thrown errors)
        console.error(
            `eYLH58kQ - Error during hospital creation process (potential ID: ${hospitalId}):`,
            error,
        );

        if (error instanceof Error && error.message.startsWith("Ab7LLjje")) {
            throw error;
        } else {
            throw new Error(
                `Failed to create hospital. Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function updateHospital(
    id: string,
    data: Partial<Hosp>,
    userId = "system",
): Promise<Hosp> {
    // 1. Validate essential inputs
    if (!id) {
        throw new Error(
            "updateHospital error: Hospital ID is required for update.",
        );
    }
    if (!data || Object.keys(data).length === 0) {
        console.warn(
            `kT6xrxZJ - updateHospital warning: No specific fields provided for update on hospital ${id}. Only timestamps/audit fields will be updated.`,
        );
        // Decide if this is an error or acceptable behavior
    }

    try {
        // 2. Create Firestore Document Reference
        const hospitalRef: DocumentReference = doc(db, "hospitals", id);

        // 3. Prepare data for update - *exclude* immutable/ID fields
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: dataId, createdAt, createdById, ...updatePayload } = data;

        const dataToUpdate = {
            ...updatePayload, // Spread the actual fields to update
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        // Check if document exists *before* updating if desired (optional optimization)
        const checkSnap = await getDoc(hospitalRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `updateHospital error: Hospital with ID ${id} not found.`,
            );
        }

        await updateDoc(hospitalRef, dataToUpdate);

        const updatedHospitalDoc = await getDoc(hospitalRef);

        if (!updatedHospitalDoc.exists()) {
            // This is highly unexpected if updateDoc succeeded without error
            throw new Error(
                `Consistency error: Hospital with ID ${id} not found immediately after successful update.`,
            );
        }

        const updatedHospital = mapFirestoreDocToHosp(
            updatedHospitalDoc.id,
            updatedHospitalDoc.data(),
        );

        if (!updatedHospital) {
            // This implies the mapper function
            throw new Error(
                `Data integrity error: Failed to map updated hospital data for ID: ${id}. Check mapper logic and Firestore data.`,
            );
        }
        return updatedHospital;
    } catch (error) {
        console.error(
            `7Hz6Gupe - Error updating hospital with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to update hospital (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

export async function deleteHospital(
    id: string,
): Promise<{ success: true; id: string }> {
    if (!id) {
        throw new Error(
            "deleteHospital error: Hospital ID is required for deletion.",
        );
    }

    console.log(`gEY7XZzd - Attempting to delete hospital with ID: ${id}`);

    try {
        const assignments: HospOrgAss[] =
            await getHospitalOrganisationAssignment(id);

        console.log(
            `cWn6Vygr - Found ${assignments.length} assignments for hospital ${id}.`,
        );

        const deleteAssignmentPromises = assignments.map((assignment) => {
            if (!assignment?.id) {
                console.warn(
                    `cKsKxDK9 - Skipping assignment deletion due to missing ID for hospital: ${id}`,
                );
                return Promise.resolve();
            }
            console.log(
                `S5dxCu8C - Deleting assignment ${assignment.id} for hospital ${id}...`,
            );
            // Assuming removeHospitalAssignment deletes the doc and returns a Promise
            return removeHospitalAssignment(assignment.id);
        });

        await Promise.all(deleteAssignmentPromises);
        console.log(
            `XUN15PuS - Successfully deleted ${assignments.length} assignments for hospital ${id}.`,
        );

        const hospitalRef = doc(db, "hospitals", id);
        console.log(`9dhsUT5S - Deleting hospital document ${id}...`);
        await deleteDoc(hospitalRef);
        console.log(`4eLCxMf7 - Successfully deleted hospital document ${id}.`);

        return { success: true, id };
    } catch (error) {
        console.error(
            `2xnCvUEP - Error during deletion process for hospital ID ${id}:`,
            error,
        );

        throw new Error(
            `Failed to delete hospital (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}
