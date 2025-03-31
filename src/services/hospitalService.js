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
import { db } from "@/config/firebase";
import {
    assignHospitalToOrganisation,
    cleanupHosOrgAss,
    getHospitalOrganisationAssignment,
    removeHospitalAssignment,
} from "./hospitalAssignmentService";
import { formatFirestoreTimestamp } from "@/utils/firestoreUtil";

const hospitalsCollection = collection(db, "hospitals");

// Helper function to safely format Firestore timestamps

export const getHospitals = async (organisationId) => {
    try {
        const organisationRef = doc(db, "organisations", organisationId);

        const assignmentsQuery = query(
            collection(db, "hospital_organisation_assignments"),
            where("organisation", "==", organisationRef),
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

export const updateHospital = async (
    id,
    organisationId,
    data,
    userId = "system",
) => {
    try {
        const hospitalRef = doc(db, "hospitals", id);

        // Add update timestamp and audit field
        const dataToUpdate = {
            ...data,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };
        console.log("Data being sent to Firestore:", dataToUpdate);

        // Update the hospital document
        console.log("Before update:", await getHospital(id));
        await updateDoc(hospitalRef, dataToUpdate);
        console.log("After update:", await getHospital(id));

        // Handle organisation assignment if organisation is provided
        if (organisationId) {
            // Clean up any existing assignments and get the current one (if any)
            const existingAssignment = await cleanupHosOrgAss(
                id,
                organisationId,
            );

            if (existingAssignment) {
                // Update the existing assignment
                console.log(
                    `Updating existing assignment ${existingAssignment.id}`,
                );
                await updateDoc(
                    doc(
                        db,
                        "hospital_organisation_assignments",
                        existingAssignment.id,
                    ),
                    {
                        updatedAt: serverTimestamp(),
                        updatedById: userId,
                        active: true, // Ensure it's marked as active
                    },
                );
            } else {
                // No existing assignment, create a new one
                console.log(
                    `Creating new assignment for hospital ${id} and organisation ${organisationId}`,
                );
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
            city: hospitalData.city || "",
            postcode: hospitalData.postcode || "",
            contactPhone: hospitalData.contactNumber || "",
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
