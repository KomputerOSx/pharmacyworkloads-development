// // src/context/DepartmentContext.tsx
// "use client";
//
// import React, {
//     createContext,
//     useCallback,
//     useContext,
//     useEffect,
//     useState,
// } from "react";
// import {
//     addDepartment,
//     deleteDepartment,
//     getDepartmentTypes,
//     updateDepartment,
// } from "@/services/departmentService";
// import { getHospitals } from "@/services/hospitalService";
// import {
//     ensureCompleteDepartment,
//     getDepartmentChildrenSafe,
//     getDepartmentsSafe,
// } from "@/utils/departmentUtils";
// import { Hospital } from "@/context/HospitalContext";
// import { Timestamp } from "firebase/firestore";
//
// // Define the Department type
// export type Department = {
//     id: string;
//     name: string;
//     code: string;
//     description?: string;
//     type: string;
//     color?: string;
//     parent?: {
//         id: string;
//         name: string;
//     } | null;
//     uniqueProperties?: UniqueDepartmentProperties;
//     active: boolean;
//     createdAt?: Timestamp | string;
//     updatedAt?: Timestamp | string;
//     children?: Department[];
// };
//
// export type UniqueDepartmentProperties = {
//     requiresLunchCover?: boolean;
//     pharmacistCount?: number;
//     technicianCount?: number;
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
//     getAllRootDepartments: () => Department[]; // Method to get all root departments
// }
//
// // Create the context
// const DepartmentContext = createContext<DepartmentContextType | undefined>(
//     undefined,
// );
//
// // Provider component
// export const DepartmentProvider: React.FC<{
//     children: React.ReactNode;
//     organisationId: string;
// }> = ({ children }) => {
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
//     // State to maintain all root departments regardless of filters
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
//             // Get children for this department - ensure type safety
//             const children = await getDepartmentChildrenSafe(rootDept.id);
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
//             // Get departments with no filter but make sure they're type-safe
//             const allDepts = await getDepartmentsSafe({
//                 hospital: "all",
//                 type: "all",
//                 parent: "all",
//                 search: "",
//             });
//
//             // Filter to just root departments (those without a parent)
//             const rootDepts = allDepts.filter((dept) => !dept.parent);
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
//     const refreshDepartments = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError(null);
//
//             // Get flat list of departments using our type-safe utility
//             const data = await getDepartmentsSafe(filter);
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
//     }, [filter]);
//
//     // Function to fetch hospitals (for dropdowns)
//     const refreshHospitals = async () => {
//         try {
//             const data = await getHospitals({ status: "active" });
//             const hospitals = data.map((hospital) => ({
//                 ...hospital,
//                 name: hospital.organization.name,
//             }));
//             setHospitals(hospitals as Hospital[]);
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
//             // Use our type-safe utility
//             return await getDepartmentChildrenSafe(departmentId);
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
//             // Ensure the returned department is type-safe
//             const typeSafeDepartment = ensureCompleteDepartment(newDepartment);
//             await refreshDepartments();
//             // Refresh all root departments if this is a new root department
//             if (!department.parent) {
//                 await loadAllRootDepartments();
//             }
//             return typeSafeDepartment;
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
//             const rawUpdatedDepartment = await updateDepartment(id, department);
//             // Ensure the returned department is type-safe
//             const typeSafeDepartment =
//                 ensureCompleteDepartment(rawUpdatedDepartment);
//             await refreshDepartments();
//             // Refresh all root departments if parent relationship changed
//             if ("parent" in department) {
//                 await loadAllRootDepartments();
//             }
//             return typeSafeDepartment;
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
//             setError("Failed to delete department. Please try again.");
//             throw err;
//         }
//     };
//
//     // Load all root departments on mount (independent of filters)
//     useEffect(() => {
//         loadAllRootDepartments().then((r) => r);
//     }, []);
//
//     // Load departments on mount and when filter changes
//     useEffect(() => {
//         refreshDepartments().then((r) => r);
//     }, [filter, refreshDepartments]);
//
//     // Load hospitals on mount
//     useEffect(() => {
//         refreshHospitals().then((r) => r);
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
import {
    ensureCompleteDepartment,
    getDepartmentChildrenSafe,
    getDepartmentsSafe,
} from "@/utils/departmentUtils";
import { Hospital } from "@/context/HospitalContext";
import { Timestamp } from "firebase/firestore";
import { getHospitals } from "@/services/hospitalService";

