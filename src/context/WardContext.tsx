// // src/context/WardContext.tsx
// "use client";
//
// import React, { createContext, useContext, useEffect, useState } from "react";
// import {
//     addWard,
//     deleteWard,
//     getWards,
//     getWardsByDepartment,
//     updateWard,
// } from "@/services/wardService";
// import { getDepartments } from "@/services/departmentService";
// import { getHospitals } from "@/services/hospitalService";
//
// // Define the Ward type
// export type Ward = {
//     id: string;
//     name: string;
//     code: string;
//     department: {
//         id: string;
//         name: string;
//         color?: string;
//     };
//     hospital: {
//         id: string;
//         name: string;
//     };
//     bedCount: number;
//     active: boolean;
//     createdAt?: string;
//     updatedAt?: string;
// };
//
// export type WardDepartmentAssignment = {
//     id: string;
//     department: {
//         id: string;
//         name: string;
//         code: string;
//         color?: string;
//     };
//     isPrimary: boolean;
//     startDate?: string;
//     endDate?: string | null;
// };
//
// // Define the Department type (simplified for the context)
// export type Department = {
//     id: string;
//     name: string;
//     color?: string;
//     hospital?: {
//         id: string;
//         name: string;
//     };
// };
//
// // Define the Hospital type (simplified for the context)
// export type Hospital = {
//     id: string;
//     name: string;
// };
//
// // Define the filter type
// export type WardFilter = {
//     department: string;
//     hospital: string;
//     search: string;
//     active?: boolean;
// };
//
// // Define the context type
// interface WardContextType {
//     wards: Ward[];
//     departments: Department[];
//     hospitals: Hospital[];
//     loading: boolean;
//     error: string | null;
//     filter: WardFilter;
//     setFilter: React.Dispatch<React.SetStateAction<WardFilter>>;
//     refreshWards: () => Promise<void>;
//     refreshDepartments: () => Promise<void>;
//     refreshHospitals: () => Promise<void>;
//     getWardsByDepartment: (departmentId: string) => Promise<Ward[]>;
//     addNewWard: (
//         ward: Omit<Ward, "id" | "createdAt" | "updatedAt">,
//     ) => Promise<Ward>;
//     updateExistingWard: (id: string, ward: Partial<Ward>) => Promise<Ward>;
//     removeWard: (id: string) => Promise<void>;
// }
//
// // Create the context
// const WardContext = createContext<WardContextType | undefined>(undefined);
//
// // Provider component
// export const WardProvider: React.FC<{ children: React.ReactNode }> = ({
//     children,
// }) => {
//     const [wards, setWards] = useState<Ward[]>([]);
//     const [departments, setDepartments] = useState<Department[]>([]);
//     const [hospitals, setHospitals] = useState<Hospital[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [filter, setFilter] = useState<WardFilter>({
//         department: "all",
//         hospital: "all",
//         search: "",
//     });
//
//     // Function to fetch wards
//     const refreshWards = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//
//             const data = await getWards(filter);
//             setWards(data);
//         } catch (err) {
//             console.error("Error fetching wards:", err);
//             setError("Failed to load wards. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // Function to fetch departments (for dropdowns)
//     const refreshDepartments = async () => {
//         try {
//             // Get departments that don't have a parent (top-level)
//             const data = await getDepartments({ active: true });
//             setDepartments(data);
//         } catch (err) {
//             console.error("Error fetching departments:", err);
//             setError(
//                 "Failed to load departments for dropdown. Please try again.",
//             );
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
//     // Function to get wards by department
//     const getWardsByDepartmentFunc = async (departmentId: string) => {
//         try {
//             return await getWardsByDepartment(departmentId);
//         } catch (err) {
//             console.error("Error fetching wards for department:", err);
//             setError(
//                 "Failed to load wards for this department. Please try again.",
//             );
//             return [];
//         }
//     };
//
//     // Add a new ward
//     const addNewWard = async (
//         ward: Omit<Ward, "id" | "createdAt" | "updatedAt">,
//     ) => {
//         try {
//             const newWard = await addWard(ward);
//             await refreshWards();
//             return newWard;
//         } catch (err) {
//             console.error("Error adding ward:", err);
//             setError("Failed to add ward. Please try again.");
//             throw err;
//         }
//     };
//
//     // Update an existing ward
//     const updateExistingWard = async (id: string, ward: Partial<Ward>) => {
//         try {
//             const updatedWard = await updateWard(id, ward);
//             await refreshWards();
//             return updatedWard;
//         } catch (err) {
//             console.error("Error updating ward:", err);
//             setError("Failed to update ward. Please try again.");
//             throw err;
//         }
//     };
//
//     // Delete a ward
//     const removeWard = async (id: string) => {
//         try {
//             await deleteWard(id);
//             await refreshWards();
//         } catch (err: any) {
//             console.error("Error deleting ward:", err);
//             setError(err.message || "Failed to delete ward. Please try again.");
//             throw err;
//         }
//     };
//
//     // Load wards on mount and when filter changes
//     useEffect(() => {
//         refreshWards();
//     }, [filter]);
//
//     // Load departments and hospitals on mount
//     useEffect(() => {
//         const loadData = async () => {
//             await Promise.all([refreshDepartments(), refreshHospitals()]);
//         };
//
//         loadData();
//     }, []);
//
//     // Context value
//     const value: WardContextType = {
//         wards,
//         departments,
//         hospitals,
//         loading,
//         error,
//         filter,
//         setFilter,
//         refreshWards,
//         refreshDepartments,
//         refreshHospitals,
//         getWardsByDepartment: getWardsByDepartmentFunc,
//         addNewWard,
//         updateExistingWard,
//         removeWard,
//     };
//
//     return (
//         <WardContext.Provider value={value}>{children}</WardContext.Provider>
//     );
// };
//
// // Custom hook to use the ward context
// export const useWards = () => {
//     const context = useContext(WardContext);
//     if (context === undefined) {
//         throw new Error("useWards must be used within a WardProvider");
//     }
//     return context;
// };

