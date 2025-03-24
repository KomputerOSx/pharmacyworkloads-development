// //src/services/departmentAssignmentService.js
// import {
//     addDoc,
//     collection,
//     doc,
//     getDocs,
//     query,
//     where,
//     serverTimestamp,
//     updateDoc,
//     deleteDoc,
// } from "firebase/firestore";
// import { db } from "./firebase.js";
// import {
//     cleanupHosOrgAss,
//     removeHospitalAssignment,
// } from "./hospitalAssignmentService";
//
// export const assignDepartmentToHospital = async (
//     departmentId,
//     hospitalId,
//     userId = "system",
// ) => {
//     try {
//         const departmentRef = doc(db, "departments", departmentId);
//         const hospitalRef = doc(db, "hospitals", hospitalId);
//
//         // Clean up any existing assignments first
//         const existingAssignment = await cleanupHosOrgAss(
//             departmentId,
//             hospitalId,
//         );
//
//         if (existingAssignment) {
//             // Update the existing assignment
//             await updateDoc(
//                 doc(
//                     db,
//                     "department_hospital_assignments",
//                     existingAssignment.id,
//                 ),
//                 {
//                     updatedAt: serverTimestamp(),
//                     updatedById: userId,
//                 },
//             );
//             return { id: existingAssignment.id };
//         }
//
//         // No existing assignment, create a new one
//         const assignmentData = {
//             department: departmentRef,
//             hospital: hospitalRef,
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             createdById: userId,
//             updatedById: userId,
//         };
//
//         const docRef = await addDoc(
//             collection(db, "department_hospital_assignments"),
//             assignmentData,
//         );
//
//         return { id: docRef.id };
//     } catch (err) {
//         console.error("Error assigning Department to Hospital:", err);
//         throw err;
//     }
// };
//
// export const getDepartmentHospitalAssignment = async (departmentId) => {
//     try {
//         const assignments = await getDocs(
//             query(
//                 collection(db, "department_hospital_assignments"),
//                 where("department", "==", doc(db, "departments", departmentId)),
//             ),
//         );
//         return assignments.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//         }));
//     } catch (err) {
//         console.error("Error fetching Department assignments:", err);
//         throw err;
//     }
// };
//
// export const removeDepartmentAssignment = async (assignmentId) => {
//     try {
//         await deleteDoc(
//             doc(db, "department_hospital_assignments", assignmentId),
//         );
//     } catch (err) {
//         console.error("Error deleting department assignment:", err);
//         throw err;
//     }
// };
//
// export const cleanupDepHospAss = async (departmentId, hospitalId) => {
//     try {
//         const departmentRef = doc(db, "departments", departmentId);
//         const hospitalRef = doc(db, "hospitals", hospitalId);
//
//         // Find all existing assignments for this hospital-org pair
//         const existingQuery = query(
//             collection(db, "department_hospital_assignments"),
//             where("department", "==", departmentRef),
//             where("hospital", "==", hospitalRef),
//         );
//
//         const existingSnapshot = await getDocs(existingQuery);
//
//         if (existingSnapshot.empty) {
//             // No existing assignments found
//             return null;
//         }
//
//         if (existingSnapshot.docs.length === 1) {
//             // Only one assignment exists, return it
//             return {
//                 id: existingSnapshot.docs[0].id,
//                 data: existingSnapshot.docs[0].data(),
//             };
//         }
//
//         // Multiple assignments found, keep the oldest and delete the rest
//         const assignments = existingSnapshot.docs.map((doc) => ({
//             id: doc.id,
//             data: doc.data(),
//             createdAt: doc.data().createdAt,
//         }));
//
//         // Sort by createdAt (oldest first)
//         assignments.sort((a, b) => {
//             if (!a.createdAt) return 1;
//             if (!b.createdAt) return -1;
//             return a.createdAt.seconds - b.createdAt.seconds;
//         });
//
//         // Keep the oldest assignment
//         const keepAssignment = assignments[0];
//         console.log(
//             `Keeping assignment ${keepAssignment.id} for hospital ${departmentId} and org ${hospitalId}`,
//         );
//
//         // Delete all other assignments
//         for (let i = 1; i < assignments.length; i++) {
//             console.log(`Deleting duplicate assignment ${assignments[i].id}`);
//             await removeHospitalAssignment(assignments[i].id);
//         }
//
//         return keepAssignment;
//     } catch (error) {
//         console.error("Error cleaning up hospital assignments:", error);
//         throw error;
//     }
// };

