"use client";

import { CellContext, Column, ColumnDef, Row } from "@tanstack/react-table";
import { DepTeam } from "@/types/subDepTypes"; // Use the DepTeam type directly
import { formatDate } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import {
    ArrowUpDown,
    MoreHorizontal,
    Trash,
    Edit,
    MapPin,
    Users,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge"; // For active status

// --- Table Meta Interface ---
interface DepTeamsTableMeta {
    openDeleteDialog: (teamId: string, teamName: string) => void;
    openEditSheet: (team: DepTeam) => void;
    openManageLocationsDialog: (team: DepTeam) => void;
    openManageUsersDialog: (team: DepTeam) => void;
}

// --- Action Row Component Props ---
interface DataTableRowActionsProps {
    row: Row<DepTeam>; // Row data is DepTeam
    meta: DepTeamsTableMeta; // Get meta from table
}

// --- Reusable Header Component ---
const SortableHeader = ({
    column,
    title,
}: {
    column: Column<DepTeam>; // Use DepTeam
    title: string;
}) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8 data-[state=open]:bg-accent"
    >
        <span>{title}</span>
        {column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
    </Button>
);

// --- Action Buttons Component for Each Row ---
const DataTableRowActions: React.FC<DataTableRowActionsProps> = ({
    row,
    meta,
}) => {
    const team = row.original;

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
            <DropdownMenuContent align="end" className="w-[180px]">
                {" "}
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => meta.openEditSheet(team)}
                    className="cursor-pointer"
                >
                    <Edit className="mr-2 h-4 w-4" /> Edit Team
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => meta.openManageUsersDialog(team)}
                    className="cursor-pointer"
                >
                    <Users className="mr-2 h-4 w-4" /> Manage Users
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => meta.openManageLocationsDialog(team)}
                    className="cursor-pointer"
                >
                    <MapPin className="mr-2 h-4 w-4" /> Manage Locations
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => meta.openDeleteDialog(team.id, team.name)}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                >
                    <Trash className="mr-2 h-4 w-4" /> Delete Team
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// --- Column Definitions Array ---
export const columns: ColumnDef<DepTeam>[] = [
    // Define columns for DepTeam
    // 1. Team Name Column
    {
        accessorKey: "name",
        header: ({ column }) => (
            <SortableHeader column={column} title="Team Name" />
        ),
        cell: ({ row }: CellContext<DepTeam, unknown>) => (
            <div className="font-medium">{row.getValue("name")}</div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    // 2. Description Column
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground truncate max-w-xs">
                {/* Show ellipsis for long descriptions */}
                {row.getValue("description") || "-"}
            </div>
        ),
        enableSorting: false,
        enableHiding: true,
    },
    // 3. Active Status Column
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
    // 4. Created At Column
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <SortableHeader column={column} title="Created On" />
        ),
        cell: ({ row }) => {
            const dateVal = row.getValue("createdAt") as Date | null;
            return (
                <div className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(dateVal)}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true,
        sortDescFirst: true,
    },

    // 5. Actions Column
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Actions</div>,
        cell: ({ row, table }: CellContext<DepTeam, unknown>) => {
            const meta = table.options.meta as DepTeamsTableMeta | undefined;
            // Check for ALL required meta functions now
            if (
                !meta?.openDeleteDialog ||
                !meta?.openEditSheet ||
                !meta?.openManageLocationsDialog ||
                !meta.openManageUsersDialog
            ) {
                console.error(
                    "Meta methods not provided to DepTeamsColumns actions cell!",
                );
                return <div className="text-right text-red-500">!</div>;
            }
            return (
                <div className="text-right">
                    {" "}
                    <DataTableRowActions row={row} meta={meta} />{" "}
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
        size: 80,
    },
];