// src/context/WardContext.tsx
"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    addWard,
    deleteWard,
    getWards,
    getWardsByDepartment,
    updateWard,
} from "@/services/wardService";
import { getDepartments } from "@/services/departmentService";
import {
    assignWardToDepartment as assignWardToDepartmentService,
    getWardDepartmentAssignments,
    getWardsForDepartment as getWardsForDepartmentService,
    removeWardDepartmentAssignment as removeWardDepartmentAssignmentService,
    setPrimaryDepartment as setPrimaryDepartmentService,
} from "../services/wardDepartmentService";
import { ensureCompleteDepartment } from "@/utils/departmentUtils";
import { ensureCompleteHospital } from "@/utils/hospitalUtils";
import { getHospitals } from "@/services/hospitalService";
import { ensureCompleteWardDepartmentAssignment } from "@/utils/wardDepartmentUtils";
import { Hospital } from "@/context/HospitalContext";

// Define the Ward type
export type Ward = {
    id: string;
    name: string;
    code: string;
    // department: {
    //     id: string;
    //     name: string;
    //     color?: string;
    // };
    // hospital: {
    //     id: string;
    //     name: string;
    // };
    department: Department;
    hospital: Hospital;
    bedCount: number;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
    departments?: WardDepartmentAssignment[]; // Added for multi-department support
};

export type WardDepartmentAssignment = {
    id: string;
    department: {
        id: string;
        name: string;
        code: string;
        color?: string;
    };
    isPrimary: boolean;
    startDate?: string;
    endDate?: string | null;
};

// Define the Department type (simplified for the context)
export type Department = {
    id: string;
    name: string;
    color?: string;
    hospital?: {
        id: string;
        name: string;
    };
};

// Define the Hospital type (simplified for the context)
// export type Hospital = {
//     id: string;
//     name: string;
// };

// Define the filter type
export type WardFilter = {
    department: string;
    hospital: string;
    search: string;
    active?: boolean;
};

