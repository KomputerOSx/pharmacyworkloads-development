// src/utils/departmentUtils.ts
import {Department, DepartmentFilter} from "@/context/DepartmentContext";
import {getDepartmentChildren as getDepChildren, getDepartments as getDepData,} from "@/services/departmentService";

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
        type: dept.type || "",
        hospital: dept.hospital || { id: "", name: "" },
        parent: dept.parent || null,
        active: dept.active || false,
        description: dept.description,
        color: dept.color,
        requiresLunchCover: dept.requiresLunchCover,
        pharmacistCount: dept.pharmacistCount,
        technicianCount: dept.technicianCount,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
        children: dept.children
            ? dept.children.map(ensureCompleteDepartment)
            : undefined,
    };
};

/**
 * A type-safe wrapper for getDepartments that ensures returned data
 * conforms to the Department type
 */
export const getDepartmentsSafe = async (
    filter: DepartmentFilter,
): Promise<Department[]> => {
    const departments = await getDepData(filter);
    return departments.map((dept) => ensureCompleteDepartment(dept));
};

/**
 * A type-safe wrapper for getDepartmentChildren
 */
export const getDepartmentChildrenSafe = async (
    departmentId: string,
): Promise<Department[]> => {
    const children = await getDepChildren(departmentId);
    return children.map(ensureCompleteDepartment);
};
