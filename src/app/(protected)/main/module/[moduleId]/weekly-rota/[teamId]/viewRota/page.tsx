"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { addDays, format, getISOWeek, startOfWeek } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Check, FileText, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WeekSelector } from "@/components/rota/week-selector";
import { useDepTeam } from "@/hooks/useDepTeams";
import { useUser, useUsers } from "@/hooks/useUsers";
import { useHospLocs } from "@/hooks/useHospLoc";
import { useRotaAssignmentsByWeekAndTeam } from "@/hooks/useRotaAssignments";
import { useWeekStatus } from "@/hooks/useRotaWeekStatus";
import { formatFirestoreTimestamp } from "@/lib/firestoreUtil";
import type { StoredAssignment } from "@/types/rotaTypes";
import type { User } from "@/types/userTypes";
import type { HospLoc } from "@/types/subDepTypes";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopRotaView } from "@/components/rota/desktop-rota-view";
import { MobileRotaView } from "@/components/rota/mobile-rota-view";
import { useAuth } from "@/lib/context/AuthContext";

export default function ViewRotaPage() {
    const params = useParams();
    const moduleId = params.moduleId as string;
    const teamId = params.teamId as string;

    const { user: authUser, loading: authLoading } = useAuth();
    const {
        data: userProfile,
        isLoading: profileLoading,
        isError: profileError,
        error: profileErrorDetails,
    } = useUser(authUser?.uid);

    // --- State Derivation ---
    const { orgId } = useMemo(() => {
        if (!authLoading && !profileLoading && userProfile) {
            return {
                orgId: userProfile.orgId,
                depId: userProfile.departmentId,
            };
        }
        return { orgId: undefined };
    }, [authLoading, profileLoading, userProfile]);

    const [date, setDate] = useState<Date>(new Date());
    const isMobile = useIsMobile();

    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const weekNumber = getISOWeek(date);
    const weekYear = format(date, "yyyy");
    const weekId = `${weekYear}-W${weekNumber}`;

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
    } = useUsers(orgId!);
    const {
        data: allOrgLocations,
        isLoading: isLoadingLocs,
        isError: isErrorLocs,
        error: errorLocs,
    } = useHospLocs(orgId!);

    const allOrgUsersMap = useMemo(() => {
        if (!allOrgUsers) return new Map<string, User>();
        return new Map(allOrgUsers.map((u) => [u.id, u]));
    }, [allOrgUsers]);

    const allOrgLocationsMap = useMemo(() => {
        if (!allOrgLocations) return new Map<string, HospLoc>();
        return new Map(allOrgLocations.map((loc) => [loc.id, loc]));
    }, [allOrgLocations]);

    const usersToDisplayIds = useMemo(() => {
        if (!fetchedAssignments) return new Set<string>();
        return new Set(fetchedAssignments.map((a) => a.userId));
    }, [fetchedAssignments]);

    const usersToDisplay = useMemo(() => {
        return Array.from(usersToDisplayIds)
            .map((id) => allOrgUsersMap.get(id))
            .filter((user): user is User => user !== undefined)
            .sort((a, b) => (a.lastName ?? "").localeCompare(b.lastName ?? ""));
    }, [usersToDisplayIds, allOrgUsersMap]);

    const assignmentsMap = useMemo(() => {
        const map = new Map<string, StoredAssignment[]>();
        if (!fetchedAssignments) return map;
        fetchedAssignments.forEach((assignment) => {
            const key = `${assignment.userId}-${assignment.dayIndex}`;
            const existing = map.get(key) || [];
            existing.push(assignment);
            map.set(key, existing);
        });
        return map;
    }, [fetchedAssignments]);

    const currentStatus = useMemo(
        () => currentWeekStatusData?.status ?? null,
        [currentWeekStatusData],
    );
    const lastModified = useMemo(
        () => currentWeekStatusData?.lastModified,
        [currentWeekStatusData],
    );
    const displayStatus = isLoadingStatus ? null : (currentStatus ?? "draft");

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
        isErrorLocs ||
        profileError;
    const error =
        errorTeam ||
        errorAssignments ||
        errorStatus ||
        errorUsers ||
        errorLocs ||
        profileErrorDetails;

    if (isLoading || isMobile === undefined) {
        return (
            <div className="container mx-auto p-4 md:p-6">
                <LoadingSpinner text="Loading Rota..." />
            </div>
        );
    }

    if (isError || !team) {
        return (
            <div className="container mx-auto p-4 md:p-6">
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

    const rotaViewProps = {
        weekNumber,
        teamName: team.name,
        weekDays,
        usersToDisplay,
        assignmentsMap,
        allOrgLocationsMap,
    };

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                        View Rota:{" "}
                        <span className="text-primary">{team.name}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Week {weekNumber}, {weekYear}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-medium">Status:</span>
                    {displayStatus === "published" ? (
                        <Badge
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-xs md:text-sm whitespace-nowrap"
                        >
                            <Check className="h-3 w-3 mr-1" /> Published{" "}
                            <span className="hidden sm:inline ml-1">
                                {lastModified
                                    ? `(${formatFirestoreTimestamp(lastModified)})`
                                    : ""}
                            </span>
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 text-xs md:text-sm whitespace-nowrap"
                        >
                            <FileText className="h-3 w-3 mr-1" /> Draft{" "}
                            <span className="hidden sm:inline ml-1">
                                {lastModified
                                    ? `(Saved: ${formatFirestoreTimestamp(lastModified)})`
                                    : ""}
                            </span>
                        </Badge>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex-shrink-0">
                    <WeekSelector date={date} onDateChange={setDate} />
                </div>
                <div className="flex flex-wrap items-center justify-start md:justify-end gap-2">
                    {userProfile?.role === "admin" ||
                        (userProfile?.role === "manager" && (
                            <Link
                                href={`/main/module/${moduleId}/weekly-rota/${teamId}/editRota`}
                                passHref
                            >
                                <Button variant="outline" size="sm">
                                    <Pencil className="mr-1.5 h-4 w-4" /> Edit
                                </Button>
                            </Link>
                        ))}
                    <Link
                        href={`/main/module/${moduleId}/weekly-rota`}
                        passHref
                    >
                        <Button variant="default" size="sm">
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Conditional Rota Table Rendering */}
            <div className="mt-4">
                {isMobile ? (
                    <MobileRotaView {...rotaViewProps} />
                ) : (
                    <DesktopRotaView {...rotaViewProps} />
                )}
            </div>
        </div>
    );
}
