"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    DirectorateSummary,
    DirectorateType,
    PharmacistSummary,
    ShiftType,
    WardWorkload,
    WorkloadEntry,
    WorkloadState,
} from "@/types/workload"; // Create the context

// Create the context
const WorkloadContext = createContext<WorkloadState | undefined>(undefined);

// Sample data
const sampleWorkloadData: WorkloadEntry[] = [
    {
        id: 1,
        directorate: "COTE",
        ward: "Ward 1",
        pharmacist: "John Smith",
        shift: "AM",
        histories: 12,
        reviews: 25,
    },
    {
        id: 2,
        directorate: "COTE",
        ward: "Ward 1",
        pharmacist: "Emma Wilson",
        shift: "PM",
        histories: 12,
        reviews: 25,
    },
    {
        id: 3,
        directorate: "COTE",
        ward: "Ward 2",
        pharmacist: "John Smith",
        shift: "AM",
        histories: 8,
        reviews: 15,
    },
    {
        id: 4,
        directorate: "COTE",
        ward: "Ward 2",
        pharmacist: "John Smith",
        shift: "PM",
        histories: 8,
        reviews: 15,
    },
    {
        id: 5,
        directorate: "MEDS",
        ward: "Ward 5",
        pharmacist: "Emma Wilson",
        shift: "AM",
        histories: 15,
        reviews: 30,
    },
    {
        id: 6,
        directorate: "MEDS",
        ward: "Ward 5",
        pharmacist: "Sarah Johnson",
        shift: "PM",
        histories: 15,
        reviews: 30,
    },
    {
        id: 7,
        directorate: "MEDS",
        ward: "Ward 6",
        pharmacist: "Emma Wilson",
        shift: "AM",
        histories: 10,
        reviews: 22,
    },
    {
        id: 8,
        directorate: "MEDS",
        ward: "Ward 6",
        pharmacist: "Michael Brown",
        shift: "PM",
        histories: 10,
        reviews: 22,
    },
    {
        id: 9,
        directorate: "SURG",
        ward: "Ward 9",
        pharmacist: "Michael Brown",
        shift: "AM",
        histories: 5,
        reviews: 18,
    },
    {
        id: 10,
        directorate: "SURG",
        ward: "Ward 9",
        pharmacist: "Michael Brown",
        shift: "PM",
        histories: 5,
        reviews: 18,
    },
    {
        id: 11,
        directorate: "SURG",
        ward: "Ward 10",
        pharmacist: "Sarah Johnson",
        shift: "AM",
        histories: 7,
        reviews: 14,
    },
    {
        id: 12,
        directorate: "SURG",
        ward: "Ward 10",
        pharmacist: "Sarah Johnson",
        shift: "PM",
        histories: 7,
        reviews: 14,
    },
    {
        id: 13,
        directorate: "EMRG",
        ward: "Ward 13",
        pharmacist: "David Lee",
        shift: "AM",
        histories: 20,
        reviews: 35,
    },
    {
        id: 14,
        directorate: "EMRG",
        ward: "Ward 13",
        pharmacist: "David Lee",
        shift: "PM",
        histories: 20,
        reviews: 35,
    },
    {
        id: 15,
        directorate: "EMRG",
        ward: "Ward 14",
        pharmacist: "John Smith",
        shift: "AM",
        histories: 9,
        reviews: 19,
    },
    {
        id: 16,
        directorate: "EMRG",
        ward: "Ward 14",
        pharmacist: "David Lee",
        shift: "PM",
        histories: 9,
        reviews: 19,
    },
];

