// src/services/departmentService.js
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

const departmentsCollection = collection(db, "departments");

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

// Get all departments with optional filters
export const getDepartments = async (filters = {}) => {
    try {
        // Start with a basic query
        let q = departmentsCollection;

        // Apply filters if provided
        const constraints = [];

        if (filters.hospital && filters.hospital !== "all") {
            const hospitalRef = doc(db, "hospitals", filters.hospital);
            constraints.push(where("hospital", "==", hospitalRef));
        }

        if (filters.type && filters.type !== "all") {
            constraints.push(where("type", "==", filters.type));
        }

        if (filters.parent === "root") {
            // Only get top-level departments (no parent)
            constraints.push(where("parent", "==", null));
        } else if (filters.parent && filters.parent !== "all") {
            const parentRef = doc(db, "departments", filters.parent);
            constraints.push(where("parent", "==", parentRef));
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
            q = query(departmentsCollection, ...constraints);
        }

        const querySnapshot = await getDocs(q);

        // Convert to array of data objects with IDs
        let departments = [];

        // Process each department and resolve references
        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();

            // Get hospital data from reference
            let hospitalData = null;
            if (data.hospital) {
                hospitalData = await formatReferenceField(data.hospital);
            }

            // Get parent department data from reference
            let parentData = null;
            if (data.parent) {
                parentData = await formatReferenceField(data.parent);
            }

            departments.push({
                id: docSnapshot.id,
                ...data,
                hospital: hospitalData || { id: "", name: "Unknown" },
                parent: parentData,
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            });
        }

        // Apply search filter (client-side) if provided
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return departments.filter(
                (dept) =>
                    dept.name?.toLowerCase().includes(searchLower) ||
                    dept.code?.toLowerCase().includes(searchLower) ||
                    dept.description?.toLowerCase().includes(searchLower),
            );
        }

        return departments;
    } catch (error) {
        console.error("Error getting departments:", error);
        throw error;
    }
};

// Get a single department by ID
export const getDepartment = async (id) => {
    try {
        const docRef = doc(db, "departments", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Get hospital data
            let hospitalData = null;
            if (data.hospital) {
                hospitalData = await formatReferenceField(data.hospital);
            }

            // Get parent department data
            let parentData = null;
            if (data.parent) {
                parentData = await formatReferenceField(data.parent);
            }

            return {
                id: docSnap.id,
                ...data,
                hospital: hospitalData || { id: "", name: "Unknown" },
                parent: parentData,
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting department:", error);
        throw error;
    }
};

// Get department children (subdepartments)
export const getDepartmentChildren = async (departmentId) => {
    try {
        if (!departmentId) return [];

        const departmentRef = doc(db, "departments", departmentId);
        const q = query(
            departmentsCollection,
            where("parent", "==", departmentRef),
            orderBy("name"),
        );

        const querySnapshot = await getDocs(q);

        // Convert to array of data objects with IDs
        const departments = [];

        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();

            // Get hospital data from reference
            let hospitalData = null;
            if (data.hospital) {
                hospitalData = await formatReferenceField(data.hospital);
            }

            departments.push({
                id: docSnapshot.id,
                ...data,
                hospital: hospitalData || { id: "", name: "Unknown" },
                parent: { id: departmentId, name: "Parent Department" }, // simplified parent info
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            });
        }

        return departments;
    } catch (error) {
        console.error("Error getting department children:", error);
        throw error;
    }
};

// Add a new department
export const addDepartment = async (departmentData, userId = "system") => {
    try {
        // Convert references
        let hospitalRef = null;
        if (departmentData.hospital && departmentData.hospital.id) {
            hospitalRef = doc(db, "hospitals", departmentData.hospital.id);
        }

        let parentRef = null;
        if (departmentData.parent && departmentData.parent.id) {
            parentRef = doc(db, "departments", departmentData.parent.id);
        }

        // Format data for Firestore
        const { hospital, parent, ...otherData } = departmentData;

        // Add timestamps and audit fields
        const dataToAdd = {
            ...otherData,
            hospital: hospitalRef,
            parent: parentRef,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(departmentsCollection, dataToAdd);

        // Return the created department with its new ID
        return {
            id: docRef.id,
            ...departmentData,
        };
    } catch (error) {
        console.error("Error adding department:", error);
        throw error;
    }
};

// Update an existing department
export const updateDepartment = async (
    id,
    departmentData,
    userId = "system",
) => {
    try {
        const departmentRef = doc(db, "departments", id);

        // Convert references
        let hospitalRef = null;
        if (departmentData.hospital && departmentData.hospital.id) {
            hospitalRef = doc(db, "hospitals", departmentData.hospital.id);
        }

        let parentRef = null;
        if (departmentData.parent && departmentData.parent.id) {
            parentRef = doc(db, "departments", departmentData.parent.id);
        }

        // Format data for Firestore
        const { hospital, parent, ...otherData } = departmentData;

        // Add update timestamp and audit field
        const dataToUpdate = {
            ...otherData,
            hospital: hospitalRef,
            parent: parentRef,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        await updateDoc(departmentRef, dataToUpdate);

        // Return the updated department
        return {
            id,
            ...departmentData,
        };
    } catch (error) {
        console.error("Error updating department:", error);
        throw error;
    }
};

// Delete a department
export const deleteDepartment = async (id) => {
    try {
        // Check if department has children
        const children = await getDepartmentChildren(id);
        if (children.length > 0) {
            throw new Error(
                "Cannot delete department with subdepartments. Please delete or reassign subdepartments first.",
            );
        }

        // TODO: Check if department has wards or staff assigned

        const departmentRef = doc(db, "departments", id);
        await deleteDoc(departmentRef);

        return { success: true, id };
    } catch (error) {
        console.error("Error deleting department:", error);
        throw error;
    }
};

// Get department types (for dropdowns)
export const getDepartmentTypes = () => {
    return [
        { id: "pharmacy", name: "Pharmacy" },
        { id: "clinical", name: "Clinical" },
        { id: "outpatient", name: "Outpatient" },
        { id: "inpatient", name: "Inpatient" },
        { id: "medical", name: "Medical" },
        { id: "porters", name: "Porters" },
        { id: "catering", name: "Catering" },
        { id: "admin", name: "Administration" },
        { id: "other", name: "Other" },
    ];
};

// Check if a department has root-level access
export const isRootDepartment = async (departmentId) => {
    try {
        const docRef = doc(db, "departments", departmentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.parent === null;
        }

        return false;
    } catch (error) {
        console.error("Error checking if department is root:", error);
        return false;
    }
};
