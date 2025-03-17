// src/context/StaffContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    addStaff,
    deleteStaff,
    getStaff,
    getStaffByDepartment,
    updateStaff,
} from "@/services/staffService";
import { getDepartments } from "@/services/departmentService";
import { getHospitals } from "@/services/hospitalService";
import { getOrganizations } from "@/services/organizationService";

export type WorkingDay =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export type WorkHours = {
    start: string;
    end: string;
};

export type WorkingHours = {
    [key in WorkingDay]?: WorkHours | null;
};

// Define the Staff type
export type Staff = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    primaryRole: {
        id: string;
        name: string;
    };
    departmentRole: {
        id: string;
        name: string; // Manager, admin, coordinator, supervisor
    };
    nhsBand?: string;
    organization: {
        id: string;
        name: string;
    };
    defaultHospital: {
        id: string;
        name: string;
    };
    departments?: {
        id: string;
        name: string;
    }[];
    usualWorkingHours?: {
        monday?: { start: string; end: string };
        tuesday?: { start: string; end: string };
        wednesday?: { start: string; end: string };
        thursday?: { start: string; end: string };
        friday?: { start: string; end: string };
        saturday?: { start: string; end: string } | null;
        sunday?: { start: string; end: string } | null;
    };
    additionalTraining?: string[]; // Array of training certifications
    startDate?: string; // ISO date string
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
};

// Define simplified types for related entities
export type Organization = {
    id: string;
    name: string;
};

export type Hospital = {
    id: string;
    name: string;
};

export type Department = {
    id: string;
    name: string;
    color?: string;
};

export type StaffRole = {
    id: string;
    name: string;
    description?: string;
};

export type DepartmentRole = {
    id: string;
    name: string;
};

// Define the filter type
export type StaffFilter = {
    organization: string;
    hospital: string;
    department: string;
    role: string;
    search: string;
    showInactive?: boolean;
};

// Define available training options
export const trainingOptions = [
    { id: "warfarin", name: "Warfarin" },
    { id: "independent_prescriber", name: "Independent Prescriber" },
    { id: "hospice", name: "Hospice" },
    { id: "icar", name: "ICAR" },
    { id: "paediatrics", name: "Paediatrics" },
    { id: "cote", name: "COTE" },
    { id: "med", name: "MED" },
    { id: "surg", name: "SURG" },
    { id: "emrg", name: "EMRG" },
    { id: "history", name: "Medication History Taking" },
    { id: "tto", name: "TTO Processing" },
    { id: "iv", name: "IV Preparation" },
    { id: "chemo", name: "Chemotherapy" },
];

// Define department roles
export const departmentRoles = [
    { id: "manager", name: "Manager" },
    { id: "admin", name: "Admin" },
    { id: "coordinator", name: "Coordinator" },
    { id: "supervisor", name: "Supervisor" },
    { id: "staff", name: "Staff" },
];

// Define NHS bands
export const nhsBands = [
    { id: "band2", name: "Band 2" },
    { id: "band3", name: "Band 3" },
    { id: "band4", name: "Band 4" },
    { id: "band5", name: "Band 5" },
    { id: "band6", name: "Band 6" },
    { id: "band7", name: "Band 7" },
    { id: "band8a", name: "Band 8a" },
    { id: "band8b", name: "Band 8b" },
    { id: "band8c", name: "Band 8c" },
    { id: "band8d", name: "Band 8d" },
    { id: "band9", name: "Band 9" },
];

// Define the context type
interface StaffContextType {
    staff: Staff[];
    organizations: Organization[];
    hospitals: Hospital[];
    departments: Department[];
    staffRoles: StaffRole[];
    loading: boolean;
    error: string | null;
    filter: StaffFilter;
    setFilter: React.Dispatch<React.SetStateAction<StaffFilter>>;
    refreshStaff: () => Promise<void>;
    refreshOrganizations: () => Promise<void>;
    refreshHospitals: () => Promise<void>;
    refreshDepartments: () => Promise<void>;
    refreshStaffRoles: () => Promise<void>;
    getStaffByDepartment: (departmentId: string) => Promise<Staff[]>;
    addNewStaff: (
        staff: Omit<Staff, "id" | "createdAt" | "updatedAt">,
    ) => Promise<Staff>;
    updateExistingStaff: (id: string, staff: Partial<Staff>) => Promise<Staff>;
    removeStaff: (id: string) => Promise<void>;
}

// Create the context
const StaffContext = createContext<StaffContextType | undefined>(undefined);

