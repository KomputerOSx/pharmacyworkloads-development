// src/services/hospitalService.js
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

const hospitalsCollection = collection(db, "hospitals");

// Helper function to safely format Firestore timestamps
const formatFirestoreTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === "function") {
        return timestamp.toDate().toISOString().split("T")[0];
    }
    return timestamp || null;
};

// Helper function to format reference fields to usable data
const formatReferenceField = async (reference) => {
    if (!reference) return null;

    try {
        const docSnap = await getDoc(reference);
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            };
        }
        return null;
    } catch (error) {
        console.error("Error getting reference document:", error);
        return null;
    }
};

// Get all hospitals with optional filters
export const getHospitals = async (filters = {}) => {
    try {
        // Start with a basic query
        let q = hospitalsCollection;

        // Apply filters if provided
        const constraints = [];

        if (filters.organization && filters.organization !== "all") {
            const orgRef = doc(db, "organizations", filters.organization);
            constraints.push(where("organization", "==", orgRef));
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
            q = query(hospitalsCollection, ...constraints);
        }

        const querySnapshot = await getDocs(q);

        // Convert to array of data objects with IDs
        const hospitals = [];

        // Process each hospital and resolve organization references
        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();

            // Get organization data from reference
            let organizationData = null;
            if (data.organization) {
                organizationData = await formatReferenceField(
                    data.organization,
                );
            }

            hospitals.push({
                id: docSnapshot.id,
                ...data,
                organization: organizationData || { id: "", name: "Unknown" },
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            });
        }

        // Apply search filter (client-side) if provided
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return hospitals.filter(
                (hospital) =>
                    hospital.name?.toLowerCase().includes(searchLower) ||
                    hospital.city?.toLowerCase().includes(searchLower) ||
                    hospital.postcode?.toLowerCase().includes(searchLower),
            );
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

            // Get organization data
            let organizationData = null;
            if (data.organization) {
                organizationData = await formatReferenceField(
                    data.organization,
                );
            }

            return {
                id: docSnap.id,
                ...data,
                organization: organizationData || { id: "", name: "Unknown" },
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
export const addHospital = async (hospitalData, userId = "system") => {
    try {
        // Convert organization to reference if needed
        let organizationRef = null;
        if (hospitalData.organization && hospitalData.organization.id) {
            organizationRef = doc(
                db,
                "organizations",
                hospitalData.organization.id,
            );
        }

        // Format data for Firestore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { organization, ...otherData } = hospitalData;

        // Add timestamps and audit fields
        const dataToAdd = {
            ...otherData,
            organization: organizationRef,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(hospitalsCollection, dataToAdd);

        // Return the created hospital with its new ID
        return {
            id: docRef.id,
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

        // Convert organization to reference if needed
        let organizationRef = null;
        if (hospitalData.organization && hospitalData.organization.id) {
            organizationRef = doc(
                db,
                "organizations",
                hospitalData.organization.id,
            );
        }

        // Format data for Firestore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { organization, ...otherData } = hospitalData;

        // Add update timestamp and audit field
        const dataToUpdate = {
            ...otherData,
            organization: organizationRef,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        await updateDoc(hospitalRef, dataToUpdate);

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

// Delete a hospital
export const deleteHospital = async (id) => {
    try {
        // TODO: Consider checking if there are any departments/wards linked to this hospital
        // and prevent deletion if there are (or implement cascading delete)

        const hospitalRef = doc(db, "hospitals", id);
        await deleteDoc(hospitalRef);

        return { success: true, id };
    } catch (error) {
        console.error("Error deleting hospital:", error);
        throw error;
    }
};

// Count departments for a hospital
export const countDepartments = async (hospitalId) => {
    try {
        const departmentsCollection = collection(db, "departments");
        const q = query(
            departmentsCollection,
            where("hospital", "==", doc(db, "hospitals", hospitalId)),
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error("Error counting departments:", error);
        return 0;
    }
};

// Count wards for a hospital
export const countWards = async (hospitalId) => {
    try {
        const wardsCollection = collection(db, "wards");
        const q = query(
            wardsCollection,
            where("hospital", "==", doc(db, "hospitals", hospitalId)),
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error("Error counting wards:", error);
        return 0;
    }
};
