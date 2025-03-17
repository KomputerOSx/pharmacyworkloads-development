// src/context/DepartmentContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    addDepartment,
    deleteDepartment,
    getDepartmentChildren,
    getDepartments,
    getDepartmentTypes,
    updateDepartment,
} from "@/services/departmentService";
import { getHospitals } from "@/services/hospitalService";

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
            // Get children for this department
            const children = await getDepartmentChildren(rootDept.id);

            // Add to hierarchy with children
            hierarchy.push({
                ...rootDept,
                children,
            });
        }

        return hierarchy;
    };

    // Function to fetch departments
    const refreshDepartments = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get flat list of departments
            const data = await getDepartments(filter);
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
    };

    // Function to fetch hospitals (for dropdowns)
    const refreshHospitals = async () => {
        try {
            const data = await getHospitals({ status: "active" });
            setHospitals(data);
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
            return await getDepartments({ parent: departmentId });
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
            await refreshDepartments();
            return newDepartment;
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
            const updatedDepartment = await updateDepartment(id, department);
            await refreshDepartments();
            return updatedDepartment;
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
        } catch (err: any) {
            console.error("Error deleting department:", err);
            setError(
                err.message || "Failed to delete department. Please try again.",
            );
            throw err;
        }
    };

    // Load departments on mount and when filter changes
    useEffect(() => {
        refreshDepartments();
    }, [filter]);

    // Load hospitals on mount
    useEffect(() => {
        refreshHospitals();
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
