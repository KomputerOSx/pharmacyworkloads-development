// src/services/hospitalService.js
// noinspection ExceptionCaughtLocallyJS

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebase";
import {
    assignHospitalToOrganisation,
    getHospitalOrganisationAssignment,
    removeHospitalAssignment,
} from "./hospitalAssignmentService";

const hospitalsCollection = collection(db, "hospitals");

// Helper function to safely format Firestore timestamps
const formatFirestoreTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === "function") {
        return timestamp.toDate().toISOString().split("T")[0];
    }
    return timestamp || null;
};

export const getHospitals = async (organisationId) => {
    try {
        const organisationRef = doc(db, "organisations", organisationId);

        const assignmentsQuery = query(
            collection(db, "hospital_organisation_assignments"),
            where("organisation", "==", organisationRef),
            where("active", "==", true),
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);

        const hospitals = [];
        for (const assignmentDoc of assignmentsSnapshot.docs) {
            const data = assignmentDoc.data();
            const hospitalRef = data.hospital;

            if (hospitalRef) {
                const hospitalDoc = await getDoc(hospitalRef);
                if (hospitalDoc.exists()) {
                    hospitals.push({
                        id: hospitalDoc.id,
                        ...hospitalDoc.data(),
                        createdAt: formatFirestoreTimestamp(
                            hospitalDoc.data().createdAt,
                        ),
                        updatedAt: formatFirestoreTimestamp(
                            hospitalDoc.data().updatedAt,
                        ),
                    });
                }
            }
        }

        return hospitals;
    } catch (error) {
        console.error("Error getting hospitals:", error);
        throw error;
    }
};

// Get a single hospital by ID
export const getHospital = async (id) => {
    try {
        const docRef = doc(db, "hospitals", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            return {
                id: docSnap.id,
                ...data,
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting hospital:", error);
        throw error;
    }
};

// Add a new hospital
// create the hospital
// create a new organisation assignment
export const addHospital = async (
    hospitalData,
    organisationId,
    userId = "system",
) => {
    try {
        // Validate organization is provided
        if (!organisationId) {
            throw new Error("Organization is required to create a hospital");
        }

        // Extract organization from hospital data
        const { ...otherData } = hospitalData;

        // Add timestamps and audit fields for the hospital
        const dataToAdd = {
            ...otherData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        // Add the hospital to the collection (without organization reference)
        const docRef = await addDoc(hospitalsCollection, dataToAdd);
        const hospitalId = docRef.id;

        // Create the organization assignment
        try {
            await assignHospitalToOrganisation(
                hospitalId,
                organisationId,
                userId,
            );
        } catch (assignmentError) {
            // If assignment fails, delete the hospital and throw error
            console.error(
                "Error creating hospital-organization assignment:",
                assignmentError,
            );
            await deleteDoc(doc(db, "hospitals", hospitalId));
            throw new Error(
                "Failed to assign hospital to organization. Hospital creation aborted.",
            );
        }

        // Return the created hospital with its new ID
        return {
            id: hospitalId,
            ...hospitalData,
        };
    } catch (error) {
        console.error("Error adding hospital:", error);
        throw error;
    }
};

// Update an existing hospital
export const updateHospital = async (id, organisationId, userId = "system") => {
    try {
        const hospitalRef = doc(db, "hospitals", id);

        // Add update timestamp and audit field - no otherData needed since we're just updating timestamps
        const dataToUpdate = {
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        // Update the hospital document (just the timestamp)
        await updateDoc(hospitalRef, dataToUpdate);

        // Handle organisation assignment if organisation is provided
        if (organisationId) {
            // Get current organisation assignment
            const currentAssignments =
                await getHospitalOrganisationAssignment(id);

            // If there's a current assignment, and it's different from the new one
            if (currentAssignments.length > 0) {
                const currentAssignment = currentAssignments[0];
                const currentOrgRef = currentAssignment.organisation;
                const currentOrgId = currentOrgRef.path.split("/").pop();

                // If organisation has changed
                if (currentOrgId !== organisationId) {
                    // Fixed: compare with organisationId parameter
                    // Remove old assignment
                    await removeHospitalAssignment(currentAssignment.id);

                    // Create new assignment
                    await assignHospitalToOrganisation(
                        id,
                        organisationId,
                        userId,
                    );
                }
                // If same organisation, no need to update assignment
            } else {
                // No current assignment, create a new one
                await assignHospitalToOrganisation(id, organisationId, userId);
            }
        }

        // Fetch the updated hospital to return complete data
        const updatedHospitalDoc = await getDoc(hospitalRef);

        if (!updatedHospitalDoc.exists()) {
            throw new Error(`Hospital with ID ${id} not found after update`);
        }

        const hospitalData = updatedHospitalDoc.data();

        // Return the complete updated hospital object
        return {
            id,
            name: hospitalData.name || "",
            address: hospitalData.address || "",
            city: hospitalData.city || "",
            postcode: hospitalData.postcode || "",
            contactNumber: hospitalData.contactNumber || "",
            contactEmail: hospitalData.contactEmail || "",
            active:
                hospitalData.active !== undefined ? hospitalData.active : true,
            createdAt: formatFirestoreTimestamp(hospitalData.createdAt),
            updatedAt: formatFirestoreTimestamp(hospitalData.updatedAt),
        };
    } catch (error) {
        console.error("Error updating hospital:", error);
        throw error;
    }
};

export const deleteHospital = async (id) => {
    try {
        // TODO: Consider checking if there are any departments/wards linked to this hospital
        // and prevent deletion if there are (or implement cascading delete)

        // First, get and delete any organisation assignments
        const assignments = await getHospitalOrganisationAssignment(id);

        // Delete each organisation assignment
        for (const assignment of assignments) {
            await removeHospitalAssignment(assignment.id);
        }

        // Then delete the hospital
        const hospitalRef = doc(db, "hospitals", id);
        await deleteDoc(hospitalRef);

        return { success: true, id };
    } catch (error) {
        console.error("Error deleting hospital:", error);
        throw error;
    }
};
