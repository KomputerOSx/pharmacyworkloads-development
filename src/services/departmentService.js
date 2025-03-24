// // src/services/departmentService.js
// import {
//     addDoc,
//     collection,
//     deleteDoc,
//     doc,
//     getDoc,
//     getDocs,
//     orderBy,
//     query,
//     serverTimestamp,
//     updateDoc,
//     where,
// } from "firebase/firestore";
// import { db } from "./firebase";
// import {
//     formatFirestoreTimestamp,
//     formatReferenceField,
// } from "@/utils/firestoreUtil";
// import {
//     assignDepartmentToHospital,
//     cleanupDepHospAss,
//     getDepartmentHospitalAssignment,
//     removeDepartmentAssignment,
// } from "@/services/departmentAssignmentService";
//
// const departmentsCollection = collection(db, "departments");
//
// // Helper function to format reference fields to usable data
//
// // Get all departments with optional filters
// export const getDepartments = async (organisationId) => {
//     try {
//         const organisationRef = doc(db, "organisations", organisationId);
//
//         // Step 1: Get all hospital assignments for this organisation
//         const hospitalAssignmentsQuery = query(
//             collection(db, "hospital_organisation_assignments"),
//             where("organisation", "==", organisationRef),
//         );
//
//         const hospitalAssignmentsSnapshot = await getDocs(
//             hospitalAssignmentsQuery,
//         );
//
//         // Step 2: Collect unique hospital references
//         const uniqueHospitalIds = new Set();
//         const hospitalRefs = [];
//
//         hospitalAssignmentsSnapshot.docs.forEach((doc) => {
//             const data = doc.data();
//             if (data.hospital) {
//                 const hospitalId = data.hospital.path.split("/").pop();
//                 // Only add if we haven't seen this hospital yet
//                 if (!uniqueHospitalIds.has(hospitalId)) {
//                     uniqueHospitalIds.add(hospitalId);
//                     hospitalRefs.push(data.hospital);
//                 }
//             }
//         });
//
//         // Step 3: For each hospital, get its departments
//         const departments = [];
//         const processedDepartmentIds = new Set(); // To handle potential duplicates
//
//         for (const hospitalRef of hospitalRefs) {
//             // Query all departments for this hospital
//             const departmentsQuery = query(
//                 collection(db, "department_hospital_assignments"),
//                 where("hospital", "==", hospitalRef),
//             );
//
//             const departmentsSnapshot = await getDocs(departmentsQuery);
//
//             // Add each department to our result set (avoiding duplicates)
//             departmentsSnapshot.docs.forEach((departmentDoc) => {
//                 const departmentId = departmentDoc.id;
//
//                 // Skip if we've already processed this department
//                 if (processedDepartmentIds.has(departmentId)) return;
//
//                 processedDepartmentIds.add(departmentId);
//
//                 const data = departmentDoc.data();
//                 departments.push({
//                     id: departmentId,
//                     ...data,
//                     hospitalId: hospitalRef.path.split("/").pop(), // Include the hospital ID
//                     createdAt: formatFirestoreTimestamp(data.createdAt),
//                     updatedAt: formatFirestoreTimestamp(data.updatedAt),
//                 });
//             });
//         }
//
//         return departments;
//     } catch (error) {
//         console.error("Error getting departments by organisation:", error);
//         throw error;
//     }
// };
//
// // Get a single department by ID
// export const getDepartment = async (id) => {
//     try {
//         const docRef = doc(db, "departments", id);
//         const docSnap = await getDoc(docRef);
//
//         if (docSnap.exists()) {
//             const data = docSnap.data();
//
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
//         console.error("Error getting Department:", error);
//         throw error;
//     }
// };
//
// // Get department children (Sub-Departments)
// export const getDepartmentChildren = async (departmentId) => {
//     try {
//         if (!departmentId) return [];
//
//         const departmentRef = doc(db, "departments", departmentId);
//         const q = query(
//             departmentsCollection,
//             where("parent", "==", departmentRef),
//             orderBy("name"),
//         );
//
//         const querySnapshot = await getDocs(q);
//
//         // Convert to array of data objects with IDs
//         const departments = [];
//
//         for (const docSnapshot of querySnapshot.docs) {
//             const data = docSnapshot.data();
//
//             // Get hospital data from reference
//             let hospitalData = null;
//             if (data.hospital) {
//                 hospitalData = await formatReferenceField(data.hospital);
//             }
//
//             departments.push({
//                 id: docSnapshot.id,
//                 ...data,
//                 hospital: hospitalData || { id: "", name: "Unknown" },
//                 parent: { id: departmentId, name: "Parent Department" }, // simplified parent info
//                 createdAt: formatFirestoreTimestamp(data.createdAt),
//                 updatedAt: formatFirestoreTimestamp(data.updatedAt),
//             });
//         }
//
//         return departments;
//     } catch (error) {
//         console.error("Error getting department children:", error);
//         throw error;
//     }
// };
//
// // Add a new department
// // Add a new department and link it to a hospital
// export const addDepartment = async (
//     departmentData,
//     hospitalId,
//     userId = "system",
// ) => {
//     try {
//         // Validate hospital is provided
//         if (!hospitalId) {
//             throw new Error("Hospital is required to create a department");
//         }
//
//         // Format parent reference if provided
//         let parentRef = null;
//         if (departmentData.parent && departmentData.parent.id) {
//             parentRef = doc(db, "departments", departmentData.parent.id);
//         }
//
//         // Extract fields that shouldn't go directly to the department document
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         const { hospital, parent, ...otherData } = departmentData;
//
//         // Add timestamps and audit fields for the department
//         const dataToAdd = {
//             ...otherData,
//             parent: parentRef, // Include parent reference if available
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             createdById: userId,
//             updatedById: userId,
//         };
//
//         // Add the department to the collection (without hospital reference)
//         const docRef = await addDoc(departmentsCollection, dataToAdd);
//         const departmentId = docRef.id;
//
//         // Create the hospital assignment
//         try {
//             await assignDepartmentToHospital(departmentId, hospitalId, userId);
//         } catch (assignmentError) {
//             // If assignment fails, delete the department and throw error
//             console.error(
//                 "Error creating department-hospital assignment:",
//                 assignmentError,
//             );
//             await deleteDoc(doc(db, "departments", departmentId));
//             throw new Error(
//                 "Failed to assign department to hospital. Department creation aborted.",
//             );
//         }
//
//         // Return the created department with its new ID
//         return {
//             id: departmentId,
//             ...departmentData,
//             hospitalId, // Include the hospital ID in the returned object
//         };
//     } catch (error) {
//         console.error("Error adding department:", error);
//         throw error;
//     }
// };
//
// // Update an existing department
// export const updateDepartment = async (
//     id,
//     hospitalId,
//     data,
//     userId = "system",
// ) => {
//     try {
//         const departmentRef = doc(db, "departments", id);
//
//         // Format parent reference if provided
//         let parentRef = null;
//         if (data.parent && data.parent.id) {
//             parentRef = doc(db, "departments", data.parent.id);
//
//             // Prevent circular parent references
//             if (data.parent.id === id) {
//                 console.error("Department cannot be its own parent");
//                 parentRef = null;
//             }
//         }
//
//         // Extract data that shouldn't go directly to update
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         const { hospital, parent, ...otherData } = data;
//
//         // Add update timestamp and audit field
//         const dataToUpdate = {
//             ...otherData,
//             parent: parentRef,
//             updatedAt: serverTimestamp(),
//             updatedById: userId,
//         };
//
//         console.log("Department data being sent to Firestore:", dataToUpdate);
//
//         // Update the department document
//         console.log("Before update:", await getDepartment(id));
//         await updateDoc(departmentRef, dataToUpdate);
//         console.log("After update:", await getDepartment(id));
//
//         // Handle hospital assignment if hospital ID is provided
//         if (hospitalId) {
//             // Clean up any existing assignments and get the current one (if any)
//             // this is the Department cleanup function
//             const existingAssignment = await cleanupDepHospAss(id, hospitalId);
//
//             if (existingAssignment) {
//                 // Update the existing assignment
//                 console.log(
//                     `Updating existing assignment ${existingAssignment.id}`,
//                 );
//                 await updateDoc(
//                     doc(
//                         db,
//                         "department_hospital_assignments",
//                         existingAssignment.id,
//                     ),
//                     {
//                         updatedAt: serverTimestamp(),
//                         updatedById: userId,
//                         active: true, // Ensure it's marked as active
//                     },
//                 );
//             } else {
//                 // No existing assignment, create a new one
//                 console.log(
//                     `Creating new assignment for department ${id} and hospital ${hospitalId}`,
//                 );
//                 await assignDepartmentToHospital(id, hospitalId, userId);
//             }
//         }
//
//         // Fetch the updated department to return complete data
//         const updatedDepartmentDoc = await getDoc(departmentRef);
//
//         if (!updatedDepartmentDoc.exists()) {
//             throw new Error(`Department with ID ${id} not found after update`);
//         }
//
//         const departmentData = updatedDepartmentDoc.data();
//
//         // Return the updated department data
//         return {
//             id,
//             ...departmentData,
//             createdAt: formatFirestoreTimestamp(departmentData.createdAt),
//             updatedAt: formatFirestoreTimestamp(departmentData.updatedAt),
//             hospitalId: hospitalId, // Include the hospital ID in the response
//         };
//     } catch (error) {
//         console.error("Error updating department:", error);
//         throw error;
//     }
// };
//
// // Delete a department
// export const deleteDepartment = async (id) => {
//     try {
//         // TODO: Consider checking if there are any departments/wards linked to this hospital
//         // and prevent deletion if there are (or implement cascading delete)
//
//         // First, get and delete any organisation assignments
//         const assignments = await getDepartmentHospitalAssignment(id);
//
//         // Delete each organisation assignment
//         for (const assignment of assignments) {
//             await removeDepartmentAssignment(assignment.id);
//         }
//
//         // Then delete the hospital
//         const departmentRef = doc(db, "departments", id);
//         await deleteDoc(departmentRef);
//
//         return { success: true, id };
//     } catch (error) {
//         console.error("Error deleting hospital:", error);
//         throw error;
//     }
// };
//
// // Get department types (for dropdowns)
// export const getDepartmentTypes = () => {
//     return [
//         { id: "pharmacy", name: "Pharmacy" },
//         { id: "clinical", name: "Clinical" },
//         { id: "outpatient", name: "Outpatient" },
//         { id: "inpatient", name: "Inpatient" },
//         { id: "medical", name: "Medical" },
//         { id: "porters", name: "Porters" },
//         { id: "catering", name: "Catering" },
//         { id: "admin", name: "Administration" },
//         { id: "other", name: "Other" },
//     ];
// };
//
// // Check if a department has root-level access
// export const isRootDepartment = async (departmentId) => {
//     try {
//         const docRef = doc(db, "departments", departmentId);
//         const docSnap = await getDoc(docRef);
//
//         if (docSnap.exists()) {
//             const data = docSnap.data();
//             return data.parent === null;
//         }
//
//         return false;
//     } catch (error) {
//         console.error("Error checking if department is root:", error);
//         return false;
//     }
// };

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
import {
    formatFirestoreTimestamp,
    formatReferenceField,
} from "@/utils/firestoreUtil";
import {
    assignDepartmentToHospital,
    cleanupDepHospAss,
    getDepartmentHospitalAssignment,
    removeDepartmentAssignment,
} from "@/services/departmentAssignmentService";

