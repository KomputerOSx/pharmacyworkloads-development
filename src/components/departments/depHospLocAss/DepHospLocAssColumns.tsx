"use client";

import { CellContext, Column, ColumnDef, Row } from "@tanstack/react-table";
import { AssignedLocationData } from "@/types/depTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DepAssignedLocTableMeta {
    // Pass the assignmentId to the delete handler
    openDeleteDialog: (
        assignmentId: string,
        locationName: string | null,
    ) => void;
    isLoadingLocations: boolean;
    hospitalNameMap: Map<string, string>;
    isLoadingHospitals: boolean;
}

// --- Action Row Component Props ---
interface DataTableRowActionsProps {
    row: Row<AssignedLocationData>;
    openDeleteDialog: (
        assignmentId: string,
        locationName: string | null,
    ) => void; // Accept the function
}

// --- Reusable Header Component for Sorting ---
const SortableHeader = ({
    column,
    title,
}: {
    column: Column<AssignedLocationData>;
    title: string;
}) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8 data-[state=open]:bg-accent" // Standard shadcn table header button style
    >
        <span>{title}</span>
        {column.getCanSort() && ( // Only show arrow if sortable
            <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
    </Button>
);
// --- Action Buttons Component for Each Row ---
const DataTableRowActions: React.FC<DataTableRowActionsProps> = ({
    row,
    openDeleteDialog, // Receive the handler via props
}) => {
    const assignment = row.original; // Get data for this specific row

    return (
        <DropdownMenu>
            {/* The Trigger wraps the button and requires asChild */}
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted" // Standard icon button style
                >
                    <MoreHorizontal className="h-4 w-4" />{" "}
                    {/* The 3 dots icon */}
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            {/* The Content of the dropdown */}
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    // Call the passed handler on click
                    onClick={() =>
                        openDeleteDialog(
                            assignment.assignmentId,
                            assignment.locationName,
                        )
                    }
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50" // Destructive action styling
                >
                    <Trash className="mr-2 h-4 w-4" /> {/* Delete Icon */}
                    Delete Assignment
                </DropdownMenuItem>
                {/* Add more DropdownMenuItems here for future actions like 'Edit' */}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
// --- Column Definitions Array ---
export const columns: ColumnDef<AssignedLocationData>[] = [
    // 1. Location Name Column
    {
        accessorKey: "locationName",
        header: ({ column }) => (
            <SortableHeader column={column} title="Location" />
        ),
        cell: ({ row, table }: CellContext<AssignedLocationData, unknown>) => {
            const locationName = row.getValue("locationName") as string | null;
            const meta = table.options.meta as DepAssignedLocTableMeta;

            if (meta.isLoadingLocations && locationName === null) {
                // Show skeleton only if locations are loading AND name is not yet available
                return <Skeleton className="h-5 w-32" />;
            }

            return (
                <div className="font-medium">
                    {locationName ?? (
                        <span className="text-muted-foreground italic">
                            Unknown Location
                        </span>
                    )}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true,
    },
    // 2. Hospital Column
    {
        accessorKey: "hospId", // Access the ID, lookup name in cell
        header: ({ column }) => (
            <SortableHeader column={column} title="Hospital" />
        ),
        cell: ({ row, table }: CellContext<AssignedLocationData, unknown>) => {
            const hospId = row.getValue("hospId") as string | null;
            const meta = table.options.meta as DepAssignedLocTableMeta;

            // Show skeleton if hospitals are loading
            if (meta.isLoadingHospitals) {
                return <Skeleton className="h-5 w-24 md:w-32" />; // Responsive width
            }

            // Show name from map or fallback
            const hospName = hospId ? meta.hospitalNameMap.get(hospId) : null;
            return (
                <div className="">
                    {hospName ?? (
                        <span className="text-muted-foreground">N/A</span>
                    )}
                </div>
            );
        },
        // Sorting by name requires custom sort function or enable sorting on hospId
        enableSorting: true, // Sorts by hospId by default
        enableHiding: true,
        // Add filter function later if needed (would filter by hospId)
    },

    // 3. Assigned At Column
    {
        accessorKey: "assignedAt", // Use the processed 'assignedAt' field
        header: ({ column }) => (
            <SortableHeader column={column} title="Assigned On" />
        ),
        cell: ({ row }) => {
            const dateVal = row.getValue("assignedAt") as Date | null;
            return (
                <div className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(dateVal)} {/* Use your formatDate utility */}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true,
        sortDescFirst: true, // Default sort newest first
    },

    // 4. Actions Column
    {
        id: "actions", // Unique id for this column
        header: () => <div className="text-right pr-4">Actions</div>, // Right-aligned header text
        // Cell renderer function: gets row and table context
        cell: ({ row, table }: CellContext<AssignedLocationData, unknown>) => {
            const meta = table.options.meta as DepAssignedLocTableMeta;

            // Render the custom DataTableRowActions component for this row
            return (
                <div className="text-right">
                    {" "}
                    {/* Align content within the cell */}
                    <DataTableRowActions
                        row={row} // Pass the current row data
                        openDeleteDialog={meta.openDeleteDialog} // Pass the delete handler from meta
                    />
                </div>
            );
        },
        enableSorting: false, // Typically actions aren't sortable
        enableHiding: false, // Typically actions column is always visible
        size: 80, // Fixed width for the column
    },
];