// Define the context type
interface WardContextType {
    wards: Ward[];
    departments: Department[];
    hospitals: Hospital[];
    loading: boolean;
    error: string | null;
    filter: WardFilter;
    setFilter: React.Dispatch<React.SetStateAction<WardFilter>>;
    refreshWards: () => Promise<void>;
    refreshDepartments: () => Promise<void>;
    refreshHospitals: () => Promise<void>;
    getWardsByDepartment: (departmentId: string) => Promise<Ward[]>;
    addNewWard: (
        ward: Omit<Ward, "id" | "createdAt" | "updatedAt">,
    ) => Promise<Ward>;
    updateExistingWard: (id: string, ward: Partial<Ward>) => Promise<Ward>;
    removeWard: (id: string) => Promise<void>;

    // New properties for ward-department assignments
    currentWardDepartments: WardDepartmentAssignment[];
    setCurrentWardDepartments: React.Dispatch<
        React.SetStateAction<WardDepartmentAssignment[]>
    >;
    getWardDepartments: (wardId: string) => Promise<WardDepartmentAssignment[]>;
    assignWardToDepartment: (
        wardId: string,
        departmentId: string,
        isPrimary?: boolean,
    ) => Promise<void>;
    setPrimaryDepartment: (
        assignmentId: string,
        wardId: string,
    ) => Promise<void>;
    removeWardDepartmentAssignment: (assignmentId: string) => Promise<void>;
    getWardsForDepartment: (departmentId: string) => Promise<Ward[]>;
}

// Create the context
const WardContext = createContext<WardContextType | undefined>(undefined);

