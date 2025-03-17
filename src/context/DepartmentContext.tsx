// "use client";
//
// import React, { createContext, useContext, useEffect, useState } from "react";
// import {
//     addDepartment,
//     deleteDepartment,
//     getDepartmentChildren,
//     getDepartments,
//     getDepartmentTypes,
//     updateDepartment,
// } from "@/services/departmentService";
// import { getHospitals } from "@/services/hospitalService";
// // Define the Department type
// export type Department = {
//     id: string;
//     name: string;
//     code: string;
//     description?: string;
//     type: string;
//     color?: string;
//     hospital: {
//         id: string;
//         name: string;
//     };
//     parent?: {
//         id: string;
//         name: string;
//     } | null;
//     requiresLunchCover?: boolean;
//     pharmacistCount?: number;
//     technicianCount?: number;
//     active: boolean;
//     createdAt?: string;
//     updatedAt?: string;
//     children?: Department[];
// };
//
// // Define the Hospital type (simplified version for the context)
// export type Hospital = {
//     id: string;
//     name: string;
// };
//
// // Define the Department Type interface
// export type DepartmentType = {
//     id: string;
//     name: string;
// };
//
// // Define the filter type
// export type DepartmentFilter = {
//     hospital: string;
//     type: string;
//     parent: string;
//     search: string;
//     active?: boolean;
// };
//
// // Define the context type
// interface DepartmentContextType {
//     departments: Department[];
//     departmentHierarchy: Department[];
//     hospitals: Hospital[];
//     departmentTypes: DepartmentType[];
//     loading: boolean;
//     error: string | null;
//     filter: DepartmentFilter;
//     setFilter: React.Dispatch<React.SetStateAction<DepartmentFilter>>;
//     refreshDepartments: () => Promise<void>;
//     refreshHospitals: () => Promise<void>;
//     getDepartmentChildren: (departmentId: string) => Promise<Department[]>;
//     addNewDepartment: (
//         department: Omit<
//             Department,
//             "id" | "createdAt" | "updatedAt" | "children"
//         >,
//     ) => Promise<Department>;
//     updateExistingDepartment: (
//         id: string,
//         department: Partial<Department>,
//     ) => Promise<Department>;
//     removeDepartment: (id: string) => Promise<void>;
//     getAllRootDepartments: () => Department[]; // New method to get all root departments
// }
//
// // Create the context
// const DepartmentContext = createContext<DepartmentContextType | undefined>(
//     undefined,
// );
//
// // Provider component
// export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({
//     children,
// }) => {
//     const [departments, setDepartments] = useState<Department[]>([]);
//     const [departmentHierarchy, setDepartmentHierarchy] = useState<
//         Department[]
//     >([]);
//     const [hospitals, setHospitals] = useState<Hospital[]>([]);
//     const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>(
//         [],
//     );
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [filter, setFilter] = useState<DepartmentFilter>({
//         hospital: "all",
//         type: "all",
//         parent: "all",
//         search: "",
//     });
//
//     // New state to maintain all root departments regardless of filters
//     const [allRootDepartments, setAllRootDepartments] = useState<Department[]>(
//         [],
//     );
//
//     // Load department types
//     useEffect(() => {
//         setDepartmentTypes(getDepartmentTypes());
//     }, []);
//
//     // Function to build department hierarchy
//     const buildDepartmentHierarchy = async (flatDepartments: Department[]) => {
//         // First, get root departments (those without a parent)
//         const rootDepartments = flatDepartments.filter((dept) => !dept.parent);
//
//         const hierarchy: Department[] = [];
//
//         // Process each root department
//         for (const rootDept of rootDepartments) {
//             // Get children for this department
//             const children = await getDepartmentChildren(rootDept.id);
//
//             // Add to hierarchy with children
//             hierarchy.push({
//                 ...rootDept,
//                 children,
//             });
//         }
//
//         return hierarchy;
//     };
//
//     // Function to load all root departments (not affected by filters)
//     const loadAllRootDepartments = async () => {
//         try {
//             // Get departments with no filter
//             const allDepts = await getDepartments({
//                 hospital: "all",
//                 type: "all",
//                 parent: "all",
//                 search: "",
//             });
//
//             // Filter to just root departments (those without a parent)
//             const rootDepts: Department[] = allDepts.filter(
//                 (dept) => !dept.parent,
//             );
//             setAllRootDepartments(rootDepts);
//         } catch (err) {
//             console.error("Error loading all root departments:", err);
//         }
//     };
//
//     // Method to get all root departments (for filter component)
//     const getAllRootDepartments = () => {
//         return allRootDepartments;
//     };
//
//     // Function to fetch departments
//     const refreshDepartments = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//
//             // Get flat list of departments
//             const data = await getDepartments(filter);
//             setDepartments(data);
//
//             // Build hierarchy if needed
//             if (
//                 filter.parent === "all" &&
//                 filter.hospital === "all" &&
//                 filter.type === "all" &&
//                 !filter.search
//             ) {
//                 const hierarchy = await buildDepartmentHierarchy(data);
//                 setDepartmentHierarchy(hierarchy);
//             } else {
//                 // Just convert flat list to hierarchy format when filtered
//                 setDepartmentHierarchy(data);
//             }
//         } catch (err) {
//             console.error("Error fetching departments:", err);
//             setError("Failed to load departments. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // Function to fetch hospitals (for dropdowns)
//     const refreshHospitals = async () => {
//         try {
//             const data = await getHospitals({ status: "active" });
//             setHospitals(data);
//         } catch (err) {
//             console.error("Error fetching hospitals:", err);
//             setError(
//                 "Failed to load hospitals for dropdown. Please try again.",
//             );
//         }
//     };
//
//     // Function to get department children
//     const getDepartmentChildrenFunc = async (departmentId: string) => {
//         try {
//             return await getDepartments({ parent: departmentId });
//         } catch (err) {
//             console.error("Error fetching department children:", err);
//             setError("Failed to load subdepartments. Please try again.");
//             return [];
//         }
//     };
//
//     // Add a new department
//     const addNewDepartment = async (
//         department: Omit<
//             Department,
//             "id" | "createdAt" | "updatedAt" | "children"
//         >,
//     ) => {
//         try {
//             const newDepartment = await addDepartment(department);
//             await refreshDepartments();
//             // Refresh all root departments if this is a new root department
//             if (!department.parent) {
//                 await loadAllRootDepartments();
//             }
//             return newDepartment;
//         } catch (err) {
//             console.error("Error adding department:", err);
//             setError("Failed to add department. Please try again.");
//             throw err;
//         }
//     };
//
//     // Update an existing department
//     const updateExistingDepartment = async (
//         id: string,
//         department: Partial<Department>,
//     ) => {
//         try {
//             const updatedDepartment = await updateDepartment(id, department);
//             await refreshDepartments();
//             // Refresh all root departments if parent relationship changed
//             if ("parent" in department) {
//                 await loadAllRootDepartments();
//             }
//             return updatedDepartment;
//         } catch (err) {
//             console.error("Error updating department:", err);
//             setError("Failed to update department. Please try again.");
//             throw err;
//         }
//     };
//
//     // Delete a department
//     const removeDepartment = async (id: string) => {
//         try {
//             await deleteDepartment(id);
//             await refreshDepartments();
//             // Refresh all root departments in case a root was deleted
//             await loadAllRootDepartments();
//         } catch (err) {
//             console.error("Error deleting department:", err);
//             setError(
//                 err.message || "Failed to delete department. Please try again.",
//             );
//             throw err;
//         }
//     };
//
//     // Load all root departments on mount (independent of filters)
//     useEffect(() => {
//         loadAllRootDepartments();
//     }, []);
//
//     // Load departments on mount and when filter changes
//     useEffect(() => {
//         refreshDepartments();
//     }, [filter]);
//
//     // Load hospitals on mount
//     useEffect(() => {
//         refreshHospitals();
//     }, []);
//
//     // Context value
//     const value: DepartmentContextType = {
//         departments,
//         departmentHierarchy,
//         hospitals,
//         departmentTypes,
//         loading,
//         error,
//         filter,
//         setFilter,
//         refreshDepartments,
//         refreshHospitals,
//         getDepartmentChildren: getDepartmentChildrenFunc,
//         addNewDepartment,
//         updateExistingDepartment,
//         removeDepartment,
//         getAllRootDepartments,
//     };
//
//     return (
//         <DepartmentContext.Provider value={value}>
//             {children}
//         </DepartmentContext.Provider>
//     );
// };
//
// // Custom hook to use the department context
// export const useDepartments = () => {
//     const context = useContext(DepartmentContext);
//     if (context === undefined) {
//         throw new Error(
//             "useDepartments must be used within a DepartmentProvider",
//         );
//     }
//     return context;
// };

// src/context/DepartmentContext.tsx
"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    addDepartment,
    deleteDepartment,
    getDepartmentTypes,
    updateDepartment,
} from "@/services/departmentService";
import { getHospitals } from "@/services/hospitalService";
import {
    ensureCompleteDepartment,
    getDepartmentChildrenSafe,
    getDepartmentsSafe,
} from "@/utils/departmentUtils";

// Define the Department type
export type Department = {
    id: string;
    name: string;
    code: string;
    description?: string;
    type: string;
    color?: string;
    hospital: {
        id: string;
        name: string;
    };
    parent?: {
        id: string;
        name: string;
    } | null;
    requiresLunchCover?: boolean;
    pharmacistCount?: number;
    technicianCount?: number;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
    children?: Department[];
};

// Define the Hospital type (simplified version for the context)
export type Hospital = {
    id: string;
    name: string;
};

// Define the Department Type interface
export type DepartmentType = {
    id: string;
    name: string;
};

// Define the filter type
export type DepartmentFilter = {
    hospital: string;
    type: string;
    parent: string;
    search: string;
    active?: boolean;
};

// Define the context type
interface DepartmentContextType {
    departments: Department[];
    departmentHierarchy: Department[];
    hospitals: Hospital[];
    departmentTypes: DepartmentType[];
    loading: boolean;
    error: string | null;
    filter: DepartmentFilter;
    setFilter: React.Dispatch<React.SetStateAction<DepartmentFilter>>;
    refreshDepartments: () => Promise<void>;
    refreshHospitals: () => Promise<void>;
    getDepartmentChildren: (departmentId: string) => Promise<Department[]>;
    addNewDepartment: (
        department: Omit<
            Department,
            "id" | "createdAt" | "updatedAt" | "children"
        >,
    ) => Promise<Department>;
    updateExistingDepartment: (
        id: string,
        department: Partial<Department>,
    ) => Promise<Department>;
    removeDepartment: (id: string) => Promise<void>;
    getAllRootDepartments: () => Department[]; // Method to get all root departments
}

// Create the context
const DepartmentContext = createContext<DepartmentContextType | undefined>(
    undefined,
);

// Provider component
export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [departmentHierarchy, setDepartmentHierarchy] = useState<
        Department[]
    >([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>(
        [],
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<DepartmentFilter>({
        hospital: "all",
        type: "all",
        parent: "all",
        search: "",
    });

    // State to maintain all root departments regardless of filters
    const [allRootDepartments, setAllRootDepartments] = useState<Department[]>(
        [],
    );

    // Load department types
    useEffect(() => {
        setDepartmentTypes(getDepartmentTypes());
    }, []);

    // Function to build department hierarchy
    const buildDepartmentHierarchy = async (flatDepartments: Department[]) => {
        // First, get root departments (those without a parent)
        const rootDepartments = flatDepartments.filter((dept) => !dept.parent);

        const hierarchy: Department[] = [];

        // Process each root department
        for (const rootDept of rootDepartments) {
            // Get children for this department - ensure type safety
            const children = await getDepartmentChildrenSafe(rootDept.id);

            // Add to hierarchy with children
            hierarchy.push({
                ...rootDept,
                children,
            });
        }

        return hierarchy;
    };

    // Function to load all root departments (not affected by filters)
    const loadAllRootDepartments = async () => {
        try {
            // Get departments with no filter but make sure they're type-safe
            const allDepts = await getDepartmentsSafe({
                hospital: "all",
                type: "all",
                parent: "all",
                search: "",
            });

            // Filter to just root departments (those without a parent)
            const rootDepts = allDepts.filter((dept) => !dept.parent);
            setAllRootDepartments(rootDepts);
        } catch (err) {
            console.error("Error loading all root departments:", err);
        }
    };

    // Method to get all root departments (for filter component)
    const getAllRootDepartments = () => {
        return allRootDepartments;
    };

    // Function to fetch departments
    const refreshDepartments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Get flat list of departments using our type-safe utility
            const data = await getDepartmentsSafe(filter);
            setDepartments(data);

            // Build hierarchy if needed
            if (
                filter.parent === "all" &&
                filter.hospital === "all" &&
                filter.type === "all" &&
                !filter.search
            ) {
                const hierarchy = await buildDepartmentHierarchy(data);
                setDepartmentHierarchy(hierarchy);
            } else {
                // Just convert flat list to hierarchy format when filtered
                setDepartmentHierarchy(data);
            }
        } catch (err) {
            console.error("Error fetching departments:", err);
            setError("Failed to load departments. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    // Function to fetch hospitals (for dropdowns)
    const refreshHospitals = async () => {
        try {
            const data = await getHospitals({ status: "active" });
            const hospitals = data.map((hospital) => ({
                ...hospital,
                name: hospital.organization.name,
            }));
            setHospitals(hospitals);
        } catch (err) {
            console.error("Error fetching hospitals:", err);
            setError(
                "Failed to load hospitals for dropdown. Please try again.",
            );
        }
    };

    // Function to get department children
    const getDepartmentChildrenFunc = async (departmentId: string) => {
        try {
            // Use our type-safe utility
            return await getDepartmentChildrenSafe(departmentId);
        } catch (err) {
            console.error("Error fetching department children:", err);
            setError("Failed to load subdepartments. Please try again.");
            return [];
        }
    };

    // Add a new department
    const addNewDepartment = async (
        department: Omit<
            Department,
            "id" | "createdAt" | "updatedAt" | "children"
        >,
    ) => {
        try {
            const newDepartment = await addDepartment(department);
            // Ensure the returned department is type-safe
            const typeSafeDepartment = ensureCompleteDepartment(newDepartment);
            await refreshDepartments();
            // Refresh all root departments if this is a new root department
            if (!department.parent) {
                await loadAllRootDepartments();
            }
            return typeSafeDepartment;
        } catch (err) {
            console.error("Error adding department:", err);
            setError("Failed to add department. Please try again.");
            throw err;
        }
    };

    // Update an existing department
    const updateExistingDepartment = async (
        id: string,
        department: Partial<Department>,
    ) => {
        try {
            const rawUpdatedDepartment = await updateDepartment(id, department);
            // Ensure the returned department is type-safe
            const typeSafeDepartment =
                ensureCompleteDepartment(rawUpdatedDepartment);
            await refreshDepartments();
            // Refresh all root departments if parent relationship changed
            if ("parent" in department) {
                await loadAllRootDepartments();
            }
            return typeSafeDepartment;
        } catch (err) {
            console.error("Error updating department:", err);
            setError("Failed to update department. Please try again.");
            throw err;
        }
    };

    // Delete a department
    const removeDepartment = async (id: string) => {
        try {
            await deleteDepartment(id);
            await refreshDepartments();
            // Refresh all root departments in case a root was deleted
            await loadAllRootDepartments();
        } catch (err) {
            console.error("Error deleting department:", err);
            setError("Failed to delete department. Please try again.");
            throw err;
        }
    };

    // Load all root departments on mount (independent of filters)
    useEffect(() => {
        loadAllRootDepartments().then((r) => r);
    }, []);

    // Load departments on mount and when filter changes
    useEffect(() => {
        refreshDepartments().then((r) => r);
    }, [filter, refreshDepartments]);

    // Load hospitals on mount
    useEffect(() => {
        refreshHospitals().then((r) => r);
    }, []);

    // Context value
    const value: DepartmentContextType = {
        departments,
        departmentHierarchy,
        hospitals,
        departmentTypes,
        loading,
        error,
        filter,
        setFilter,
        refreshDepartments,
        refreshHospitals,
        getDepartmentChildren: getDepartmentChildrenFunc,
        addNewDepartment,
        updateExistingDepartment,
        removeDepartment,
        getAllRootDepartments,
    };

    return (
        <DepartmentContext.Provider value={value}>
            {children}
        </DepartmentContext.Provider>
    );
};

// Custom hook to use the department context
export const useDepartments = () => {
    const context = useContext(DepartmentContext);
    if (context === undefined) {
        throw new Error(
            "useDepartments must be used within a DepartmentProvider",
        );
    }
    return context;
};
