// src/components/users/columns.tsx
"use client";

import {
    ColumnDef,
    FilterFn,
    SortingFn,
    sortingFns,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/userTypes"; // Adjust path as needed
import { cn } from "@/lib/utils"; // For conditional classNames

// Define a type for the custom meta passed to columns
// This makes accessing the passed functions/data type-safe
interface UserTableMeta {
    departmentNameMap: Map<string, string>;
    isLoadingDepartmentMap: boolean;
    onEditRequest: (user: User) => void;
    onDeleteRequest: (user: User) => void;
}

// Helper function for basic case-insensitive filtering
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = sortingFns.fuzzy(row, columnId, value, addMeta);

    // Return if the item should be filtered in/out
    return itemRank > 0; // Use threshold greater than 0 for fuzzy match
};

// --- Column Definitions ---
export const columns: ColumnDef<User, UserTableMeta>[] = [
    // --- Selection Column ---
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },

    // --- User Name ---
    {
        accessorKey: "firstName", // Can sort/filter by first name
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const firstName = row.original.firstName;
            const lastName = row.original.lastName;
            return (
                <div className="font-medium">{`${firstName} ${lastName}`}</div>
            );
        },
        filterFn: fuzzyFilter, // Enable fuzzy filtering on this combined name concept if needed elsewhere
    },
    // We hide lastName by default but keep it for filtering/data
    {
        accessorKey: "lastName",
        header: "Last Name", // Simple header, no sorting UI needed if hiding
        cell: ({ row }) => row.original.lastName,
        enableHiding: true, // Can be hidden
        enableSorting: false, // Usually sort by full name or first name
    },

    // --- Email ---
    {
        accessorKey: "email",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Email
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="lowercase">{row.getValue("email")}</div>
        ),
        filterFn: fuzzyFilter,
    },

    // --- Department ---
    {
        accessorKey: "departmentId",
        header: "Department",
        cell: ({ row, table }) => {
            const departmentId = row.getValue("departmentId") as string;
            // Access map and loading state from meta
            const meta = table.options.meta;
            if (meta?.isLoadingDepartmentMap) {
                return (
                    <span className="text-xs text-muted-foreground">
                        Loading...
                    </span>
                );
            }
            const departmentName = meta?.departmentNameMap?.get(departmentId);
            return (
                <div>
                    {departmentName || (
                        <span className="text-xs text-muted-foreground">
                            N/A
                        </span>
                    )}
                </div>
            );
        },
        // Enable filtering using the *displayed name* rather than the ID
        filterFn: (row, columnId, filterValue) => {
            const departmentId = row.original.departmentId;
            const meta = row.table.options.meta as UserTableMeta | undefined; // Cast meta
            const departmentName =
                meta?.departmentNameMap?.get(departmentId) ?? "";
            return departmentName
                .toLowerCase()
                .includes(String(filterValue).toLowerCase());
        },
        enableSorting: false, // Sorting by name requires joining data or denormalizing name onto user doc
    },

    // --- Role ---
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <div>{row.getValue("role")}</div>,
        filterFn: "equalsString", // Exact match filter might be better for roles
    },

    // --- Status (Active/Inactive) ---
    {
        accessorKey: "active",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const isActive = row.getValue("active");
            return (
                <Badge
                    variant={isActive ? "success" : "destructive"}
                    className="text-xs"
                >
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            // Filter for true/false based on string 'active'/'inactive'
            const isActive = row.getValue(columnId);
            const filterString = String(filterValue).toLowerCase();
            if (filterString === "active") return isActive === true;
            if (filterString === "inactive") return isActive === false;
            return true; // Show all if filter doesn't match 'active' or 'inactive'
        },
    },

    // --- Optional Columns (Initially hidden potentially) ---
    {
        accessorKey: "phoneNumber",
        header: "Phone Number",
        cell: ({ row }) => <div>{row.getValue("phoneNumber") || "-"}</div>,
        enableSorting: false,
    },
    {
        accessorKey: "jobTitle",
        header: "Job Title",
        cell: ({ row }) => <div>{row.getValue("jobTitle") || "-"}</div>,
        enableSorting: false,
    },
    {
        accessorKey: "specialty",
        header: "Specialty",
        cell: ({ row }) => <div>{row.getValue("specialty") || "-"}</div>,
        enableSorting: false,
    },
    {
        accessorKey: "lastLogin",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Last Login
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const lastLogin = row.getValue("lastLogin") as Date | null;
            return <div>{lastLogin ? formatDate(lastLogin) : "-"}</div>; // Format: Sep 19, 2023, 11:05:30 AM
        },
    },

    // --- Actions Column ---
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => {
            const user = row.original;
            // Access callbacks from meta
            const meta = table.options.meta;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() =>
                                navigator.clipboard.writeText(user.email)
                            }
                        >
                            Copy Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => meta?.onEditRequest(user)}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                            onClick={() => meta?.onDeleteRequest(user)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
