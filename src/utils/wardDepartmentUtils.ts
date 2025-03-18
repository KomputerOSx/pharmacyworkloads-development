// src/utils/wardDepartmentUtils.ts
import {Ward, WardDepartmentAssignment} from "@/context/WardContext";
import {Department} from "@/context/DepartmentContext";

/**
 * Updates a ward object with the latest department assignments
 * @param ward The ward to update
 * @param departmentAssignments The current department assignments
 * @returns The updated ward object
 */
export const updateWardWithDepartments = (
    ward: Ward,
    departmentAssignments: WardDepartmentAssignment[],
): Ward => {
    // Find the primary department
    const primaryAssignment = departmentAssignments.find((a) => a.isPrimary);

    // Create a new ward object with the updated department info
    return {
        ...ward,
        // Update the primary department reference
        department: primaryAssignment
            ? {
                  id: primaryAssignment.department.id,
                  name: primaryAssignment.department.name,
                  color: primaryAssignment.department.color,
              }
            : ward.department,
        // Add all department assignments
        departments: departmentAssignments,
    };
};

/**
 * Gets all wards that are assigned to a specific department
 * @param wards The full list of wards
 * @param departmentId The department ID to filter by
 * @returns Array of wards assigned to the department
 */
export const getWardsByDepartment = (
    wards: Ward[],
    departmentId: string,
): Ward[] => {
    return wards.filter((ward) => {
        // Check primary department
        if (ward.department?.id === departmentId) {
            return true;
        }

        // Check all department assignments
        if (ward.departments) {
            return ward.departments.some(
                (assignment) => assignment.department.id === departmentId,
            );
        }

        return false;
    });
};

/**
 * Gets all departments that a ward is assigned to
 * @param ward The ward to check
 * @returns Array of department IDs
 */
export const getDepartmentIdsForWard = (ward: Ward): string[] => {
    const departmentIds: string[] = [];

    // Add primary department if it exists
    if (ward.department?.id) {
        departmentIds.push(ward.department.id);
    }

    // Add all other departments from assignments
    if (ward.departments) {
        ward.departments.forEach((assignment) => {
            if (!departmentIds.includes(assignment.department.id)) {
                departmentIds.push(assignment.department.id);
            }
        });
    }

    return departmentIds;
};

/**
 * Finds departments that a ward isn't already assigned to
 * @param allDepartments All available departments
 * @param ward The ward to check
 * @returns Array of departments not assigned to the ward
 */
export const getUnassignedDepartments = (
    allDepartments: Department[],
    ward: Ward,
): Department[] => {
    const assignedDeptIds = getDepartmentIdsForWard(ward);

    return allDepartments.filter((dept) => !assignedDeptIds.includes(dept.id));
};

/**
 * Checks if a ward is assigned to a specific department
 * @param ward The ward to check
 * @param departmentId The department ID to look for
 * @returns True if the ward is assigned to the department
 */
export const isWardAssignedToDepartment = (
    ward: Ward,
    departmentId: string,
): boolean => {
    // Check primary department
    if (ward.department?.id === departmentId) {
        return true;
    }

    // Check all department assignments
    if (ward.departments) {
        return ward.departments.some(
            (assignment) => assignment.department.id === departmentId,
        );
    }

    return false;
};
