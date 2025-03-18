// src/services/wardDepartmentService.js
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebase";

const wardDeptAssignmentsCollection = collection(
    db,
    "ward_department_assignments",
);

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

// Get all department assignments for a ward
export const getWardDepartmentAssignments = async (wardId) => {
    try {
        const wardRef = doc(db, "wards", wardId);
        const q = query(
            wardDeptAssignmentsCollection,
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
            }

            assignments.push({
                id: docSnapshot.id,
                department: departmentData
                    ? {
                          id: departmentData.id,
                          name: departmentData.name,
                          code: departmentData.code,
                          color: departmentData.color || "#3273dc",
                      }
                    : null,
                isPrimary: data.isPrimary || false,
                startDate: formatFirestoreTimestamp(data.startDate),
                endDate: formatFirestoreTimestamp(data.endDate),
            });
        }

        return assignments;
    } catch (error) {
        console.error("Error getting ward department assignments:", error);
        throw error;
    }
};

// Assign a ward to a department
export const assignWardToDepartment = async (
    wardId,
    departmentId,
    isPrimary = false,
    userId = "system",
) => {
    try {
        const wardRef = doc(db, "wards", wardId);
        const departmentRef = doc(db, "departments", departmentId);

        // First, check if this assignment already exists
        const existingQuery = query(
            wardDeptAssignmentsCollection,
            where("ward", "==", wardRef),
            where("department", "==", departmentRef),
            where("active", "==", true),
        );

        const existingSnapshot = await getDocs(existingQuery);

        // If the assignment already exists, update it
        if (!existingSnapshot.empty) {
            const existingDoc = existingSnapshot.docs[0];
            await updateDoc(
                doc(db, "ward_department_assignments", existingDoc.id),
                {
                    isPrimary,
                    updatedAt: serverTimestamp(),
                    updatedById: userId,
                },
            );

            return {
                id: existingDoc.id,
                isPrimary,
            };
        }

        // If making this primary, update any existing primary assignment
        if (isPrimary) {
            const primaryQuery = query(
                wardDeptAssignmentsCollection,
                where("ward", "==", wardRef),
                where("isPrimary", "==", true),
                where("active", "==", true),
            );

            const primarySnapshot = await getDocs(primaryQuery);

            if (!primarySnapshot.empty) {
                // Update existing primary assignment to not be primary
                await updateDoc(
                    doc(
                        db,
                        "ward_department_assignments",
                        primarySnapshot.docs[0].id,
                    ),
                    {
                        isPrimary: false,
                        updatedAt: serverTimestamp(),
                        updatedById: userId,
                    },
                );
            }
        }

        // Create new assignment
        const newAssignment = {
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

        const docRef = await addDoc(
            wardDeptAssignmentsCollection,
            newAssignment,
        );

        return {
            id: docRef.id,
            isPrimary,
        };
    } catch (error) {
        console.error("Error assigning ward to department:", error);
        throw error;
    }
};

// Set a department as primary for a ward
export const setPrimaryDepartment = async (
    assignmentId,
    wardId,
    userId = "system",
) => {
    try {
        const wardRef = doc(db, "wards", wardId);

        // First, find and update any existing primary assignment
        const primaryQuery = query(
            wardDeptAssignmentsCollection,
            where("ward", "==", wardRef),
            where("isPrimary", "==", true),
            where("active", "==", true),
        );

        const primarySnapshot = await getDocs(primaryQuery);

        if (!primarySnapshot.empty) {
            for (const docSnapshot of primarySnapshot.docs) {
                // Skip if this is the same assignment we're trying to make primary
                if (docSnapshot.id === assignmentId) continue;

                // Update to not be primary
                await updateDoc(
                    doc(db, "ward_department_assignments", docSnapshot.id),
                    {
                        isPrimary: false,
                        updatedAt: serverTimestamp(),
                        updatedById: userId,
                    },
                );
            }
        }

        // Update the selected assignment to be primary
        const assignmentRef = doc(
            db,
            "ward_department_assignments",
            assignmentId,
        );
        await updateDoc(assignmentRef, {
            isPrimary: true,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        });

        return { success: true };
    } catch (error) {
        console.error("Error setting primary department:", error);
        throw error;
    }
};

// Remove a ward-department assignment
export const removeWardDepartmentAssignment = async (
    assignmentId,
    userId = "system",
) => {
    try {
        // Check if this is a primary assignment
        const assignmentRef = doc(
            db,
            "ward_department_assignments",
            assignmentId,
        );
        const assignmentSnap = await getDoc(assignmentRef);

        if (!assignmentSnap.exists()) {
            throw new Error("Assignment not found");
        }

        const assignmentData = assignmentSnap.data();

        // If this is a primary assignment, we need to ensure the ward still has a primary department
        if (assignmentData.isPrimary) {
            const wardRef = assignmentData.ward;

            // Find all other active assignments for this ward
            const otherAssignmentsQuery = query(
                wardDeptAssignmentsCollection,
                where("ward", "==", wardRef),
                where("active", "==", true),
            );

            const otherAssignments = await getDocs(otherAssignmentsQuery);

            // If there are other assignments, make one of them primary
            if (otherAssignments.size > 1) {
                for (const docSnapshot of otherAssignments.docs) {
                    if (docSnapshot.id !== assignmentId) {
                        // Make this the new primary
                        await updateDoc(
                            doc(
                                db,
                                "ward_department_assignments",
                                docSnapshot.id,
                            ),
                            {
                                isPrimary: true,
                                updatedAt: serverTimestamp(),
                                updatedById: userId,
                            },
                        );
                        break;
                    }
                }
            }
        }

        // Soft delete the assignment (mark as inactive)
        await updateDoc(assignmentRef, {
            active: false,
            endDate: serverTimestamp(),
            updatedAt: serverTimestamp(),
            updatedById: userId,
        });

        return { success: true };
    } catch (error) {
        console.error("Error removing ward-department assignment:", error);
        throw error;
    }
};

// Get the primary department for a ward
export const getPrimaryDepartmentForWard = async (wardId) => {
    try {
        const wardRef = doc(db, "wards", wardId);
        const q = query(
            wardDeptAssignmentsCollection,
            where("ward", "==", wardRef),
            where("isPrimary", "==", true),
            where("active", "==", true),
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const data = querySnapshot.docs[0].data();

        // Get department data
        let departmentData = null;
        if (data.department) {
            departmentData = await formatReferenceField(data.department);
        }

        return {
            id: querySnapshot.docs[0].id,
            department: departmentData
                ? {
                      id: departmentData.id,
                      name: departmentData.name,
                      code: departmentData.code,
                      color: departmentData.color || "#3273dc",
                  }
                : null,
            isPrimary: true,
            startDate: formatFirestoreTimestamp(data.startDate),
        };
    } catch (error) {
        console.error("Error getting primary department for ward:", error);
        throw error;
    }
};

// Get all wards for a department
export const getWardsForDepartment = async (departmentId) => {
    try {
        const departmentRef = doc(db, "departments", departmentId);
        const q = query(
            wardDeptAssignmentsCollection,
            where("department", "==", departmentRef),
            where("active", "==", true),
        );

        const querySnapshot = await getDocs(q);
        const wards = [];

        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();

            // Get ward data
            let wardData = null;
            if (data.ward) {
                wardData = await formatReferenceField(data.ward);
            }

            if (wardData) {
                wards.push({
                    id: wardData.id,
                    name: wardData.name,
                    code: wardData.code,
                    isPrimary: data.isPrimary || false,
                    assignmentId: docSnapshot.id,
                });
            }
        }

        return wards;
    } catch (error) {
        console.error("Error getting wards for department:", error);
        throw error;
    }
};
