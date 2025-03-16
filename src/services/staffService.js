// src/services/staffService.js
import {
    addDoc,
    collection,
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

const staffCollection = collection(db, "staff");

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

// Get all staff with optional filters
export const getStaff = async (filters = {}) => {
    try {
        // Start with a basic query
        let q = staffCollection;

        // Apply filters if provided
        const constraints = [];

        if (filters.organization && filters.organization !== "all") {
            const orgRef = doc(db, "organizations", filters.organization);
            constraints.push(where("organization", "==", orgRef));
        }

        if (filters.hospital && filters.hospital !== "all") {
            const hospitalRef = doc(db, "hospitals", filters.hospital);
            constraints.push(where("defaultHospital", "==", hospitalRef));
        }

        if (filters.role && filters.role !== "all") {
            const roleRef = doc(db, "staff_roles", filters.role);
            constraints.push(where("primaryRole", "==", roleRef));
        }

        // Only show active staff by default
        if (!filters.showInactive) {
            constraints.push(where("active", "==", true));
        }

        // Add sorting
        constraints.push(orderBy("name"));

        // Apply all constraints
        if (constraints.length > 0) {
            q = query(staffCollection, ...constraints);
        }

        const querySnapshot = await getDocs(q);

        // Convert to array of data objects with IDs
        const staffMembers = [];

        // Process each staff member and resolve references
        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();

            // Get organization data
            let organizationData = null;
            if (data.organization) {
                organizationData = await formatReferenceField(
                    data.organization,
                );
            }

            // Get hospital data
            let hospitalData = null;
            if (data.defaultHospital) {
                hospitalData = await formatReferenceField(data.defaultHospital);
            }

            // Get primary role data
            let roleData = null;
            if (data.primaryRole) {
                roleData = await formatReferenceField(data.primaryRole);
            }

            // Get department assignments (these would be in a separate collection)
            const departmentData = [];
            try {
                const deptAssignmentsQuery = query(
                    collection(db, "staff_department_assignments"),
                    where("staff", "==", doc(db, "staff", docSnapshot.id)),
                    where("active", "==", true),
                );

                const deptAssignmentsSnapshot =
                    await getDocs(deptAssignmentsQuery);

                for (const deptAssignment of deptAssignmentsSnapshot.docs) {
                    const deptData = deptAssignment.data();
                    if (deptData.department) {
                        const deptRef = await formatReferenceField(
                            deptData.department,
                        );
                        if (deptRef) {
                            departmentData.push({
                                id: deptRef.id,
                                name: deptRef.name,
                                color: deptRef.color,
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error getting department assignments:", error);
            }

            staffMembers.push({
                id: docSnapshot.id,
                ...data,
                organization: organizationData || { id: "", name: "Unknown" },
                defaultHospital: hospitalData || { id: "", name: "Unknown" },
                primaryRole: roleData || { id: "", name: "Unknown" },
                departments: departmentData,
                startDate: formatFirestoreTimestamp(data.startDate),
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            });
        }

        // Apply department filter (client-side) if provided
        let filteredStaff = staffMembers;
        if (filters.department && filters.department !== "all") {
            filteredStaff = staffMembers.filter((staff) =>
                staff.departments?.some(
                    (dept) => dept.id === filters.department,
                ),
            );
        }

        // Apply search filter (client-side) if provided
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return filteredStaff.filter(
                (staff) =>
                    staff.name?.toLowerCase().includes(searchLower) ||
                    staff.email?.toLowerCase().includes(searchLower) ||
                    staff.phone?.includes(filters.search) ||
                    staff.primaryRole?.name
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    staff.departmentRole?.name
                        ?.toLowerCase()
                        .includes(searchLower),
            );
        }

        return filteredStaff;
    } catch (error) {
        console.error("Error getting staff:", error);
        throw error;
    }
};

// Get staff for a single department
export const getStaffByDepartment = async (departmentId) => {
    try {
        const departmentRef = doc(db, "departments", departmentId);

        // First get the staff_department_assignments
        const assignmentsQuery = query(
            collection(db, "staff_department_assignments"),
            where("department", "==", departmentRef),
            where("active", "==", true),
        );

        const assignmentsSnapshot = await getDocs(assignmentsQuery);

        // Collect all staff IDs from the assignments
        const staffPromises = assignmentsSnapshot.docs.map(
            async (assignmentDoc) => {
                const assignmentData = assignmentDoc.data();
                if (assignmentData.staff) {
                    const staffRef = assignmentData.staff;
                    const staffDoc = await getDoc(staffRef);

                    if (staffDoc.exists()) {
                        const staffData = staffDoc.data();

                        // Resolve references
                        let organizationData = null;
                        if (staffData.organization) {
                            organizationData = await formatReferenceField(
                                staffData.organization,
                            );
                        }

                        let hospitalData = null;
                        if (staffData.defaultHospital) {
                            hospitalData = await formatReferenceField(
                                staffData.defaultHospital,
                            );
                        }

                        let roleData = null;
                        if (staffData.primaryRole) {
                            roleData = await formatReferenceField(
                                staffData.primaryRole,
                            );
                        }

                        return {
                            id: staffDoc.id,
                            ...staffData,
                            organization: organizationData || {
                                id: "",
                                name: "Unknown",
                            },
                            defaultHospital: hospitalData || {
                                id: "",
                                name: "Unknown",
                            },
                            primaryRole: roleData || {
                                id: "",
                                name: "Unknown",
                            },
                            departments: [
                                {
                                    id: departmentId,
                                    name: "Current Department",
                                },
                            ],
                            startDate: formatFirestoreTimestamp(
                                staffData.startDate,
                            ),
                            createdAt: formatFirestoreTimestamp(
                                staffData.createdAt,
                            ),
                            updatedAt: formatFirestoreTimestamp(
                                staffData.updatedAt,
                            ),
                        };
                    }
                }
                return null;
            },
        );

        const staffResults = await Promise.all(staffPromises);
        return staffResults.filter(Boolean); // Remove null values
    } catch (error) {
        console.error("Error getting staff for department:", error);
        throw error;
    }
};

// Get a single staff member by ID
export const getStaffMember = async (id) => {
    try {
        const docRef = doc(db, "staff", id);
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

            // Get hospital data
            let hospitalData = null;
            if (data.defaultHospital) {
                hospitalData = await formatReferenceField(data.defaultHospital);
            }

            // Get primary role data
            let roleData = null;
            if (data.primaryRole) {
                roleData = await formatReferenceField(data.primaryRole);
            }

            // Get department assignments
            const departmentData = [];
            try {
                const deptAssignmentsQuery = query(
                    collection(db, "staff_department_assignments"),
                    where("staff", "==", docRef),
                    where("active", "==", true),
                );

                const deptAssignmentsSnapshot =
                    await getDocs(deptAssignmentsQuery);

                for (const deptAssignment of deptAssignmentsSnapshot.docs) {
                    const deptData = deptAssignment.data();
                    if (deptData.department) {
                        const deptRef = await formatReferenceField(
                            deptData.department,
                        );
                        if (deptRef) {
                            departmentData.push({
                                id: deptRef.id,
                                name: deptRef.name,
                                color: deptRef.color,
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error getting department assignments:", error);
            }

            return {
                id: docSnap.id,
                ...data,
                organization: organizationData || { id: "", name: "Unknown" },
                defaultHospital: hospitalData || { id: "", name: "Unknown" },
                primaryRole: roleData || { id: "", name: "Unknown" },
                departments: departmentData,
                startDate: formatFirestoreTimestamp(data.startDate),
                createdAt: formatFirestoreTimestamp(data.createdAt),
                updatedAt: formatFirestoreTimestamp(data.updatedAt),
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting staff member:", error);
        throw error;
    }
};

// Add a new staff member
export const addStaff = async (staffData, userId = "system") => {
    try {
        // Convert organization to reference
        let organizationRef = null;
        if (staffData.organization && staffData.organization.id) {
            organizationRef = doc(
                db,
                "organizations",
                staffData.organization.id,
            );
        }

        // Convert hospital to reference
        let hospitalRef = null;
        if (staffData.defaultHospital && staffData.defaultHospital.id) {
            hospitalRef = doc(db, "hospitals", staffData.defaultHospital.id);
        }

        // Convert primary role to reference
        let roleRef = null;
        if (staffData.primaryRole && staffData.primaryRole.id) {
            roleRef = doc(db, "staff_roles", staffData.primaryRole.id);
        }

        // Format data for Firestore (remove references and complex objects)
        const {
            organization,
            defaultHospital,
            primaryRole,
            departments,
            usualWorkingHours,
            ...otherData
        } = staffData;

        // Add timestamps and audit fields
        const dataToAdd = {
            ...otherData,
            organization: organizationRef,
            defaultHospital: hospitalRef,
            primaryRole: roleRef,
            // Convert Date to Firestore timestamp if exists
            startDate: staffData.startDate
                ? new Date(staffData.startDate)
                : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdById: userId,
            updatedById: userId,
        };

        // Special handling for working hours
        if (usualWorkingHours) {
            dataToAdd.usualWorkingHours = usualWorkingHours;
        }

        const docRef = await addDoc(staffCollection, dataToAdd);

        // Handle department assignments if provided
        if (departments && departments.length > 0) {
            const staffRef = doc(db, "staff", docRef.id);
            for (const dept of departments) {
                if (dept.id) {
                    const deptRef = doc(db, "departments", dept.id);
                    // Create assignment in staff_department_assignments collection
                    await addDoc(
                        collection(db, "staff_department_assignments"),
                        {
                            staff: staffRef,
                            department: deptRef,
                            startDate: new Date(),
                            endDate: null,
                            active: true,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                            createdById: userId,
                            updatedById: userId,
                        },
                    );
                }
            }
        }

        // Return the created staff with its new ID
        return {
            id: docRef.id,
            ...staffData,
        };
    } catch (error) {
        console.error("Error adding staff:", error);
        throw error;
    }
};

// Update an existing staff member
export const updateStaff = async (id, staffData, userId = "system") => {
    try {
        const staffRef = doc(db, "staff", id);

        // Convert organization to reference if provided
        let organizationRef = undefined;
        if (staffData.organization && staffData.organization.id) {
            organizationRef = doc(
                db,
                "organizations",
                staffData.organization.id,
            );
        }

        // Convert hospital to reference if provided
        let hospitalRef = undefined;
        if (staffData.defaultHospital && staffData.defaultHospital.id) {
            hospitalRef = doc(db, "hospitals", staffData.defaultHospital.id);
        }

        // Convert primary role to reference if provided
        let roleRef = undefined;
        if (staffData.primaryRole && staffData.primaryRole.id) {
            roleRef = doc(db, "staff_roles", staffData.primaryRole.id);
        }

        // Format data for Firestore update
        const {
            organization,
            defaultHospital,
            primaryRole,
            departments,
            ...otherData
        } = staffData;

        // Build update object
        const updateData = {
            ...otherData,
            updatedAt: serverTimestamp(),
            updatedById: userId,
        };

        // Only set fields that are provided
        if (organizationRef !== undefined)
            updateData.organization = organizationRef;
        if (hospitalRef !== undefined) updateData.defaultHospital = hospitalRef;
        if (roleRef !== undefined) updateData.primaryRole = roleRef;
        if (staffData.startDate)
            updateData.startDate = new Date(staffData.startDate);

        await updateDoc(staffRef, updateData);

        // Handle department assignments if provided
        if (departments) {
            // First, get current department assignments
            const currentAssignmentsQuery = query(
                collection(db, "staff_department_assignments"),
                where("staff", "==", staffRef),
                where("active", "==", true),
            );

            const currentAssignmentsSnapshot = await getDocs(
                currentAssignmentsQuery,
            );

            // Create a map of current department IDs
            const currentDeptIds = new Map();
            currentAssignmentsSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.department) {
                    // This assumes we can extract the ID from the reference path
                    const deptId = data.department.path.split("/").pop();
                    currentDeptIds.set(deptId, doc.id);
                }
            });

            // Process new departments
            for (const dept of departments) {
                if (!dept.id) continue;

                if (currentDeptIds.has(dept.id)) {
                    // Department already assigned, remove from map to avoid deactivation
                    currentDeptIds.delete(dept.id);
                } else {
                    // New department assignment
                    const deptRef = doc(db, "departments", dept.id);
                    await addDoc(
                        collection(db, "staff_department_assignments"),
                        {
                            staff: staffRef,
                            department: deptRef,
                            startDate: new Date(),
                            endDate: null,
                            active: true,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                            createdById: userId,
                            updatedById: userId,
                        },
                    );
                }
            }

            // Deactivate assignments for departments that were removed
            for (const [deptId, assignmentId] of currentDeptIds.entries()) {
                const assignmentRef = doc(
                    db,
                    "staff_department_assignments",
                    assignmentId,
                );
                await updateDoc(assignmentRef, {
                    active: false,
                    endDate: new Date(),
                    updatedAt: serverTimestamp(),
                    updatedById: userId,
                });
            }
        }

        // Return the updated staff
        return {
            id,
            ...staffData,
        };
    } catch (error) {
        console.error("Error updating staff:", error);
        throw error;
    }
};

// Delete a staff member
export const deleteStaff = async (id) => {
    try {
        // Check if the staff member exists
        const staffRef = doc(db, "staff", id);
        const staffDoc = await getDoc(staffRef);

        if (!staffDoc.exists()) {
            throw new Error("Staff member not found");
        }

        // Deactivate rather than delete
        await updateDoc(staffRef, {
            active: false,
            updatedAt: serverTimestamp(),
            updatedById: "system",
        });

        // Alternatively, to truly delete:
        // await deleteDoc(staffRef);

        return { success: true, id };
    } catch (error) {
        console.error("Error deleting staff:", error);
        throw error;
    }
};
