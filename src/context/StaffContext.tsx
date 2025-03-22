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
import {
    assignStaffToOrganisation,
    assignStaffToHospital,
    assignStaffToDepartment,
    getStaffOrganisationAssignments,
    getStaffHospitalAssignments,
    getStaffDepartmentAssignments,
    getStaffAssignments,
    setPrimaryHospital,
    removeStaffOrganisationAssignment,
    removeStaffHospitalAssignment,
    removeStaffDepartmentAssignment,
    removeStaffAssignments,
} from "@/services/staffAssignmentService";
import { getDepartments } from "@/services/departmentService";
import { getHospitals } from "@/services/hospitalService";
import { getOrganisations } from "@/services/organisationService";
import { Organisation } from "@/context/OrganisationContext";
import { Hospital } from "./HospitalContext";
import { Department } from "@/context/DepartmentContext";

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
    organisation: {
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

// Using your existing type definitions
export type StaffOrganisationAssignment = {
    id: string;
    staff: Staff;
    organisation: Organisation;
};

export type StaffHospitalAssignment = {
    id: string;
    staff: Staff;
    hospital: Hospital;
    isPrimary: boolean;
    startDate?: string;
    endDate?: string | null;
};

export type StaffDepartmentAssignment = {
    id: string;
    department: Department;
    role: string; // e.g., "Pharmacist", "Doctor"
    departmentRole: string; // e.g., "Manager", "Staff"
    isPrimary: boolean;
    startDate?: string;
    endDate?: string | null;
};

export type StaffAssignments = {
    id: string;
    organisation: Organisation;
    hospital: Hospital;
    department: Department;
    role: string; // e.g., "Pharmacist", "Doctor"
    departmentRole: string; // e.g., "Manager", "Staff"
    isPrimary: boolean;
    startDate?: string;
    endDate?: string | null;
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
    organisation: string;
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
    organisations: Organisation[];
    hospitals: Hospital[];
    departments: Department[];
    staffRoles: StaffRole[];
    loading: boolean;
    error: string | null;
    filter: StaffFilter;
    setFilter: React.Dispatch<React.SetStateAction<StaffFilter>>;
    refreshStaff: () => Promise<void>;
    refreshOrganisations: () => Promise<void>;
    refreshHospitals: () => Promise<void>;
    refreshDepartments: () => Promise<void>;
    refreshStaffRoles: () => Promise<void>;
    getStaffByDepartment: (departmentId: string) => Promise<Staff[]>;
    addNewStaff: (
        staff: Omit<Staff, "id" | "createdAt" | "updatedAt">,
    ) => Promise<Staff>;
    updateExistingStaff: (id: string, staff: Partial<Staff>) => Promise<Staff>;
    removeStaff: (id: string) => Promise<void>;

    // Staff Assignment Serivce Functions
    assignStaffToOrganisation: (
        staffId: string,
        organisationId: string,
        isPrimary?: boolean,
    ) => Promise<{ id: string; isPrimary: boolean }>;

    assignStaffToHospital: (
        staffId: string,
        hospitalId: string,
        isPrimary?: boolean,
    ) => Promise<{ id: string; isPrimary: boolean }>;

    assignStaffToDepartment: (
        staffId: string,
        departmentId: string,
        role?: string,
        departmentRole?: string,
        isPrimary?: boolean,
    ) => Promise<{ id: string; isPrimary: boolean }>;

    // Retrieval functions
    getStaffOrganisationAssignments: (
        staffId: string,
    ) => Promise<StaffOrganisationAssignment[]>;
    getStaffHospitalAssignments: (
        staffId: string,
    ) => Promise<StaffHospitalAssignment[]>;
    getStaffDepartmentAssignments: (
        staffId: string,
    ) => Promise<StaffDepartmentAssignment[]>;
    getStaffAssignments: (staffId: string) => Promise<{
        organisationAssignments: StaffOrganisationAssignment[];
        hospitalAssignments: StaffHospitalAssignment[];
        departmentAssignments: StaffDepartmentAssignment[];
    }>;

    // Primary setting function
    setPrimaryHospital: (
        staffId: string,
        assignmentId: string,
    ) => Promise<void>;

    // Removal functions
    removeStaffOrganisationAssignment: (assignmentId: string) => Promise<void>;
    removeStaffHospitalAssignment: (assignmentId: string) => Promise<void>;
    removeStaffDepartmentAssignment: (assignmentId: string) => Promise<void>;
    removeStaffAssignments: (staffId: string) => Promise<void>;

    // Optional - current assignments state if needed in UI
    currentAssignments?: {
        organisationAssignments: StaffOrganisationAssignment[];
        hospitalAssignments: StaffHospitalAssignment[];
        departmentAssignments: StaffDepartmentAssignment[];
    } | null;

    setCurrentAssignments?: React.Dispatch<
        React.SetStateAction<{
            organisationAssignments: StaffOrganisationAssignment[];
            hospitalAssignments: StaffHospitalAssignment[];
            departmentAssignments: StaffDepartmentAssignment[];
        } | null>
    >;
}

// Create the context
const StaffContext = createContext<StaffContextType | undefined>(undefined);

// Provider component
export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [staff, setStaff] = useState<Staff[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentAssignments, setCurrentAssignments] = useState(null);
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [staffRoles, setStaffRoles] = useState<StaffRole[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<StaffFilter>({
        organisation: "all",
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

    // Function to fetch organisations
    const refreshOrganisations = async () => {
        try {
            const data = await getOrganisations({ status: "active" });
            setOrganisations(data);
        } catch (err) {
            console.error("Error fetching organisations:", err);
            setError("Failed to load organisations. Please try again.");
        }
    };

    // Function to fetch hospitals
    const refreshHospitals = async () => {
        try {
            const data = await getHospitals({ status: "active" });
            // @ts-expect-error Only a refresh...Not requiring all data
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
            // @ts-expect-error Only a refresh...Not requiring all data
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
        } catch (err) {
            console.error("Error deleting staff:", err);
            setError("Failed to delete staff. Please try again.");
            throw err;
        }
    };

    // Load staff on mount and when filter changes
    useEffect(
        () => {
            refreshStaff().then();
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [filter],
    );

    // Load related data on mount
    useEffect(() => {
        Promise.all([
            refreshOrganisations(),
            refreshHospitals(),
            refreshDepartments(),
            refreshStaffRoles(),
        ]);
    }, []);

    // Context value
    const value: StaffContextType = {
        staff,
        organisations,
        hospitals,
        departments,
        staffRoles,
        loading,
        error,
        filter,
        setFilter,
        refreshStaff,
        refreshOrganisations,
        refreshHospitals,
        refreshDepartments,
        refreshStaffRoles,
        getStaffByDepartment: getStaffByDepartmentFunc,
        addNewStaff,
        updateExistingStaff,
        removeStaff,

        // Add implementations for all the new methods:
        assignStaffToOrganisation: async (
            staffId,
            organisationId,
            isPrimary = false,
        ) => {
            return await assignStaffToOrganisation(
                staffId,
                organisationId,
                isPrimary,
            );
        },

        assignStaffToHospital: async (
            staffId,
            hospitalId,
            isPrimary = false,
        ) => {
            return await assignStaffToHospital(staffId, hospitalId, isPrimary);
        },

        assignStaffToDepartment: async (
            staffId,
            departmentId,
            role = "staff",
            departmentRole = "staff",
            isPrimary = false,
        ) => {
            return await assignStaffToDepartment(
                staffId,
                departmentId,
                role,
                departmentRole,
                isPrimary,
            );
        },

        getStaffOrganisationAssignments: async (staffId) => {
            const result = await getStaffOrganisationAssignments(staffId);
            return result as unknown as StaffOrganisationAssignment[];
        },

        getStaffHospitalAssignments: async (staffId) => {
            const result = await getStaffHospitalAssignments(staffId);
            return result as unknown as StaffHospitalAssignment[];
        },

        getStaffDepartmentAssignments: async (staffId) => {
            const result = await getStaffDepartmentAssignments(staffId);
            return result as unknown as StaffDepartmentAssignment[];
        },

        getStaffAssignments: async (staffId) => {
            return (await getStaffAssignments(staffId)) as {
                organisationAssignments: StaffOrganisationAssignment[];
                hospitalAssignments: StaffHospitalAssignment[];
                departmentAssignments: StaffDepartmentAssignment[];
            };
        },

        setPrimaryHospital: async (staffId, assignmentId) => {
            await setPrimaryHospital(staffId, assignmentId);
        },

        removeStaffOrganisationAssignment: async (assignmentId) => {
            await removeStaffOrganisationAssignment(assignmentId);
        },

        removeStaffHospitalAssignment: async (assignmentId) => {
            await removeStaffHospitalAssignment(assignmentId);
        },

        removeStaffDepartmentAssignment: async (assignmentId) => {
            await removeStaffDepartmentAssignment(assignmentId);
        },

        removeStaffAssignments: async (staffId) => {
            await removeStaffAssignments(staffId);
        },

        // If you use the state for current assignments
        currentAssignments,
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
