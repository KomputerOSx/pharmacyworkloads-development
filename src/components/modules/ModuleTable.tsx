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
import { Edit, Trash2 } from "lucide-react";

interface ModuleTableProps {
    modules: Module[];
    isLoading: boolean;
    onEditRequest: (module: Module) => void;
    onDeleteRequest: (id: string, name: string) => void;
}

export function ModuleTable({
    modules,
    isLoading,
    onEditRequest,
    onDeleteRequest,
}: ModuleTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-2 px-6 pb-4">
                {" "}
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
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                        Description
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[100px]">
                        Actions
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {modules.map((module) => (
                    <TableRow key={module.id}>
                        <TableCell className="font-medium">
                            {module.name}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground max-w-xs truncate">
                            {module.description || "-"}
                        </TableCell>
                        <TableCell>
                            <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                    module.active
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                }`}
                            >
                                {module.active ? "Active" : "Inactive"}
                            </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEditRequest(module)}
                            >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">
                                    Edit {module.name}
                                </span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    onDeleteRequest(module.id, module.name)
                                }
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">
                                    Delete {module.name}
                                </span>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
