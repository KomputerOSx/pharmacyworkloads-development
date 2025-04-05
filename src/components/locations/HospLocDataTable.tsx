// src/components/HospLocDataTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    flexRender,
} from "@tanstack/react-table";

// Shadcn UI Components
import {
    Table as ShadcnTable, // Renamed to avoid conflict with TanStack's Table type
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

// Your project imports
import { HospLoc } from "@/types/hosLocTypes"; // Adjust path if necessary
import { columns, DataTableViewOptions } from "./HospLocColumns";

// --- Component Props Interface ---
interface HospLocDataTableProps {
    locations: HospLoc[];
    // Consider adding isLoading and isError props if you want skeleton/error states handled here
    // isLoading?: boolean;
    // isError?: boolean;
}

export function HospLocDataTable({
    locations /*, isLoading, isError */,
}: HospLocDataTableProps) {
    // Memoize data to prevent unnecessary re-renders of the table internals
    const data = useMemo(() => locations ?? [], [locations]);

    // --- TanStack Table State ---
    const [sorting, setSorting] = useState<SortingState>(() => [
        { id: "createdAt", desc: true }, // Default sort by 'Created At' descending
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    // Note: globalFilter is initialized but not actively used if filtering is column-specific
    // const [globalFilter, setGlobalFilter] = useState("");
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {},
    );
    const [rowSelection, setRowSelection] = useState({});

    // --- Initialize TanStack Table ---
    const table = useReactTable({
        data,
        columns,
        // State Management
        state: {
            sorting,
            columnFilters,
            // globalFilter, // Only include if using global filtering feature
            columnVisibility,
            rowSelection,
        },
        // State Updaters
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        // onGlobalFilterChange: setGlobalFilter, // Only if using global filtering
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        // Pipeline - Order matters for some features
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // Processes filters
        getPaginationRowModel: getPaginationRowModel(), // Handles pagination
        getSortedRowModel: getSortedRowModel(), // Handles sorting
        // Default page size
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
        // You can define meta data to pass to column def functions if needed
        // meta: { /* custom data */ }
    });

    // --- External Control Logic ---

    // Get distinct types for the filter dropdown, memoized for performance
    const distinctTypes = useMemo(() => {
        const types = new Set<string>();
        data.forEach((loc) => {
            // Ensure type exists and is a non-empty string before adding
            if (loc.type && loc.type.trim() !== "") {
                types.add(loc.type);
            }
        });
        return Array.from(types).sort();
    }, [data]);

    // Handler for the main search input (filters only the 'name' column)
    const handleNameSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = event.target.value;
        // Set filter specifically for the 'name' column
        table.getColumn("name")?.setFilterValue(value || undefined); // Set to undefined to remove filter if value is empty
    };

    // Handler for the type filter select
    const handleTypeFilterChange = (value: string) => {
        // value is the selected type or "all"
        table
            .getColumn("type")
            ?.setFilterValue(value === "all" ? undefined : value); // Set to undefined to remove filter
    };

    // --- Sorting Button Handlers ---
    const sortByNameAsc = () => setSorting([{ id: "name", desc: false }]);
    const sortByCreatedAtDesc = () =>
        setSorting([{ id: "createdAt", desc: true }]);
    const resetSort = () => setSorting([]); // Clear sorting state

    // --- Render Logic ---

    // // Optional: Skeleton Loading State (if isLoading prop is passed)
    // if (isLoading) {
    //   return (
    //     <div className="space-y-4">
    //        {/* Basic Skeleton */}
    //        <div className="flex items-center gap-4 rounded-md border p-4">
    //          <Skeleton className="h-9 w-1/4" />
    //          <Skeleton className="h-9 w-[180px]" />
    //          <Skeleton className="h-8 w-20" />
    //          <Skeleton className="h-8 w-28" />
    //          <Skeleton className="h-8 w-24" />
    //          <Skeleton className="ml-auto h-8 w-[70px]" />
    //        </div>
    //       <div className="rounded-md border">
    //          <Skeleton className="h-[400px] w-full" /> {/* Placeholder for table body */}
    //       </div>
    //        <div className="flex items-center justify-between py-4">
    //          <Skeleton className="h-5 w-28" />
    //          <Skeleton className="h-8 w-[150px]" />
    //          <Skeleton className="h-5 w-20" />
    //          <div className="flex items-center space-x-2">
    //             <Skeleton className="h-8 w-20" />
    //             <Skeleton className="h-8 w-16" />
    //          </div>
    //        </div>
    //     </div>
    //   );
    // }

    // // Optional: Error State (if isError prop is passed)
    // if (isError) {
    //    return <Alert variant="destructive">Error loading data.</Alert>;
    // }

    return (
        <div className="w-full space-y-4">
            {/* --- External Controls Section --- */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 rounded-md border bg-card p-4 text-card-foreground">
                {/* Name Search */}
                <div className="flex flex-col space-y-1 w-full sm:w-auto">
                    <label
                        htmlFor="name-search"
                        className="text-sm font-medium"
                    >
                        Search Name
                    </label>
                    <Input
                        id="name-search"
                        placeholder="Filter by name..."
                        // Controlled input: value comes from table state
                        value={
                            (table
                                .getColumn("name")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={handleNameSearchChange}
                        className="h-9 max-w-full sm:max-w-xs" // Responsive width
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
                            // Controlled select
                            (table
                                .getColumn("type")
                                ?.getFilterValue() as string) ?? "all" // Default to 'all' if no filter
                        }
                        onValueChange={handleTypeFilterChange}
                    >
                        <SelectTrigger className="h-9 w-full sm:w-[180px]">
                            {" "}
                            {/* Responsive width */}
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {distinctTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}{" "}
                                    {/* Assuming type name is user-friendly */}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sorting Controls */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:items-end sm:ml-4">
                    {" "}
                    {/* Adjust margin/padding */}
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

                {/* Column Visibility Toggle (Pushed to the right on larger screens) */}
                <div className="ml-auto pt-2 sm:pt-0">
                    <DataTableViewOptions table={table} />
                </div>
            </div>

            {/* --- The Data Table --- */}
            <div className="rounded-md border">
                <ShadcnTable>
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
                                        {" "}
                                        {/* Optional: Use column sizing */}
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
                                    colSpan={table.getAllColumns().length} // Use table columns length
                                    className="h-24 text-center"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </ShadcnTable>
            </div>

            {/* --- Pagination --- */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                {/* Row Selection Count (Optional) */}
                <div className="text-sm text-muted-foreground order-3 sm:order-1">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected. (
                    {data.length} total rows){" "}
                    {/* Added total unfiltered count */}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 order-2 justify-center">
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
                    <div className="flex items-center justify-center text-sm font-medium">
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