const departmentsCollection = collection(db, "departments");

// Helper function to format reference fields to usable data

// DEBUGGING VERSION - Get all departments with optional filters
export const getDepartments = async (organisationId) => {
    try {
        console.log(
            "[DEPT SERVICE] Getting departments for org:",
            organisationId,
        );

        if (!organisationId || organisationId === "all") {
            console.warn(
                "[DEPT SERVICE] Invalid organisation ID:",
                organisationId,
            );
            return [];
        }

        // Direct approach - query departments collection directly
        try {
            console.log("[DEPT SERVICE] Trying direct departments query");
            const directQuery = query(departmentsCollection);
            const directSnapshot = await getDocs(directQuery);

            console.log(
                `[DEPT SERVICE] Found ${directSnapshot.docs.length} departments directly`,
            );

            if (directSnapshot.docs.length > 0) {
                const departments = [];

                directSnapshot.docs.forEach((doc) => {
                    const data = doc.data();
                    departments.push({
                        id: doc.id,
                        ...data,
                        createdAt: formatFirestoreTimestamp(data.createdAt),
                        updatedAt: formatFirestoreTimestamp(data.updatedAt),
                    });
                });

                console.log(
                    "[DEPT SERVICE] Returning departments found directly:",
                    departments,
                );
                return departments;
            }
        } catch (directErr) {
            console.error("[DEPT SERVICE] Error with direct query:", directErr);
        }

        // Original approach using organisation
        const organisationRef = doc(db, "organisations", organisationId);
        console.log("[DEPT SERVICE] Organisation reference:", organisationRef);

        // Step 1: Get all hospital assignments for this organisation
        const hospitalAssignmentsQuery = query(
            collection(db, "hospital_organisation_assignments"),
            where("organisation", "==", organisationRef),
        );

        const hospitalAssignmentsSnapshot = await getDocs(
            hospitalAssignmentsQuery,
        );

        console.log(
            `[DEPT SERVICE] Found ${hospitalAssignmentsSnapshot.docs.length} hospital assignments`,
        );

        // Step 2: Collect unique hospital references
        const uniqueHospitalIds = new Set();
        const hospitalRefs = [];

        hospitalAssignmentsSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.hospital) {
                const hospitalId = data.hospital.path.split("/").pop();
                // Only add if we haven't seen this hospital yet
                if (!uniqueHospitalIds.has(hospitalId)) {
                    uniqueHospitalIds.add(hospitalId);
                    hospitalRefs.push(data.hospital);
                }
            }
        });

        console.log(`[DEPT SERVICE] Unique hospitals: ${hospitalRefs.length}`);
        console.log(
            "[DEPT SERVICE] Hospital IDs:",
            Array.from(uniqueHospitalIds),
        );

        // Step 3: For each hospital, get its departments
        const departments = [];
        const processedDepartmentIds = new Set(); // To handle potential duplicates

        for (const hospitalRef of hospitalRefs) {
            const hospitalId = hospitalRef.path.split("/").pop();
            console.log(
                `[DEPT SERVICE] Getting departments for hospital: ${hospitalId}`,
            );

            // Query all departments for this hospital
            const departmentsQuery = query(
                collection(db, "department_hospital_assignments"),
                where("hospital", "==", hospitalRef),
            );

            const departmentsSnapshot = await getDocs(departmentsQuery);
            console.log(
                `[DEPT SERVICE] Found ${departmentsSnapshot.docs.length} department assignments for hospital ${hospitalId}`,
            );

            // Add each department to our result set (avoiding duplicates)
            for (const assignmentDoc of departmentsSnapshot.docs) {
                const assignmentData = assignmentDoc.data();

                if (!assignmentData.department) {
                    console.warn(
                        `[DEPT SERVICE] Missing department reference in assignment ${assignmentDoc.id}`,
                    );
                    continue;
                }

                const departmentRef = assignmentData.department;
                const departmentId = departmentRef.path.split("/").pop();

                // Skip if we've already processed this department
                if (processedDepartmentIds.has(departmentId)) {
                    console.log(
                        `[DEPT SERVICE] Skipping duplicate department: ${departmentId}`,
                    );
                    continue;
                }

                console.log(
                    `[DEPT SERVICE] Fetching department: ${departmentId}`,
                );

                try {
                    const departmentDoc = await getDoc(departmentRef);

                    if (departmentDoc.exists()) {
                        const departmentData = departmentDoc.data();
                        processedDepartmentIds.add(departmentId);

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
                            `[DEPT SERVICE] Successfully added department: ${departmentId}, name: ${departmentData.name || "No Name"}`,
                        );
                    } else {
                        console.warn(
                            `[DEPT SERVICE] Department document not found: ${departmentId}`,
                        );
                    }
                } catch (deptErr) {
                    console.error(
                        `[DEPT SERVICE] Error getting department ${departmentId}:`,
                        deptErr,
                    );
                }
            }
        }

        console.log(
            `[DEPT SERVICE] Returning ${departments.length} departments`,
        );
        return departments;
    } catch (error) {
        console.error(
            "[DEPT SERVICE] Error getting departments by organisation:",
            error,
        );
        return []; // Return empty array instead of throwing
    }
};

