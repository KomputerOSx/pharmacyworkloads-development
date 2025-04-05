"use client";

import React, { useMemo } from "react";

// AG Grid Imports
import { AgGridReact } from "ag-grid-react";
import { ColDef, ValueFormatterParams } from "ag-grid-community"; // AG Grid types
import { ClientSideRowModelModule } from "ag-grid-community";
import { themeQuartz } from "ag-grid-community";
// Your project imports
import { HospLoc } from "@/types/hosLocTypes"; // Adjust path if needed
import { Timestamp } from "firebase/firestore"; // Import Timestamp if needed for formatting

// Helper function for date formatting (Moved here or import from shared utils)
const formatDate = (
    dateInput: Timestamp | string | Date | null | undefined,
): string => {
    if (!dateInput) return "";
    try {
        let date: Date;
        if (dateInput instanceof Timestamp) {
            date = dateInput.toDate();
        } else if (typeof dateInput === "string") {
            date = new Date(dateInput);
        } else {
            {
                // Handle Date objects directly
                date = dateInput;
            }
        }
        // Check if date is valid after conversion/assignment
        if (isNaN(date.getTime())) {
            // Log the original input that resulted in an invalid date
            console.warn("Invalid Date created from input:", dateInput);
            return "Invalid Date";
        }
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // Optional: Use 12-hour format
        });
    } catch (error) {
        console.error("Error formatting date:", dateInput, error);
        return "Error";
    }
};

// --- Component Props Interface ---
interface HospLocGridProps {
    locations: HospLoc[];
    height?: string | number; // Allow customizing height
    width?: string | number; // Allow customizing width
}

// --- The Grid Component ---
// Use React.memo for performance optimization if props don't change
export const HospLocGrid = React.memo(
    ({
        locations,
        height = 600, // Default height
        width = "100%", // Default width
    }: HospLocGridProps) => {
        const myTheme = themeQuartz.withParams({
            browserColorScheme: "light",
            headerFontSize: 14,
        });

        // Define AG Grid Column Definitions (Internal to this component)
        const colDefs = useMemo<ColDef<HospLoc>[]>(
            () => [
                // { field: "id", headerName: "ID", width: 150, filter: true, sortable: true }, // Add sortable if needed
                { field: "name", headerName: "Name", filter: true, flex: 2 },
                { field: "type", headerName: "Type", filter: true, width: 120 },
                {
                    field: "address",
                    headerName: "Address",
                    filter: true,
                    flex: 3,
                },
                {
                    field: "contactEmail",
                    headerName: "Email",
                    filter: true,
                    flex: 2,
                },
                {
                    field: "contactPhone",
                    headerName: "Phone",
                    filter: true,
                    width: 150,
                },
                {
                    field: "active",
                    headerName: "Active",
                    width: 100,
                    filter: true,
                    valueFormatter: (
                        params: ValueFormatterParams<HospLoc, boolean>,
                    ) => (params.value ? "Yes" : "No"),
                    cellStyle: (params) => ({
                        fontWeight: params.value ? "bold" : "normal",
                        color: params.value ? "green" : "red",
                    }),
                },
                {
                    field: "createdAt",
                    headerName: "Created At",
                    filter: "agDateColumnFilter",
                    valueFormatter: (
                        params: ValueFormatterParams<
                            HospLoc,
                            Timestamp | string | Date | null
                        >, // Added Date type possibility
                    ) => formatDate(params.value),
                    width: 180,
                    sort: "desc", // Default sort by created date descending
                },
                {
                    field: "updatedAt",
                    headerName: "Updated At",
                    filter: "agDateColumnFilter",
                    valueFormatter: (
                        params: ValueFormatterParams<
                            HospLoc,
                            Timestamp | string | Date | null
                        >, // Added Date type possibility
                    ) => formatDate(params.value),
                    width: 180,
                },
                // Hidden fields remain internal logic
                { field: "hospId", headerName: "Hospital ID", hide: true },
                { field: "orgId", headerName: "Org ID", hide: true },
                {
                    field: "createdById",
                    headerName: "Created By ID",
                    hide: true,
                },
                {
                    field: "updatedById",
                    headerName: "Updated By ID",
                    hide: true,
                },
            ],
            [], // Empty dependency array: definitions don't depend on props/state here
        );

        // Define Default Column Options (Internal to this component)
        const defaultColDef = useMemo<ColDef>(
            () => ({
                sortable: true,
                resizable: true,
                floatingFilter: true,
                flex: 1,
                minWidth: 100,
            }),
            [], // Empty dependency array
        );

        return (
            <div
                className="ag-theme-quartz mt-4" // Apply AG Grid theme
                style={{ height, width }} // Use props for dimensions
            >
                <AgGridReact<HospLoc>
                    rowData={locations} // Use the passed locations prop
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    // Removed domLayout="autoHeight" - prefer explicit height for grid containers generally
                    animateRows={true}
                    modules={[ClientSideRowModelModule]} // Essential module
                    theme={myTheme}
                    // You could add a theme prop if needed
                />
            </div>
        );
    },
);

// Add display name for better debugging
HospLocGrid.displayName = "HospLocGrid";