// Provider component
export const WardProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [wards, setWards] = useState<Ward[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<WardFilter>({
        department: "all",
        hospital: "all",
        search: "",
    });

    // New state for ward-department assignments
    const [currentWardDepartments, setCurrentWardDepartments] = useState<
        WardDepartmentAssignment[]
    >([]);

    // Function to fetch wards
    const refreshWards = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getWards(filter);

            setWards(data as Ward[]);
        } catch (err) {
            console.error("Error fetching wards:", err);
            setError("Failed to load wards. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    // Function to fetch departments (for dropdowns)
    const refreshDepartments = async () => {
        try {
            // Get departments that don't have a parent (top-level)
            const data = await getDepartments({ active: true });
            const typeSafeDepartments = data.map((dept) =>
                ensureCompleteDepartment(dept),
            );
            setDepartments(typeSafeDepartments);
        } catch (err) {
            console.error("Error fetching departments:", err);
            setError(
                "Failed to load departments for dropdown. Please try again.",
            );
        }
    };

    // Function to fetch hospitals (for dropdowns)
    const refreshHospitals = async () => {
        try {
            const data = await getHospitals({ status: "active" });
            const typeSafeHospitals = data.map((hospital) =>
                ensureCompleteHospital(hospital),
            );
            setHospitals(typeSafeHospitals);
        } catch (err) {
            console.error("Error fetching hospitals:", err);
            setError(
                "Failed to load hospitals for dropdown. Please try again.",
            );
        }
    };

    // Function to get wards by department
    const getWardsByDepartmentFunc = async (departmentId: string) => {
        try {
            return await getWardsByDepartment(departmentId);
        } catch (err) {
            console.error("Error fetching wards for department:", err);
            setError(
                "Failed to load wards for this department. Please try again.",
            );
            return [];
        }
    };

    // Add a new ward
    const addNewWard = async (
        ward: Omit<Ward, "id" | "createdAt" | "updatedAt">,
    ) => {
        try {
            const newWard = await addWard(ward);
            await refreshWards();
            return newWard;
        } catch (err) {
            console.error("Error adding ward:", err);
            setError("Failed to add ward. Please try again.");
            throw err;
        }
    };

    // Update an existing ward
    const updateExistingWard = async (id: string, ward: Partial<Ward>) => {
        try {
            const updatedWard = await updateWard(id, ward);
            await refreshWards();
            return updatedWard;
        } catch (err) {
            console.error("Error updating ward:", err);
            setError("Failed to update ward. Please try again.");
            throw err;
        }
    };

    // Delete a ward
    const removeWard = async (id: string) => {
        try {
            await deleteWard(id);
            await refreshWards();
        } catch (err) {
            console.error("Error deleting ward:", err);
            // @ts-expect-error error message
            setError(err.message || "Failed to delete ward. Please try again.");
            throw err;
        }
    };

    // New function to get a ward's department assignments
    const getWardDepartments = async (wardId: string) => {
        try {
            const assignments = await getWardDepartmentAssignments(wardId);

            // Transform to ensure they match the WardDepartmentAssignment type
            const typeSafeAssignments = assignments
                .filter((assignment) => assignment.department !== null) // Filter out null departments
                .map((assignment) =>
                    // @ts-expect-error no type for assignment
                    ensureCompleteWardDepartmentAssignment(assignment),
                );

            setCurrentWardDepartments(typeSafeAssignments);
            return typeSafeAssignments;
        } catch (err) {
            console.error("Error getting ward departments:", err);
            setError(
                "Failed to load department assignments for this ward. Please try again.",
            );
            return [];
        }
    };

    // New function to assign a ward to a department
    const assignWardToDepartment = async (
        wardId: string,
        departmentId: string,
        isPrimary = false,
    ) => {
        try {
            await assignWardToDepartmentService(
                wardId,
                departmentId,
                isPrimary,
            );
            await getWardDepartments(wardId); // Refresh assignments
            return;
        } catch (err) {
            console.error("Error assigning ward to department:", err);
            setError("Failed to assign department to ward. Please try again.");
            throw err;
        }
    };

    // New function to set a department as primary
    const setPrimaryDepartment = async (
        assignmentId: string,
        wardId: string,
    ) => {
        try {
            await setPrimaryDepartmentService(assignmentId, wardId);
            await getWardDepartments(wardId); // Refresh assignments
            return;
        } catch (err) {
            console.error("Error setting primary department:", err);
            setError("Failed to set primary department. Please try again.");
            throw err;
        }
    };

    // New function to remove a ward-department assignment
    const removeWardDepartmentAssignment = async (assignmentId: string) => {
        try {
            await removeWardDepartmentAssignmentService(assignmentId);

            // Update local state
            setCurrentWardDepartments((prev) =>
                prev.filter((assignment) => assignment.id !== assignmentId),
            );

            return;
        } catch (err) {
            console.error("Error removing ward-department assignment:", err);
            setError(
                "Failed to remove department assignment. Please try again.",
            );
            throw err;
        }
    };

    // New function to get all wards for a department
    const getWardsForDepartment = async (departmentId: string) => {
        try {
            return await getWardsForDepartmentService(departmentId);
        } catch (err) {
            console.error("Error getting wards for department:", err);
            setError(
                "Failed to load wards for this department. Please try again.",
            );
            return [];
        }
    };

    // Load wards on mount and when filter changes
    useEffect(() => {
        refreshWards().then((r) => r);
    }, [filter, refreshWards]);

    // Load departments and hospitals on mount
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([refreshDepartments(), refreshHospitals()]);
        };

        loadData().then((r) => r);
    }, []);

    // Context value
    const value: WardContextType = {
        wards,
        departments,
        hospitals,
        loading,
        error,
        filter,
        setFilter,
        refreshWards,
        refreshDepartments,
        refreshHospitals,
        // @ts-expect-error I dont know what this is TODO to fix
        getWardsByDepartment: getWardsByDepartmentFunc,
        addNewWard,
        updateExistingWard,
        removeWard,

        // New values for ward-department assignments
        currentWardDepartments,
        setCurrentWardDepartments,
        getWardDepartments,
        assignWardToDepartment,
        setPrimaryDepartment,
        removeWardDepartmentAssignment,
        //@ts-expect-error TODO to fix...i dont know what this issue is
        getWardsForDepartment,
    };

    return (
        <WardContext.Provider value={value}>{children}</WardContext.Provider>
    );
};

// Custom hook to use the ward context
export const useWards = () => {
    const context = useContext(WardContext);
    if (context === undefined) {
        throw new Error("useWards must be used within a WardProvider");
    }
    return context;
};
