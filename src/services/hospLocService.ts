import {
    collection,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { HospLoc } from "@/types/hosLocTypes";
import { mapFirestoreDocToHospLoc } from "@/utils/firestoreUtil";

const hospLocCollection = collection(db, "hospital_locations");

export async function getHospLocs(orgId: string): Promise<HospLoc[]> {
    try {
        const hospLocsQuery = query(
            collection(db, "hospital_locations"),
            where("orgId", "==", orgId),
        );

        const hospLocsSnapshot = await getDocs(hospLocsQuery);
        return hospLocsSnapshot.docs
            .map((doc) => {
                try {
                    return mapFirestoreDocToHospLoc(doc.id, doc.data());
                } catch (mapError) {
                    console.error(
                        `D84NPvb2 - Error mapping hospital location document ${doc.id}:`,
                        mapError,
                    );
                    return null;
                }
            })
            .filter((h): h is HospLoc => h !== null);
    } catch (error) {
        console.error(
            `p5qC4J2p - Error getting hospital locations for org ${orgId}:`,
            error,
        );
        throw error;
    }
}

export async function getHospLoc(id: string): Promise<HospLoc | null> {
    if (!id) {
        console.error(
            "ug2LFbWy - getHospLoc error: Attempted to fetch with an invalid ID.",
        );
        return null;
    }

    try {
        const docRef: DocumentReference = doc(db, "hospital_locations", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapFirestoreDocToHospLoc(docSnap.id, docSnap.data());
        } else {
            console.warn(
                `ev9xS569 - Hospital location document with ID ${id} not found.`,
            );
            return null;
        }
    } catch (error) {
        console.error(
            `Nu6nrpLk - Error fetching hospital location with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to retrieve hospital location data for ID: ${id}.`,
        );
    }
}

export async function createHospLoc(
    hospLocData: Partial<HospLoc>,
    orgId: string,
    hospId: string,
    userId = "system",
): Promise<HospLoc> {
    if (!orgId || !hospId) {
        throw new Error(
            "bTJ7rHCD - Organization and hospital are required to create a hospital location",
        );
    }

    if (!hospLocData.name || hospLocData.name.trim() === "") {
        throw new Error("3UDqJNnd - Hospital location name cannot be empty.");
    }

    const hospLocName = hospLocData.name.trim();
    const customDocId = hospLocName.toLowerCase().replace(/ /g, "_");

    if (!customDocId) {
        throw new Error(
            `V4mEC64p - Could not generate a valid ID from name: "${hospLocName}"`,
        );
    }

    const docRef = doc(hospLocCollection, customDocId);

    try {
        const existingDocSnap = await getDoc(docRef);
        if (existingDocSnap.exists()) {
            const existingData = existingDocSnap.data();
            if (existingData.orgId === orgId) {
                throw new Error(
                    `Hospital location with name "${hospLocName}" already exists. Please choose a different name.`,
                );
            } else {
                console.warn(
                    `CREATE_HOSP_LOC_WARN_ID_COLLISION - Hospital location ID ${customDocId} exists but belongs to a different org (${existingData?.orgId}). Proceeding, but consider ID strategy.`,
                );
            }
        }

        const dataToAdd: DocumentData = {
            ...hospLocData,
            name: hospLocName,
            orgId: orgId,
            hospId: hospId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            updatedBy: userId,
        };

        await setDoc(docRef, dataToAdd);

        const newHospLocDoc = await getDoc(docRef);
        if (!newHospLocDoc.exists()) {
            throw new Error(
                `CREATE_HOSP_LOC_ERR_FETCH_FAIL - Failed to retrieve newly created hospital (ID: ${customDocId}) immediately after creation.`,
            );
        }

        const createdHospLoc = mapFirestoreDocToHospLoc(
            newHospLocDoc.id,
            newHospLocDoc.data(),
        );

        if (!createdHospLoc) {
            throw new Error(
                `CREATE_HOSP_LOC_ERR_MAP_FAIL - Failed to map newly created hospital data (ID: ${customDocId}).`,
            );
        }

        return createdHospLoc;
    } catch (error) {
        console.error(
            `Nh1NLEbM - Error during hospital location creation process (Attempted ID: ${customDocId}, OrgID: ${orgId}):`,
            error,
        );

        if (
            error instanceof Error &&
            error.message.startsWith("CREATE_HOSP_LOC_ERR")
        ) {
            throw error;
        } else {
            throw new Error(
                `Failed to create hospital Location. Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function updateHospLoc(
    id: string,
    data: Partial<HospLoc>,
    userId = "system",
): Promise<HospLoc> {
    if (!id) {
        throw new Error(
            "updateHospLoc error: Hospital ID is required for update.",
        );
    }
    if (!data || Object.keys(data).length === 0) {
        console.warn(
            `ycETLNy9 - updateHospLoc warning: No specific fields provided for update on hospital ${id}. Only timestamps/audit fields will be updated.`,
        );
    }

    try {
        const hospLocRef: DocumentReference = doc(db, "hospital_locations", id);

        // 3. Prepare data for update - *exclude* immutable/ID fields
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: dataId, createdAt, createdById, ...updatePayload } = data;

        const dataToUpdate = {
            ...updatePayload, // Spread the actual fields to update
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        // Check if document exists *before* updating if desired (optional optimization)
        const checkSnap = await getDoc(hospLocRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `updateHospLoc error: Hospital with ID ${id} not found.`,
            );
        }

        await updateDoc(hospLocRef, dataToUpdate);

        const updatedHospLocDoc = await getDoc(hospLocRef);

        if (!updatedHospLocDoc.exists()) {
            throw new Error(
                `Consistency error: Hospital with ID ${id} not found immediately after successful update.`,
            );
        }

        const updatedHospLoc = mapFirestoreDocToHospLoc(
            updatedHospLocDoc.id,
            updatedHospLocDoc.data(),
        );

        if (!updatedHospLoc) {
            // This implies the mapper function
            throw new Error(
                `Data integrity error: Failed to map updated hospital data for ID: ${id}. Check mapper logic and Firestore data.`,
            );
        }
        return updatedHospLoc;
    } catch (error) {
        console.error(
            `NsfNu5pM - Error updating hospital with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to update hospital (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

export async function deleteHospLoc(id: string): Promise<void> {
    if (!id) {
        throw new Error(
            "deleteHospLoc error: Hospital ID is required for deletion.",
        );
    }

    console.log("U5BH6JJb - Attempting to delete hospital with ID:", id);

    try {
        const hospLocRef = doc(db, "hospital_locations", id);
        console.log("s1V7gtwS - Deleting hospital document:", id);
        await deleteDoc(hospLocRef);
        console.log("DWqf87at - Successfully deleted hospital document:", id);
    } catch (error) {
        console.error(
            `NZHbF26F - Error deleting hospital with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to delete hospital (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}
