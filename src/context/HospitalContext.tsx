// src/context/HospitalContext.tsx
"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    addHospital,
    deleteHospital,
    updateHospital,
} from "@/services/hospitalService";
import { getHospitalsByOrganisation } from "@/services/hospitalAssignmentService";

// Define the Hospital type
export type Hospital = {
    id: string;
    name: string;
    address: string;
    city: string;
    postcode: string;
    contactNumber: string;
    contactEmail: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type HospitalOrganisationAssignment = {
    id: string;
    hospitalId: string;
    organisationId: string;
};

// Define the filter type
export type HospitalFilter = {
    status: string;
    search: string;
};

// Define the context type
interface HospitalContextType {
    hospitals: Hospital[];
    loading: boolean;
    error: string | null;
    filter: HospitalFilter;
    setFilter: React.Dispatch<React.SetStateAction<HospitalFilter>>;
    refreshHospitals: () => Promise<void>;
    addNewHospital: (
        hospital: Omit<Hospital, "id" | "createdAt" | "updatedAt">,
        orgId: string,
    ) => Promise<Hospital>;
    updateExistingHospital: (
        id: string,
        organisationId: string,
    ) => Promise<Hospital>;
    removeHospital: (id: string) => Promise<void>;
}

// Create the context
const HospitalContext = createContext<HospitalContextType | undefined>(
    undefined,
);

// Provider component that takes the organisation ID as a prop
export const HospitalProvider: React.FC<{
    children: React.ReactNode;
    organisationId: string;
}> = ({ children, organisationId }) => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<HospitalFilter>({
        status: "all",
        search: "",
    });

    // Function to fetch hospitals for the current organisation
    const refreshHospitals = useCallback(async () => {
        if (!organisationId) {
            setHospitals([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Get hospitals for this organisation
            const hospitalData = await getHospitalsByOrganisation(
                organisationId,
                filter,
            );
            setHospitals(hospitalData);
        } catch (err) {
            console.error("Error fetching hospitals:", err);
            setError("Failed to load hospitals. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [organisationId, filter]);

    // Add a new hospital within the current organisation
    const addNewHospital = async (
        hospital: Omit<Hospital, "id" | "createdAt" | "updatedAt">,
        orgId: string,
    ) => {
        if (!organisationId) {
            throw new Error("Cannot add hospital: No organisation selected");
        }

        try {
            const newHospital = await addHospital(hospital, orgId);
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
        organisationId: string,
    ) => {
        if (!organisationId) {
            throw new Error("Cannot update hospital: No organisation selected");
        }

        try {
            const updatedHospital = await updateHospital(id, organisationId);
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

    // Load hospitals on mount and when filter or organisationId changes
    useEffect(() => {
        refreshHospitals().then((r) => r);
    }, [filter, organisationId, refreshHospitals]);

    // Context value
    const value: HospitalContextType = {
        hospitals,
        loading,
        error,
        filter,
        setFilter,
        refreshHospitals,
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
