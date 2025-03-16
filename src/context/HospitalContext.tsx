// src/context/HospitalContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    addHospital,
    deleteHospital,
    getHospitals,
    updateHospital,
} from "@/services/hospitalService";
import { getOrganizations } from "@/services/organizationService";

// Define the Hospital type
export type Hospital = {
    id: string;
    name: string;
    organization: {
        id: string;
        name: string;
    };
    address: string;
    city: string;
    postcode: string;
    contactNumber: string;
    contactEmail: string;
    beds: number;
    active: boolean;
    departments?: number;
    wards?: number;
    staff?: number;
    createdAt?: string;
    updatedAt?: string;
};

// Define the Organization type (simplified version for the context)
export type Organization = {
    id: string;
    name: string;
};

// Define the filter type
export type HospitalFilter = {
    organization: string;
    status: string;
    search: string;
};

// Define the context type
interface HospitalContextType {
    hospitals: Hospital[];
    organizations: Organization[];
    loading: boolean;
    error: string | null;
    filter: HospitalFilter;
    setFilter: React.Dispatch<React.SetStateAction<HospitalFilter>>;
    refreshHospitals: () => Promise<void>;
    refreshOrganizations: () => Promise<void>;
    addNewHospital: (
        hospital: Omit<Hospital, "id" | "createdAt" | "updatedAt">,
    ) => Promise<Hospital>;
    updateExistingHospital: (
        id: string,
        hospital: Partial<Hospital>,
    ) => Promise<Hospital>;
    removeHospital: (id: string) => Promise<void>;
}

// Create the context
const HospitalContext = createContext<HospitalContextType | undefined>(
    undefined,
);

// Provider component
export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<HospitalFilter>({
        organization: "all",
        status: "all",
        search: "",
    });

    // Function to fetch hospitals
    const refreshHospitals = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getHospitals(filter);
            setHospitals(data as Hospital[]);
        } catch (err) {
            console.error("Error fetching hospitals:", err);
            setError("Failed to load hospitals. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch organizations (for dropdowns)
    const refreshOrganizations = async () => {
        try {
            const data = await getOrganizations();
            setOrganizations(data);
        } catch (err) {
            console.error("Error fetching organizations:", err);
            setError(
                "Failed to load organizations for dropdown. Please try again.",
            );
        }
    };

    // Add a new hospital
    const addNewHospital = async (
        hospital: Omit<Hospital, "id" | "createdAt" | "updatedAt">,
    ) => {
        try {
            const newHospital = await addHospital(hospital);
            await refreshHospitals();
            return newHospital;
        } catch (err) {
            console.error("Error adding hospital:", err);
            setError("Failed to add hospital. Please try again.");
            throw err;
        }
    };

    // Update an existing hospital
    const updateExistingHospital = async (
        id: string,
        hospital: Partial<Hospital>,
    ) => {
        try {
            const updatedHospital = await updateHospital(id, hospital);
            await refreshHospitals();
            return updatedHospital;
        } catch (err) {
            console.error("Error updating hospital:", err);
            setError("Failed to update hospital. Please try again.");
            throw err;
        }
    };

    // Delete a hospital
    const removeHospital = async (id: string) => {
        try {
            await deleteHospital(id);
            await refreshHospitals();
        } catch (err) {
            console.error("Error deleting hospital:", err);
            setError("Failed to delete hospital. Please try again.");
            throw err;
        }
    };

    // Load hospitals on mount and when filter changes
    useEffect(() => {
        refreshHospitals();
    }, [filter]);

    // Load organizations on mount
    useEffect(() => {
        refreshOrganizations();
    }, []);

    // Context value
    const value: HospitalContextType = {
        hospitals,
        organizations,
        loading,
        error,
        filter,
        setFilter,
        refreshHospitals,
        refreshOrganizations,
        addNewHospital,
        updateExistingHospital,
        removeHospital,
    };

    return (
        <HospitalContext.Provider value={value}>
            {children}
        </HospitalContext.Provider>
    );
};

// Custom hook to use the hospital context
export const useHospitals = () => {
    const context = useContext(HospitalContext);
    if (context === undefined) {
        throw new Error("useHospitals must be used within a HospitalProvider");
    }
    return context;
};