// Define the Department type
export type Department = {
    id: string;
    name: string;
    code: string;
    description?: string;
    type: string;
    color?: string;
    hospitalId?: string;
    parent?: {
        id: string;
        name: string;
    } | null;
    uniqueProperties?: UniqueDepartmentProperties;
    active: boolean;
    createdAt?: Timestamp | string;
    updatedAt?: Timestamp | string;
    children?: Department[];
};

export type UniqueDepartmentProperties = {
    requiresLunchCover?: boolean;
    pharmacistCount?: number;
    technicianCount?: number;
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
        hospitalId: string,
    ) => Promise<Department>;
    updateExistingDepartment: (
        id: string,
        hospitalId: string,
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
export const DepartmentProvider: React.FC<{
    children: React.ReactNode;
    organisationId: string;
}> = ({ children, organisationId }) => {
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
        hospital: organisationId || "all", // Use the org ID directly
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
            if (!organisationId) {
                console.error("No organisation ID provided for departments");
                return;
            }

            // Get departments for this organisation
            const allDepts = await getDepartmentsSafe(organisationId, filter);

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
            if (!organisationId) {
                console.error("No organisation ID provided for departments");
                setDepartments([]);
                setDepartmentHierarchy([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            // Get flat list of departments using our type-safe utility (pass org ID directly)
            const data = await getDepartmentsSafe(organisationId, filter);

            // Apply additional client-side filtering if needed
            let filteredData = [...data];

            if (filter.type !== "all") {
                filteredData = filteredData.filter(
                    (dept) => dept.type === filter.type,
                );
            }

            if (filter.parent !== "all") {
                if (filter.parent === "none") {
                    filteredData = filteredData.filter((dept) => !dept.parent);
                } else {
                    filteredData = filteredData.filter(
                        (dept) =>
                            dept.parent && dept.parent.id === filter.parent,
                    );
                }
            }

            if (filter.search) {
                const search = filter.search.toLowerCase();
                filteredData = filteredData.filter(
                    (dept) =>
                        (dept.name &&
                            dept.name.toLowerCase().includes(search)) ||
                        (dept.code &&
                            dept.code.toLowerCase().includes(search)) ||
                        (dept.description &&
                            dept.description.toLowerCase().includes(search)),
                );
            }

            setDepartments(filteredData);

            // Build hierarchy if needed
            if (
                filter.parent === "all" &&
                filter.type === "all" &&
                !filter.search
            ) {
                const hierarchy = await buildDepartmentHierarchy(filteredData);
                setDepartmentHierarchy(hierarchy);
            } else {
                // Just convert flat list to hierarchy format when filtered
                setDepartmentHierarchy(filteredData);
            }
        } catch (err) {
            console.error("Error fetching departments:", err);
            setError("Failed to load departments. Please try again.");
            setDepartments([]);
            setDepartmentHierarchy([]);
        } finally {
            setLoading(false);
        }
    }, [filter, organisationId]);

    // Function to fetch hospitals (for dropdowns)
    const refreshHospitals = async () => {
        try {
            if (!organisationId) {
                console.error("No organisation ID provided for hospitals");
                setHospitals([]);
                return;
            }

            // Use the correct function with organisation ID
            const data = await getHospitals(organisationId);
            setHospitals(data);
        } catch (err) {
            console.error("Error fetching hospitals:", err);
            setError(
                "Failed to load hospitals for dropdown. Please try again.",
            );
            setHospitals([]);
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
        hospitalId: string,
    ) => {
        try {
            if (!hospitalId) {
                throw new Error(
                    "Hospital ID is required to create a department",
                );
            }

            const newDepartment = await addDepartment(department, hospitalId);
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
        hospitalId: string,
        department: Partial<Department>,
    ) => {
        try {
            if (!hospitalId) {
                throw new Error(
                    "Hospital ID is required to update a department",
                );
            }

            const rawUpdatedDepartment = await updateDepartment(
                id,
                hospitalId,
                department,
            );
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

    // Update filter when organisationId changes
    useEffect(() => {
        setFilter((prevFilter) => ({
            ...prevFilter,
            hospital: organisationId,
        }));
    }, [organisationId]);

    // Load all root departments on mount (independent of filters)
    useEffect(() => {
        if (organisationId) {
            loadAllRootDepartments();
        }
    }, [organisationId]);

    // Load departments on mount and when filter changes
    useEffect(() => {
        if (organisationId) {
            refreshDepartments();
        }
    }, [filter, organisationId, refreshDepartments]);

    // Load hospitals on mount
    useEffect(() => {
        if (organisationId) {
            refreshHospitals();
        }
    }, [organisationId]);

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
