// src/components/locations/HospLocColumns.tsx
"use client";

import React from "react"; // Import React
import {
    ColumnDef,
    Column,
    Table,
    Row,
    CellContext, // Import CellContext for accessing table meta in cell renderers
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Timestamp } from "firebase/firestore";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    DropdownMenu as ViewDropdownMenu,
    DropdownMenuCheckboxItem as ViewDropdownMenuCheckboxItem,
    DropdownMenuContent as ViewDropdownMenuContent,
    DropdownMenuTrigger as ViewDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons"; // Ensure @radix-ui/react-icons is installed

// Project Specific Imports
import { HospLoc } from "@/types/hosLocTypes";
import { formatDate } from "@/utils/utils";
import { cn } from "@/lib/utils"; // Assuming you have cn utility
import { Skeleton } from "../ui/skeleton";

// --- Table Meta Interface ---
// Defines the custom properties added to the table's meta option
interface HospLocTableMeta {
    openEditDialog: (location: HospLoc) => void;
    openDeleteDialog: (location: HospLoc) => void;
    hospitalNameMap: Map<string, string>;
    isLoadingHospitalMap: boolean;
}

// --- Action Row Component Props ---
// Defines the props expected by the DataTableRowActions component
interface DataTableRowActionsProps {
    row: Row<HospLoc>;
    openEditDialog: (location: HospLoc) => void; // Function to trigger edit dialog
    openDeleteDialog: (location: HospLoc) => void; // Function to trigger delete dialog
}

// --- Reusable Header Component for Sorting ---
const SortableHeader = ({
    column,
    title,
}: {
    column: Column<HospLoc, unknown>;
    title: string;
}) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8 data-[state=open]:bg-accent"
    >
        <span>{title}</span>
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
);

