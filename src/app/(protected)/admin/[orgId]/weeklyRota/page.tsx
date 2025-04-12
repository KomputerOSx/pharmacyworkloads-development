"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDeps } from "@/hooks/useDeps";
import { useAllOrgTeams } from "@/hooks/useDepTeams"; // Use the correct hook
import { DepTeam } from "@/types/subDepTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, Terminal, CalendarDays, Pencil } from "lucide-react";

export default function DepartmentTeamRotasPage() {
    const params = useParams();
    const orgId = params.orgId as string;

    const {
        data: departments,
        isLoading: isLoadingDeps,
        isError: isErrorDeps,
        error: errorDeps,
        refetch: refetchDeps,
    } = useDeps(orgId);
    const {
        data: allTeams,
        isLoading: isLoadingTeams,
        isError: isErrorTeams,
        error: errorTeams,
        refetch: refetchTeams,
    } = useAllOrgTeams(orgId); // Use the correct hook

    const isLoading = isLoadingDeps || isLoadingTeams;
    const isError = isErrorDeps || isErrorTeams;
    const error = errorDeps || errorTeams;

    const teamsByDepartment = useMemo(() => {
        if (!allTeams) return new Map<string, DepTeam[]>();
        const grouped = new Map<string, DepTeam[]>();
        allTeams.forEach((team) => {
            const teamsList = grouped.get(team.depId) || [];
            teamsList.push(team);
            teamsList.sort((a, b) => a.name.localeCompare(b.name));
            grouped.set(team.depId, teamsList);
        });
        return grouped;
    }, [allTeams]);

    const handleRefresh = () => {
        refetchDeps();
        refetchTeams();
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 px-4 space-y-6">
                <Skeleton className="h-8 w-1/3 mb-4" />
                {[...Array(3)].map((_, i) => (
                    <div
                        key={`dep_skel_${i}`}
                        className="space-y-3 p-4 border rounded-md"
                    >
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto py-6 px-4">
                <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Data</AlertTitle>
                    <AlertDescription>
                        {error instanceof Error
                            ? error.message
                            : "An unknown error occurred."}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRefresh}
                            className="ml-4 mt-2"
                        >
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!departments || departments.length === 0) {
        return (
            <div className="container mx-auto py-6 px-4 text-center">
                <h1 className="text-2xl font-semibold tracking-tight mb-6">
                    Departments & Team Rotas
                </h1>
                <p className="text-muted-foreground">
                    No departments found for this organization.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Departments & Team Rotas
                </h1>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}{" "}
                    Refresh Data
                </Button>
            </div>

            {departments
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((department) => {
                    const departmentTeams =
                        teamsByDepartment.get(department.id) || [];
                    return (
                        <section
                            key={department.id}
                            aria-labelledby={`dep-heading-${department.id}`}
                        >
                            <div className="border-b pb-2 mb-4">
                                <h2
                                    id={`dep-heading-${department.id}`}
                                    className="text-lg font-medium text-primary"
                                >
                                    {department.name}
                                </h2>
                            </div>

                            {departmentTeams.length === 0 ? (
                                <p className="text-sm text-muted-foreground pl-4">
                                    No teams found in this department.
                                </p>
                            ) : (
                                <ul className="space-y-3 pl-4">
                                    {departmentTeams.map((team) => (
                                        <li
                                            key={team.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                        >
                                            <span
                                                className="font-medium text-sm flex-1 truncate"
                                                title={team.name}
                                            >
                                                {team.name}
                                            </span>
                                            <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
                                                <Link
                                                    href={`/admin/${orgId}/weeklyRota/${team.id}/viewRota`}
                                                    passHref
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <CalendarDays className="mr-1.5 h-4 w-4" />{" "}
                                                        View Rota
                                                    </Button>
                                                </Link>
                                                <Link
                                                    href={`/admin/${orgId}/weeklyRota/${team.id}/editRota`}
                                                    passHref
                                                >
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                    >
                                                        <Pencil className="mr-1.5 h-4 w-4" />{" "}
                                                        Edit Rota
                                                    </Button>
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    );
                })}
        </div>
    );
}
