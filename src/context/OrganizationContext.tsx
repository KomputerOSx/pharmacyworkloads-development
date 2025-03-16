// src/context/OrganizationContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    addOrganization,
    deleteOrganization,
    getOrganizations,
    updateOrganization,
} from "@/services/organizationService";

// Define the Organization type
export type Organization = {
    id: string;
    name: string;
    type: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    hospitalCount: number;
    createdAt?: string;
    updatedAt?: string;
};

// Define the filter type
export type OrganizationFilter = {
    type: string;
    status: string;
    search: string;
};

// Define the context type
interface OrganizationContextType {
    organizations: Organization[];
    loading: boolean;
    error: string | null;
    filter: OrganizationFilter;
    setFilter: React.Dispatch<React.SetStateAction<OrganizationFilter>>;
    refreshOrganizations: () => Promise<void>;
    addNewOrganization: (
        org: Omit<
            Organization,
            "id" | "hospitalCount" | "createdAt" | "updatedAt"
        >,
    ) => Promise<Organization>;
    updateExistingOrganization: (
        id: string,
        org: Partial<Organization>,
    ) => Promise<Organization>;
    removeOrganization: (id: string) => Promise<void>;
}

// Create the context
const OrganizationContext = createContext<OrganizationContextType | undefined>(
    undefined,
);

// Provider component
export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<OrganizationFilter>({
        type: "all",
        status: "all",
        search: "",
    });

    // Function to fetch organizations
    const refreshOrganizations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrganizations(filter);
            setOrganizations(data);
        } catch (err) {
            console.error("Error fetching organizations:", err);
            setError("Failed to load organizations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Add a new organization
    const addNewOrganization = async (
        org: Omit<
            Organization,
            "id" | "hospitalCount" | "createdAt" | "updatedAt"
        >,
    ) => {
        try {
            const newOrg = await addOrganization(org);
            await refreshOrganizations();
            return newOrg;
        } catch (err) {
            console.error("Error adding organization:", err);
            setError("Failed to add organization. Please try again.");
            throw err;
        }
    };

    // Update an existing organization
    const updateExistingOrganization = async (
        id: string,
        org: Partial<Organization>,
    ) => {
        try {
            const updatedOrg = await updateOrganization(id, org);
            await refreshOrganizations();
            return updatedOrg;
        } catch (err) {
            console.error("Error updating organization:", err);
            setError("Failed to update organization. Please try again.");
            throw err;
        }
    };

    // Delete an organization
    const removeOrganization = async (id: string) => {
        try {
            await deleteOrganization(id);
            await refreshOrganizations();
        } catch (err) {
            console.error("Error deleting organization:", err);
            setError("Failed to delete organization. Please try again.");
            throw err;
        }
    };

    // Load organizations on mount and when filter changes
    useEffect(() => {
        refreshOrganizations();
    }, [filter]);

    // Context value
    const value: OrganizationContextType = {
        organizations,
        loading,
        error,
        filter,
        setFilter,
        refreshOrganizations,
        addNewOrganization,
        updateExistingOrganization,
        removeOrganization,
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};

// Custom hook to use the organization context
export const useOrganizations = () => {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error(
            "useOrganizations must be used within an OrganizationProvider",
        );
    }
    return context;
};