// --- Action Buttons Component for Each Row ---
// Renders the dropdown menu with Edit and Delete actions.
// *** CORRECTED: Receives handlers via props, does NOT use row.getContext() ***
const DataTableRowActions: React.FC<DataTableRowActionsProps> = ({
    row,
    openEditDialog, // Receive the function as a prop
    openDeleteDialog, // Receive the function as a prop
}) => {
    const location = row.original; // Get the data for the specific row

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    // *** CORRECTED: Call the handler passed via props ***
                    onClick={() => openEditDialog(location)}
                    className="cursor-pointer"
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    // *** CORRECTED: Call the handler passed via props ***
                    onClick={() => openDeleteDialog(location)}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// --- Column Definitions Array ---
export const columns: ColumnDef<HospLoc>[] = [
    // 1. Select Column (Checkbox)
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected()
                        ? true
                        : table.getIsSomePageRowsSelected()
                          ? "indeterminate"
                          : false
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all rows on this page"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select this row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
    },

    // 2. Name Column
    {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} title="Name" />,
        cell: ({ row }) => (
            <div className="font-medium capitalize">{row.getValue("name")}</div>
        ),
        filterFn: "includesString",
        enableSorting: true,
        enableHiding: true,
    },

    // 3. Hospital Column (Using hospId)
    {
        accessorKey: "hospId",
        header: ({ column }) => (
            <SortableHeader column={column} title="Hospital" />
        ),
        // Cell renderer still uses the map from meta to DISPLAY the name
        cell: ({ row, table }: CellContext<HospLoc, unknown>) => {
            const hospId = row.getValue("hospId") as string;
            const meta = table.options.meta as HospLocTableMeta;
            const hospitalNameMap = meta.hospitalNameMap;
            const isLoading = meta.isLoadingHospitalMap;

            if (isLoading) {
                return <Skeleton className="h-5 w-24" />;
            }
            const hospName = hospitalNameMap.get(hospId);
            return (
                <div className="">
                    {hospName ?? (
                        <span className="text-muted-foreground">N/A</span>
                    )}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true,
    },

    // 4. Type Column
    {
        accessorKey: "type",
        header: ({ column }) => <SortableHeader column={column} title="Type" />,
        cell: ({ row }) => <div>{row.getValue("type")}</div>,
        filterFn: "equalsString", // Use 'equalsString' for exact match if filtering by select dropdown
        enableSorting: true,
        enableHiding: true,
    },

    // 5. Address Column
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
            <div className="whitespace-nowrap">
                {row.getValue("address") ?? "N/A"}
            </div>
        ),
        enableSorting: false,
        enableHiding: true,
    },

    // 6. Email Column
    {
        accessorKey: "contactEmail",
        header: "Email",
        cell: ({ row }) => <div>{row.getValue("contactEmail") ?? "N/A"}</div>,
        enableSorting: false,
        enableHiding: true,
    },

    // 7. Phone Column
    {
        accessorKey: "contactPhone",
        header: "Phone",
        cell: ({ row }) => <div>{row.getValue("contactPhone") ?? "N/A"}</div>,
        enableSorting: false,
        enableHiding: true,
    },

    // 8. Active Status Column
    {
        accessorKey: "active",
        header: ({ column }) => (
            <SortableHeader column={column} title="Active" />
        ),
        cell: ({ row }) => {
            const isActive = row.getValue("active");
            // Using Badge component styles inline for simplicity
            return (
                <div
                    className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        isActive
                            ? "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                    )}
                >
                    {isActive ? "Yes" : "No"}
                </div>
            );
        },
        // Simple boolean filter
        filterFn: (row, id, filterValue) => {
            const rowValue = row.getValue(id) as boolean;
            // Allow filtering by 'true'/'false' or 'yes'/'no' string
            const filterString = String(filterValue).toLowerCase();
            if (filterString === "true" || filterString === "yes")
                return rowValue;
            if (filterString === "false" || filterString === "no")
                return !rowValue;
            return true; // No filter applied if value is something else
        },
        enableSorting: true,
        enableHiding: true,
        size: 80,
    },

    // 9. Created At Column
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <SortableHeader column={column} title="Created At" />
        ),
        cell: ({ row }) => {
            const dateVal = row.getValue("createdAt") as
                | Timestamp
                | Date
                | string
                | null
                | undefined;
            return (
                <div className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(dateVal)}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true,
        sortDescFirst: true, // Default sort newest first
    },

    // 10. Updated At Column
    {
        accessorKey: "updatedAt",
        header: ({ column }) => (
            <SortableHeader column={column} title="Updated At" />
        ),
        cell: ({ row }) => {
            const dateVal = row.getValue("updatedAt") as
                | Timestamp
                | Date
                | string
                | null
                | undefined;
            return (
                <div className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(dateVal)}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true,
    },

    // 11. Actions Column
    // *** CORRECTED IMPLEMENTATION ***
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Actions</div>, // Align header text
        // *** Use CellContext to access row and table ***
        cell: ({ row, table }: CellContext<HospLoc, unknown>) => {
            // *** Access meta safely via 'table' from CellContext ***
            const meta = table.options.meta as HospLocTableMeta; // Type assertion

            // *** Render the Actions component, passing handlers from meta as props ***
            return (
                <div className="text-right">
                    {" "}
                    {/* Align dropdown trigger to the right */}
                    <DataTableRowActions
                        row={row}
                        openEditDialog={meta.openEditDialog}
                        openDeleteDialog={meta.openDeleteDialog}
                    />
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false, // Actions usually always visible
        size: 80, // Fixed size for the actions column
    },
];

// --- Component for Column Visibility Toggle ---
// Allows users to show/hide columns
export function DataTableViewOptions<TData>({
    table,
}: {
    table: Table<TData>;
}) {
    return (
        <ViewDropdownMenu>
            <ViewDropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto hidden h-9 lg:flex" // Match height and hide on smaller screens
                >
                    <MixerHorizontalIcon className="mr-2 h-4 w-4" />
                    View
                </Button>
            </ViewDropdownMenuTrigger>
            <ViewDropdownMenuContent align="end" className="w-[150px]">
                <div className="px-1 py-1 text-sm font-medium text-muted-foreground">
                    Toggle Columns
                </div>
                <DropdownMenuSeparator />
                {table
                    .getAllColumns()
                    // Filter out columns that shouldn't be toggleable (e.g., 'select', 'actions')
                    // or columns explicitly marked as enableHiding: false
                    .filter(
                        (column) =>
                            typeof column.accessorFn !== "undefined" && // Ensure it's a data column
                            column.getCanHide(), // Respect getCanHide property set in definition
                    )
                    .map((column) => {
                        // Attempt to get a readable header name, fall back to id
                        const headerText =
                            typeof column.columnDef.header === "string"
                                ? column.columnDef.header
                                : column.id.charAt(0).toUpperCase() +
                                  column.id.slice(1); // Capitalize ID as fallback

                        return (
                            <ViewDropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={
                                    (value) => column.toggleVisibility(value) // Ensure boolean value
                                }
                            >
                                {headerText}
                            </ViewDropdownMenuCheckboxItem>
                        );
                    })}
            </ViewDropdownMenuContent>
        </ViewDropdownMenu>
    );
}
