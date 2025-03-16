// src/services/organizationService.js
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

const organizationsCollection = collection(db, "organizations");

// Helper function to safely format Firestore timestamps
const formatFirestoreTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === "function") {
        return timestamp.toDate().toISOString().split("T")[0];
    }
    // If it's already a string date or null/undefined, just return it
    return timestamp || null;
};

// Get all organizations with optional filters
export const getOrganizations = async (filters = {}) => {
    try {
        // Start with a basic query
        let q = organizationsCollection;

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
            q = query(organizationsCollection, ...constraints);
        }

        const querySnapshot = await getDocs(q);

        // Convert to array of data objects with IDs
        const organizations = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            organizations.push({
                id: doc.id,
                ...data,
                // Add derived fields for UI with safe conversion
                hospitalCount: data.hospitalCount || 0,
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            });
        });

        // Apply search filter (client-side) if provided
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return organizations.filter(
                (org) =>
                    org.name?.toLowerCase().includes(searchLower) ||
                    org.contactEmail?.toLowerCase().includes(searchLower) ||
                    (org.contactPhone &&
                        org.contactPhone.includes(filters.search)),
            );
        }

        return organizations;
    } catch (error) {
        console.error("Error getting organizations:", error);
        throw error;
    }
};

// Get a single organization by ID
export const getOrganization = async (id) => {
    try {
        const docRef = doc(db, "organizations", id);
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
        console.error("Error getting organization:", error);
        throw error;
    }
};

// Add a new organization
export const addOrganization = async (organizationData, userId = "system") => {
    try {
        // Add timestamps and audit fields
        const dataToAdd = {
            ...organizationData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
            hospitalCount: 0, // Initialize hospital count to 0
        };

        const docRef = await addDoc(organizationsCollection, dataToAdd);

        // Return the created organization with its new ID
        return {
            id: docRef.id,
            ...organizationData,
        };
    } catch (error) {
        console.error("Error adding organization:", error);
        throw error;
    }
};

// Update an existing organization
export const updateOrganization = async (
    id,
    organizationData,
    userId = "system",
) => {
    try {
        const organizationRef = doc(db, "organizations", id);

        // Add update timestamp and audit field
        const dataToUpdate = {
            ...organizationData,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        await updateDoc(organizationRef, dataToUpdate);

        // Return the updated organization
        return {
            id,
            ...organizationData,
        };
    } catch (error) {
        console.error("Error updating organization:", error);
        throw error;
    }
};

// Delete an organization
export const deleteOrganization = async (id) => {
    try {
        // TODO: Consider checking if there are any hospitals linked to this organization
        // and prevent deletion if there are (or implement cascading delete)

        const organizationRef = doc(db, "organizations", id);
        await deleteDoc(organizationRef);

        return { success: true, id };
    } catch (error) {
        console.error("Error deleting organization:", error);
        throw error;
    }
};

// Count hospitals for an organization
export const countHospitals = async (organizationId) => {
    try {
        const hospitalsCollection = collection(db, "hospitals");
        const q = query(
            hospitalsCollection,
            where(
                "organization",
                "==",
                doc(db, "organizations", organizationId),
            ),
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error("Error counting hospitals:", error);
        return 0;
    }
};

// Get organization types (for dropdowns)
export const getOrganizationTypes = () => {
    return [
        { id: "NHS Trust", name: "NHS Trust" },
        { id: "NHS Foundation Trust", name: "NHS Foundation Trust" },
        { id: "Private Healthcare", name: "Private Healthcare" },
        { id: "Community Healthcare", name: "Community Healthcare" },
    ];
};
