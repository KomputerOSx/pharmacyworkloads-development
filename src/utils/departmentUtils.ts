import { Department, DepartmentFilter } from "@/context/DepartmentContext";
import {
    getDepartmentChildren,
    getDepartments,
} from "@/services/departmentService";
import { getDepartmentHospitalAssignment } from "@/services/departmentAssignmentService";

/**
 * Ensures a department object conforms to the Department type
 * by providing default values for required fields if they're missing
 */
export const ensureCompleteDepartment = (
    dept: Partial<Department>,
): Department => {
    return {
        id: dept.id || "",
        name: dept.name || "",
        code: dept.code || "",
        description: dept.description || "",
        type: dept.type || "",
        color: dept.color || "#4a4a4a",
        parent: dept.parent || null,
        active: dept.active !== undefined ? dept.active : true,
        uniqueProperties: {
            requiresLunchCover:
                dept.uniqueProperties?.requiresLunchCover || false,
            pharmacistCount: dept.uniqueProperties?.pharmacistCount || 0,
            technicianCount: dept.uniqueProperties?.technicianCount || 0,
        },
        hospital: dept.hospital || undefined,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
        children: dept.children
            ? dept.children.map(ensureCompleteDepartment)
            : undefined,
    };
};

/**
 * Enhance departments with their hospital information
 * @param {Array} departments - Array of department objects
 * @param {Array} hospitals - Array of hospital objects
 * @returns {Promise<Array>} - Enhanced departments with hospital information
 */
export const enhanceDepartmentsWithHospitals = async (
    departments: Department[],
    hospitals: { id: string; name: string }[],
): Promise<Department[]> => {
    if (!departments?.length || !hospitals?.length) {
        return departments;
    }

    console.log("Enhancing departments with hospital data...");

    const enhancedDepartments = [];

    // Process departments in batches to avoid too many parallel requests
    const batchSize = 5;
    for (let i = 0; i < departments.length; i += batchSize) {
        const batch = departments.slice(i, i + batchSize);
        const batchPromises = batch.map(async (department) => {
            try {
                // Get assignments for this department
                const assignments = await getDepartmentHospitalAssignment(
                    department.id,
                );
                console.log(
                    `Department ${department.name}: Found ${assignments.length} assignments`,
                );

                if (assignments && assignments.length > 0) {
                    // Get the first active assignment
                    const assignment = assignments[0];

                    if (assignment.hospitalId) {
                        // Find the hospital in our hospital array
                        const hospital = hospitals.find(
                            (h) => h.id === assignment.hospitalId,
                        );

                        // Create enhanced department with hospital info
                        return {
                            ...department,
                            hospital: {
                                id: assignment.hospitalId,
                                name: hospital
                                    ? hospital.name
                                    : "Unknown Hospital",
                            },
                        };
                    }
                }

                // Return department without hospital if no valid assignment found
                return department;
            } catch (error) {
                console.error(
                    `Error enhancing department ${department.id}:`,
                    error,
                );
                return department;
            }
        });

        // Wait for all promises in this batch
        const batchResults = await Promise.all(batchPromises);
        enhancedDepartments.push(...batchResults);
    }

    console.log(
        `Enhanced ${enhancedDepartments.length} departments with hospital data`,
    );
    return enhancedDepartments;
};

export const getDepartmentsSafe = async (
    organisationId: string,
    filter: DepartmentFilter,
): Promise<Department[]> => {
    try {
        // Get all departments from the organisation
        const allDepartments = await getDepartments(organisationId);

        // Apply hospital filter if needed (not "all")
        let filteredDepartments = [...allDepartments];

        // If filter.hospital is not the organisation ID, it's a specific hospital ID
        if (
            filter.hospital &&
            filter.hospital !== organisationId &&
            filter.hospital !== "all"
        ) {
            // Filter by hospitalId if present, or by hospital.id if using the new format
            filteredDepartments = filteredDepartments.filter(
                (dept) =>
                    dept.hospitalId === filter.hospital ||
                    (dept.hospital && dept.hospital.id === filter.hospital),
            );
        }

        // Ensure each department conforms to the Department type
        return filteredDepartments.map(ensureCompleteDepartment);
    } catch (error) {
        console.error("Error in getDepartmentsSafe:", error);
        return [];
    }
};

/**
 * A type-safe wrapper for getDepartmentChildren with error handling
 */
export const getDepartmentChildrenSafe = async (
    departmentId: string,
): Promise<Department[]> => {
    try {
        if (!departmentId) {
            return [];
        }

        const children = await getDepartmentChildren(departmentId);

        // Check if children is actually an array before mapping
        if (!Array.isArray(children)) {
            console.error(
                "Expected children to be an array but got:",
                typeof children,
            );
            return [];
        }

        return children.map(ensureCompleteDepartment);
    } catch (error) {
        console.error("Error in getDepartmentChildrenSafe:", error);
        return []; // Return empty array on error
    }
};
