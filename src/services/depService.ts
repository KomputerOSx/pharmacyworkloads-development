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
import { mapFirestoreDocToDep } from "@/utils/firestoreUtil";
import { Department } from "@/types/depTypes";

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
            "2kQYNajj - Organization ID  are required to create a Department.",
        );
    }

    if (!departmentData.name) {
        throw new Error("eQgDj7gv - Department name cannot be empty.");
    }

    try {
        // 2. Prepare data for creation
        const dataToAdd: DocumentData = {
            ...departmentData, // Spread the provided data (like address, etc.)
            name: departmentData.name,
            orgId: orgId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            updatedBy: userId,
        };

        // 3. Add the document to the collection - Firestore generates the ID
        const newDocRef: DocumentReference = await addDoc(
            DepartmentsCollection,
            dataToAdd,
        );

        // 4. Fetch the newly created document using the reference returned by addDoc
        const newDepartmentDoc = await getDoc(newDocRef);

        if (!newDepartmentDoc.exists()) {
            // This is highly unexpected if addDoc succeeded
            throw new Error(
                `CREATE_DEP_ERR_FETCH_FAIL - Failed to retrieve newly created Department (ID: ${newDocRef.id}) immediately after creation.`,
            );
        }

        // 5. Map the Firestore document data (including the auto-generated ID)
        const createdDepartment = mapFirestoreDocToDep(
            newDepartmentDoc.id, // Use the ID from the snapshot
            newDepartmentDoc.data(),
        );

        if (!createdDepartment) {
            throw new Error(
                `CREATE_DEP_ERR_FETCH_FAIL - Failed to map newly created department data (ID: ${newDepartmentDoc.id}). Check mapper logic and Firestore data.`,
            );
        }

        console.log(
            `Department created successfully with ID: ${createdDepartment.id}`,
        );
        return createdDepartment; // Return the complete mapped object
    } catch (error) {
        // Updated error log message - no custom ID to reference here
        console.error(
            `Gnb5y7ej - Error during Department creation process (OrgID: ${orgId}):`,
            error,
        );

        // Re-throw specific internal errors or a generic one
        if (
            error instanceof Error &&
            error.message.startsWith("CREATE_DEP_ERR")
        ) {
            throw error;
        } else {
            throw new Error(
                `Failed to create department. Reason: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

export async function updateDep(
    id: string,
    data: Omit<Partial<Department>, "id" | "orgId" | "createdAt" | "createdBy">,
    userId = "system",
): Promise<Department> {
    if (!id) {
        throw new Error(
            "updateDep error: Department ID is required for update.",
        );
    }
    if (!data || Object.keys(data).length === 0) {
        console.warn(
            `g3u2aESf - updateDepartment warning: No specific fields provided for update on department ${id}. Only timestamps/audit fields will be updated.`,
        );
    }

    try {
        const departmentRef: DocumentReference = doc(db, "departments", id);

        const dataToUpdate = {
            ...data, // Spread the actual fields to update
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        // Check if document exists *before* updating if desired (optional optimization)
        const checkSnap = await getDoc(departmentRef);
        if (!checkSnap.exists()) {
            throw new Error(
                `updateDepartment error: Department with ID ${id} not found.`,
            );
        }

        await updateDoc(departmentRef, dataToUpdate);

        const updatedDepartmentDoc = await getDoc(departmentRef);

        if (!updatedDepartmentDoc.exists()) {
            throw new Error(
                `Consistency error: Department with ID ${id} not found immediately after successful update.`,
            );
        }

        const updatedDepartment = mapFirestoreDocToDep(
            updatedDepartmentDoc.id,
            updatedDepartmentDoc.data(),
        );

        if (!updatedDepartment) {
            // This implies the mapper function
            throw new Error(
                `Data integrity error: Failed to map updated department data for ID: ${id}. Check mapper logic and Firestore data.`,
            );
        }
        return updatedDepartment;
    } catch (error) {
        console.error(
            `g3u2aESf - Error updating department with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to update department (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

export async function deleteDep(id: string): Promise<void> {
    if (!id) {
        throw new Error(
            "deleteDep error: Department ID is required for deletion.",
        );
    }

    console.log("fpBqeu8X - Attempting to delete Department with ID:", id);

    try {
        const departmentRef = doc(db, "departments", id);
        console.log("Cq2CkYZb - Deleting Department document:", id);
        await deleteDoc(departmentRef);
        console.log("wegdXKD3 - Successfully deleted Department document:", id);
    } catch (error) {
        console.error(
            `mC7eUQT6 - Error deleting Department with ID ${id}:`,
            error,
        );
        throw new Error(
            `Failed to delete Department (ID: ${id}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}
