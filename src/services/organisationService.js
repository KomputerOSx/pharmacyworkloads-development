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
import { db } from "./firebase";
import { formatFirestoreTimestamp } from "@/utils/firestoreUtil";

const OrganisationsCollection = collection(db, "organisations");

// Helper function to safely format Firestore timestamps

// Get all Organisations with optional filters
export const getOrganisations = async (filters = {}) => {
    try {
        // Start with a basic query
        let q = OrganisationsCollection;

        // Apply filters if provided
        const constraints = [];

        if (filters.type && filters.type !== "all") {
            constraints.push(where("type", "==", filters.type));
        }

        if (filters.status === "active") {
            constraints.push(where("active", "==", true));
        } else if (filters.status === "inactive") {
            constraints.push(where("active", "==", false));
        }

        // Add sorting
        constraints.push(orderBy("name"));

        // Apply all constraints
        if (constraints.length > 0) {
            q = query(OrganisationsCollection, ...constraints);
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

        // Apply search filter (client-side) if provided
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return Organisations.filter(
                (org) =>
                    org.name?.toLowerCase().includes(searchLower) ||
                    org.contactEmail?.toLowerCase().includes(searchLower) ||
                    (org.contactPhone &&
                        org.contactPhone.includes(filters.search)),
            );
        }

        return Organisations;
    } catch (error) {
        console.error("Error getting Organisations:", error);
        throw error;
    }
};

// Get a single Organisation by ID
// export const getOrganisation = async (id) => {
//     try {
//         const docRef = doc(db, "organisations", id);
//         const docSnap = await getDoc(docRef);
//
//         if (docSnap.exists()) {
//             const data = docSnap.data();
//             return {
//                 id: docSnap.id,
//                 ...data,
//                 createdAt: formatFirestoreTimestamp(data.createdAt),
//                 updatedAt: formatFirestoreTimestamp(data.updatedAt),
//             };
//         } else {
//             return null;
//         }
//     } catch (error) {
//         console.error("Error getting Organisation:", error);
//         throw error;
//     }
// };

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
                console.error("Document exists but has no data");
                return null;
            }

            return {
                id: docSnap.id,
                name: data.name || "Unknown Organisation",
                type: data.type || "Unknown Type",
                contactEmail: data.contactEmail || "",
                contactPhone: data.contactPhone || "",
                active: data.active !== undefined ? data.active : true,
                createdAt: data.createdAt
                    ? formatFirestoreTimestamp(data.createdAt)
                    : null,
                updatedAt: data.updatedAt
                    ? formatFirestoreTimestamp(data.updatedAt)
                    : null,
            };
        } else {
            console.error(`No organisation found with ID: ${id}`);
            return null;
        }
    } catch (error) {
        console.error("Error getting organisation:", error);
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

        const docRef = await addDoc(OrganisationsCollection, dataToAdd);

        // Return the created Organisation with its new ID
        return {
            id: docRef.id,
            ...OrganisationData,
        };
    } catch (error) {
        console.error("Error adding Organisation:", error);
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
        const OrganisationRef = doc(db, "Organisations", id);

        // Add update timestamp and audit field
        const dataToUpdate = {
            ...OrganisationData,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        await updateDoc(OrganisationRef, dataToUpdate);

        // Return the updated Organisation
        return {
            id,
            ...OrganisationData,
        };
    } catch (error) {
        console.error("Error updating Organisation:", error);
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
        console.error("Error deleting Organisation:", error);
        throw error;
    }
};

// Count hospitals for an Organisation
export const countHospitals = async (OrganisationId) => {
    try {
        const hospitalsCollection = collection(db, "hospitals");
        const q = query(
            hospitalsCollection,
            where(
                "Organisation",
                "==",
                doc(db, "Organisations", OrganisationId),
            ),
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error("Error counting hospitals:", error);
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
