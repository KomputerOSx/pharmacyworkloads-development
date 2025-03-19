import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp,
    updateDoc,
    writeBatch,
    deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export const assignStaffToOrganization = async (
    staffId,
    organizationId,
    isPrimary = false,
    userId = "system",
) => {
    try {
        const staffRef = doc(db, "staff", staffId);
        const orgRef = doc(db, "organizations", organizationId);

        const existingQuery = query(
            collection(db, "staff_organization_assignments"),
            where("staff", "==", staffRef),
            where("organization", "==", organizationRef),
            where("active", "==", true),
        );

        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
            // Update existing assignment
            const existingDoc = existingSnapshot.docs[0];
            await updateDoc(
                doc(db, "staff_organization_assignments", existingDoc.id),
                {
                    isPrimary,
                    updatedAt: serverTimestamp(),
                    updatedById: userId,
                },
            );
            return { id: existingDoc.id, isPrimary };
        }

        if (isPrimary) {
            const primaryQuery = query(
                collection(db, "staff_organization_assignments"),
                where("staff", "==", staffRef),
                where("isPrimary", "==", true),
                where("active", "==", true),
            );

            const primarySnapshot = await getDocs(primaryQuery);
            if (!primarySnapshot.empty) {
                await updateDoc(
                    doc(
                        db,
                        "staff_organization_assignments",
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
        const assignmentData = {
            staff: staffRef,
            organization: orgRef,
            isPrimary,
            startDate: serverTimestamp(),
            endDate: null,
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(
            collection(db, "staff_organization_assignments"),
            assignmentData,
        );
        return { id: docRef.id, isPrimary };
    } catch (err) {
        console.error("Error assigning staff to organization:", err);
        throw err;
    }
};

export const assignStaffToHospital = async (
    staffId,
    hospitalId,
    isPrimary = false,
    userId = "system",
) => {
    try {
        const staffRef = doc(db, "staff", staffId);
        const hospitalRef = doc(db, "hospitals", hospitalId);

        const existingQuery = query(
            collection(db, "staff_hospital_assignments"),
            where("staff", "==", staffRef),
            where("hospital", "==", hospitalRef),
            where("active", "==", true),
        );

        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
            // Update existing assignment
            const existingDoc = existingSnapshot.docs[0];
            await updateDoc(
                doc(db, "staff_hospital_assignments", existingDoc.id),
                {
                    isPrimary,
                    updatedAt: serverTimestamp(),
                    updatedById: userId,
                },
            );
            return { id: existingDoc.id, isPrimary };
        }

        if (isPrimary) {
            const primaryQuery = query(
                collection(db, "staff_hospital_assignments"),
                where("staff", "==", staffRef),
                where("isPrimary", "==", true),
                where("active", "==", true),
            );

            const primarySnapshot = await getDocs(primaryQuery);
            if (!primarySnapshot.empty) {
                await updateDoc(
                    doc(
                        db,
                        "staff_hospital_assignments",
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
        const assignmentData = {
            staff: staffRef,
            hospital: hospitalRef,
            isPrimary,
            startDate: serverTimestamp(),
            endDate: null,
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(
            collection(db, "staff_hospital_assignments"),
            assignmentData,
        );
        return { id: docRef.id, isPrimary };
    } catch (err) {
        console.error("Error assigning staff to hospital:", err);
        throw err;
    }
};

export const assignStaffToDepartment = async (
    staffId,
    departmentId,
    role = "staff",
    departmentRole = "staff",
    isPrimary = false,
    userId = "system",
) => {
    try {
        const staffRef = doc(db, "staff", staffId);
        const departmentRef = doc(db, "departments", departmentId);

        const existingQuery = query(
            collection(db, "staff_department_assignments"),
            where("staff", "==", staffRef),
            where("department", "==", departmentRef),
            where("active", "==", true),
        );

        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
            // Update existing assignment
            const existingDoc = existingSnapshot.docs[0];
            await updateDoc(
                doc(db, "staff_department_assignments", existingDoc.id),
                {
                    role,
                    departmentRole,
                    isPrimary,
                    updatedAt: serverTimestamp(),
                    updatedById: userId,
                },
            );
            return { id: existingDoc.id, isPrimary };
        }

        if (isPrimary) {
            const primaryQuery = query(
                collection(db, "staff_department_assignments"),
                where("staff", "==", staffRef),
                where("isPrimary", "==", true),
                where("active", "==", true),
            );

            const primarySnapshot = await getDocs(primaryQuery);
            if (!primarySnapshot.empty) {
                await updateDoc(
                    doc(
                        db,
                        "staff_department_assignments",
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
        const assignmentData = {
            staff: staffRef,
            department: departmentRef,
            isPrimary,
            startDate: serverTimestamp(),
            endDate: null,
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        const docRef = await addDoc(
            collection(db, "staff_department_assignments"),
            assignmentData,
        );
        return { id: docRef.id, isPrimary };
    } catch (err) {
        console.error("Error assigning staff to hospital:", err);
        throw err;
    }
};

export const getStaffOrganizationAssignments = async (staffId) => {
    try {
        const assignments = await getDocs(
            query(
                collection(db, "staff_organization_assignments"),
                where("staff", "==", doc(db, "staff", staffId)),
                where("active", "==", true),
            ),
        );
        return assignments.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (err) {
        console.error("Error fetching staff organization assignments:", err);
        throw err;
    }
};

export const getStaffHospitalAssignments = async (staffId) => {
    try {
        const assignments = await getDocs(
            query(
                collection(db, "staff_hospital_assignments"),
                where("staff", "==", doc(db, "staff", staffId)),
                where("active", "==", true),
            ),
        );
        return assignments.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (err) {
        console.error("Error fetching staff hospital assignments:", err);
        throw err;
    }
};

export const getStaffDepartmentAssignments = async (staffId) => {
    try {
        const assignments = await getDocs(
            query(
                collection(db, "staff_department_assignments"),
                where("staff", "==", doc(db, "staff", staffId)),
                where("active", "==", true),
            ),
        );
        return assignments.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (err) {
        console.error("Error fetching staff department assignments:", err);
        if (err.code === "permission-denied") {
            return [];
        }
    }
};

export const getStaffAssignments = async (staffId) => {
    const organizationAssignments =
        await getStaffOrganizationAssignments(staffId);
    const hospitalAssignments = await getStaffHospitalAssignments(staffId);
    const departmentAssignments = await getStaffDepartmentAssignments(staffId);
    return {
        organizationAssignments,
        hospitalAssignments,
        departmentAssignments,
    };
};

export const setPrimaryHospital = async (staffId, assignmentId) => {
    try {
        // Get all hospital assignments for this staff member
        const assignmentsQuery = query(
            collection(db, "staff_hospital_assignments"),
            where("staff", "==", doc(db, "staff", staffId)),
            where("active", "==", true),
        );

        // Update all assignments to non-primary (using a batch for efficiency)
        const querySnapshot = await getDocs(assignmentsQuery);
        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
            batch.update(doc.ref, {
                isPrimary: false,
                updatedAt: serverTimestamp(),
            });
        });

        // Set the selected assignment as primary
        batch.update(doc(db, "staff_hospital_assignments", assignmentId), {
            isPrimary: true,
            updatedAt: serverTimestamp(),
        });

        // Commit all updates
        await batch.commit();
    } catch (err) {
        console.error("Error setting primary hospital:", err);
        throw err;
    }
};

export const removeStaffOrganizationAssignment = async (assignmentId) => {
    try {
        await deleteDoc(
            doc(db, "staff_organization_assignments", assignmentId),
        );
    } catch (err) {
        console.error("Error deleting staff assignment:", err);
        throw err;
    }
};
export const removeStaffHospitalAssignment = async (assignmentId) => {
    try {
        await deleteDoc(doc(db, "staff_hospital_assignments", assignmentId));
    } catch (err) {
        console.error("Error deleting staff assignment:", err);
        throw err;
    }
};

export const removeStaffDepartmentAssignment = async (assignmentId) => {
    try {
        await deleteDoc(doc(db, "staff_department_assignments", assignmentId));
    } catch (err) {
        console.error("Error deleting staff assignment:", err);
        throw err;
    }
};

export const removeStaffAssignments = async (staffId) => {
    try {
        await deleteDoc(doc(db, "staff_organization_assignments", staffId));
        await deleteDoc(doc(db, "staff_hospital_assignments", staffId));
        await deleteDoc(doc(db, "staff_department_assignments", staffId));
    } catch (err) {
        console.error("Error deleting staff assignments:", err);
        throw err;
    }
};
//
// import {
//     addDoc,
//     collection,
//     doc,
//     getDocs,
//     query,
//     where,
//     serverTimestamp,
//     updateDoc,
//     writeBatch,
//     deleteDoc,
//     getDoc,
// } from "firebase/firestore";
// import { db } from "./firebase";
//
// const formatFirestoreTimestamp = (timestamp) => {
//     if (timestamp && typeof timestamp.toDate === "function") {
//         return timestamp.toDate().toISOString().split("T")[0];
//     }
//     return timestamp || null;
// };
//
// export const assignStaffToOrganization = async (
//     staffId,
//     organizationId,
//     isPrimary = false,
//     userId = "system",
// ) => {
//     try {
//         const staffRef = doc(db, "staff", staffId);
//         const orgRef = doc(db, "organizations", organizationId);
//
//         const existingQuery = query(
//             collection(db, "staff_organization_assignments"),
//             where("staff", "==", staffRef),
//             where("organization", "==", organizationRef),
//             where("active", "==", true),
//         );
//
//         const existingSnapshot = await getDocs(existingQuery);
//
//         if (!existingSnapshot.empty) {
//             // Update existing assignment
//             const existingDoc = existingSnapshot.docs[0];
//             await updateDoc(
//                 doc(db, "staff_organization_assignments", existingDoc.id),
//                 {
//                     isPrimary,
//                     updatedAt: serverTimestamp(),
//                     updatedById: userId,
//                 },
//             );
//             return { id: existingDoc.id, isPrimary };
//         }
//
//         if (isPrimary) {
//             const primaryQuery = query(
//                 collection(db, "staff_organization_assignments"),
//                 where("staff", "==", staffRef),
//                 where("isPrimary", "==", true),
//                 where("active", "==", true),
//             );
//
//             const primarySnapshot = await getDocs(primaryQuery);
//             if (!primarySnapshot.empty) {
//                 await updateDoc(
//                     doc(
//                         db,
//                         "staff_organization_assignments",
//                         primarySnapshot.docs[0].id,
//                     ),
//                     {
//                         isPrimary: false,
//                         updatedAt: serverTimestamp(),
//                         updatedById: userId,
//                     },
//                 );
//             }
//         }
//
//         // Create new assignment
//         const assignmentData = {
//             staff: staffRef,
//             organization: orgRef,
//             isPrimary,
//             startDate: serverTimestamp(),
//             endDate: null,
//             active: true,
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             createdById: userId,
//             updatedById: userId,
//         };
//
//         const docRef = await addDoc(
//             collection(db, "staff_organization_assignments"),
//             assignmentData,
//         );
//         return { id: docRef.id, isPrimary };
//     } catch (err) {
//         console.error("Error assigning staff to organization:", err);
//         throw err;
//     }
// };
//
// export const assignStaffToHospital = async (
//     staffId,
//     hospitalId,
//     isPrimary = false,
//     userId = "system",
// ) => {
//     try {
//         const staffRef = doc(db, "staff", staffId);
//         const hospitalRef = doc(db, "hospitals", hospitalId);
//
//         const existingQuery = query(
//             collection(db, "staff_hospital_assignments"),
//             where("staff", "==", staffRef),
//             where("hospital", "==", hospitalRef),
//             where("active", "==", true),
//         );
//
//         const existingSnapshot = await getDocs(existingQuery);
//
//         if (!existingSnapshot.empty) {
//             // Update existing assignment
//             const existingDoc = existingSnapshot.docs[0];
//             await updateDoc(
//                 doc(db, "staff_hospital_assignments", existingDoc.id),
//                 {
//                     isPrimary,
//                     updatedAt: serverTimestamp(),
//                     updatedById: userId,
//                 },
//             );
//             return { id: existingDoc.id, isPrimary };
//         }
//
//         if (isPrimary) {
//             const primaryQuery = query(
//                 collection(db, "staff_hospital_assignments"),
//                 where("staff", "==", staffRef),
//                 where("isPrimary", "==", true),
//                 where("active", "==", true),
//             );
//
//             const primarySnapshot = await getDocs(primaryQuery);
//             if (!primarySnapshot.empty) {
//                 await updateDoc(
//                     doc(
//                         db,
//                         "staff_hospital_assignments",
//                         primarySnapshot.docs[0].id,
//                     ),
//                     {
//                         isPrimary: false,
//                         updatedAt: serverTimestamp(),
//                         updatedById: userId,
//                     },
//                 );
//             }
//         }
//
//         // Create new assignment
//         const assignmentData = {
//             staff: staffRef,
//             hospital: hospitalRef,
//             isPrimary,
//             startDate: serverTimestamp(),
//             endDate: null,
//             active: true,
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             createdById: userId,
//             updatedById: userId,
//         };
//
//         const docRef = await addDoc(
//             collection(db, "staff_hospital_assignments"),
//             assignmentData,
//         );
//         return { id: docRef.id, isPrimary };
//     } catch (err) {
//         console.error("Error assigning staff to hospital:", err);
//         throw err;
//     }
// };
//
// export const assignStaffToDepartment = async (
//     staffId,
//     departmentId,
//     role = "staff",
//     departmentRole = "staff",
//     isPrimary = false,
//     userId = "system",
// ) => {
//     try {
//         const staffRef = doc(db, "staff", staffId);
//         const departmentRef = doc(db, "departments", departmentId);
//
//         const existingQuery = query(
//             collection(db, "staff_department_assignments"),
//             where("staff", "==", staffRef),
//             where("department", "==", departmentRef),
//             where("active", "==", true),
//         );
//
//         const existingSnapshot = await getDocs(existingQuery);
//
//         if (!existingSnapshot.empty) {
//             // Update existing assignment
//             const existingDoc = existingSnapshot.docs[0];
//             await updateDoc(
//                 doc(db, "staff_department_assignments", existingDoc.id),
//                 {
//                     role,
//                     departmentRole,
//                     isPrimary,
//                     updatedAt: serverTimestamp(),
//                     updatedById: userId,
//                 },
//             );
//             return { id: existingDoc.id, isPrimary };
//         }
//
//         if (isPrimary) {
//             const primaryQuery = query(
//                 collection(db, "staff_department_assignments"),
//                 where("staff", "==", staffRef),
//                 where("isPrimary", "==", true),
//                 where("active", "==", true),
//             );
//
//             const primarySnapshot = await getDocs(primaryQuery);
//             if (!primarySnapshot.empty) {
//                 await updateDoc(
//                     doc(
//                         db,
//                         "staff_department_assignments",
//                         primarySnapshot.docs[0].id,
//                     ),
//                     {
//                         isPrimary: false,
//                         updatedAt: serverTimestamp(),
//                         updatedById: userId,
//                     },
//                 );
//             }
//         }
//
//         // Create new assignment
//         const assignmentData = {
//             staff: staffRef,
//             department: departmentRef,
//             isPrimary,
//             startDate: serverTimestamp(),
//             endDate: null,
//             active: true,
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//             createdById: userId,
//             updatedById: userId,
//         };
//
//         const docRef = await addDoc(
//             collection(db, "staff_department_assignments"),
//             assignmentData,
//         );
//         return { id: docRef.id, isPrimary };
//     } catch (err) {
//         console.error("Error assigning staff to hospital:", err);
//         throw err;
//     }
// };
//
// export const getStaffOrganizationAssignments = async (staffId) => {
//     try {
//         const assignments = await getDocs(
//             query(
//                 collection(db, "staff_organization_assignments"),
//                 where("staff", "==", doc(db, "staff", staffId)),
//             ),
//         );
//
//         // Process the assignments to match your expected interface
//         const processedAssignments = [];
//         for (const doc of assignments.docs) {
//             const data = doc.data();
//
//             // Get organization data
//             let organization = { id: "", name: "" };
//             if (data.organization) {
//                 const orgDoc = await getDoc(data.organization);
//                 if (orgDoc.exists()) {
//                     organization = {
//                         id: orgDoc.id,
//                         name: orgDoc.data().name,
//                     };
//                 }
//             }
//
//             processedAssignments.push({
//                 id: doc.id,
//                 organization,
//                 isPrimary: data.isPrimary || false,
//                 startDate: data.startDate
//                     ? formatFirestoreTimestamp(data.startDate)
//                     : undefined,
//                 endDate: data.endDate
//                     ? formatFirestoreTimestamp(data.endDate)
//                     : null,
//                 active: data.active || false,
//             });
//         }
//
//         return processedAssignments;
//     } catch (err) {
//         console.error("Error fetching staff organization assignments:", err);
//         throw err;
//     }
// };
//
// export const getStaffHospitalAssignments = async (staffId) => {
//     try {
//         const assignments = await getDocs(
//             query(
//                 collection(db, "staff_hospital_assignments"),
//                 where("staff", "==", doc(db, "staff", staffId)),
//             ),
//         );
//
//         // Process the assignments to match your expected interface
//         // noinspection DuplicatedCode
//         const processedAssignments = [];
//         for (const doc of assignments.docs) {
//             const data = doc.data();
//
//             // Get hospital data
//             let hospital = { id: "", name: "" };
//             if (data.hospital) {
//                 const hospitalDoc = await getDoc(data.hospital);
//                 if (hospitalDoc.exists()) {
//                     hospital = {
//                         id: hospitalDoc.id,
//                         name: hospitalDoc.data().name,
//                     };
//                 }
//             }
//
//             processedAssignments.push({
//                 id: doc.id,
//                 hospital,
//                 isPrimary: data.isPrimary || false,
//                 startDate: data.startDate
//                     ? formatFirestoreTimestamp(data.startDate)
//                     : undefined,
//                 endDate: data.endDate
//                     ? formatFirestoreTimestamp(data.endDate)
//                     : null,
//                 active: data.active || false,
//             });
//         }
//
//         return processedAssignments;
//     } catch (err) {
//         console.error("Error fetching staff hospital assignments:", err);
//         throw err;
//     }
// };
//
// export const getStaffDepartmentAssignments = async (staffId) => {
//     try {
//         const assignments = await getDocs(
//             query(
//                 collection(db, "staff_department_assignments"),
//                 where("staff", "==", doc(db, "staff", staffId)),
//             ),
//         );
//
//         // Process the assignments to match your expected interface
//         // noinspection DuplicatedCode
//         const processedAssignments = [];
//         for (const doc of assignments.docs) {
//             const data = doc.data();
//
//             // Get organization data
//             let department = { id: "", name: "" };
//             if (data.department) {
//                 const departmentDoc = await getDoc(data.department);
//                 if (departmentDoc.exists()) {
//                     department = {
//                         id: departmentDoc.id,
//                         name: departmentDoc.data().name,
//                     };
//                 }
//             }
//
//             processedAssignments.push({
//                 id: doc.id,
//                 department,
//                 isPrimary: data.isPrimary || false,
//                 startDate: data.startDate
//                     ? formatFirestoreTimestamp(data.startDate)
//                     : undefined,
//                 endDate: data.endDate
//                     ? formatFirestoreTimestamp(data.endDate)
//                     : null,
//                 active: data.active || false,
//             });
//         }
//
//         return processedAssignments;
//     } catch (err) {
//         console.error("Error fetching staff organization assignments:", err);
//         throw err;
//     }
// };
//
// export const getStaffAssignments = async (staffId) => {
//     const organizationAssignments =
//         await getStaffOrganizationAssignments(staffId);
//     const hospitalAssignments = await getStaffHospitalAssignments(staffId);
//     const departmentAssignments = await getStaffDepartmentAssignments(staffId);
//     return {
//         organizationAssignments,
//         hospitalAssignments,
//         departmentAssignments,
//     };
// };
//
// export const setPrimaryHospital = async (staffId, assignmentId) => {
//     try {
//         // Get all hospital assignments for this staff member
//         const assignmentsQuery = query(
//             collection(db, "staff_hospital_assignments"),
//             where("staff", "==", doc(db, "staff", staffId)),
//             where("active", "==", true),
//         );
//
//         // Update all assignments to non-primary (using a batch for efficiency)
//         const querySnapshot = await getDocs(assignmentsQuery);
//         const batch = writeBatch(db);
//
//         querySnapshot.forEach((doc) => {
//             batch.update(doc.ref, {
//                 isPrimary: false,
//                 updatedAt: serverTimestamp(),
//             });
//         });
//
//         // Set the selected assignment as primary
//         batch.update(doc(db, "staff_hospital_assignments", assignmentId), {
//             isPrimary: true,
//             updatedAt: serverTimestamp(),
//         });
//
//         // Commit all updates
//         await batch.commit();
//     } catch (err) {
//         console.error("Error setting primary hospital:", err);
//         throw err;
//     }
// };
//
// export const removeStaffOrganizationAssignment = async (assignmentId) => {
//     try {
//         await deleteDoc(
//             doc(db, "staff_organization_assignments", assignmentId),
//         );
//     } catch (err) {
//         console.error("Error deleting staff assignment:", err);
//         throw err;
//     }
// };
// export const removeStaffHospitalAssignment = async (assignmentId) => {
//     try {
//         await deleteDoc(doc(db, "staff_hospital_assignments", assignmentId));
//     } catch (err) {
//         console.error("Error deleting staff assignment:", err);
//         throw err;
//     }
// };
//
// export const removeStaffDepartmentAssignment = async (assignmentId) => {
//     try {
//         await deleteDoc(doc(db, "staff_department_assignments", assignmentId));
//     } catch (err) {
//         console.error("Error deleting staff assignment:", err);
//         throw err;
//     }
// };
//
// export const removeStaffAssignments = async (staffId) => {
//     try {
//         await deleteDoc(doc(db, "staff_organization_assignments", staffId));
//         await deleteDoc(doc(db, "staff_hospital_assignments", staffId));
//         await deleteDoc(doc(db, "staff_department_assignments", staffId));
//     } catch (err) {
//         console.error("Error deleting staff assignments:", err);
//         throw err;
//     }
// };
