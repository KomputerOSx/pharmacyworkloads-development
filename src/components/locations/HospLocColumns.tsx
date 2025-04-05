// src/components/locations/LocationsColumn.tsx
"use client";

import {
    ColumnDef,
    Column,
    Table,
    Row, // Import Row type for actions
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react"; // Added MoreHorizontal
import { Timestamp } from "firebase/firestore";

// Shadcn UI Imports for Checkbox and Action Dropdown
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components

// Project Specific Imports
import { HospLoc } from "@/types/hosLocTypes"; // Adjust path if necessary
import { formatDate } from "@/utils/utils"; // Ensure path is correct

// Shadcn UI Imports for Column Visibility Dropdown (aliased)
import {
    DropdownMenu as ViewDropdownMenu,
    DropdownMenuCheckboxItem as ViewDropdownMenuCheckboxItem,
    DropdownMenuContent as ViewDropdownMenuContent,
    DropdownMenuTrigger as ViewDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons"; // Ensure @radix-ui/react-icons is installed

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
        className="-ml-4 h-8 data-[state=open]:bg-accent" // Basic style adjustments
    >
        <span>{title}</span> {/* Wrap title for potential styling */}
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
);

// --- Action Buttons Component for Each Row ---
// This component renders the dropdown menu with actions for a specific row.
const DataTableRowActions = ({ row }: { row: Row<HospLoc> }) => {
    const location = row.original; // Get the full data object for the row

    // Placeholder functions - replace with your actual logic
    const handleEdit = () => {
        console.log("Trigger Edit for Location ID:", location.id);
        // Example: openEditModal(location);
        // Example: router.push(`/admin/${orgId}/locations/${location.id}/edit`);
    };

    const handleDelete = () => {
        console.log("Trigger Delete for Location ID:", location.id);
        // Example: openDeleteConfirmDialog(location.id);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted" // Standard size and open state style
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                {" "}
                {/* Adjust width as needed */}
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Add more items as needed */}
                <DropdownMenuItem onClick={handleEdit}>
                    {/* Optionally add an icon: <Pencil className="mr-2 h-4 w-4" /> */}
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50" // Destructive styling
                >
                    {/* Optionally add an icon: <Trash className="mr-2 h-4 w-4" /> */}
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
                className="translate-y-[2px]" // Align checkbox nicely
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select this row"
                className="translate-y-[2px]" // Align checkbox nicely
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50, // Explicitly set size for narrow column
    },

    // 2. Name Column
    {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} title="Name" />,
        cell: ({ row }) => (
            <div className="font-medium capitalize">{row.getValue("name")}</div>
        ), // Added font-medium
        filterFn: "includesString",
        enableSorting: true,
        enableHiding: true,
    },

    // 3. Hospital Column (Using hospId)
    // TODO: Consider fetching/displaying Hospital Name if available/needed
    {
        accessorKey: "hospId",
        header: ({ column }) => (
            <SortableHeader column={column} title="Hospital ID" />
        ),
        cell: ({ row }) => <div>{row.getValue("hospId")}</div>,
        enableSorting: true,
        enableHiding: true,
        filterFn: "includesString", // Allow filtering by ID if desired
    },

    // 4. Type Column
    {
        accessorKey: "type",
        header: ({ column }) => <SortableHeader column={column} title="Type" />,
        cell: ({ row }) => <div>{row.getValue("type")}</div>,
        filterFn: "equalsString",
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
        enableSorting: false, // Address sorting is usually not useful
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
            return (
                <div
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        isActive
                            ? "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                >
                    {isActive ? "Yes" : "No"}
                </div>
            );
        },
        filterFn: (row, id, filterValue) => {
            const rowValue = row.getValue(id) as boolean;
            const filterString = String(filterValue).toLowerCase();
            if (filterString === "yes" || filterString === "true")
                return rowValue;
            if (filterString === "no" || filterString === "false")
                return !rowValue;
            return true;
        },
        enableSorting: true,
        enableHiding: true,
        size: 80, // Adjust size for status
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
            ); // Style date
        },
        enableSorting: true,
        enableHiding: true,
        sortDescFirst: true, // Common to sort newest first
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
            ); // Style date
        },
        enableSorting: true,
        enableHiding: true,
    },

    // 11. Actions Column
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Actions</div>, // Add padding for alignment
        cell: ({ row }) => (
            <div className="text-right">
                {" "}
                {/* Align content to the right */}
                <DataTableRowActions row={row} />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 80, // Adjust size as needed
    },
];

// --- Component for Column Visibility Toggle ---
export function DataTableViewOptions<TData>({
    table,
}: {
    table: Table<TData>;
}) {
    return (
        <ViewDropdownMenu>
            {" "}
            {/* Using aliased import */}
            <ViewDropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto hidden h-9 lg:flex" // Match height with other controls
                >
                    <MixerHorizontalIcon className="mr-2 h-4 w-4" />
                    View
                </Button>
            </ViewDropdownMenuTrigger>
            <ViewDropdownMenuContent align="end" className="w-[150px]">
                {" "}
                {/* Using aliased import */}
                <div className="px-1 py-1 text-sm font-medium text-muted-foreground">
                    Toggle Columns
                </div>
                <DropdownMenuSeparator />
                {table
                    .getAllColumns()
                    .filter((column) =>
                        // Check if column *can* be hidden (accessor exists and not explicitly disabled)
                        column.getCanHide(),
                    )
                    .map((column) => {
                        // Attempt to get a readable header name, fall back to id
                        const headerText =
                            typeof column.columnDef.header === "string"
                                ? column.columnDef.header
                                : column.id; // Use id if header is a component

                        return (
                            <ViewDropdownMenuCheckboxItem // Using aliased import
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                    column.toggleVisibility(value)
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
