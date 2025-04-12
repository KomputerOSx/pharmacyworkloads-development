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
import { db } from "@/config/firebase";
import { mapFirestoreDocToHospLoc } from "@/lib/firestoreUtil";
import { HospLoc } from "@/types/subDepTypes";

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
    // Input data, explicitly excluding fields we will set automatically
    hospLocData: Omit<
        Partial<HospLoc>,
        | "id"
        | "orgId"
        | "hospId"
        | "createdAt"
        | "updatedAt"
        | "createdBy"
        | "updatedBy"
    >,
    orgId: string,
    hospId: string,
    userId = "system",
): Promise<HospLoc> {
    // 1. Validate essential inputs
    if (!orgId || !hospId) {
        throw new Error(
            "bTJ7rHCD - Organization ID and Hospital ID are required to create a hospital location.",
        );
    }

    if (!hospLocData.name) {
        throw new Error("3UDqJNnd - Hospital location name cannot be empty.");
    }

    try {
        // 2. Prepare data for creation
        const dataToAdd: DocumentData = {
            ...hospLocData, // Spread the provided data (like address, etc.)
            name: hospLocData.name, // Use the trimmed name
            orgId: orgId, // Add the organization ID
            hospId: hospId, // Add the hospital ID
            isDeleted: false,
            createdAt: serverTimestamp(), // Set creation timestamp
            updatedAt: serverTimestamp(), // Set initial update timestamp
            createdBy: userId, // Track who created it
            updatedBy: userId, // Track who last updated it (initially creator)
        };

        // 3. Add the document to the collection - Firestore generates the ID
        const newDocRef: DocumentReference = await addDoc(
            hospLocCollection,
            dataToAdd,
        );

        // 4. Fetch the newly created document using the reference returned by addDoc
        const newHospLocDoc = await getDoc(newDocRef);

        if (!newHospLocDoc.exists()) {
            // This is highly unexpected if addDoc succeeded
            throw new Error(
                `CREATE_HOSP_LOC_ERR_FETCH_FAIL - Failed to retrieve newly created hospital location (ID: ${newDocRef.id}) immediately after creation.`,
            );
        }

        // 5. Map the Firestore document data (including the auto-generated ID)
        const createdHospLoc = mapFirestoreDocToHospLoc(
            newHospLocDoc.id, // Use the ID from the snapshot
            newHospLocDoc.data(),
        );

        if (!createdHospLoc) {
            throw new Error(
                `CREATE_HOSP_LOC_ERR_MAP_FAIL - Failed to map newly created hospital location data (ID: ${newHospLocDoc.id}). Check mapper logic and Firestore data.`,
            );
        }

        console.log(
            `Hospital Location created successfully with ID: ${createdHospLoc.id}`,
        );
        return createdHospLoc; // Return the complete mapped object
    } catch (error) {
        // Updated error log message - no custom ID to reference here
        console.error(
            `Nh1NLEbM - Error during hospital location creation process (OrgID: ${orgId}, HospID: ${hospId}):`,
            error,
        );

        // Re-throw specific internal errors or a generic one
        if (
            error instanceof Error &&
            error.message.startsWith("CREATE_HOSP_LOC_ERR")
        ) {
            throw error;
        } else {
            throw new Error(
                `Failed to create hospital location. Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function updateHospLoc(
    id: string,
    data: Omit<
        Partial<HospLoc>,
        "id" | "orgId" | "createdAt" | "createdBy" | "isDeleted"
    >,
    userId = "system",
): Promise<HospLoc> {
    if (!id) {
        throw new Error(
            "updateHospLoc error: Hospital Location ID is required for update.",
        );
    }
    if (!data || Object.keys(data).length === 0) {
        console.warn(
            `ycETLNy9 - updateHospLoc warning: No specific fields provided for update on Hospital Location ${id}. Only timestamps/audit fields will be updated.`,
        );
    }

    try {
        const hospLocRef: DocumentReference = doc(db, "hospital_locations", id);

        const dataToUpdate = {
            ...data, // Spread the actual fields to update
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        // Check if document exists *before* updating if desired (optional optimization)
        const checkSnap = await getDoc(hospLocRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `updateHospLoc error: Hospital Location with ID ${id} not found.`,
            );
        }

        await updateDoc(hospLocRef, dataToUpdate);

        const updatedHospLocDoc = await getDoc(hospLocRef);

        if (!updatedHospLocDoc.exists()) {
            throw new Error(
                `Consistency error: Hospital Location with ID ${id} not found immediately after successful update.`,
            );
        }

        const updatedHospLoc = mapFirestoreDocToHospLoc(
            updatedHospLocDoc.id,
            updatedHospLocDoc.data(),
        );

        if (!updatedHospLoc) {
            // This implies the mapper function
            throw new Error(
                `Data integrity error: Failed to map updated Hospital Location data for ID: ${id}. Check mapper logic and Firestore data.`,
            );
        }
        return updatedHospLoc;
    } catch (error) {
        console.error(
            `NsfNu5pM - Error updating Hospital Location with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to update Hospital Location (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

//TODO - Soft delete location by setting isDeleted to true, if it has rota assignments
export async function deleteHospLoc(id: string): Promise<void> {
    if (!id) {
        throw new Error(
            "deleteHospLoc error: Hospital ID is required for deletion.",
        );
    }

    console.log("U5BH6JJb - Attempting to delete hospital with ID:", id);

    const hasAssignments = await checkHospLocHasAssignments(id);
    if (hasAssignments) {
        throw new Error(
            `Cannot delete a Hospital Location that is assigned to a department. All assignments to any department must be deleted first.`,
        );
    }

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

async function checkHospLocHasAssignments(
    locationId: string,
): Promise<boolean> {
    const depAssCollection = collection(db, "department_location_assignments");

    const assignmentsQuery = query(
        depAssCollection,
        where("locationId", "==", locationId),
    );
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    return !assignmentsSnapshot.empty;
}
