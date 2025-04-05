// src/components/locations/HospLocDataTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getFacetedRowModel, // Added for potential faceted filters
    getFacetedUniqueValues, // Added for potential faceted filters
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState, // Import RowSelectionState
    flexRender,
    TableMeta,
} from "@tanstack/react-table";

// Shadcn UI Components
import {
    Table, // Use Shadcn Table component
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Optional: For horizontal scroll on small screens

// Project Imports
import { HospLoc } from "@/types/hosLocTypes"; // Adjust path
import { columns, DataTableViewOptions } from "./HospLocColumns"; // Import updated columns/options

// --- Component Props Interface ---

interface HospLocTableMeta extends TableMeta<HospLoc> {
    openEditDialog: (location: HospLoc) => void;
    openDeleteDialog: (location: HospLoc) => void;
    hospitalNameMap: Map<string, string>; // Add the map
    isLoadingHospitalMap: boolean;
    // Add other functions/data needed by columns here
}

interface HospLocDataTableProps {
    locations: HospLoc[];
    onEditRequest: (location: HospLoc) => void;
    onDeleteRequest: (location: HospLoc) => void;
    hospitalNameMap: Map<string, string>; // Add the map
    isLoadingHospitalMap: boolean;
}

export function HospLocDataTable({
    locations,
    onEditRequest,
    onDeleteRequest,
    hospitalNameMap,
    isLoadingHospitalMap,
}: HospLocDataTableProps) {
    // Memoize data to prevent unnecessary recalculations
    const data = useMemo(() => locations ?? [], [locations]);

    // OPTION 1 (Preferred if map is reliable): Use the passed hospitalNameMap
    const distinctHospitalsForFilter = useMemo(() => {
        if (isLoadingHospitalMap || !hospitalNameMap) {
            return [];
        }
        const hospitalOptions: { value: string; label: string }[] = [];
        hospitalNameMap.forEach((name, id) => {
            if (name && name.trim() !== "" && id) {
                hospitalOptions.push({ value: id, label: name });
            }
        });
        // Sort options by label (name)
        return hospitalOptions.sort((a, b) => a.label.localeCompare(b.label));
    }, [hospitalNameMap, isLoadingHospitalMap]);

    // --- TanStack Table State ---
    const [sorting, setSorting] = useState<SortingState>(() => [
        { id: "createdAt", desc: true }, // Default sort
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {},
    );
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({}); // State for selected rows

    // --- Initialize TanStack Table ---
    const table = useReactTable({
        data,
        columns, // Use the imported columns array
        // State Management
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection, // Include row selection state
        },
        // State Updaters
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection, // Enable updating selection state
        // Pipeline - Order can matter
        getCoreRowModel: getCoreRowModel(), // Required
        getFilteredRowModel: getFilteredRowModel(), // Handle filtering
        getPaginationRowModel: getPaginationRowModel(), // Handle pagination
        getSortedRowModel: getSortedRowModel(), // Handle sorting
        getFacetedRowModel: getFacetedRowModel(), // Optional: For advanced filtering summary
        getFacetedUniqueValues: getFacetedUniqueValues(), // Optional: For advanced filtering unique values

        // **** Enable Row Selection Feature ****
        enableRowSelection: false, // Master switch for row selection
        // enableMultiRowSelection: true, // Default: true
        // enableSubRowSelection: false, // Default: false (for nested rows)
        // ***********************************

        // Default page size
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
        // }

        meta: {
            openEditDialog: onEditRequest,
            openDeleteDialog: onDeleteRequest,
            hospitalNameMap: hospitalNameMap,
            isLoadingHospitalMap: isLoadingHospitalMap,
        } as HospLocTableMeta,
    });

    // --- External Control Logic ---

    // Get distinct types for the filter dropdown, memoized
    const distinctTypes = useMemo(() => {
        const types = new Set<string>();
        data.forEach((loc) => {
            if (loc.type && loc.type.trim() !== "") {
                types.add(loc.type);
            }
        });
        return Array.from(types).sort();
    }, [data]);

    // Handler for the 'Name' search input
    const handleNameSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        table
            .getColumn("name")
            ?.setFilterValue(event.target.value || undefined);
    };

    // Handler for the 'Type' filter select
    const handleTypeFilterChange = (value: string) => {
        table
            .getColumn("type")
            ?.setFilterValue(value === "all" ? undefined : value);
    };

    const handleHospitalFilterChange = (value: string) => {
        table
            .getColumn("hospId") // Target the correct column ID
            ?.setFilterValue(value === "all" ? undefined : value); // Set ID as filter value
    };

    // --- Sorting Button Handlers ---
    const sortByNameAsc = () => setSorting([{ id: "name", desc: false }]);
    const sortByCreatedAtDesc = () =>
        setSorting([{ id: "createdAt", desc: true }]);
    const resetSort = () => setSorting([]); // Clear sorting

    const isFilterLoading = isLoadingHospitalMap;

    return (
        <div className="w-full space-y-4">
            {/* --- Toolbar: Filters, Sorting, View Options --- */}
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center rounded-md border bg-card p-4 text-card-foreground">
                {/* Name Search */}
                <div className="flex flex-col space-y-1 flex-grow sm:flex-grow-0 sm:basis-1/4">
                    {" "}
                    {/* Adjust basis */}
                    <label
                        htmlFor="name-search"
                        className="text-sm font-medium"
                    >
                        Search Name
                    </label>
                    <Input
                        id="name-search"
                        placeholder="Filter by name..."
                        value={
                            (table
                                .getColumn("name")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={handleNameSearchChange}
                        className="h-9"
                    />
                </div>

                {/* Type Filter */}
                <div className="flex flex-col space-y-1">
                    <label
                        htmlFor="type-filter"
                        className="text-sm font-medium"
                    >
                        Filter by Type
                    </label>
                    <Select
                        value={
                            (table
                                .getColumn("type")
                                ?.getFilterValue() as string) ?? "all"
                        }
                        onValueChange={handleTypeFilterChange}
                    >
                        <SelectTrigger className="h-9 w-full sm:w-[180px]">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {distinctTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Hospital Filter */}
                <div className="flex flex-col space-y-1">
                    <label
                        htmlFor="hospital-filter"
                        className="text-sm font-medium"
                    >
                        Filter by Hospital
                    </label>
                    <Select
                        // Value is the hospId stored in the column's filter state
                        value={
                            (table
                                .getColumn("hospId")
                                ?.getFilterValue() as string) ?? "all"
                        }
                        onValueChange={handleHospitalFilterChange}
                        disabled={isFilterLoading} // Disable while loading options
                    >
                        <SelectTrigger
                            className="h-9 w-full sm:w-[180px]"
                            disabled={isFilterLoading}
                        >
                            <SelectValue
                                placeholder={
                                    isFilterLoading
                                        ? "Loading..."
                                        : "Select Hospital"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Hospitals</SelectItem>
                            {/* Map over the {value, label} options */}
                            {distinctHospitalsForFilter.map((hospital) => (
                                <SelectItem
                                    key={hospital.value}
                                    value={hospital.value}
                                >
                                    {hospital.label} {/* Display Name */}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sorting Controls Group */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:items-end sm:ml-4">
                    <span className="text-sm font-medium self-center pb-1 mr-1 hidden sm:inline">
                        Sort:
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={sortByNameAsc}
                    >
                        Name ▲
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={sortByCreatedAtDesc}
                    >
                        Created At ▼
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={resetSort}
                    >
                        Reset
                    </Button>
                </div>

                {/* Column Visibility (Pushed Right) */}
                <div className="ml-0 sm:ml-auto pt-2 sm:pt-0">
                    <DataTableViewOptions table={table} />
                </div>
            </div>

            {/* --- The Data Table (with optional horizontal scroll) --- */}
            <div className="rounded-md border">
                <ScrollArea className="w-full whitespace-nowrap">
                    {" "}
                    {/* Optional Scroll */}
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
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected() && "selected"
                                        } // Highlight selected rows
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
                                        colSpan={table.getAllColumns().length} // Use dynamic colSpan
                                        className="h-24 text-center"
                                    >
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />{" "}
                    {/* Optional Scroll */}
                </ScrollArea>
            </div>

            {/* --- Pagination Controls --- */}
            <div className="flex flex-col gap-4 sm:flex-row items-center justify-between py-4">
                {/* Row Selection Count */}
                <div className="text-sm text-muted-foreground order-last sm:order-first">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                    {/* Optional: Show total count before filtering */}
                    {/* ({data.length} total) */}
                </div>

                {/* Pagination Controls Group */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 order-first sm:order-last">
                    {/* Page Size Selector */}
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows:</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue
                                    placeholder={
                                        table.getState().pagination.pageSize
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 50, 100].map((pageSize) => (
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
