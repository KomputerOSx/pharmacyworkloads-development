//src/services/hospitalAssignmentService.js
import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp,
    deleteDoc,
    DocumentReference,
    getDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { HospOrgAss } from "@/types/hospTypes";
import { mapFirestoreDocToHospOrgAss } from "@/utils/firestoreUtil";

const assignmentsCollection = collection(
    db,
    "hospital_organisation_assignments",
);

export const assignHospitalToOrganisation = async (
    hospitalId: string,
    organisationId: string,
    userId = "system",
): Promise<HospOrgAss> => {
    if (!hospitalId || !organisationId) {
        throw new Error(
            "assignHospitalToOrganisation error: Both hospitalId and organisationId are required.",
        );
    }

    try {
        // 1. Clean up existing/duplicates and get the single valid one (or null)
        // cleanupHosOrgAss now also ensures the returned one (if any) is active
        const existingAssignment = await cleanupHosOrgAss(hospitalId);

        if (existingAssignment) {
            // 2. If cleanup found/activated an existing one, return it
            console.log(
                `Found and ensured active assignment ${existingAssignment.id} for hospital ${hospitalId} / org ${organisationId}.`,
            );
            return existingAssignment; // Already mapped and active
        }

        // 3. No valid existing assignment found, create a new one
        console.log(
            `No valid assignment found. Creating new assignment for hospital ${hospitalId} / org ${organisationId}.`,
        );
        const hospitalRef: DocumentReference = doc(db, "hospitals", hospitalId);
        const organisationRef: DocumentReference = doc(
            db,
            "organisations",
            organisationId,
        );

        const assignmentData = {
            hospital: hospitalRef,
            organisation: organisationRef,
            active: true, // Create as active
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef: DocumentReference = await addDoc(
            assignmentsCollection,
            assignmentData,
        );

        // 4. Fetch and map the newly created assignment to return consistent data
        const newAssignmentDoc = await getDoc(docRef);
        if (!newAssignmentDoc.exists()) {
            throw new Error(
                `Failed to fetch newly created assignment (ID: ${docRef.id}) immediately.`,
            );
        }

        const mappedNewAssignment = mapFirestoreDocToHospOrgAss(
            newAssignmentDoc.id,
            newAssignmentDoc.data(),
        );
        if (!mappedNewAssignment) {
            throw new Error(
                `Failed to map newly created assignment (ID: ${docRef.id}). Check data integrity.`,
            );
        }

        console.log(
            `Successfully created new assignment ${mappedNewAssignment.id}.`,
        );
        return mappedNewAssignment;
    } catch (err) {
        console.error(
            `Error assigning hospital ${hospitalId} to organisation ${organisationId}:`,
            err,
        );
        // Re-throw error for upstream handlers
        throw new Error(
            `Assignment failed. Reason: ${err instanceof Error ? err.message : String(err)}`,
        );
    }
};
export const getHospitalOrganisationAssignment = async (
    hospitalId: string,
): Promise<HospOrgAss[]> => {
    if (!hospitalId) {
        console.warn(
            "getHospitalOrganisationAssignment called with no hospitalId",
        );
        return []; // Return empty array if no ID provided
    }

    try {
        const hospitalRef: DocumentReference = doc(db, "hospitals", hospitalId);
        const assignmentsQuery = query(
            collection(db, "hospital_organisation_assignments"),
            where("hospital", "==", hospitalRef),
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);

        const assignments: HospOrgAss[] = []; // Initialize array for HospOrgAss

        assignmentsSnapshot.forEach((docSnap) => {
            // Use the mapper function
            const mappedAssignment = mapFirestoreDocToHospOrgAss(
                docSnap.id,
                docSnap.data(),
            );
            if (mappedAssignment) {
                assignments.push(mappedAssignment);
            }
        });

        return assignments;
    } catch (error) {
        console.error(
            `Error fetching assignments for hospital ${hospitalId}:`,
            error,
        );
        throw new Error(
            `Failed to retrieve assignments for hospital ${hospitalId}.`,
        );
    }
};

export const removeHospitalAssignment = async (
    assignmentId: string,
): Promise<void> => {
    if (!assignmentId) {
        throw new Error(
            "removeHospitalAssignment error: Assignment ID is required for deletion.",
        );
    }

    console.log(
        `7TsBqfc2 - Attempting to delete assignment with ID: ${assignmentId}`,
    );

    try {
        const assignmentRef = doc(
            db,
            "hospital_organisation_assignments",
            assignmentId,
        );

        await deleteDoc(assignmentRef);

        console.log(
            `ka8TxNSf - Successfully deleted assignment ${assignmentId}.`,
        );
    } catch (error) {
        console.error(
            `ZuCT6qkP - Error deleting assignment with ID ${assignmentId}:`,
            error,
        );
        throw new Error(
            `Failed to delete assignment (ID: ${assignmentId}). Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
};

export const cleanupHosOrgAss = async (
    hospitalId: string,
): Promise<HospOrgAss | null> => {
    if (!hospitalId) {
        throw new Error("cleanupHosOrgAss error: Hospital ID is required.");
    }

    try {
        const hospitalRef: DocumentReference = doc(db, "hospitals", hospitalId);

        const assignmentsQuery = query(
            collection(db, "hospital_organisation_assignments"),
            where("hospital", "==", hospitalRef),
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);

        if (assignmentsSnapshot.empty) {
            console.log(`No assignments found for hospital ${hospitalId}.`);
            return null;
        }

        if (assignmentsSnapshot.size === 1) {
            const docSnap = assignmentsSnapshot.docs[0];
            console.log(
                `Found single valid assignment ${docSnap.id} for hospital ${hospitalId}.`,
            );

            const mappedAssignment = mapFirestoreDocToHospOrgAss(
                docSnap.id,
                docSnap.data(),
            );

            if (!mappedAssignment) {
                console.error(
                    `CRITICAL ERROR: Failed to map the single assignment ${docSnap.id} found for hospital ${hospitalId}. Check Firestore data.`,
                );
                throw new Error(
                    `Data integrity error: Could not map assignment ${docSnap.id}.`,
                );
            }

            return mappedAssignment;
        } else {
            console.error(
                `CRITICAL DATA INTEGRITY ERROR: Found ${assignmentsSnapshot.size} assignments for hospital ${hospitalId}. Expected only one.`,
            );
            assignmentsSnapshot.docs.forEach((d) =>
                console.error(
                    `  - Conflicting assignment ID: ${d.id} linking to Org: ${(d.data().organisation as DocumentReference)?.id ?? "Unknown"}`,
                ),
            );

            throw new Error(
                `Data integrity violation: Multiple assignments found for hospital ${hospitalId}. Manual cleanup required in Firestore.`,
            );
        }
    } catch (error) {
        console.error(
            `XCNrQ2Wb - Error checking assignments for hospital ${hospitalId}:`,
            error,
        );
        throw new Error(
            `Failed assignment check process for hospital ${hospitalId}. Reason: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
};
