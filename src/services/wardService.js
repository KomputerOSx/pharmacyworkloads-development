// src/services/wardService.js
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

const wardsCollection = collection(db, "wards");

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

// Get all wards with optional filters
export const getWards = async (filters = {}) => {
    try {
        // Start with a basic query
        let q = wardsCollection;

        // Apply filters if provided
        const constraints = [];

        if (filters.department && filters.department !== "all") {
            const deptRef = doc(db, "departments", filters.department);
            constraints.push(where("department", "==", deptRef));
        }

        if (filters.hospital && filters.hospital !== "all") {
            const hospitalRef = doc(db, "hospitals", filters.hospital);
            constraints.push(where("hospital", "==", hospitalRef));
        }

        if (filters.active === true) {
            constraints.push(where("active", "==", true));
        } else if (filters.active === false) {
            constraints.push(where("active", "==", false));
        }

        // Add sorting
        constraints.push(orderBy("name"));

        // Apply all constraints
        if (constraints.length > 0) {
            q = query(wardsCollection, ...constraints);
        }

        const querySnapshot = await getDocs(q);

        // Convert to array of data objects with IDs
        const wards = [];

        // Process each ward and resolve references
        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();

            // Get department data from reference
            let departmentData = null;
            if (data.department) {
                departmentData = await formatReferenceField(data.department);

                // Get department color if available
                if (departmentData && !departmentData.color) {
                    departmentData.color = "#3273dc"; // Default blue if no color specified
                }
            }

            // Get hospital data from reference
            let hospitalData = null;
            if (data.hospital) {
                hospitalData = await formatReferenceField(data.hospital);
            }

            wards.push({
                id: docSnapshot.id,
                ...data,
                department: departmentData || { id: "", name: "Unknown" },
                hospital: hospitalData || { id: "", name: "Unknown" },
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            });
        }

        // Apply search filter (client-side) if provided
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return wards.filter(
                (ward) =>
                    ward.name?.toLowerCase().includes(searchLower) ||
                    ward.code?.toLowerCase().includes(searchLower),
            );
        }

        return wards;
    } catch (error) {
        console.error("Error getting wards:", error);
        throw error;
    }
};

// Get a single ward by ID
export const getWard = async (id) => {
    try {
        const docRef = doc(db, "wards", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Get department data
            let departmentData = null;
            if (data.department) {
                departmentData = await formatReferenceField(data.department);
            }

            // Get hospital data
            let hospitalData = null;
            if (data.hospital) {
                hospitalData = await formatReferenceField(data.hospital);
            }

            return {
                id: docSnap.id,
                ...data,
                department: departmentData || { id: "", name: "Unknown" },
                hospital: hospitalData || { id: "", name: "Unknown" },
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting ward:", error);
        throw error;
    }
};

// Add a new ward
export const addWard = async (wardData, userId = "system") => {
    try {
        // Convert department reference
        let departmentRef = null;
        if (wardData.department && wardData.department.id) {
            departmentRef = doc(db, "departments", wardData.department.id);
        }

        // Convert hospital reference
        let hospitalRef = null;
        if (wardData.hospital && wardData.hospital.id) {
            hospitalRef = doc(db, "hospitals", wardData.hospital.id);
        }

        // Format data for Firestore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { department, hospital, ...otherData } = wardData;

        // Add timestamps and audit fields
        const dataToAdd = {
            ...otherData,
            department: departmentRef,
            hospital: hospitalRef,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(wardsCollection, dataToAdd);

        // Return the created ward with its new ID
        return {
            id: docRef.id,
            ...wardData,
        };
    } catch (error) {
        console.error("Error adding ward:", error);
        throw error;
    }
};

// Update an existing ward
export const updateWard = async (id, wardData, userId = "system") => {
    try {
        const wardRef = doc(db, "wards", id);

        // Convert department reference
        let departmentRef = null;
        if (wardData.department && wardData.department.id) {
            departmentRef = doc(db, "departments", wardData.department.id);
        }

        // Convert hospital reference
        let hospitalRef = null;
        if (wardData.hospital && wardData.hospital.id) {
            hospitalRef = doc(db, "hospitals", wardData.hospital.id);
        }

        // Format data for Firestore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { department, hospital, ...otherData } = wardData;

        // Add update timestamp and audit field
        const dataToUpdate = {
            ...otherData,
            department: departmentRef,
            hospital: hospitalRef,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        await updateDoc(wardRef, dataToUpdate);

        // Return the updated ward
        return {
            id,
            ...wardData,
        };
    } catch (error) {
        console.error("Error updating ward:", error);
        throw error;
    }
};

// Delete a ward
export const deleteWard = async (id) => {
    try {
        // TODO: Consider checking if there are any active assignments for this ward
        // and prevent deletion if there are (or implement cascading delete)

        const wardRef = doc(db, "wards", id);
        await deleteDoc(wardRef);

        return { success: true, id };
    } catch (error) {
        console.error("Error deleting ward:", error);
        throw error;
    }
};

// Get department for a ward
export const getWardDepartment = async (wardId) => {
    try {
        const ward = await getWard(wardId);

        if (ward && ward.department) {
            return ward.department;
        }

        return null;
    } catch (error) {
        console.error("Error getting ward department:", error);
        return null;
    }
};

// Get hospital for a ward
export const getWardHospital = async (wardId) => {
    try {
        const ward = await getWard(wardId);

        if (ward && ward.hospital) {
            return ward.hospital;
        }

        return null;
    } catch (error) {
        console.error("Error getting ward hospital:", error);
        return null;
    }
};

// Get all wards for a department
export const getWardsByDepartment = async (departmentId) => {
    try {
        const departmentRef = doc(db, "departments", departmentId);
        const q = query(
            wardsCollection,
            where("department", "==", departmentRef),
            orderBy("name"),
        );

        const querySnapshot = await getDocs(q);

        // Convert to array of data objects with IDs
        const wards = [];

        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();

            // We don't need to resolve references here since we already know the department
            wards.push({
                id: docSnapshot.id,
                ...data,
                department: { id: departmentId, name: "Department" }, // Simplified
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            });
        }

        return wards;
    } catch (error) {
        console.error("Error getting wards by department:", error);
        throw error;
    }
};
