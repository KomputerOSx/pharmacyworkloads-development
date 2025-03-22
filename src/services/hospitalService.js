// src/services/hospitalService.js
// noinspection ExceptionCaughtLocallyJS

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
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

// Get all hospitals with optional filters
export const getHospitals = async (organisationId) => {
    try {
        const assignedHospitals = await getDocs(
            query(
                collection(db, "hospital_organisation_assignments"),
                where("organisation", "==", organisationId),
                orderBy("name"),
            ),
        );

        return assignedHospitals.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
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
export const addHospital = async (hospitalData, userId = "system") => {
    try {
        // Validate organization is provided
        if (!hospitalData.organization || !hospitalData.organization.id) {
            throw new Error("Organization is required to create a hospital");
        }

        // Extract organization from hospital data
        const { organization, ...otherData } = hospitalData;

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
                organization.id,
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
export const updateHospital = async (id, hospitalData, userId = "system") => {
    try {
        const hospitalRef = doc(db, "hospitals", id);

        // Extract organisation from hospital data
        const { organisation, ...otherData } = hospitalData;

        // Add update timestamp and audit field
        const dataToUpdate = {
            ...otherData,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        // Update the hospital document (without organisation reference)
        await updateDoc(hospitalRef, dataToUpdate);

        // Handle organisation assignment if organisation is provided
        if (organisation && organisation.id) {
            // Get current organisation assignment
            const currentAssignments =
                await getHospitalOrganisationAssignment(id);

            // If there's a current assignment, and it's different from the new one
            if (currentAssignments.length > 0) {
                const currentAssignment = currentAssignments[0];
                const currentOrgRef = currentAssignment.organisation;
                const currentOrgId = currentOrgRef.path.split("/").pop();

                // If organisation has changed
                if (currentOrgId !== organisation.id) {
                    // Remove old assignment
                    await removeHospitalAssignment(currentAssignment.id);

                    // Create new assignment
                    await assignHospitalToOrganisation(
                        id,
                        organisation.id,
                        userId,
                    );
                }
                // If same organisation, no need to update assignment
            } else {
                // No current assignment, create a new one
                await assignHospitalToOrganisation(id, organisation.id, userId);
            }
        }

        // Return the updated hospital
        return {
            id,
            ...hospitalData,
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
