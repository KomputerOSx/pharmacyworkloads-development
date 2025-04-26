// src/components/departments/settings/DepartmentModuleAssignmentSection.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useAllModules } from "@/hooks/admin/useModules";
import {
    useDepModuleAssignments,
    useCreateDepModuleAssignment,
    useDeleteDepModuleAssignment,
} from "@/hooks/admin/useDepModuleAss";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Cog, Terminal } from "lucide-react";
import { toast } from "sonner";

interface DepartmentModuleAssignmentSectionProps {
    depId: string;
    orgId: string;
    departmentName: string;
}

export function DepartmentModuleAssignmentSection({
    depId,
    orgId,
    departmentName,
}: DepartmentModuleAssignmentSectionProps) {
    const [mutatingModuleId, setMutatingModuleId] = useState<string | null>(
        null,
    );

    // Data Fetching
    const {
        data: allModules,
        isLoading: isLoadingAllModules,
        isError: isErrorAllModules,
        error: errorAllModules,
    } = useAllModules();
    const {
        data: depModuleAssignments,
        isLoading: isLoadingDepAssignments,
        isError: isErrorDepAssignments,
        error: errorDepAssignments,
    } = useDepModuleAssignments(depId);

    // Mutations
    const createAssignmentMutation = useCreateDepModuleAssignment();
    const deleteAssignmentMutation = useDeleteDepModuleAssignment();

    // Memoized Data
    const assignedModuleIds = useMemo(() => {
        if (!depModuleAssignments) return new Set<string>();
        return new Set(depModuleAssignments.map((ass) => ass.moduleId));
    }, [depModuleAssignments]);

    const assignmentIdMap = useMemo(() => {
        if (!depModuleAssignments) return new Map<string, string>();
        return new Map(
            depModuleAssignments.map((ass) => [ass.moduleId, ass.id]),
        );
    }, [depModuleAssignments]);

    const assignableModules = useMemo(() => {
        return (allModules ?? []).filter((module) => module.active);
    }, [allModules]);

    // Handler
    const handleModuleAssignmentToggle = (
        moduleId: string,
        isCurrentlyChecked: boolean,
        currentAssignmentId: string | undefined,
    ) => {
        setMutatingModuleId(moduleId);
        if (isCurrentlyChecked) {
            createAssignmentMutation.mutate(
                { depId, moduleId, orgId },
                {
                    onError: (error) =>
                        console.error(`gH7jKlP1 - Failed assign:`, error), // Toast in hook
                    onSettled: () => setMutatingModuleId(null),
                },
            );
        } else {
            if (currentAssignmentId) {
                deleteAssignmentMutation.mutate(
                    { id: currentAssignmentId, depId: depId },
                    {
                        onError: (error) =>
                            console.error(`wE9rTyU6 - Failed unassign:`, error), // Toast in hook
                        onSettled: () => setMutatingModuleId(null),
                    },
                );
            } else {
                console.error(
                    `zX7cVbN3 - No Assignment ID for Module ${moduleId}, Dep ${depId}`,
                );
                toast.error("Error: Could not find assignment record.");
                setMutatingModuleId(null);
            }
        }
    };

    const isLoading = isLoadingAllModules || isLoadingDepAssignments;
    const isError = isErrorAllModules || isErrorDepAssignments;
    const error = errorAllModules || errorDepAssignments;
    const isProcessingAssignments =
        createAssignmentMutation.isPending ||
        deleteAssignmentMutation.isPending;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Cog className="h-5 w-5" /> Module Assignments
                </CardTitle>
                <CardDescription>
                    Select the global modules enabled for {departmentName}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">
                            Loading...
                        </span>
                    </div>
                )}
                {isError && !isLoading && (
                    <Alert variant="destructive" className="my-4">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error Loading Assignment Data</AlertTitle>
                        <AlertDescription>
                            {error?.message || "Could not load required data."}
                        </AlertDescription>
                    </Alert>
                )}
                {!isLoading &&
                    !isError &&
                    (assignableModules.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No active global modules found.
                        </p>
                    ) : (
                        <ScrollArea className="max-h-[40vh] min-h-[100px] pr-4">
                            <div className="space-y-3 py-1">
                                {assignableModules.map((module) => {
                                    const isAssigned = assignedModuleIds.has(
                                        module.id,
                                    );
                                    const assignmentId = assignmentIdMap.get(
                                        module.id,
                                    );
                                    const isMutatingThis =
                                        mutatingModuleId === module.id;

                                    return (
                                        <div
                                            key={module.id}
                                            className="flex items-center justify-between rounded-md border p-3 shadow-sm gap-2 hover:bg-muted/50 transition-colors"
                                        >
                                            <Label
                                                htmlFor={`mod-${depId}-${module.id}`} // More unique ID
                                                className={`text-sm font-medium leading-none cursor-pointer ${isProcessingAssignments && isMutatingThis ? "opacity-50" : ""}`}
                                            >
                                                {module.name}
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                {isProcessingAssignments &&
                                                    isMutatingThis && (
                                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    )}
                                                <Checkbox
                                                    id={`mod-${depId}-${module.id}`}
                                                    checked={isAssigned}
                                                    disabled={
                                                        isProcessingAssignments
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
                                                        handleModuleAssignmentToggle(
                                                            module.id,
                                                            !!checked,
                                                            assignmentId,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    ))}
            </CardContent>
        </Card>
    );
}
