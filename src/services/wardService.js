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
const assignmentsCollection = collection(db, "ward_department_assignments");

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

// Get ward department assignments
const getWardDepartmentAssignments = async (wardId) => {
    try {
        const wardRef = doc(db, "wards", wardId);
        const q = query(
            assignmentsCollection,
            where("ward", "==", wardRef),
            where("active", "==", true),
        );

        const querySnapshot = await getDocs(q);
        const assignments = [];

        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();

            // Get department data
            let departmentData = null;
            if (data.department) {
                departmentData = await formatReferenceField(data.department);
                // Add default color if missing
                if (departmentData && !departmentData.color) {
                    departmentData.color = "#3273dc";
                }
            }

            assignments.push({
                id: docSnapshot.id,
                department: departmentData || { id: "", name: "Unknown" },
                isPrimary: data.isPrimary || false,
                startDate: formatFirestoreTimestamp(data.startDate),
                endDate: formatFirestoreTimestamp(data.endDate),
            });
        }

        return assignments;
    } catch (error) {
        console.error("Error getting ward department assignments:", error);
        return [];
    }
};

// Get primary department for a ward from assignments
const getWardPrimaryDepartment = async (wardId) => {
    try {
        const assignments = await getWardDepartmentAssignments(wardId);
        const primaryAssignment = assignments.find((a) => a.isPrimary);
        return primaryAssignment ? primaryAssignment.department : null;
    } catch (error) {
        console.error("Error getting ward primary department:", error);
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

        // We'll handle department filtering differently for multi-department relationships
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
        let wards = [];

        // Process each ward and resolve references
        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();
            const wardId = docSnapshot.id;

            // Get hospital data from reference
            let hospitalData = null;
            if (data.hospital) {
                hospitalData = await formatReferenceField(data.hospital);
            }

            // Get department assignments for this ward
            const departmentAssignments =
                await getWardDepartmentAssignments(wardId);

            // Determine primary department (for backward compatibility)
            const primaryDepartment =
                departmentAssignments.find((a) => a.isPrimary)?.department ||
                null;

            // Legacy department reference (for backward compatibility)
            let legacyDepartment = null;
            if (data.department) {
                legacyDepartment = await formatReferenceField(data.department);
                if (legacyDepartment && !legacyDepartment.color) {
                    legacyDepartment.color = "#3273dc"; // Default blue if no color specified
                }
            }

            // Use the most appropriate department reference
            const department = primaryDepartment ||
                legacyDepartment || { id: "", name: "Unknown" };

            wards.push({
                id: wardId,
                ...data,
                department, // For backward compatibility
                departmentAssignments,
                primaryDepartment,
                hospital: hospitalData || { id: "", name: "Unknown" },
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            });
        }

        // Apply department filter if provided (client-side)
        if (filters.department && filters.department !== "all") {
            wards = wards.filter((ward) => {
                // Check if ward has direct department reference matching filter
                if (ward.department?.id === filters.department) {
                    return true;
                }

                // Check if ward has any department assignment matching filter
                return ward.departmentAssignments?.some(
                    (a) => a.department?.id === filters.department,
                );
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

            // Get hospital data
            let hospitalData = null;
            if (data.hospital) {
                hospitalData = await formatReferenceField(data.hospital);
            }

            // Get department assignments for this ward
            const departmentAssignments =
                await getWardDepartmentAssignments(id);

            // Determine primary department (for backward compatibility)
            const primaryDepartment =
                departmentAssignments.find((a) => a.isPrimary)?.department ||
                null;

            // Legacy department reference (for backward compatibility)
            let legacyDepartment = null;
            if (data.department) {
                legacyDepartment = await formatReferenceField(data.department);
                if (legacyDepartment && !legacyDepartment.color) {
                    legacyDepartment.color = "#3273dc"; // Default blue if no color specified
                }
            }

            // Use the most appropriate department reference
            const department = primaryDepartment ||
                legacyDepartment || { id: "", name: "Unknown" };

            return {
                id: docSnap.id,
                ...data,
                department, // For backward compatibility
                departmentAssignments,
                primaryDepartment,
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
        // Extract department assignments if they exist
        const {
            departmentAssignments,
            primaryDepartment,
            ...wardDataWithoutAssignments
        } = wardData;

        // Convert hospital reference
        let hospitalRef = null;
        if (
            wardDataWithoutAssignments.hospital &&
            wardDataWithoutAssignments.hospital.id
        ) {
            hospitalRef = doc(
                db,
                "hospitals",
                wardDataWithoutAssignments.hospital.id,
            );
        }

        // Convert department reference (for backward compatibility)
        let departmentRef = null;
        // Use primary department if available, otherwise use the department from wardData
        if (primaryDepartment && primaryDepartment.id) {
            departmentRef = doc(db, "departments", primaryDepartment.id);
        } else if (
            wardDataWithoutAssignments.department &&
            wardDataWithoutAssignments.department.id
        ) {
            departmentRef = doc(
                db,
                "departments",
                wardDataWithoutAssignments.department.id,
            );
        }

        // Format data for Firestore
        const { department, hospital, ...otherData } =
            wardDataWithoutAssignments;

        // Add timestamps and audit fields
        const dataToAdd = {
            ...otherData,
            department: departmentRef, // For backward compatibility
            hospital: hospitalRef,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(wardsCollection, dataToAdd);
        const wardId = docRef.id;

        // Add department assignments if provided
        if (
            departmentAssignments &&
            Array.isArray(departmentAssignments) &&
            departmentAssignments.length > 0
        ) {
            for (const assignment of departmentAssignments) {
                if (assignment.department && assignment.department.id) {
                    await assignDepartmentToWard(
                        wardId,
                        assignment.department.id,
                        assignment.isPrimary || false,
                        userId,
                    );
                }
            }
        } else if (primaryDepartment && primaryDepartment.id) {
            // If no assignments but primaryDepartment is specified, create an assignment for it
            await assignDepartmentToWard(
                wardId,
                primaryDepartment.id,
                true,
                userId,
            );
        } else if (department && department.id) {
            // For backward compatibility, create an assignment for the department
            await assignDepartmentToWard(wardId, department.id, true, userId);
        }

        // Return the created ward with its new ID
        return {
            id: wardId,
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

        // Extract department assignments if they exist
        const {
            departmentAssignments,
            primaryDepartment,
            ...wardDataWithoutAssignments
        } = wardData;

        // Convert hospital reference
        let hospitalRef = null;
        if (
            wardDataWithoutAssignments.hospital &&
            wardDataWithoutAssignments.hospital.id
        ) {
            hospitalRef = doc(
                db,
                "hospitals",
                wardDataWithoutAssignments.hospital.id,
            );
        }

        // Convert department reference (for backward compatibility)
        let departmentRef = null;
        // Use primary department if available, otherwise use the department from wardData
        if (primaryDepartment && primaryDepartment.id) {
            departmentRef = doc(db, "departments", primaryDepartment.id);
        } else if (
            wardDataWithoutAssignments.department &&
            wardDataWithoutAssignments.department.id
        ) {
            departmentRef = doc(
                db,
                "departments",
                wardDataWithoutAssignments.department.id,
            );
        }

        // Format data for Firestore
        const { department, hospital, ...otherData } =
            wardDataWithoutAssignments;

        // Build update object - only include fields that are provided
        const updateData = {
            ...otherData,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        // Only add these fields if they were actually provided
        if (hospitalRef !== null) updateData.hospital = hospitalRef;
        if (departmentRef !== null) updateData.department = departmentRef;

        await updateDoc(wardRef, updateData);

        // Update department assignments if provided
        if (departmentAssignments && Array.isArray(departmentAssignments)) {
            // Get existing assignments
            const existingAssignments = await getWardDepartmentAssignments(id);

            // Handle each new assignment
            for (const assignment of departmentAssignments) {
                if (assignment.department && assignment.department.id) {
                    const existingAssignment = existingAssignments.find(
                        (a) => a.department.id === assignment.department.id,
                    );

                    if (existingAssignment) {
                        // If isPrimary status changed, update it
                        if (
                            existingAssignment.isPrimary !==
                            assignment.isPrimary
                        ) {
                            await updateDepartmentAssignment(
                                existingAssignment.id,
                                { isPrimary: assignment.isPrimary },
                                userId,
                            );
                        }
                    } else {
                        // New assignment
                        await assignDepartmentToWard(
                            id,
                            assignment.department.id,
                            assignment.isPrimary || false,
                            userId,
                        );
                    }
                }
            }

            // Remove assignments that are no longer in the list
            for (const existing of existingAssignments) {
                const stillExists = departmentAssignments.some(
                    (a) =>
                        a.department &&
                        a.department.id === existing.department.id,
                );

                if (!stillExists) {
                    await removeDepartmentFromWard(existing.id, userId);
                }
            }
        } else if (primaryDepartment && primaryDepartment.id) {
            // If only primaryDepartment is specified, ensure it's set as primary
            await setPrimaryDepartment(id, primaryDepartment.id, userId);
        }

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
        // Delete all department assignments first
        const assignments = await getWardDepartmentAssignments(id);
        for (const assignment of assignments) {
            await removeDepartmentFromWard(assignment.id);
        }

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
        // First try to get primary department from assignments
        const primaryDept = await getWardPrimaryDepartment(wardId);
        if (primaryDept) {
            return primaryDept;
        }

        // Fall back to legacy department reference
        const ward = await getWard(wardId);
        if (ward && ward.department && ward.department.id) {
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
        // First look for wards with direct department references (legacy)
        const departmentRef = doc(db, "departments", departmentId);
        const legacyQuery = query(
            wardsCollection,
            where("department", "==", departmentRef),
            orderBy("name"),
        );

        // Now look for wards with department assignments
        const assignmentQuery = query(
            assignmentsCollection,
            where("department", "==", departmentRef),
            where("active", "==", true),
        );

        // Execute both queries
        const [legacySnapshot, assignmentSnapshot] = await Promise.all([
            getDocs(legacyQuery),
            getDocs(assignmentQuery),
        ]);

        // Process legacy wards
        const wardsFromLegacy = [];
        for (const docSnapshot of legacySnapshot.docs) {
            const data = docSnapshot.data();
            wardsFromLegacy.push({
                id: docSnapshot.id,
                ...data,
                department: { id: departmentId, name: "Department" }, // Simplified
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            });
        }

        // Process wards from assignments
        const wardIds = new Set();
        for (const docSnapshot of assignmentSnapshot.docs) {
            const data = docSnapshot.data();
            if (data.ward) {
                const wardDoc = await getDoc(data.ward);
                if (wardDoc.exists()) {
                    wardIds.add(wardDoc.id);
                }
            }
        }

        // Add wards from assignments that aren't already in the list
        const wardsFromAssignments = [];
        for (const wardId of wardIds) {
            if (!wardsFromLegacy.some((w) => w.id === wardId)) {
                const ward = await getWard(wardId);
                if (ward) {
                    wardsFromAssignments.push(ward);
                }
            }
        }

        // Combine unique wards from both sources
        return [...wardsFromLegacy, ...wardsFromAssignments];
    } catch (error) {
        console.error("Error getting wards by department:", error);
        throw error;
    }
};

// New functions for ward-department assignments

// Assign a department to a ward
export const assignDepartmentToWard = async (
    wardId,
    departmentId,
    isPrimary = false,
    userId = "system",
) => {
    try {
        // Check if assignment already exists
        const wardRef = doc(db, "wards", wardId);
        const departmentRef = doc(db, "departments", departmentId);

        const q = query(
            assignmentsCollection,
            where("ward", "==", wardRef),
            where("department", "==", departmentRef),
            where("active", "==", true),
        );

        const existingSnapshot = await getDocs(q);

        if (!existingSnapshot.empty) {
            // Assignment already exists, update it
            const existingAssignment = existingSnapshot.docs[0];
            await updateDoc(existingSnapshot.docs[0].ref, {
                isPrimary,
                updatedAt: serverTimestamp(),
                updatedById: userId,
            });

            return {
                id: existingAssignment.id,
                wardId,
                departmentId,
                isPrimary,
            };
        }

        // If this is a primary assignment, unset any existing primary assignments
        if (isPrimary) {
            const primaryQuery = query(
                assignmentsCollection,
                where("ward", "==", wardRef),
                where("isPrimary", "==", true),
                where("active", "==", true),
            );

            const primarySnapshot = await getDocs(primaryQuery);

            for (const primaryDoc of primarySnapshot.docs) {
                await updateDoc(primaryDoc.ref, {
                    isPrimary: false,
                    updatedAt: serverTimestamp(),
                    updatedById: userId,
                });
            }
        }

        // Create new assignment
        const assignmentData = {
            ward: wardRef,
            department: departmentRef,
            isPrimary,
            active: true,
            startDate: serverTimestamp(),
            endDate: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(assignmentsCollection, assignmentData);

        return {
            id: docRef.id,
            wardId,
            departmentId,
            isPrimary,
        };
    } catch (error) {
        console.error("Error assigning department to ward:", error);
        throw error;
    }
};

// Update a department assignment
export const updateDepartmentAssignment = async (
    assignmentId,
    updates,
    userId = "system",
) => {
    try {
        const assignmentRef = doc(assignmentsCollection, assignmentId);
        const assignmentSnap = await getDoc(assignmentRef);

        if (!assignmentSnap.exists()) {
            throw new Error("Assignment not found");
        }

        const assignmentData = assignmentSnap.data();

        // If updating to primary, unset any other primary assignments
        if (updates.isPrimary === true) {
            const wardRef = assignmentData.ward;
            const primaryQuery = query(
                assignmentsCollection,
                where("ward", "==", wardRef),
                where("isPrimary", "==", true),
                where("active", "==", true),
            );

            const primarySnapshot = await getDocs(primaryQuery);

            for (const primaryDoc of primarySnapshot.docs) {
                if (primaryDoc.id !== assignmentId) {
                    await updateDoc(primaryDoc.ref, {
                        isPrimary: false,
                        updatedAt: serverTimestamp(),
                        updatedById: userId,
                    });
                }
            }
        }

        // Update the assignment
        await updateDoc(assignmentRef, {
            ...updates,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        });

        return { success: true, id: assignmentId };
    } catch (error) {
        console.error("Error updating department assignment:", error);
        throw error;
    }
};

// Remove a department from a ward
export const removeDepartmentFromWard = async (
    assignmentId,
    userId = "system",
) => {
    try {
        const assignmentRef = doc(assignmentsCollection, assignmentId);

        // Instead of deleting, mark as inactive with end date
        await updateDoc(assignmentRef, {
            active: false,
            endDate: serverTimestamp(),
            updatedAt: serverTimestamp(),
            updatedById: userId,
        });

        return { success: true, id: assignmentId };
    } catch (error) {
        console.error("Error removing department from ward:", error);
        throw error;
    }
};

// Set primary department for a ward
export const setPrimaryDepartment = async (
    wardId,
    departmentId,
    userId = "system",
) => {
    try {
        const wardRef = doc(db, "wards", wardId);
        const departmentRef = doc(db, "departments", departmentId);

        // Find the assignment
        const q = query(
            assignmentsCollection,
            where("ward", "==", wardRef),
            where("department", "==", departmentRef),
            where("active", "==", true),
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            // Create a new assignment if it doesn't exist
            return await assignDepartmentToWard(
                wardId,
                departmentId,
                true,
                userId,
            );
        }

        // Update existing assignment to be primary
        const assignmentDoc = snapshot.docs[0];

        // First, unset any existing primary
        const primaryQuery = query(
            assignmentsCollection,
            where("ward", "==", wardRef),
            where("isPrimary", "==", true),
            where("active", "==", true),
        );

        const primarySnapshot = await getDocs(primaryQuery);

        for (const primaryDoc of primarySnapshot.docs) {
            if (primaryDoc.id !== assignmentDoc.id) {
                await updateDoc(primaryDoc.ref, {
                    isPrimary: false,
                    updatedAt: serverTimestamp(),
                    updatedById: userId,
                });
            }
        }

        // Set this assignment as primary
        await updateDoc(assignmentDoc.ref, {
            isPrimary: true,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        });

        return {
            id: assignmentDoc.id,
            wardId,
            departmentId,
            isPrimary: true,
        };
    } catch (error) {
        console.error("Error setting primary department:", error);
        throw error;
    }
};
