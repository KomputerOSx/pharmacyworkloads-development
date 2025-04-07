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
    limit,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { mapFirestoreDocToHosp } from "@/lib/firestoreUtil";
import { Hosp } from "@/types/hospTypes";

const hospitalsCollection = collection(db, "hospitals");

export async function getHospitals(orgId: string): Promise<Hosp[]> {
    try {
        const hospitalsQuery = query(
            collection(db, "hospitals"),
            where("orgId", "==", orgId),
        );

        const hospitalsSnapshot = await getDocs(hospitalsQuery);
        return hospitalsSnapshot.docs
            .map((doc) => {
                try {
                    return mapFirestoreDocToHosp(doc.id, doc.data());
                } catch (mapError) {
                    console.error(
                        `Error mapping hospital document ${doc.id}:`,
                        mapError,
                    );
                    return null;
                }
            })
            .filter((h): h is Hosp => h !== null);
    } catch (error) {
        console.error("rsr8WJdQ - Error getting hospitals:", error);
        throw error;
        // return []; // Alternative: return empty array on error
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

// create the hospital
// export async function createHospital(
//     hospitalData: Partial<Hosp>,
//     orgId: string,
//     userId = "system",
// ): Promise<Hosp> {
//     // Validate organization is provided
//     if (!orgId) {
//         throw new Error(
//             "1Gv4Jn6x - Organization is required to create a hospital",
//         );
//     }
//
//     const hospitalId: string | null = null;
//
//     try {
//         // 2. Prepare data with timestamps and audit fields
//         const dataToAdd = {
//             ...hospitalData, // Directly spread the input data
//             orgId: orgId,
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             createdById: userId,
//             updatedById: userId,
//         };
//
//         const docRef: DocumentReference = await addDoc(
//             hospitalsCollection,
//             dataToAdd,
//         );
//
//         const newHospitalDoc = await getDoc(docRef); // Use the docRef we already have
//         if (!newHospitalDoc.exists()) {
//             // This should be extremely rare if addDoc succeeded, but handle defensively
//             throw new Error(
//                 `Wd9fGj4k - Failed to retrieve newly created hospital (ID: ${hospitalId}) immediately after creation.`,
//             );
//         }
//
//         const createdHospital = mapFirestoreDocToHosp(
//             newHospitalDoc.id,
//             newHospitalDoc.data(),
//         );
//
//         if (!createdHospital) {
//             // This implies the mapper function failed even though the doc exists
//             throw new Error(
//                 `Pq2sRz8m - Failed to map newly created hospital (ID: ${hospitalId}) data.`,
//             );
//         }
//
//         return createdHospital;
//     } catch (error) {
//         // 8. Handle any other errors (e.g., from initial addDoc, getDoc, or re-thrown errors)
//         console.error(
//             `eYLH58kQ - Error during hospital creation process (potential ID: ${hospitalId}):`,
//             error,
//         );
//
//         if (error instanceof Error && error.message.startsWith("Ab7LLjje")) {
//             throw error;
//         } else {
//             throw new Error(
//                 `Failed to create hospital. Reason: ${error instanceof Error ? error.message : String(error)}`,
//             );
//         }
//     }
// }

export async function createHospital(
    hospitalData: Partial<Hosp>,
    orgId: string,
    userId = "system",
): Promise<Hosp> {
    // 1. Validate essential inputs
    if (!orgId) {
        throw new Error(
            "1Gv4Jn6x - Organization ID is required to create a hospital",
        );
    }
    if (!hospitalData.name || hospitalData.name.trim() === "") {
        throw new Error("Hospital name is required and cannot be empty.");
    }

    // Normalize the name for checking (e.g., trim whitespace)
    const hospitalName = hospitalData.name.trim();

    try {
        // 2. Check for existing hospital with the same name in the same organization
        const duplicateCheckQuery = query(
            hospitalsCollection,
            where("orgId", "==", orgId),
            where("name", "==", hospitalName), // Check against the normalized name
            limit(1), // We only need to know if at least one exists
        );

        console.log(
            `Checking for duplicate hospital name "${hospitalName}" in org "${orgId}"...`,
        );
        const duplicateSnapshot = await getDocs(duplicateCheckQuery);

        if (!duplicateSnapshot.empty) {
            // Found a duplicate
            const existingDocId = duplicateSnapshot.docs[0].id;
            console.warn(
                `DUPLICATE_HOSPITAL: Attempted to create hospital with name "${hospitalName}" but it already exists (ID: ${existingDocId}) in organization "${orgId}".`,
            );
            throw new Error(
                `DUPLICATE_HOSPITAL_NAME: A hospital with the name "${hospitalName}" already exists in this organization.`,
            );
        }
        console.log(
            `No duplicate found for "${hospitalName}" in org "${orgId}". Proceeding with creation.`,
        );

        // 3. Prepare data with timestamps and audit fields
        const dataToAdd = {
            ...hospitalData, // Spread the input data
            name: hospitalName, // Use the trimmed name
            orgId: orgId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        // 4. Add the new hospital document
        const docRef: DocumentReference = await addDoc(
            hospitalsCollection,
            dataToAdd,
        );
        const newHospitalId = docRef.id; // Get the ID from the returned DocumentReference

        // 5. Fetch the newly created document to ensure consistency and get server timestamp values
        // It's generally better to fetch after creation to get accurate data including server timestamps
        const newHospitalDoc = await getDoc(docRef);
        if (!newHospitalDoc.exists()) {
            // This should be extremely rare if addDoc succeeded, but handle defensively
            console.error(
                `Wd9fGj4k - Failed to retrieve newly created hospital (ID: ${newHospitalId}) immediately after creation. This indicates a potential Firestore inconsistency.`,
            );
            throw new Error(
                `Wd9fGj4k - Failed to retrieve newly created hospital (ID: ${newHospitalId}) immediately after creation.`,
            );
        }

        // 6. Map Firestore data to Hosp type
        const createdHospital = mapFirestoreDocToHosp(
            newHospitalDoc.id,
            newHospitalDoc.data(),
        );

        if (!createdHospital) {
            // This implies the mapper function failed even though the doc exists
            console.error(
                `Pq2sRz8m - Failed to map newly created hospital (ID: ${newHospitalId}) data. Check mapping function and Firestore data structure.`,
                newHospitalDoc.data(),
            );
            throw new Error(
                `Pq2sRz8m - Failed to map newly created hospital (ID: ${newHospitalId}) data.`,
            );
        }

        console.log(
            `Successfully created hospital "${createdHospital.name}" with ID: ${createdHospital.id} in org "${orgId}"`,
        );
        return createdHospital;
    } catch (error) {
        // 7. Handle specific errors (like duplicate check) and general errors
        console.error(
            `eYLH58kQ - Error during hospital creation process for name "${hospitalName}" in org "${orgId}":`,
            error,
        );

        // Re-throw specific errors or a generic one
        if (
            error instanceof Error &&
            error.message.startsWith("DUPLICATE_HOSPITAL_NAME")
        ) {
            throw error; // Re-throw the specific duplicate error
        } else {
            throw new Error(
                `Failed to create hospital. Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function updateHospital(
    id: string,
    data: Omit<Partial<Hosp>, "id" | "createdAt" | "createdById">,
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

        const dataToUpdate = {
            ...data, // Spread the actual fields to update
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
            "deleteHospital error: Hospital ID is required for deletion",
        );
    }

    console.log(`gEY7XZzd - Attempting to delete hospital with ID: ${id}`);

    const hospitalHasLocations = await checkIfHospitalHasLocations(id);

    if (hospitalHasLocations) {
        throw new Error(
            "\nCannot Delete Hospital as it has locations.\nAll associated locations must be deleted first, or changed to another hospital.",
        );
    }

    try {
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

async function checkIfHospitalHasLocations(
    hospitalId: string,
): Promise<boolean> {
    try {
        const locationsRef = collection(db, "hospital_locations");
        const querySnapshot = await getDocs(
            query(locationsRef, where("hospId", "==", hospitalId)),
        );
        return !querySnapshot.empty;
    } catch (error) {
        console.error(
            `Error checking if hospital ${hospitalId} has locations:`,
            error,
        );
        return false;
    }
}
