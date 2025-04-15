"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { addDays, format, getISOWeek, startOfWeek } from "date-fns";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Check, FileText, Pencil } from "lucide-react"; // Icons needed for display
import { Badge } from "@/components/ui/badge"; // For status display
import { WeekSelector } from "@/components/rota/week-selector"; // Reusable week selector
import { ViewOnlyAssignmentCard } from "@/components/rota/view-only-assignment-card"; // A new view-only card component
import { useDepTeam } from "@/hooks/useDepTeams";
import { useUsers } from "@/hooks/useUsers"; // Needed to get user names for rows
import { useHospLocs } from "@/hooks/useHospLoc"; // Needed for location names in cards
import { useRotaAssignmentsByWeekAndTeam } from "@/hooks/useRotaAssignments";
import { useWeekStatus } from "@/hooks/useRotaWeekStatus";
import { formatFirestoreTimestamp } from "@/lib/firestoreUtil"; // For status timestamp
import type { StoredAssignment } from "@/types/rotaTypes";
import type { User } from "@/types/userTypes";
import type { HospLoc } from "@/types/subDepTypes";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// --- View-Only Page Component ---
export default function ViewRotaPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    const teamId = params.teamId as string;

    const [date, setDate] = useState<Date>(new Date());

    // --- Date Calculations ---
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const weekNumber = getISOWeek(date);
    const weekYear = format(date, "yyyy");
    const weekId = `${weekYear}-W${weekNumber}`;

    // --- Data Fetching ---
    const {
        data: team,
        isLoading: isLoadingTeam,
        isError: isErrorTeam,
        error: errorTeam,
    } = useDepTeam(teamId);
    const {
        data: fetchedAssignments,
        isLoading: isLoadingAssignments,
        isError: isErrorAssignments,
        error: errorAssignments,
    } = useRotaAssignmentsByWeekAndTeam(weekId, teamId);
    const {
        data: currentWeekStatusData,
        isLoading: isLoadingStatus,
        isError: isErrorStatus,
        error: errorStatus,
    } = useWeekStatus(weekId, teamId);
    const {
        data: allOrgUsers,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: errorUsers,
    } = useUsers(orgId); // Fetch users for names
    const {
        data: allOrgLocations,
        isLoading: isLoadingLocs,
        isError: isErrorLocs,
        error: errorLocs,
    } = useHospLocs(orgId); // Fetch locations for names

    // --- Derived Data ---
    const allOrgUsersMap = useMemo(() => {
        if (!allOrgUsers) return new Map<string, User>();
        return new Map(allOrgUsers.map((u) => [u.id, u]));
    }, [allOrgUsers]);

    const allOrgLocationsMap = useMemo(() => {
        if (!allOrgLocations) return new Map<string, HospLoc>();
        return new Map(allOrgLocations.map((loc) => [loc.id, loc]));
    }, [allOrgLocations]);

    // Determine which users have assignments this week to display them
    const usersToDisplayIds = useMemo(() => {
        if (!fetchedAssignments) return new Set<string>();
        return new Set(fetchedAssignments.map((a) => a.userId));
    }, [fetchedAssignments]);

    const usersToDisplay = useMemo(() => {
        return Array.from(usersToDisplayIds)
            .map((id) => allOrgUsersMap.get(id))
            .filter((user): user is User => user !== undefined)
            .sort((a, b) => (a.lastName ?? "").localeCompare(b.lastName ?? "")); // Sort users
    }, [usersToDisplayIds, allOrgUsersMap]);

    // Group assignments by user and day for efficient rendering
    const assignmentsMap = useMemo(() => {
        const map = new Map<string, StoredAssignment[]>(); // Key: `${userId}-${dayIndex}`
        if (!fetchedAssignments) return map;
        fetchedAssignments.forEach((assignment) => {
            const key = `${assignment.userId}-${assignment.dayIndex}`;
            const existing = map.get(key) || [];
            existing.push(assignment);
            map.set(key, existing);
        });
        return map;
    }, [fetchedAssignments]);

    // --- Status Info ---
    const currentStatus = useMemo(
        () => currentWeekStatusData?.status ?? null,
        [currentWeekStatusData],
    );
    const lastModified = useMemo(
        () => currentWeekStatusData?.lastModified,
        [currentWeekStatusData],
    );
    const displayStatus = isLoadingStatus ? null : (currentStatus ?? "draft"); // Treat null as draft for display

    // --- Loading & Error ---
    const isLoading =
        isLoadingTeam ||
        isLoadingAssignments ||
        isLoadingStatus ||
        isLoadingUsers ||
        isLoadingLocs;
    const isError =
        isErrorTeam ||
        isErrorAssignments ||
        isErrorStatus ||
        isErrorUsers ||
        isErrorLocs;
    const error =
        errorTeam || errorAssignments || errorStatus || errorUsers || errorLocs;

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <LoadingSpinner text="Loading Rota..." />
            </div>
        );
    }

    if (isError || !team) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error?.message ||
                            "Failed to load rota data or team details."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        View Rota for Team:{" "}
                        <span className="text-primary">{team.name}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Week {weekNumber}, {weekYear}
                    </p>
                </div>
                {/* Status Display */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-medium">Status:</span>
                    {displayStatus === "published" ? (
                        <Badge
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Check className="h-3 w-3 mr-1" /> Published{" "}
                            {lastModified
                                ? `(${formatFirestoreTimestamp(lastModified)})`
                                : ""}
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                            <FileText className="h-3 w-3 mr-1" /> Draft{" "}
                            {lastModified
                                ? `(Saved: ${formatFirestoreTimestamp(lastModified)})`
                                : ""}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Week Selector */}
            <div className="flex justify-between">
                <div className="">
                    <WeekSelector date={date} onDateChange={setDate} />
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/${orgId}/weeklyRota/${teamId}/editRota`}
                        passHref
                    >
                        <Button variant="outline">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Rota
                        </Button>
                    </Link>
                    <Link href={`/admin/${orgId}/weeklyRota/`} passHref>
                        <Button variant="default">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go back
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Rota Table */}
            <div className="w-full overflow-x-auto border rounded-md">
                <Table className="w-full table-fixed min-w-[1080px]">
                    <TableCaption className="mt-4 mb-2">
                        User Rota for Week {weekNumber} - Team: {team.name}
                    </TableCaption>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow>
                            <TableHead className="w-[200px] z-20 bg-muted/50 p-2">
                                User
                            </TableHead>
                            {weekDays.map((day, index) => (
                                <TableHead
                                    key={index}
                                    className="w-[180px] text-center p-2"
                                >
                                    <div>{format(day, "EEE")}</div>
                                    <div className="text-xs">
                                        {format(day, "MMM d")}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usersToDisplay.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No users with assignments found for this
                                    week.
                                </TableCell>
                            </TableRow>
                        ) : (
                            usersToDisplay.map((user) => (
                                <TableRow key={user.id}>
                                    {/* Sticky User Cell */}
                                    <TableCell className="font-medium align-top z-10 bg-background p-2">
                                        <div
                                            className="font-semibold truncate"
                                            title={`${user.firstName} ${user.lastName}`}
                                        >
                                            {user.firstName} {user.lastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {user.jobTitle ||
                                                user.role ||
                                                "User"}
                                        </div>
                                    </TableCell>
                                    {/* Daily Assignment Cells */}
                                    {weekDays.map((_, dayIndex) => {
                                        const cellKey = `${user.id}-${dayIndex}`;
                                        const cellAssignments =
                                            assignmentsMap.get(cellKey) || [];
                                        return (
                                            <TableCell
                                                key={cellKey}
                                                className="p-1 h-auto align-top min-w-[130px]"
                                            >
                                                <div className="space-y-1">
                                                    {cellAssignments.length ===
                                                    0 ? (
                                                        <div className="h-16 flex items-center justify-center text-xs text-muted-foreground italic">
                                                            No Assignment
                                                        </div> // Placeholder for empty cell
                                                    ) : (
                                                        cellAssignments.map(
                                                            (assignment) => (
                                                                <ViewOnlyAssignmentCard
                                                                    key={
                                                                        assignment.id
                                                                    }
                                                                    assignment={
                                                                        assignment
                                                                    }
                                                                    locationsMap={
                                                                        allOrgLocationsMap
                                                                    } // Pass map for lookup
                                                                />
                                                            ),
                                                        )
                                                    )}
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
