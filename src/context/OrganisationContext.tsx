// src/context/OrganisationContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    addOrganisation,
    deleteOrganisation,
    getOrganisations,
    updateOrganisation,
} from "@/services/organisationService";

// Define the Organisation type
export type Organisation = {
    id: string;
    name: string;
    type: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
};

// Define the filter type
export type OrganisationFilter = {
    type: string;
    status: string;
    search: string;
};

// Define the context type
interface OrganisationContextType {
    organisations: Organisation[];
    loading: boolean;
    error: string | null;
    filter: OrganisationFilter;
    setFilter: React.Dispatch<React.SetStateAction<OrganisationFilter>>;
    refreshOrganisations: () => Promise<void>;
    addNewOrganisation: (
        org: Omit<Organisation, "id" | "createdAt" | "updatedAt">,
    ) => Promise<Organisation>;
    updateExistingOrganisation: (
        id: string,
        org: Partial<Organisation>,
    ) => Promise<Organisation>;
    removeOrganisation: (id: string) => Promise<void>;
}

// Create the context
const OrganisationContext = createContext<OrganisationContextType | undefined>(
    undefined,
);

// Provider component
export const OrganisationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<OrganisationFilter>({
        type: "all",
        status: "all",
        search: "",
    });

    // Function to fetch organisations
    const refreshOrganisations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrganisations(filter);
            setOrganisations(data);
        } catch (err) {
            console.error("Error fetching organisations:", err);
            setError("Failed to load organisations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Add a new organisation
    const addNewOrganisation = async (
        org: Omit<Organisation, "id" | "createdAt" | "updatedAt">,
    ) => {
        try {
            const newOrg = await addOrganisation(org);
            await refreshOrganisations();
            return newOrg;
        } catch (err) {
            console.error("Error adding organisation:", err);
            setError("Failed to add organisation. Please try again.");
            throw err;
        }
    };

    // Update an existing organisation
    const updateExistingOrganisation = async (
        id: string,
        org: Partial<Organisation>,
    ) => {
        try {
            const updatedOrg = await updateOrganisation(id, org);
            await refreshOrganisations();
            return updatedOrg;
        } catch (err) {
            console.error("Error updating organisation:", err);
            setError("Failed to update organisation. Please try again.");
            throw err;
        }
    };

    // Delete an organisation
    const removeOrganisation = async (id: string) => {
        try {
            await deleteOrganisation(id);
            await refreshOrganisations();
        } catch (err) {
            console.error("Error deleting organisation:", err);
            setError("Failed to delete organisation. Please try again.");
            throw err;
        }
    };

    // Load organisations on mount and when filter changes
    useEffect(
        () => {
            refreshOrganisations().then((r) => r);
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [filter],
    );

    // Context value
    const value: OrganisationContextType = {
        organisations,
        loading,
        error,
        filter,
        setFilter,
        refreshOrganisations,
        addNewOrganisation,
        updateExistingOrganisation,
        removeOrganisation,
    };

    return (
        <OrganisationContext.Provider value={value}>
            {children}
        </OrganisationContext.Provider>
    );
};

// Custom hook to use the organisation context
export const useOrganisations = () => {
    const context = useContext(OrganisationContext);
    if (context === undefined) {
        throw new Error(
            "useOrganisations must be used within an OrganisationProvider",
        );
    }
    return context;
};