// Provider component
export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [staffRoles, setStaffRoles] = useState<StaffRole[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<StaffFilter>({
        organization: "all",
        hospital: "all",
        department: "all",
        role: "all",
        search: "",
    });

    // Function to fetch staff
    const refreshStaff = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getStaff(filter);
            // @ts-expect-error Have selected important parameters as necessary and other as optional.
            setStaff(data);
        } catch (err) {
            console.error("Error fetching staff:", err);
            setError("Failed to load staff. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch organizations
    const refreshOrganizations = async () => {
        try {
            const data = await getOrganizations({ status: "active" });
            setOrganizations(data);
        } catch (err) {
            console.error("Error fetching organizations:", err);
            setError("Failed to load organizations. Please try again.");
        }
    };

    // Function to fetch hospitals
    const refreshHospitals = async () => {
        try {
            const data = await getHospitals({ status: "active" });
            setHospitals(data);
        } catch (err) {
            console.error("Error fetching hospitals:", err);
            setError("Failed to load hospitals. Please try again.");
        }
    };

    // Function to fetch departments
    const refreshDepartments = async () => {
        try {
            const data = await getDepartments({ active: true });
            setDepartments(data);
        } catch (err) {
            console.error("Error fetching departments:", err);
            setError("Failed to load departments. Please try again.");
        }
    };

    // Function to fetch staff roles
    const refreshStaffRoles = async () => {
        try {
            // This would typically be a service call, but we're defining them statically
            setStaffRoles([
                {
                    id: "pharmacist",
                    name: "Pharmacist",
                    description: "Licensed pharmacist",
                },
                {
                    id: "technician",
                    name: "Pharmacy Technician",
                    description: "Qualified pharmacy technician",
                },
                {
                    id: "dispenser",
                    name: "Dispenser",
                    description: "Pharmacy dispenser",
                },
                {
                    id: "prereg",
                    name: "Pre-Registration Pharmacist",
                    description: "Pharmacist in training",
                },
                {
                    id: "assistant",
                    name: "Pharmacy Assistant",
                    description: "Pharmacy assistant",
                },
                {
                    id: "porter",
                    name: "Porter",
                    description: "Pharmacy porter",
                },
            ]);
        } catch (err) {
            console.error("Error fetching staff roles:", err);
            setError("Failed to load staff roles. Please try again.");
        }
    };

    // Function to get staff by department
    const getStaffByDepartmentFunc = async (departmentId: string) => {
        try {
            return await getStaffByDepartment(departmentId);
        } catch (err) {
            console.error("Error fetching staff for department:", err);
            setError(
                "Failed to load staff for this department. Please try again.",
            );
            return [];
        }
    };

    // Add a new staff member
    const addNewStaff = async (
        staffData: Omit<Staff, "id" | "createdAt" | "updatedAt">,
    ) => {
        try {
            const newStaff = await addStaff(staffData);
            await refreshStaff();
            return newStaff;
        } catch (err) {
            console.error("Error adding staff:", err);
            setError("Failed to add staff. Please try again.");
            throw err;
        }
    };

    // Update an existing staff member
    const updateExistingStaff = async (
        id: string,
        staffData: Partial<Staff>,
    ) => {
        try {
            const updatedStaff = await updateStaff(id, staffData);
            await refreshStaff();
            return updatedStaff;
        } catch (err) {
            console.error("Error updating staff:", err);
            setError("Failed to update staff. Please try again.");
            throw err;
        }
    };

    // Delete a staff member
    const removeStaff = async (id: string) => {
        try {
            await deleteStaff(id);
            await refreshStaff();
        } catch (err: any) {
            console.error("Error deleting staff:", err);
            setError(
                err.message || "Failed to delete staff. Please try again.",
            );
            throw err;
        }
    };

    // Load staff on mount and when filter changes
    useEffect(() => {
        refreshStaff();
    }, [filter]);

    // Load related data on mount
    useEffect(() => {
        Promise.all([
            refreshOrganizations(),
            refreshHospitals(),
            refreshDepartments(),
            refreshStaffRoles(),
        ]);
    }, []);

    // Context value
    const value: StaffContextType = {
        staff,
        organizations,
        hospitals,
        departments,
        staffRoles,
        loading,
        error,
        filter,
        setFilter,
        refreshStaff,
        refreshOrganizations,
        refreshHospitals,
        refreshDepartments,
        refreshStaffRoles,
        getStaffByDepartment: getStaffByDepartmentFunc,
        addNewStaff,
        updateExistingStaff,
        removeStaff,
    };

    return (
        <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
    );
};

// Custom hook to use the staff context
export const useStaff = () => {
    const context = useContext(StaffContext);
    if (context === undefined) {
        throw new Error("useStaff must be used within a StaffProvider");
    }
    return context;
};
