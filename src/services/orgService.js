// src/services/OrganisationService.js
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
import { db } from "@/config/firebase";
import { formatFirestoreTimestamp } from "@/utils/firestoreUtil";

const OrgsCol = collection(db, "organisations");

// Helper function to safely format Firestore timestamps

// Get all Organisations with optional filters
export const getOrgs = async () => {
    try {
        // Start with a basic query
        let q = OrgsCol;

        // Apply filters if provided
        const constraints = [];

        // Add sorting
        constraints.push(orderBy("name"));

        // Apply all constraints
        if (constraints.length > 0) {
            q = query(OrgsCol, ...constraints);
        }

        const querySnapshot = await getDocs(q);

        // Convert to array of data objects with IDs
        const Organisations = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            Organisations.push({
                id: doc.id,
                ...data,
                // Add derived fields for UI with safe conversion
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            });
        });

        return Organisations;
    } catch (error) {
        console.error("Error getting Organisations:", error);
        throw error;
    }
};

export const getOrganisation = async (id) => {
    if (!id) {
        console.error("Organisation ID is required");
        return null;
    }

    try {
        // Use lowercase collection name if that's your actual collection name
        const docRef = doc(db, "organisations", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Make sure we have a valid data object
            if (!data) {
                console.error("C3P6y9Du - Document exists but has no data");
                return null;
            }

            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt
                    ? formatFirestoreTimestamp(data.createdAt)
                    : null,
                updatedAt: data.updatedAt
                    ? formatFirestoreTimestamp(data.updatedAt)
                    : null,
            };
        } else {
            console.error(`YiDf9v38 - No organisation found with ID: ${id}`);
            return null;
        }
    } catch (error) {
        console.error("n0b846Cp - Error getting organisation:", error);
        throw error;
    }
};

// Add a new Organisation
export const addOrganisation = async (OrganisationData, userId = "system") => {
    try {
        // Add timestamps and audit fields
        const dataToAdd = {
            ...OrganisationData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(OrgsCol, dataToAdd);

        // Return the created Organisation with its new ID
        return {
            id: docRef.id,
            ...OrganisationData,
        };
    } catch (error) {
        console.error("6pHK68JX - Error adding Organisation:", error);
        throw error;
    }
};

// Update an existing Organisation
export const updateOrganisation = async (
    id,
    OrganisationData,
    userId = "system",
) => {
    try {
        const OrgRef = doc(db, "Organisations", id);

        // Add update timestamp and audit field
        const dataToUpdate = {
            ...OrganisationData,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        await updateDoc(OrgRef, dataToUpdate);

        // Return the updated Organisation
        return {
            id,
            ...OrganisationData,
        };
    } catch (error) {
        console.error("wJ47B2Uk - Error updating Organisation:", error);
        throw error;
    }
};

// Delete an Organisation
export const deleteOrganisation = async (id) => {
    try {
        // TODO: Consider checking if there are any hospitals linked to this Organisation
        // and prevent deletion if there are (or implement cascading delete)

        const OrganisationRef = doc(db, "Organisations", id);
        await deleteDoc(OrganisationRef);

        return { success: true, id };
    } catch (error) {
        console.error("1rsnPn8K - Error deleting Organisation:", error);
        throw error;
    }
};

// Count hospitals for an Organisation
export const countHospitals = async (OrganisationId) => {
    try {
        const hospOrgAssCol = collection(
            db,
            "hospital_organisation_assignments",
        );

        const q = query(
            hospOrgAssCol,
            where(
                "organisation",
                "==",
                doc(db, "organisations", OrganisationId),
            ),
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error("vfW8WEG7 - Error counting hospitals:", error);
        return 0;
    }
};

// Get Organisation types (for dropdowns)
export const getOrganisationTypes = () => {
    return [
        { id: "NHS Trust", name: "NHS Trust" },
        { id: "NHS Foundation Trust", name: "NHS Foundation Trust" },
        { id: "Private Healthcare", name: "Private Healthcare" },
        { id: "Community Healthcare", name: "Community Healthcare" },
    ];
};