// src/services/departmentAssignmentService.js
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
import { db } from "./firebase";
import { formatFirestoreTimestamp } from "@/utils/firestoreUtil";

const assignmentsCollection = collection(db, "department_hospital_assignments");

// Assign a department to a hospital
export const assignDepartmentToHospital = async (
    departmentId,
    hospitalId,
    userId = "system",
) => {
    try {
        console.log("[ASSIGN] Assigning department to hospital");
        console.log("[ASSIGN] Department ID:", departmentId);
        console.log("[ASSIGN] Hospital ID:", hospitalId);

        if (!departmentId || !hospitalId) {
            console.error("[ASSIGN] Missing required IDs");
            throw new Error("Both department ID and hospital ID are required");
        }

        const departmentRef = doc(db, "departments", departmentId);
        const hospitalRef = doc(db, "hospitals", hospitalId);

        // Check if department exists
        const departmentDoc = await getDoc(departmentRef);
        if (!departmentDoc.exists()) {
            console.error("[ASSIGN] Department does not exist:", departmentId);
            throw new Error(
                `Department with ID ${departmentId} does not exist`,
            );
        }

        // Check if hospital exists
        const hospitalDoc = await getDoc(hospitalRef);
        if (!hospitalDoc.exists()) {
            console.error("[ASSIGN] Hospital does not exist:", hospitalId);
            throw new Error(`Hospital with ID ${hospitalId} does not exist`);
        }

        console.log(
            "[ASSIGN] Both department and hospital exist, proceeding with assignment",
        );

        // Clean up any existing assignments first
        const existingAssignment = await cleanupDepHospAss(
            departmentId,
            hospitalId,
        );

        if (existingAssignment) {
            // Update the existing assignment
            console.log(
                "[ASSIGN] Updating existing assignment:",
                existingAssignment.id,
            );

            await updateDoc(
                doc(
                    db,
                    "department_hospital_assignments",
                    existingAssignment.id,
                ),
                {
                    updatedAt: serverTimestamp(),
                    updatedById: userId,
                    active: true, // Ensure it's marked as active
                },
            );

            console.log("[ASSIGN] Assignment updated successfully");
            return { id: existingAssignment.id };
        }

        console.log("[ASSIGN] Creating new assignment");

        // No existing assignment, create a new one
        const assignmentData = {
            department: departmentRef,
            hospital: hospitalRef,
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(assignmentsCollection, assignmentData);
        console.log("[ASSIGN] New assignment created with ID:", docRef.id);

        return { id: docRef.id };
    } catch (err) {
        console.error("[ASSIGN] Error assigning department to hospital:", err);
        throw err;
    }
};

// Get all hospital assignments for a department
export const getDepartmentHospitalAssignment = async (departmentId) => {
    try {
        console.log(
            "[ASSIGN] Getting hospital assignments for department:",
            departmentId,
        );

        if (!departmentId) {
            console.warn("[ASSIGN] No department ID provided");
            return [];
        }

        const departmentRef = doc(db, "departments", departmentId);

        const q = query(
            assignmentsCollection,
            where("department", "==", departmentRef),
            where("active", "==", true),
        );

        const assignments = await getDocs(q);
        console.log(
            `[ASSIGN] Found ${assignments.docs.length} hospital assignments`,
        );

        const result = assignments.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Get hospital ID from reference path
            hospitalId: doc.data().hospital
                ? doc.data().hospital.path.split("/").pop()
                : null,
        }));

        console.log("[ASSIGN] Processed assignments:", result);
        return result;
    } catch (err) {
        console.error("[ASSIGN] Error fetching department assignments:", err);
        return []; // Return empty array instead of throwing
    }
};

