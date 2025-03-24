import { Department, DepartmentFilter } from "@/context/DepartmentContext";
import {
    getDepartmentChildren as getDepChildren,
    getDepartments as getDepData,
} from "@/services/departmentService";

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
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
        children: dept.children
            ? dept.children.map(ensureCompleteDepartment)
            : undefined,
    };
};

/**
 * A type-safe wrapper for getDepartments that ensures returned data
 * conforms to the Department type and includes proper error handling
 */
export const getDepartmentsSafe = async (
    organisationId: string,
    filter: DepartmentFilter,
): Promise<Department[]> => {
    try {
        // Call the actual service function with the organization ID
        const departments = await getDepData(organisationId);

        // Check if departments is actually an array before mapping
        if (!Array.isArray(departments)) {
            console.error(
                "Expected departments to be an array but got:",
                typeof departments,
            );
            return [];
        }

        // Apply additional client-side filtering based on other filter parameters
        let filteredDepartments = departments;

        // Filter by type if specified
        if (filter.type && filter.type !== "all") {
            filteredDepartments = filteredDepartments.filter(
                (dept) => dept.type === filter.type,
            );
        }

        // Filter by parent if specified
        if (filter.parent && filter.parent !== "all") {
            if (filter.parent === "none") {
                // Only root departments (no parent)
                filteredDepartments = filteredDepartments.filter(
                    (dept) => !dept.parent,
                );
            } else {
                // Departments with specific parent
                filteredDepartments = filteredDepartments.filter(
                    (dept) => dept.parent && dept.parent.id === filter.parent,
                );
            }
        }

        // Apply search filter if provided
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filteredDepartments = filteredDepartments.filter((dept) => {
                // Safely check each property before using indexOf
                const nameMatch =
                    typeof dept.name === "string" &&
                    dept.name.toLowerCase().includes(searchLower);
                const codeMatch =
                    typeof dept.code === "string" &&
                    dept.code.toLowerCase().includes(searchLower);
                const descMatch =
                    typeof dept.description === "string" &&
                    dept.description.toLowerCase().includes(searchLower);

                return nameMatch || codeMatch || descMatch;
            });
        }

        // Apply active filter if specified
        if (filter.active !== undefined) {
            filteredDepartments = filteredDepartments.filter(
                (dept) => dept.active === filter.active,
            );
        }

        return filteredDepartments.map((dept) =>
            ensureCompleteDepartment(dept),
        );
    } catch (error) {
        console.error("Error in getDepartmentsSafe:", error);
        return []; // Return empty array on error instead of crashing
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

        const children = await getDepChildren(departmentId);

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
