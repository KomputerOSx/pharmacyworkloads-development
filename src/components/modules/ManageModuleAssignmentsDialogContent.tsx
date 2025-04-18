// src/components/modules/ManageModuleAssignmentsDialogContent.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAssignmentsByModule } from "@/hooks/useDepModuleAss";
import { useOrgs } from "@/hooks/useOrgs";
import { Module, ModuleAssignmentWithDetails } from "@/types/moduleTypes";
import { Department } from "@/types/depTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Terminal, Building, Users } from "lucide-react";
import { Org } from "@/types/orgTypes";
import { getDeps } from "@/services/depService"; // Building, Users icons

interface ManageModuleAssignmentsDialogContentProps {
    module: Module;
}

async function fetchAllDepartments(orgIds: string[]): Promise<Department[]> {
    if (!orgIds || orgIds.length === 0) return [];
    console.log(`Fetching departments for ${orgIds.length} organizations...`);
    try {
        const depPromises = orgIds.map((orgId) => getDeps(orgId));
        const results = await Promise.allSettled(depPromises);
        const allDeps: Department[] = [];
        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                allDeps.push(...result.value);
            } else {
                console.error(
                    `Failed to fetch deps for org ${orgIds[index]}:`,
                    result.reason,
                );
            }
        });
        console.log(`Fetched total ${allDeps.length} departments.`);
        return allDeps;
    } catch (error) {
        console.error("Error in fetchAllDepartments:", error);
        return [];
    }
}

function useAllDepartments(orgIds: string[] | undefined) {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!orgIds || orgIds.length === 0) {
            setDepartments([]);
            return;
        }
        let isMounted = true;
        setIsLoading(true);
        setIsError(false);
        fetchAllDepartments(orgIds)
            .then((data) => {
                if (isMounted) setDepartments(data);
            })
            .catch(() => {
                if (isMounted) setIsError(true);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, [orgIds]);

    return { data: departments, isLoading, isError };
}
// --- END TEMP HOOK ---

export function ManageModuleAssignmentsDialogContent({
    module,
}: ManageModuleAssignmentsDialogContentProps) {
    const {
        data: assignments,
        isLoading: isLoadingAssignments,
        isError: isErrorAssignments,
    } = useAssignmentsByModule(module.id);

    // Fetch all organizations to get names
    const {
        data: allOrgs,
        isLoading: isLoadingOrgs,
        isError: isErrorOrgs,
    } = useOrgs();

    // Extract Org IDs from assignments to fetch relevant departments
    const assignedOrgIds = useMemo(() => {
        if (!assignments) return [];
        return Array.from(new Set(assignments.map((a) => a.orgId)));
    }, [assignments]);

    const {
        data: allRelevantDeps,
        isLoading: isLoadingDeps,
        isError: isErrorDeps,
    } = useAllDepartments(assignedOrgIds);

    // Create lookup maps for performance
    const orgMap = useMemo(() => {
        if (!allOrgs) return new Map<string, Org>();
        return new Map(allOrgs.map((org) => [org.id, org]));
    }, [allOrgs]);

    const depMap = useMemo(() => {
        if (!allRelevantDeps) return new Map<string, Department>();
        return new Map(allRelevantDeps.map((dep) => [dep.id, dep]));
    }, [allRelevantDeps]);

    // Combine assignment data with org/dep names
    const assignmentsWithDetails: ModuleAssignmentWithDetails[] =
        useMemo(() => {
            if (!assignments) return [];
            return assignments
                .map((ass) => ({
                    ...ass,
                    organizationName:
                        orgMap.get(ass.orgId)?.name ??
                        `Org (${ass.orgId.substring(0, 5)}...)`, // Show ID snippet if name not found
                    departmentName:
                        depMap.get(ass.depId)?.name ??
                        `Dept (${ass.depId.substring(0, 5)}...)`, // Show ID snippet if name not found
                }))
                .sort((a, b) => {
                    // Sort for consistent display
                    const orgComp = (a.organizationName ?? "").localeCompare(
                        b.organizationName ?? "",
                    );
                    if (orgComp !== 0) return orgComp;
                    return (a.departmentName ?? "").localeCompare(
                        b.departmentName ?? "",
                    );
                });
        }, [assignments, orgMap, depMap]);

    const isLoading = isLoadingAssignments || isLoadingOrgs || isLoadingDeps;
    const isError = isErrorAssignments || isErrorOrgs || isErrorDeps;

    return (
        <div className="mt-4 mb-2 max-h-[60vh]">
            {isLoading && (
                <div className="space-y-2 p-4">
                    <Skeleton className="h-8 w-full rounded" />
                    <Skeleton className="h-8 w-full rounded" />
                    <Skeleton className="h-8 w-full rounded" />
                </div>
            )}
            {isError && !isLoading && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Assignment Details</AlertTitle>
                    <AlertDescription>
                        Could not load organizations or departments needed to
                        display assignments fully.
                        {/* Provide more specific error details if possible */}
                    </AlertDescription>
                </Alert>
            )}
            {!isLoading &&
                !isError &&
                (assignmentsWithDetails.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                        This module is not currently assigned to any
                        departments.
                    </p>
                ) : (
                    <ScrollArea className="h-[50vh] border rounded-md">
                        {/* Fixed height */}
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                {/* Sticky header */}
                                <TableRow>
                                    <TableHead>
                                        <Building className="inline-block h-4 w-4 mr-1" />
                                        Organization
                                    </TableHead>
                                    <TableHead>
                                        <Users className="inline-block h-4 w-4 mr-1" />
                                        Department
                                    </TableHead>
                                    {/* Add more columns if needed, e.g., Assigned Date */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignmentsWithDetails.map((ass) => (
                                    <TableRow key={ass.id}>
                                        <TableCell>
                                            {ass.organizationName}
                                        </TableCell>
                                        <TableCell>
                                            {ass.departmentName}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                ))}
        </div>
    );
}

// Assumed services/hooks (make sure they exist and function correctly):
// - getDeps(orgId: string): Promise<Department[]>  (in depService)
// - useOrgs(): UseQueryResult<Organization[]> (in useOrgs)
// - getAssignmentsByModule(moduleId: string): Promise<DepModuleAssignment[]> (in depModulesAssService)
// - useAssignmentsByModule(moduleId?: string): UseQueryResult<DepModuleAssignment[]> (created above)
