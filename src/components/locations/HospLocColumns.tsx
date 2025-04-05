// src/components/locations/LocationsColumn.tsx
"use client";

import {
    ColumnDef,
    Column, // Import the Column type
    Table, // Import Table type for DataTableViewOptions
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Timestamp } from "firebase/firestore"; // Keep for type casting if data source provides Timestamps

import { Button } from "@/components/ui/button"; // Shadcn Button
import { HospLoc } from "@/types/hosLocTypes"; // Adjust path if necessary
import { formatDate } from "@/utils/utils"; // Ensure this utility handles Timestamps, Dates, strings, null

// Shadcn UI Components for Column Visibility Toggle
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons"; // Ensure @radix-ui/react-icons is installed

// --- Reusable Header Component for Sorting ---
// This component renders a button in the header cell to trigger sorting.
const SortableHeader = ({
    column,
    title,
}: {
    // ***** CORRECTED TYPE HERE *****
    // The 'column' prop passed by the header context is an instance of the Column class,
    // not a part of the ColumnDef configuration object.
    column: Column<HospLoc, unknown>; // Use Column<TData, TValue>
    title: string;
}) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8" // Adjust padding/margin as needed for alignment
    >
        {title}
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
);

// --- Column Definitions ---
export const columns: ColumnDef<HospLoc>[] = [
    {
        accessorKey: "name",
        // The header function receives a context object containing the 'column' instance
        header: ({ column }) => <SortableHeader column={column} title="Name" />,
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("name")}</div>
        ),
        filterFn: "includesString", // Use built-in filter for basic text search
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "type",
        header: ({ column }) => <SortableHeader column={column} title="Type" />,
        cell: ({ row }) => <div>{row.getValue("type")}</div>,
        filterFn: "equalsString", // Use built-in filter for exact match (good for selects)
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "address",
        header: "Address", // No sorting needed for this column
        cell: ({ row }) => (
            <div className="whitespace-nowrap">{row.getValue("address")}</div> // Prevent wrapping if needed
        ),
        enableSorting: false, // Explicitly disable sorting if not needed
        enableHiding: true,
    },
    {
        accessorKey: "contactEmail",
        header: "Email",
        cell: ({ row }) => <div>{row.getValue("contactEmail")}</div>,
        enableSorting: false,
        enableHiding: true,
    },
    {
        accessorKey: "contactPhone",
        header: "Phone",
        cell: ({ row }) => <div>{row.getValue("contactPhone")}</div>,
        enableSorting: false,
        enableHiding: true,
    },
    {
        accessorKey: "active",
        header: ({ column }) => (
            <SortableHeader column={column} title="Active" />
        ),
        cell: ({ row }) => {
            const isActive = row.getValue("active");
            return (
                <div
                    className={`px-2 py-0.5 inline-block rounded-full text-xs font-medium ${
                        isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                >
                    {isActive ? "Yes" : "No"}
                </div>
            );
        },
        filterFn: (row, id, filterValue) => {
            const rowValue = row.getValue(id) as boolean;
            const filterString = String(filterValue).toLowerCase();
            if (filterString === "yes" || filterString === "true") {
                return rowValue;
            }
            if (filterString === "no" || filterString === "false") {
                return !rowValue;
            }
            return true; // Show row if filter is not 'yes'/'no'/true/false
        },
        enableSorting: true,
        enableHiding: true,
    },
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
                <div className="whitespace-nowrap">{formatDate(dateVal)}</div>
            );
        },
        enableSorting: true,
        enableHiding: true,
        // Example: Set initial sort direction if desired (usually handled in table state)
        // sortDescFirst: true,
    },
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
                <div className="whitespace-nowrap">{formatDate(dateVal)}</div>
            );
        },
        enableSorting: true,
        enableHiding: true,
    },
    // Add other columns like 'Actions' if needed
    // {
    //   id: "actions", // Use 'id' if no accessorKey
    //   header: "Actions",
    //   cell: ({ row }) => <DataTableRowActions row={row} />, // Define separately
    //   enableSorting: false,
    //   enableHiding: false,
    // },
];

// --- Component for Column Visibility Toggle ---
// This component renders a dropdown menu to show/hide columns.
export function DataTableViewOptions<TData>({
    table,
}: {
    table: Table<TData>; // Use the imported Table type
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm" // Match size with other control buttons
                    className="ml-auto hidden h-8 lg:flex" // Standard height, hide on small screens
                >
                    <MixerHorizontalIcon className="mr-2 h-4 w-4" />
                    View
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
                {table
                    .getAllColumns()
                    .filter(
                        (column) =>
                            typeof column.accessorFn !== "undefined" &&
                            column.getCanHide(),
                    )
                    .map((column) => {
                        // Attempt to get a readable header name, fall back to id
                        const headerText =
                            typeof column.columnDef.header === "string"
                                ? column.columnDef.header // If header is a simple string
                                : column.id; // Otherwise, use the column id

                        return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                    column.toggleVisibility(value)
                                }
                            >
                                {/* Display readable name */}
                                {headerText}
                            </DropdownMenuCheckboxItem>
                        );
                    })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