// Provider component
export const WorkloadProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [entries, setEntries] = useState<WorkloadEntry[]>([]);

    // Load sample data on first render
    useEffect(() => {
        setEntries(sampleWorkloadData);
    }, []);

    // Add a new entry
    const addEntry = (entry: Omit<WorkloadEntry, "id">) => {
        const newEntry: WorkloadEntry = {
            ...entry,
            id: Date.now(),
        };
        setEntries((prev) => [...prev, newEntry]);
    };

    // Update an existing entry
    const updateEntry = (id: number, updatedEntry: Partial<WorkloadEntry>) => {
        setEntries((prev) =>
            prev.map((entry) =>
                entry.id === id ? { ...entry, ...updatedEntry } : entry,
            ),
        );
    };

    // Delete an entry
    const deleteEntry = (id: number) => {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
    };

    // Delete all entries for a specific ward in a directorate
    const deleteWardEntries = (directorate: DirectorateType, ward: string) => {
        setEntries((prev) =>
            prev.filter(
                (entry) =>
                    !(entry.directorate === directorate && entry.ward === ward),
            ),
        );
    };

    // Get summary statistics for a directorate
    const getDirectorateSummary = (
        directorate: DirectorateType,
    ): DirectorateSummary => {
        const directorateEntries = entries.filter(
            (entry) => entry.directorate === directorate,
        );

        const histories = directorateEntries.reduce(
            (sum, entry) => sum + entry.histories,
            0,
        );
        const reviews = directorateEntries.reduce(
            (sum, entry) => sum + entry.reviews,
            0,
        );
        const total = histories + reviews;
        const wards = [
            ...new Set(directorateEntries.map((entry) => entry.ward)),
        ];
        const pharmacists = [
            ...new Set(directorateEntries.map((entry) => entry.pharmacist)),
        ];

        return {
            directorate,
            histories,
            reviews,
            total,
            wards,
            pharmacists,
        };
    };

    // Get summary statistics for a pharmacist
    const getPharmacistSummary = (pharmacist: string): PharmacistSummary => {
        const pharmacistEntries = entries.filter(
            (entry) => entry.pharmacist === pharmacist,
        );

        const histories = pharmacistEntries.reduce(
            (sum, entry) => sum + entry.histories,
            0,
        );
        const reviews = pharmacistEntries.reduce(
            (sum, entry) => sum + entry.reviews,
            0,
        );
        const total = histories + reviews;
        const directorates = [
            ...new Set(pharmacistEntries.map((entry) => entry.directorate)),
        ] as DirectorateType[];
        const wards = [
            ...new Set(pharmacistEntries.map((entry) => entry.ward)),
        ];
        const shifts = [
            ...new Set(pharmacistEntries.map((entry) => entry.shift)),
        ] as ShiftType[];

        return {
            pharmacist,
            histories,
            reviews,
            total,
            directorates,
            wards,
            shifts,
        };
    };

    // Get summary for a specific ward
    const getWardSummary = (
        directorate: DirectorateType,
        ward: string,
    ): WardWorkload | null => {
        const wardEntries = entries.filter(
            (entry) => entry.directorate === directorate && entry.ward === ward,
        );

        if (wardEntries.length === 0) {
            return null;
        }

        const amEntry = wardEntries.find((entry) => entry.shift === "AM");
        const pmEntry = wardEntries.find((entry) => entry.shift === "PM");

        return {
            ward,
            amPharmacist: amEntry?.pharmacist || "",
            pmPharmacist: pmEntry?.pharmacist || "",
            histories: amEntry?.histories || pmEntry?.histories || 0,
            reviews: amEntry?.reviews || pmEntry?.reviews || 0,
            amId: amEntry?.id,
            pmId: pmEntry?.id,
        };
    };

    // Get all entries
    const getAllEntries = () => {
        return [...entries];
    };

    // Get filtered entries
    const getFilteredEntries = (
        directorate?: DirectorateType | "all",
        search?: string,
    ) => {
        let filtered = [...entries];

        if (directorate && directorate !== "all") {
            filtered = filtered.filter(
                (entry) => entry.directorate === directorate,
            );
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(
                (entry) =>
                    entry.ward.toLowerCase().includes(lowerSearch) ||
                    entry.pharmacist.toLowerCase().includes(lowerSearch) ||
                    entry.directorate.toLowerCase().includes(lowerSearch),
            );
        }

        return filtered;
    };

    // Create the state object
    const state: WorkloadState = {
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        deleteWardEntries,
        getDirectorateSummary,
        getPharmacistSummary,
        getWardSummary,
        getAllEntries,
        getFilteredEntries,
    };

    return (
        <WorkloadContext.Provider value={state}>
            {children}
        </WorkloadContext.Provider>
    );
};

// Custom hook to use the workload context
export const useWorkload = (): WorkloadState => {
    const context = useContext(WorkloadContext);
    if (context === undefined) {
        throw new Error("useWorkload must be used within a WorkloadProvider");
    }
    return context;
};
