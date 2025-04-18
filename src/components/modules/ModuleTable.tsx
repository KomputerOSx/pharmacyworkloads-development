// src/components/modules/ModuleTable.tsx
"use client";

import { Module } from "@/types/moduleTypes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Edit, Settings2, Trash2 } from "lucide-react";

interface ModuleTableProps {
    modules: Module[];
    isLoading: boolean;
    onEditRequest: (module: Module) => void;
    onDeleteRequest: (id: string, name: string) => void;
    onManageAssignmentsRequest: (module: Module) => void;
}

export function ModuleTable({
    modules,
    isLoading,
    onEditRequest,
    onDeleteRequest,
    onManageAssignmentsRequest,
}: ModuleTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-2 px-6 pb-4">
                {/* Add padding if CardContent padding removed */}
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
            </div>
        );
    }

    if (modules.length === 0) {
        return (
            <p className="text-center text-muted-foreground py-6 px-6">
                No modules found. Create one to get started.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                        URL Path
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                        Access
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[140px]">
                        Actions
                    </TableHead>
                    {/* Increased width */}
                </TableRow>
            </TableHeader>
            <TableBody>
                {modules.map((module) => (
                    <TableRow key={module.id}>
                        <TableCell className="font-medium">
                            {module.displayName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">
                            /{module.urlPath}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm capitalize">
                            {module.accessLevel}
                        </TableCell>
                        <TableCell>
                            {/* Status Badge remains the same */}
                            <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${module.active ? "..." : "..."}`}
                            >
                                {module.active ? "Active" : "Inactive"}
                            </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                            {/* Manage Assignments Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Manage Assignments"
                                onClick={() =>
                                    onManageAssignmentsRequest(module)
                                }
                            >
                                <Settings2 className="h-4 w-4" />
                                <span className="sr-only">
                                    Manage Assignments for {module.displayName}
                                </span>
                            </Button>
                            {/* Edit Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Edit Module"
                                onClick={() => onEditRequest(module)}
                            >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">
                                    Edit {module.displayName}
                                </span>
                            </Button>
                            {/* Delete Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Delete Module"
                                onClick={() =>
                                    onDeleteRequest(
                                        module.id,
                                        module.displayName,
                                    )
                                }
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">
                                    Delete {module.displayName}
                                </span>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