// Get departments by hospital
export const getDepartmentsByHospital = async (hospitalId) => {
    try {
        console.log("[ASSIGN] Getting departments for hospital:", hospitalId);

        if (!hospitalId) {
            console.warn("[ASSIGN] No hospital ID provided");
            return [];
        }

        const hospitalRef = doc(db, "hospitals", hospitalId);

        // Get all assignments for this hospital
        const assignmentsQuery = query(
            assignmentsCollection,
            where("hospital", "==", hospitalRef),
            where("active", "==", true),
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        console.log(
            `[ASSIGN] Found ${assignmentsSnapshot.docs.length} department assignments`,
        );

        // Use a Set to track unique department IDs
        const uniqueDepartmentIds = new Set();
        const departments = [];

        for (const assignmentDoc of assignmentsSnapshot.docs) {
            const data = assignmentDoc.data();

            if (!data.department) {
                console.warn(
                    `[ASSIGN] Missing department reference in assignment ${assignmentDoc.id}`,
                );
                continue;
            }

            const departmentId = data.department.path.split("/").pop();

            // Only process each department once
            if (uniqueDepartmentIds.has(departmentId)) {
                continue;
            }

            uniqueDepartmentIds.add(departmentId);
            console.log(`[ASSIGN] Processing department: ${departmentId}`);

            try {
                const departmentDoc = await getDoc(data.department);

                if (departmentDoc.exists()) {
                    const departmentData = departmentDoc.data();
                    departments.push({
                        id: departmentId,
                        ...departmentData,
                        hospitalId: hospitalId,
                        createdAt: formatFirestoreTimestamp(
                            departmentData.createdAt,
                        ),
                        updatedAt: formatFirestoreTimestamp(
                            departmentData.updatedAt,
                        ),
                    });

                    console.log(
                        `[ASSIGN] Added department: ${departmentId}, name: ${departmentData.name || "No Name"}`,
                    );
                } else {
                    console.warn(
                        `[ASSIGN] Department ${departmentId} does not exist`,
                    );
                }
            } catch (deptErr) {
                console.error(
                    `[ASSIGN] Error fetching department ${departmentId}:`,
                    deptErr,
                );
            }
        }

        console.log(`[ASSIGN] Returning ${departments.length} departments`);
        return departments;
    } catch (error) {
        console.error("[ASSIGN] Error getting departments by hospital:", error);
        return []; // Return empty array instead of throwing
    }
};

// Remove a department assignment (unlink from hospital)
export const removeDepartmentAssignment = async (assignmentId) => {
    try {
        console.log("[ASSIGN] Removing department assignment:", assignmentId);

        if (!assignmentId) {
            console.warn("[ASSIGN] No assignment ID provided");
            return;
        }

        await deleteDoc(
            doc(db, "department_hospital_assignments", assignmentId),
        );
        console.log("[ASSIGN] Assignment removed successfully");
    } catch (err) {
        console.error("[ASSIGN] Error deleting department assignment:", err);
        throw err;
    }
};

// Cleanup existing assignments - returns the assignment to keep
export const cleanupDepHospAss = async (departmentId, hospitalId) => {
    try {
        console.log("[ASSIGN] Cleaning up department assignments");
        console.log("[ASSIGN] Department ID:", departmentId);
        console.log("[ASSIGN] Hospital ID:", hospitalId);

        if (!departmentId || !hospitalId) {
            console.error("[ASSIGN] Missing required IDs");
            return null;
        }

        const departmentRef = doc(db, "departments", departmentId);
        const hospitalRef = doc(db, "hospitals", hospitalId);

        // Find existing assignments for this department-hospital pair
        const existingQuery = query(
            assignmentsCollection,
            where("department", "==", departmentRef),
            where("hospital", "==", hospitalRef),
        );

        const existingSnapshot = await getDocs(existingQuery);
        console.log(
            `[ASSIGN] Found ${existingSnapshot.docs.length} existing assignments`,
        );

        if (existingSnapshot.empty) {
            // No existing assignments
            console.log("[ASSIGN] No existing assignments found");
            return null;
        }

        if (existingSnapshot.docs.length === 1) {
            // Only one assignment exists
            const assignment = {
                id: existingSnapshot.docs[0].id,
                data: existingSnapshot.docs[0].data(),
            };
            console.log("[ASSIGN] Found single assignment:", assignment.id);
            return assignment;
        }

        // Multiple assignments found, keep the oldest and delete the rest
        console.log("[ASSIGN] Multiple assignments found, keeping oldest");

        const assignments = existingSnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
            createdAt: doc.data().createdAt,
        }));

        // Sort by createdAt (oldest first)
        assignments.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return a.createdAt.seconds - b.createdAt.seconds;
        });

        // Keep the oldest assignment
        const keepAssignment = assignments[0];
        console.log("[ASSIGN] Keeping assignment:", keepAssignment.id);

        // Delete all other assignments
        for (let i = 1; i < assignments.length; i++) {
            console.log(
                "[ASSIGN] Deleting duplicate assignment:",
                assignments[i].id,
            );
            await removeDepartmentAssignment(assignments[i].id);
        }

        return keepAssignment;
    } catch (error) {
        console.error(
            "[ASSIGN] Error cleaning up department assignments:",
            error,
        );
        return null;
    }
};
