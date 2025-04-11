"use client";

import React, { useMemo, useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel, // For filtering
    SortingState,
    ColumnFiltersState, // For filtering
    TableMeta,
    useReactTable,
} from "@tanstack/react-table";
import { columns } from "./DepTeamsColumns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DepTeam } from "@/types/subDepTypes";

// --- Component Props ---
interface DepTeamsTableProps {
    teams: DepTeam[];
    onDeleteRequest: (teamId: string, teamName: string) => void;
    onEditRequest: (team: DepTeam) => void;
    onManageLocationsRequest: (team: DepTeam) => void;
    onManageUsersRequest: (team: DepTeam) => void;
    isLoading: boolean;
}

// --- Table Meta Interface --- (Should match the one in Columns)
interface DepTeamsTableMeta extends TableMeta<DepTeam> {
    openDeleteDialog: (teamId: string, teamName: string) => void;
    openEditSheet: (team: DepTeam) => void;
    openManageLocationsDialog: (team: DepTeam) => void;
    openManageUsersDialog: (team: DepTeam) => void;
}

export function DepTeamsTable({
    teams,
    onDeleteRequest,
    onEditRequest,
    onManageLocationsRequest,
    onManageUsersRequest,
    isLoading,
}: DepTeamsTableProps) {
    const data = useMemo(() => teams ?? [], [teams]);

    const [sorting, setSorting] = useState<SortingState>(() => [
        { id: "createdAt", desc: true }, // Default sort by creation date
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]); // State for filters

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters, // Handle filter changes
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // Enable filtering model
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
        // Pass meta data for columns/cells
        meta: {
            openDeleteDialog: onDeleteRequest,
            openEditSheet: onEditRequest,
            openManageLocationsDialog: onManageLocationsRequest,
            openManageUsersDialog: onManageUsersRequest,
        } as DepTeamsTableMeta, // Cast meta type
    });

    return (
        <div className="w-full space-y-4">
            {/* --- Toolbar (Filtering etc.) --- */}
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter by name..."
                    value={
                        (table.getColumn("name")?.getFilterValue() as string) ??
                        ""
                    }
                    onChange={(event) =>
                        table
                            .getColumn("name")
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                {/* Add more filters here if needed (e.g., status dropdown) */}
            </div>

            {/* --- The Data Table --- */}
            <div className="rounded-md border">
                <ScrollArea className="w-full whitespace-nowrap">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                width:
                                                    header.getSize() !== 150
                                                        ? header.getSize()
                                                        : undefined,
                                            }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.original.id} // Use team ID as key
                                        data-state={
                                            row.getIsSelected() && "selected"
                                        }
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                style={{
                                                    width:
                                                        cell.column.getSize() !==
                                                        150
                                                            ? cell.column.getSize()
                                                            : undefined,
                                                }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        {isLoading
                                            ? "Loading teams..."
                                            : "No teams found for this department."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>

            {/* --- Pagination Controls --- */}
            <div className="flex flex-col gap-4 sm:flex-row items-center justify-between py-4">
                {/* Row Count */}
                <div className="text-sm text-muted-foreground order-last sm:order-first">
                    Total Teams: {table.getFilteredRowModel().rows.length}
                </div>

                {/* Pagination Controls Group */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 order-first sm:order-last">
                    {/* Page Size Selector */}
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows:</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) =>
                                table.setPageSize(Number(value))
                            }
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue
                                    placeholder={
                                        table.getState().pagination.pageSize
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[5, 10, 20, 50].map((pageSize) => (
                                    <SelectItem
                                        key={pageSize}
                                        value={`${pageSize}`}
                                    >
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Page Number Display */}
                    <div className="flex items-center justify-center text-sm font-medium px-2">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>

                    {/* Prev/Next Buttons */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
