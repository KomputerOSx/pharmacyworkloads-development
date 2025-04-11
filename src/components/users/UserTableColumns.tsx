// src/components/users/columns.tsx
"use client";

import { ColumnDef, Row, CellContext } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils"; // Keep your formatter

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
import { User } from "@/types/userTypes";

// Define the type for your custom meta data
interface UserTableMeta {
    departmentNameMap: Map<string, string>;
    isLoadingDepartmentMap: boolean;
    onEditRequest: (user: User) => void;
    onDeleteRequest: (user: User) => void;
}

// --- Column Definitions ---
export const columns: ColumnDef<User>[] = [
    // --- Selection Column --- (no changes)
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

    // --- User Name --- (no changes needed here for name-only global search)
    {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: "fullName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                {" "}
                Name <ArrowUpDown className="ml-2 h-4 w-4" />{" "}
            </Button>
        ),
        cell: ({ row }) => (
            <div className="font-medium">{`${row.original.firstName} ${row.original.lastName}`}</div>
        ),
        enableColumnFilter: false, // Still handled globally
    },
    // Hidden supporting columns (no changes)
    {
        accessorKey: "lastName",
        header: "Last Name",
        enableHiding: true,
        enableSorting: false,
        enableColumnFilter: false,
    },
    {
        accessorKey: "firstName",
        header: "First Name",
        enableHiding: true,
        enableSorting: false,
        enableColumnFilter: false,
    },

    // --- Email --- (no changes needed here)
    {
        accessorKey: "email",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                {" "}
                Email <ArrowUpDown className="ml-2 h-4 w-4" />{" "}
            </Button>
        ),
        cell: ({ row }) => (
            <div className="lowercase">{row.getValue("email")}</div>
        ),
        enableColumnFilter: false, // Still handled globally (though less relevant now)
    },

    // --- Department ---
    {
        accessorKey: "departmentId",
        header: "Department",
        // Cell rendering remains the same
        cell: ({ row, table }: CellContext<User, unknown>) => {
            const departmentId = row.getValue("departmentId") as string;
            const meta = table.options.meta as UserTableMeta | undefined;
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
        // *** UPDATED FILTER FN: Handles ID matching and "All" case ***
        filterFn: (
            row: Row<User>,
            columnId: string,
            filterValue: string | undefined,
        ) => {
            // If filterValue is empty or undefined (our "All" case), show the row
            if (!filterValue) {
                return true;
            }
            // Otherwise, compare the row's departmentId with the filterValue (which is the selected ID)
            const departmentId = row.original.departmentId;
            return departmentId === filterValue;
        },
        enableSorting: false,
    },

    // --- Role --- (no changes)
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <div>{row.getValue("role")}</div>,
        filterFn: "equalsString",
        enableSorting: true,
    },

    // --- Status (Active/Inactive) --- (no changes)
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
                {" "}
                Status <ArrowUpDown className="ml-2 h-4 w-4" />{" "}
            </Button>
        ),
        cell: ({ row }) => {
            const isActive = row.getValue("active");
            return (
                <Badge
                    variant={isActive ? "success" : "destructive"}
                    className="text-xs"
                >
                    {" "}
                    {isActive ? "Active" : "Inactive"}{" "}
                </Badge>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            const isActive = row.getValue(columnId);
            const filterString = String(filterValue).toLowerCase();
            if (filterString === "active") return isActive === true;
            if (filterString === "inactive") return isActive === false;
            return true;
        },
    },

    // --- Optional Columns --- (no changes)
    {
        accessorKey: "phoneNumber",
        header: "Phone Number",
        cell: ({ row }) => <div>{row.getValue("phoneNumber") || "-"}</div>,
        enableSorting: false,
        enableColumnFilter: false,
    },
    {
        accessorKey: "jobTitle",
        header: "Job Title",
        cell: ({ row }) => <div>{row.getValue("jobTitle") || "-"}</div>,
        enableSorting: true,
        enableColumnFilter: false,
    },
    {
        accessorKey: "specialty",
        header: "Specialty",
        cell: ({ row }) => <div>{row.getValue("specialty") || "-"}</div>,
        enableSorting: true,
        enableColumnFilter: false,
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
                {" "}
                Last Login <ArrowUpDown className="ml-2 h-4 w-4" />{" "}
            </Button>
        ),
        cell: ({ row }) => {
            const lastLogin = row.getValue("lastLogin") as Date | null;
            return <div>{lastLogin ? formatDate(lastLogin) : "-"}</div>;
        },
        enableColumnFilter: false,
    },

    // --- Actions Column --- (no changes)
    {
        id: "actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row, table }: CellContext<User, unknown>) => {
            const user = row.original;
            const meta = table.options.meta as UserTableMeta | undefined;

            return (
                <DropdownMenu>
                    {/* --- Culprit Area --- */}
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            {/* ↓↓↓ These extra spaces/newlines might be interpreted as text nodes ↓↓↓ */}{" "}
                            <span className="sr-only">Open menu</span>{" "}
                            <MoreHorizontal className="h-4 w-4" /> {/* ↑↑↑ */}
                        </Button>
                        {/* Or maybe there's accidental whitespace/comment HERE between Trigger and Button */}
                    </DropdownMenuTrigger>
                    {/* --- End Culprit Area --- */}
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() =>
                                navigator.clipboard.writeText(user.email)
                            }
                        >
                            {" "}
                            Copy Email{" "}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => meta?.onEditRequest(user)}
                        >
                            {" "}
                            <Pencil className="mr-2 h-4 w-4" /> Edit User{" "}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                            onClick={() => meta?.onDeleteRequest(user)}
                        >
                            {" "}
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User{" "}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
