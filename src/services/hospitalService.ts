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
import { mapFirestoreDocToHosp } from "@/utils/firestoreUtil";
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

    const hospitalId: string | null = null;

    try {
        // 2. Prepare data with timestamps and audit fields
        const dataToAdd = {
            ...hospitalData, // Directly spread the input data
            orgId: orgId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef: DocumentReference = await addDoc(
            hospitalsCollection,
            dataToAdd,
        );

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

// export async function createHospital(
//     hospitalData: Partial<Hosp>,
//     orgId: string,
//     userId = "system",
// ): Promise<Hosp> {
//     if (!orgId) {
//         throw new Error(
//             "CREATE_HOSP_ERR_NO_ORGID - Organization ID is required to create a hospital.",
//         );
//     }
//     if (!hospitalData.name || hospitalData.name.trim() === "") {
//         throw new Error(
//             "CREATE_HOSP_ERR_NO_NAME - Hospital name cannot be empty.",
//         );
//     }
//
//     const hospitalName = hospitalData.name.trim();
//     const customDocId = hospitalName.toLowerCase().replace(/ /g, "_");
//
//     if (!customDocId) {
//         throw new Error(
//             `CREATE_HOSP_ERR_INVALID_ID - Could not generate a valid ID from name: "${hospitalName}"`,
//         );
//     }
//
//     const docRef = doc(hospitalsCollectionustomDocId);
//
//     try {
//         const existingDocSnap = await getDoc(docRef);
//         if (existingDocSnap.exists()) {
//             const existingData = existingDocSnap.data();
//             if (existingData?.orgId === orgId) {
//                 throw new Error(
//                     `CREATE_HOSP_ERR_CONFLICT - A hospital with the name "${hospitalName}" (ID: ${customDocId}) already exists in this organisation.`,
//                 );
//             } else {
//                 console.warn(
//                     `CREATE_HOSP_WARN_ID_COLLISION - Hospital ID ${customDocId} exists but belongs to a different org (${existingData?.orgId}). Proceeding, but consider ID strategy.`,
//                 );
//             }
//         }
//
//         const dataToAdd: DocumentData = {
//             ...hospitalData,
//             name: hospitalName,
//             orgId: orgId,
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             createdById: userId,
//             updatedById: userId,
//         };
//
//         await setDoc(docRef, dataToAdd);
//
//         const newHospitalDoc = await getDoc(docRef);
//         if (!newHospitalDoc.exists()) {
//             throw new Error(
//                 `CREATE_HOSP_ERR_FETCH_FAIL - Failed to retrieve newly created hospital (ID: ${customDocId}) immediately after creation.`,
//             );
//         }
//
//         const createdHospital = mapFirestoreDocToHosp(
//             newHospitalDoc.id,
//             newHospitalDoc.data(),
//         );
//
//         if (!createdHospital) {
//             throw new Error(
//                 `CREATE_HOSP_ERR_MAP_FAIL - Failed to map newly created hospital data (ID: ${customDocId}).`,
//             );
//         }
//
//         return createdHospital;
//     } catch (error) {
//         console.error(
//             `eYLH58kQ - Error during hospital creation process (Attempted ID: ${customDocId}, OrgID: ${orgId}):`,
//             error,
//         );
//
//         if (
//             error instanceof Error &&
//             error.message.startsWith("CREATE_HOSP_ERR")
//         ) {
//             throw error;
//         } else {
//             throw new Error(
//                 `Failed to create hospital. Reason: ${error instanceof Error ? error.message : String(error)}`,
//             );
//         }
//     }
// }

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