// Get a single department by ID
export const getDepartment = async (id) => {
    try {
        console.log("[DEPT SERVICE] Getting department by ID:", id);
        const docRef = doc(db, "departments", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("[DEPT SERVICE] Department found:", data);

            return {
                id: docSnap.id,
                ...data,
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            };
        } else {
            console.warn("[DEPT SERVICE] Department not found:", id);
            return null;
        }
    } catch (error) {
        console.error("[DEPT SERVICE] Error getting Department:", error);
        return null; // Return null instead of throwing
    }
};

// Get department children (Sub-Departments)
export const getDepartmentChildren = async (departmentId) => {
    try {
        if (!departmentId) return [];

        console.log(
            "[DEPT SERVICE] Getting children for department:",
            departmentId,
        );
        const departmentRef = doc(db, "departments", departmentId);
        const q = query(
            departmentsCollection,
            where("parent", "==", departmentRef),
            orderBy("name"),
        );

        const querySnapshot = await getDocs(q);
        console.log(
            `[DEPT SERVICE] Found ${querySnapshot.docs.length} child departments`,
        );

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
        console.error(
            "[DEPT SERVICE] Error getting department children:",
            error,
        );
        return []; // Return empty array instead of throwing
    }
};

// Add a new department
// Add a new department and link it to a hospital
export const addDepartment = async (
    departmentData,
    hospitalId,
    userId = "system",
) => {
    try {
        // Validate hospital is provided
        if (!hospitalId) {
            throw new Error("Hospital is required to create a department");
        }

        console.log("[DEPT SERVICE] Adding department:", departmentData);
        console.log("[DEPT SERVICE] Hospital ID:", hospitalId);

        // Format parent reference if provided
        let parentRef = null;
        if (departmentData.parent && departmentData.parent.id) {
            parentRef = doc(db, "departments", departmentData.parent.id);
        }

        // Extract fields that shouldn't go directly to the department document
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hospital, parent, ...otherData } = departmentData;

        // Add timestamps and audit fields for the department
        const dataToAdd = {
            ...otherData,
            parent: parentRef, // Include parent reference if available
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        console.log("[DEPT SERVICE] Data being added to Firestore:", dataToAdd);

        // Add the department to the collection (without hospital reference)
        const docRef = await addDoc(departmentsCollection, dataToAdd);
        const departmentId = docRef.id;
        console.log("[DEPT SERVICE] Created department with ID:", departmentId);

        // Create the hospital assignment
        try {
            console.log("[DEPT SERVICE] Creating hospital assignment...");
            await assignDepartmentToHospital(departmentId, hospitalId, userId);
            console.log(
                "[DEPT SERVICE] Hospital assignment created successfully",
            );
        } catch (assignmentError) {
            // If assignment fails, delete the department and throw error
            console.error(
                "[DEPT SERVICE] Error creating department-hospital assignment:",
                assignmentError,
            );
            await deleteDoc(doc(db, "departments", departmentId));
            throw new Error(
                "Failed to assign department to hospital. Department creation aborted.",
            );
        }

        // Return the created department with its new ID
        const result = {
            id: departmentId,
            ...departmentData,
            hospitalId, // Include the hospital ID in the returned object
        };

        console.log("[DEPT SERVICE] Returning new department:", result);
        return result;
    } catch (error) {
        console.error("[DEPT SERVICE] Error adding department:", error);
        throw error;
    }
};

// Update an existing department
export const updateDepartment = async (
    id,
    hospitalId,
    data,
    userId = "system",
) => {
    try {
        console.log("[DEPT SERVICE] Updating department:", id);
        console.log("[DEPT SERVICE] Hospital ID:", hospitalId);
        console.log("[DEPT SERVICE] Department data:", data);

        const departmentRef = doc(db, "departments", id);

        // Format parent reference if provided
        let parentRef = null;
        if (data.parent && data.parent.id) {
            parentRef = doc(db, "departments", data.parent.id);

            // Prevent circular parent references
            if (data.parent.id === id) {
                console.error(
                    "[DEPT SERVICE] Department cannot be its own parent",
                );
                parentRef = null;
            }
        }

        // Extract data that shouldn't go directly to update
        const {
            hospital,
            parent,
            children, // Explicitly exclude children
            hospitalId: dataHospitalId, // Also exclude hospitalId
            createdAt,
            updatedAt,
            ...otherData
        } = data;

        const cleanData = Object.entries(otherData).reduce(
            (acc, [key, value]) => {
                // Only include defined values
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            },
            {},
        );
        // Add update timestamp and audit field
        const dataToUpdate = {
            ...cleanData,
            parent: parentRef,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        console.log(
            "[DEPT SERVICE] Department data being sent to Firestore:",
            dataToUpdate,
        );

        // Update the department document
        console.log("[DEPT SERVICE] Before update:", await getDepartment(id));
        await updateDoc(departmentRef, dataToUpdate);
        console.log("[DEPT SERVICE] After update:", await getDepartment(id));

        // Handle hospital assignment if hospital ID is provided
        if (hospitalId) {
            // Clean up any existing assignments and get the current one (if any)
            // this is the Department cleanup function
            console.log("[DEPT SERVICE] Managing hospital assignment...");
            const existingAssignment = await cleanupDepHospAss(id, hospitalId);

            if (existingAssignment) {
                // Update the existing assignment
                console.log(
                    `[DEPT SERVICE] Updating existing assignment ${existingAssignment.id}`,
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
            } else {
                // No existing assignment, create a new one
                console.log(
                    `[DEPT SERVICE] Creating new assignment for department ${id} and hospital ${hospitalId}`,
                );
                await assignDepartmentToHospital(id, hospitalId, userId);
            }
        }

        // Fetch the updated department to return complete data
        const updatedDepartmentDoc = await getDoc(departmentRef);

        if (!updatedDepartmentDoc.exists()) {
            throw new Error(`Department with ID ${id} not found after update`);
        }

        const departmentData = updatedDepartmentDoc.data();

        // Return the updated department data
        const result = {
            id,
            ...departmentData,
            createdAt: formatFirestoreTimestamp(departmentData.createdAt),
            updatedAt: formatFirestoreTimestamp(departmentData.updatedAt),
            hospitalId: hospitalId, // Include the hospital ID in the response
        };

        console.log("[DEPT SERVICE] Returning updated department:", result);
        return result;
    } catch (error) {
        console.error("[DEPT SERVICE] Error updating department:", error);
        throw error;
    }
};

// Delete a department
export const deleteDepartment = async (id) => {
    try {
        console.log("[DEPT SERVICE] Deleting department:", id);

        // TODO: Consider checking if there are any departments/wards linked to this hospital
        // and prevent deletion if there are (or implement cascading delete)

        // First, get and delete any organisation assignments
        const assignments = await getDepartmentHospitalAssignment(id);
        console.log(
            `[DEPT SERVICE] Found ${assignments.length} hospital assignments to delete`,
        );

        // Delete each organisation assignment
        for (const assignment of assignments) {
            console.log(`[DEPT SERVICE] Deleting assignment: ${assignment.id}`);
            await removeDepartmentAssignment(assignment.id);
        }

        // Then delete the hospital
        const departmentRef = doc(db, "departments", id);
        await deleteDoc(departmentRef);
        console.log("[DEPT SERVICE] Department deleted successfully");

        return { success: true, id };
    } catch (error) {
        console.error("[DEPT SERVICE] Error deleting hospital:", error);
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
        console.error(
            "[DEPT SERVICE] Error checking if department is root:",
            error,
        );
        return false;
    }
};
