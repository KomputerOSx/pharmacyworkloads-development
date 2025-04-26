"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, format, getISOWeek, startOfWeek, subWeeks } from "date-fns";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    AlertTriangle,
    Bell,
    Copy,
    FileDown,
    Loader2,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type {
    Assignment,
    ClipboardItem,
    ContextMenuPosition,
    StoredAssignment,
} from "@/types/rotaTypes";
import { shiftPresets } from "@/types/rotaTypes";
import type { User } from "@/types/userTypes";
import type { HospLoc } from "@/types/subDepTypes";
import { generateAssignmentId } from "./utils/rota-utils";
import { WeekSelector } from "./week-selector";
import { StatusControls } from "./status-controls";
import { AddUserDialog } from "./add-user-dialog";
import { ContextMenu } from "./context-menu";
import { ConfirmationDialog } from "./confirmation-dialog";
import { NotificationDialog } from "./notification-dialog";
import { ExportDialog, type ExportFormat } from "./export-dialog";
import { exportToCSV, exportToExcel, exportToPDF } from "./utils/export-utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserRow } from "@/components/rota/user-row";
import {
    assignmentKeys,
    useDeleteWeekAssignments,
    useRotaAssignmentsByWeekAndTeam,
    useSaveWeekAssignments,
} from "@/hooks/weekly-rota/useRotaAssignments";
import {
    rotaWeekStatusKeys,
    useDeleteWeekStatus,
    useSetWeekStatus,
    useWeekStatus,
} from "@/hooks/weekly-rota/useRotaWeekStatus";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { useDepTeam } from "@/hooks/admin/useDepTeams";
import { getAssignmentsByWeekAndTeam } from "@/services/weekly-rota/rotaAssignmentsService";
import { useAuth } from "@/lib/context/AuthContext";
import { useUser } from "@/hooks/admin/useUsers";
import { createMail, emailTemplates } from "@/services/mail/mailService";

interface UserRotaManagerProps {
    users: User[];
    locations: HospLoc[];
    allOrgUsers: User[] | undefined;
    teamId: string;
    orgId: string;
    currentUserId: string;
}

export function UserRotaManager({
    users: initialUsers,
    locations: departmentLocations,
    allOrgUsers,
    teamId,
    orgId,
    currentUserId,
}: UserRotaManagerProps) {
    const queryClient = useQueryClient();

    const { user: authUser } = useAuth();
    const { data: currentUser } = useUser(authUser?.uid);

    const [date, setDate] = useState<Date>(new Date());
    const [assignments, setAssignments] = useState<
        Record<string, StoredAssignment[]>
    >({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(
        null,
    );
    const [confirmationDialog, setConfirmationDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({ open: false, title: "", description: "", onConfirm: () => {} });
    const [notificationDialog, setNotificationDialog] = useState<{
        open: boolean;
    }>({ open: false });
    const [notificationHandler, setNotificationHandler] = useState<
        ((userIds: string[]) => void) | null
    >(null);
    const [exportDialog, setExportDialog] = useState<{
        open: boolean;
        isExporting: boolean;
    }>({ open: false, isExporting: false });
    const [activeUserIds, setActiveUserIds] = useState<string[]>(() =>
        initialUsers.map((u) => u.id),
    );
    const [isLoadingCopy, setIsLoadingCopy] = useState(false);

    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const weekNumber = getISOWeek(date);
    const weekYear = format(date, "yyyy");
    const weekId = `${weekYear}-W${weekNumber}`;

    const { data: teamData, isLoading: isLoadingTeam } = useDepTeam(teamId);
    const teamName = useMemo(
        () => teamData?.name ?? "Unknown Team",
        [teamData],
    );

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
    const { mutate: saveAssignments, isPending: isSavingAssignments } =
        useSaveWeekAssignments();
    const { mutate: setStatusMutate, isPending: isSettingStatus } =
        useSetWeekStatus();
    const {
        mutate: deleteAssignmentsMutate,
        isPending: isDeletingAssignments,
    } = useDeleteWeekAssignments();
    const { mutate: deleteStatusMutate, isPending: isDeletingStatus } =
        useDeleteWeekStatus();

    useEffect(() => {
        if (
            !isLoadingAssignments &&
            !isErrorAssignments &&
            fetchedAssignments
        ) {
            const newAssignmentsState: Record<string, StoredAssignment[]> = {};
            fetchedAssignments.forEach((assignment) => {
                const cellKey = `${assignment.weekId}-${assignment.userId}-${assignment.dayIndex}-${assignment.teamId}`;
                if (!newAssignmentsState[cellKey])
                    newAssignmentsState[cellKey] = [];
                if (
                    !newAssignmentsState[cellKey].some(
                        (a) => a.id === assignment.id,
                    )
                ) {
                    newAssignmentsState[cellKey].push(assignment);
                }
            });
            setAssignments(newAssignmentsState);
            setHasUnsavedChanges(false);
        }
    }, [
        fetchedAssignments,
        isLoadingAssignments,
        isErrorAssignments,
        weekId,
        teamId,
    ]);

    useEffect(() => {
        if (fetchedAssignments && !isLoadingAssignments) {
            // Combine initial users and users found in fetched assignments
            const idsFromAssignments = new Set(
                fetchedAssignments.map((a) => a.userId),
            );
            const initialUserIds = new Set(initialUsers.map((u) => u.id));
            const combinedIds = new Set([
                ...initialUserIds,
                ...idsFromAssignments,
            ]);

            // Update state *only if* the set of IDs actually changed
            // Compare sizes first for efficiency
            setActiveUserIds((currentIds) => {
                const currentIdSet = new Set(currentIds);
                if (
                    currentIdSet.size !== combinedIds.size ||
                    ![...currentIdSet].every((id) => combinedIds.has(id))
                ) {
                    console.log(
                        "Syncing activeUserIds state with fetched assignments.",
                    );
                    // Maintain current order partially? Or just use combined set?
                    // Simplest: use the combined set derived from data. Reordering state is separate.
                    const currentOrdered = currentIds.filter((id) =>
                        combinedIds.has(id),
                    );
                    const newIdsToAdd = [...combinedIds].filter(
                        (id) => !currentIdSet.has(id),
                    );
                    return [...currentOrdered, ...newIdsToAdd];
                    // Or for simple sync: return Array.from(combinedIds);
                }
                return currentIds; // No change needed
            });
        }
    }, [fetchedAssignments, initialUsers, isLoadingAssignments]);

    const allOrgUsersMap = useMemo(() => {
        if (!allOrgUsers) return new Map<string, User>();
        return new Map(allOrgUsers.map((u) => [u.id, u]));
    }, [allOrgUsers]);

    const usersToDisplay = useMemo(() => {
        return activeUserIds
            .map((id) => allOrgUsersMap.get(id))
            .filter((user): user is User => user !== undefined);
    }, [activeUserIds, allOrgUsersMap]);

    const availableUsersToAdd = useMemo(() => {
        const activeIdSet = new Set(activeUserIds);
        return (allOrgUsers ?? []).filter((user) => !activeIdSet.has(user.id));
    }, [activeUserIds, allOrgUsers]);

    const allAvailableLocations = useMemo(() => {
        //only return active locations
        return (departmentLocations ?? []).filter(
            (location) => location.active,
        );
    }, [departmentLocations]);

    const currentStatus = useMemo(
        () => currentWeekStatusData?.status ?? null,
        [currentWeekStatusData],
    );
    const lastModified = useMemo(
        () => currentWeekStatusData?.lastModified,
        [currentWeekStatusData],
    );

    const getCellAssignments = useCallback(
        (
            userId: string,
            dayIndex: number,
            currentWeekId: string,
        ): StoredAssignment[] => {
            const cellKey = `${currentWeekId}-${userId}-${dayIndex}-${teamId}`;
            return assignments[cellKey] || [];
        },
        [assignments, teamId],
    );

    const addAssignment = useCallback(
        (userId: string, dayIndex: number, currentWeekId: string) => {
            const cellKey = `${currentWeekId}-${userId}-${dayIndex}-${teamId}`;
            setAssignments((prev) => {
                const current = prev[cellKey] || [];
                const newAssignment: StoredAssignment = {
                    id: generateAssignmentId(),
                    locationId: null,
                    shiftType: null,
                    userId: userId,
                    teamId: teamId,
                    weekId: currentWeekId,
                    dayIndex,
                    customLocation: undefined,
                    customStartTime: undefined,
                    customEndTime: undefined,
                    notes: undefined,
                };
                return { ...prev, [cellKey]: [...current, newAssignment] };
            });
            setHasUnsavedChanges(true);
        },
        [teamId],
    );

    const updateAssignment = useCallback(
        (
            userId: string,
            dayIndex: number,
            currentWeekId: string,
            assignmentId: string,
            data: Partial<Assignment>,
        ) => {
            const cellKey = `${currentWeekId}-${userId}-${dayIndex}-${teamId}`;
            setAssignments((prev) => {
                const current = prev[cellKey] || [];
                return {
                    ...prev,
                    [cellKey]: current.map((a) =>
                        a.id === assignmentId ? { ...a, ...data } : a,
                    ),
                };
            });
            setHasUnsavedChanges(true);
        },
        [teamId],
    );

    const removeAssignment = useCallback(
        (
            userId: string,
            dayIndex: number,
            currentWeekId: string,
            assignmentId: string,
        ) => {
            const cellKey = `${currentWeekId}-${userId}-${dayIndex}-${teamId}`;
            setAssignments((prev) => {
                const current = prev[cellKey] || [];
                const updated = current.filter((a) => a.id !== assignmentId);
                if (updated.length === 0) {
                    const newState = { ...prev };
                    delete newState[cellKey];
                    return newState;
                } else {
                    return { ...prev, [cellKey]: updated };
                }
            });
            setHasUnsavedChanges(true);
        },
        [teamId],
    );

    const addUserToRota = useCallback(
        (userId: string) => {
            if (!activeUserIds.includes(userId)) {
                setActiveUserIds((prev) => [...prev, userId]);
                setHasUnsavedChanges(true);
            }
        },
        [activeUserIds],
    );

    const removeUserFromRota = useCallback((userId: string) => {
        setActiveUserIds((prev) => prev.filter((id) => id !== userId));
        setHasUnsavedChanges(true);
    }, []);

    const moveUserUp = useCallback((userId: string) => {
        setActiveUserIds((prev) => {
            const index = prev.indexOf(userId);
            if (index > 0) {
                const newActive = [...prev];
                [newActive[index], newActive[index - 1]] = [
                    newActive[index - 1],
                    newActive[index],
                ];
                setHasUnsavedChanges(true);
                return newActive;
            }
            return prev;
        });
    }, []);

    const moveUserDown = useCallback((userId: string) => {
        setActiveUserIds((prev) => {
            const index = prev.indexOf(userId);
            if (index < prev.length - 1) {
                const newActive = [...prev];
                [newActive[index], newActive[index + 1]] = [
                    newActive[index + 1],
                    newActive[index],
                ];
                setHasUnsavedChanges(true);
                return newActive;
            }
            return prev;
        });
    }, []);

    const handleAddCustomLocationAssignment = useCallback(
        (
            userId: string,
            dayIndex: number,
            currentWeekId: string,
            assignmentId: string,
            customName: string,
        ) => {
            if (!customName || customName.trim() === "") return;
            const trimmedName = customName.trim();
            console.log(
                `Setting custom location "${trimmedName}" for assignment ${assignmentId}`,
            );

            // Directly update the assignment state to use the custom name
            updateAssignment(userId, dayIndex, currentWeekId, assignmentId, {
                locationId: null, // Ensure locationId is null
                customLocation: trimmedName, // Set the custom name
            });
            // No need to update customLocations state anymore
        },
        [updateAssignment], // Depends on the updateAssignment callback
    );
    const showConfirmation = useCallback(
        (title: string, description: string, onConfirm: () => void) => {
            setConfirmationDialog({
                open: true,
                title,
                description,
                onConfirm,
            });
        },
        [],
    );

    const performSave = useCallback(
        (callback?: () => void, markAsDraft = false) => {
            const currentWeekPrefix = `${weekId}-`;
            const gatheredAssignments: StoredAssignment[] = [];
            Object.entries(assignments).forEach(([key, value]) => {
                if (
                    key.startsWith(currentWeekPrefix) &&
                    key.endsWith(`-${teamId}`)
                ) {
                    gatheredAssignments.push(...value);
                }
            });
            const uniqueValidAssignments = Array.from(
                new Map(gatheredAssignments.map((a) => [a.id, a])).values(),
            ).filter(
                (a) =>
                    a.userId && a.dayIndex !== undefined && a.dayIndex !== null,
            );

            saveAssignments(
                {
                    weekId,
                    teamId,
                    assignmentsToSave: uniqueValidAssignments,
                    userId: currentUserId,
                },
                {
                    onSuccess: () => {
                        setHasUnsavedChanges(false);
                        if (
                            markAsDraft &&
                            (!currentStatus || currentStatus === "draft")
                        ) {
                            // Only set status if needed
                            setStatusMutate({
                                weekId,
                                teamId,
                                orgId,
                                status: "draft",
                                userId: currentUserId,
                            });
                        }
                        if (callback) callback();
                    },
                    onError: () => {},
                },
            );
        },
        [
            assignments,
            weekId,
            teamId,
            currentUserId,
            saveAssignments,
            setStatusMutate,
            orgId,
            currentStatus,
        ],
    );

    const usersWithNoAssignments = useMemo(() => {
        return usersToDisplay.filter(
            (user) =>
                !weekDays.some((_, dayIndex) => {
                    const cellKey = `${weekId}-${user.id}-${dayIndex}-${teamId}`;
                    return (
                        assignments[cellKey] && assignments[cellKey].length > 0
                    );
                }),
        );
    }, [usersToDisplay, weekDays, weekId, assignments, teamId]);

    const sendNotifications = useCallback(
        async (userIds: string[], type: "published" | "updated") => {
            if (!currentUser) {
                toast.error("Cannot send notifications: User data not loaded.");
                return;
            }

            const usersToNotify = usersToDisplay.filter((user) =>
                userIds.includes(user.id),
            );
            const arrayOfEmails = usersToNotify.map((user) => user.email);
            //  teamName   ,   weekNumber  ,   weekYear   ,  ${currentUser?.firstName} ${currentUser?.lastName}

            let template: { subject: string; body: string } = {
                subject: "",
                body: "",
            };
            if (type === "published") {
                template = emailTemplates.published_rota(
                    currentUser,
                    teamName,
                    weekNumber,
                    parseInt(weekYear, 10),
                );
            } else if (type === "updated") {
                template = emailTemplates.updates_to_rota(
                    currentUser,
                    teamName,
                    weekNumber,
                    parseInt(weekYear, 10),
                );
            }

            // const subject = `${teamName} Rota - Week ${weekNumber} (${weekYear})`;
            // const body = `Hello,\n\nThe rota for ${teamName} for Week ${weekNumber} (${weekYear}) has been published. Please check your assignments.\n\nBest regards,\n${currentUser?.firstName} ${currentUser?.lastName}`;
            // await createMail(arrayOfEmails, subject, body);
            // toast.success(
            //     `Notifications Sent to ${userToNotify.length} User(s).`,
            // );
            try {
                await createMail(
                    arrayOfEmails,
                    template.subject,
                    template.body,
                );
                toast.success(
                    `${type === "published" ? "Publication" : "Update"} Notifications Sent to ${usersToNotify.length} User(s).`,
                );
            } catch (error) {
                console.error("Error sending mail:", error);
                toast.error("Failed to send notifications.");
            }
        },
        [currentUser, teamName, usersToDisplay, weekNumber, weekYear],
    );

    const handleSendPublishedNotification = useCallback(
        (selectedUserIds: string[]) => {
            void sendNotifications(selectedUserIds, "published");
        },
        [sendNotifications],
    );

    const handleSendUpdateNotification = useCallback(
        (selectedUserIds: string[]) => {
            void sendNotifications(selectedUserIds, "updated");
        },
        [sendNotifications],
    );

    const handleSendNotifications = useCallback(() => {
        setNotificationHandler(() => handleSendUpdateNotification);
        setNotificationDialog({ open: true });
    }, [handleSendUpdateNotification]);

    const handleSetStatus = useCallback(
        (newStatus: "draft" | "published") => {
            const actionToConfirm = () => {
                if (newStatus === "published") {
                    performSave(() => {
                        setStatusMutate(
                            {
                                weekId,
                                teamId,
                                orgId,
                                status: "published",
                                userId: currentUserId,
                            },
                            {
                                onSuccess: () => {
                                    setNotificationHandler(
                                        () => handleSendPublishedNotification,
                                    );
                                    setNotificationDialog({ open: true });
                                },
                                onError: () => {},
                            },
                        );
                    }, false);
                } else {
                    setStatusMutate(
                        {
                            weekId,
                            teamId,
                            orgId,
                            status: "draft",
                            userId: currentUserId,
                        },
                        {
                            onSuccess: () => {
                                setHasUnsavedChanges(false);
                            },
                            onError: () => {},
                        },
                    );
                }
            };

            if (
                newStatus === "published" &&
                usersWithNoAssignments.length > 0
            ) {
                showConfirmation(
                    "Warning: Unassigned User",
                    `${usersWithNoAssignments.length} user(s) have no assignments. Publish anyway?`,
                    actionToConfirm,
                );
            } else {
                actionToConfirm();
            }
        },
        [
            usersWithNoAssignments.length,
            performSave,
            setStatusMutate,
            weekId,
            teamId,
            orgId,
            currentUserId,
            handleSendPublishedNotification,
            showConfirmation,
        ],
    );

    const handleSaveDraft = useCallback(() => {
        performSave(() => {
            toast.info("Draft saved.");
        }, true);
    }, [performSave]);

    const handleSaveChanges = useCallback(() => {
        showConfirmation(
            "Save Changes",
            "Save current changes to the published rota?",
            () => {
                performSave(() => {
                    void queryClient.invalidateQueries({
                        queryKey: rotaWeekStatusKeys.detail(weekId, teamId),
                    });
                });
            },
        );
    }, [performSave, showConfirmation, weekId, teamId, queryClient]);

    const handleClearRota = useCallback(() => {
        showConfirmation(
            "Clear Rota and Reset Status",
            "This will delete ALL assignments for this week and reset status. Cannot be undone.",
            () => {
                deleteAssignmentsMutate(
                    { weekId, teamId },
                    {
                        onSuccess: () => {
                            setAssignments({});
                            setHasUnsavedChanges(false);
                            deleteStatusMutate({ weekId, teamId });
                        },
                    },
                );
            },
        );
    }, [
        weekId,
        teamId,
        deleteAssignmentsMutate,
        deleteStatusMutate,
        showConfirmation,
    ]);

    const handleExport = useCallback(
        async (
            format: ExportFormat,
            includeNotes: boolean,
            includeEmptyCells: boolean,
        ) => {
            // Ensure team name is available before exporting
            if (isLoadingTeam) {
                toast.info("Team information is loading, please wait...");
                return;
            }

            try {
                setExportDialog((prev) => ({ ...prev, isExporting: true }));
                const getAssignmentsForCell = (
                    userId: string,
                    dayIndex: number,
                ) => getCellAssignments(userId, dayIndex, weekId);

                // --- Pass teamName to export functions ---
                const commonArgs = [
                    usersToDisplay,
                    weekDays,
                    weekId,
                    weekNumber,
                    weekYear,
                    teamName, // <-- Pass the fetched teamName here
                    getAssignmentsForCell,
                    allAvailableLocations,
                    shiftPresets,
                    includeNotes,
                    includeEmptyCells,
                ] as const; // Use 'as const' for better type inference

                if (format === "csv") {
                    exportToCSV(...commonArgs);
                } else if (format === "excel") {
                    await exportToExcel(...commonArgs);
                } else if (format === "pdf") {
                    await exportToPDF(...commonArgs);
                }
                // -----------------------------------------

                toast.success(`Rota Exported as ${format.toUpperCase()}.`);
                setExportDialog({ open: false, isExporting: false });
            } catch (error) {
                console.error("Export error:", error);
                toast.error("Export Failed. Please try again.");
                setExportDialog((prev) => ({ ...prev, isExporting: false })); // Ensure loading state is reset on error
            }
        },
        [
            usersToDisplay,
            weekDays,
            weekId,
            weekNumber,
            weekYear,
            teamName, // <-- Add teamName dependency
            getCellAssignments,
            allAvailableLocations,
            isLoadingTeam, // <-- Add isLoadingTeam dependency
        ],
    );

    const handleContextMenu = useCallback(
        (
            e: React.MouseEvent,
            userId: string,
            dayIndex: number,
            assignmentId: string,
        ) => {
            e.preventDefault();
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                userId,
                dayIndex,
                assignmentId,
            });
        },
        [],
    );

    const closeContextMenu = useCallback(() => setContextMenu(null), []);

    const handleDelete = useCallback(() => {
        if (!contextMenu) return;
        removeAssignment(
            contextMenu.userId,
            contextMenu.dayIndex,
            weekId,
            contextMenu.assignmentId,
        );
        closeContextMenu();
    }, [contextMenu, removeAssignment, weekId, closeContextMenu]);

    const handleCopy = useCallback(() => {
        if (!contextMenu) return;
        const cellKey = `${weekId}-${contextMenu.userId}-${contextMenu.dayIndex}-${teamId}`;
        const assignmentToCopy = (assignments[cellKey] || []).find(
            (a) => a.id === contextMenu.assignmentId,
        );
        if (assignmentToCopy) {
            setClipboard({
                assignment: {
                    id: generateAssignmentId(),
                    locationId: assignmentToCopy.locationId,
                    customLocation: assignmentToCopy.customLocation,
                    shiftType: assignmentToCopy.shiftType,
                    customStartTime: assignmentToCopy.customStartTime,
                    customEndTime: assignmentToCopy.customEndTime,
                    notes: assignmentToCopy.notes,
                },
            });
            toast.success("Assignment Copied");
        }
        closeContextMenu();
    }, [contextMenu, assignments, weekId, closeContextMenu, teamId]);

    const handlePaste = useCallback(() => {
        if (!contextMenu || !clipboard) return;
        const cellKey = `${weekId}-${contextMenu.userId}-${contextMenu.dayIndex}-${teamId}`;
        setAssignments((prev) => ({
            ...prev,
            [cellKey]: [
                {
                    ...clipboard.assignment,
                    id: generateAssignmentId(),
                    userId: contextMenu.userId,
                    teamId: teamId,
                    weekId,
                    dayIndex: contextMenu.dayIndex,
                },
            ],
        }));
        setHasUnsavedChanges(true);
        toast.success("Assignment Pasted");
        closeContextMenu();
    }, [contextMenu, clipboard, weekId, closeContextMenu, teamId]);

    const handleCopyToWeek = useCallback(() => {
        if (!contextMenu) return;
        const cellKey = `${weekId}-${contextMenu.userId}-${contextMenu.dayIndex}-${teamId}`;
        const assignmentToCopy = (assignments[cellKey] || []).find(
            (a) => a.id === contextMenu.assignmentId,
        );
        if (assignmentToCopy) {
            setAssignments((prev) => {
                const newState = { ...prev };
                for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
                    if (dayIndex === contextMenu.dayIndex) continue;
                    const targetCellKey = `${weekId}-${contextMenu.userId}-${dayIndex}-${teamId}`;
                    const currentAssignments = newState[targetCellKey] || [];
                    newState[targetCellKey] = [
                        ...currentAssignments,
                        {
                            ...assignmentToCopy,
                            id: generateAssignmentId(),
                            dayIndex,
                        },
                    ];
                }
                return newState;
            });
            setHasUnsavedChanges(true);
            toast.success("Assignment Copied to Weekdays");
        }
        closeContextMenu();
    }, [contextMenu, assignments, weekId, closeContextMenu, teamId]);

    // const copyFromPreviousWeek = useCallback(() => {
    //     toast.error("Copy from Previous Week: Not implemented.");
    // }, []);

    const copyFromPreviousWeek = useCallback(async () => {
        const previousWeekDate = subWeeks(date, 1);
        const previousWeekNumber = getISOWeek(previousWeekDate);
        const previousWeekYear = format(previousWeekDate, "yyyy");
        const previousWeekId = `${previousWeekYear}-W${previousWeekNumber}`;

        // Show confirmation before potentially overwriting data
        showConfirmation(
            "Copy from Previous Week",
            `This will fetch assignments from Week ${previousWeekNumber} (${previousWeekYear}) and overwrite any existing assignments for the current week (${weekNumber}, ${weekYear}). Continue?`,
            async () => {
                // Make the confirmation callback async
                setIsLoadingCopy(true); // Set loading state
                setHasUnsavedChanges(true); // Mark as changed immediately

                try {
                    // Fetch previous week's data using fetchQuery
                    const previousWeekAssignments =
                        await queryClient.fetchQuery<StoredAssignment[], Error>(
                            {
                                queryKey: assignmentKeys.listByWeekAndTeam(
                                    previousWeekId,
                                    teamId,
                                ),
                                queryFn: () =>
                                    getAssignmentsByWeekAndTeam(
                                        previousWeekId,
                                        teamId,
                                    ), // Service fn defined elsewhere
                                staleTime: 5 * 60 * 1000, // Cache fetched prev week data for a bit
                            },
                        );

                    if (
                        !previousWeekAssignments ||
                        previousWeekAssignments.length === 0
                    ) {
                        toast.info(
                            `No assignments found for the previous week (${previousWeekId}) to copy.`,
                        );
                        setIsLoadingCopy(false);
                        // Keep hasUnsavedChanges=true because user intended to change
                        return;
                    }

                    // Prepare new assignments state for the *current* week
                    const newAssignmentsState: Record<
                        string,
                        StoredAssignment[]
                    > = {};
                    const newActiveUserIds = new Set<string>(activeUserIds); // Keep current users + add from copied

                    previousWeekAssignments.forEach((prevAss) => {
                        // Create new assignment object for the current week
                        const newAssignment: StoredAssignment = {
                            ...prevAss, // Copy most fields
                            id: generateAssignmentId(), // GENERATE NEW ID
                            weekId: weekId, // Set to CURRENT weekId
                        };

                        // Add to the new state object
                        const cellKey = `${newAssignment.weekId}-${newAssignment.userId}-${newAssignment.dayIndex}-${newAssignment.teamId}`;
                        if (!newAssignmentsState[cellKey]) {
                            newAssignmentsState[cellKey] = [];
                        }
                        newAssignmentsState[cellKey].push(newAssignment);
                        newActiveUserIds.add(newAssignment.userId); // Ensure user is active
                    });

                    // Update the local state
                    setAssignments(newAssignmentsState);
                    setActiveUserIds(Array.from(newActiveUserIds)); // Update active users if new ones were copied
                    setHasUnsavedChanges(true); // Data has changed
                    toast.success(
                        `Copied ${previousWeekAssignments.length} assignments from Week ${previousWeekNumber}. Remember to save.`,
                    );
                } catch (error) {
                    console.error(
                        "Failed to fetch or copy previous week assignments:",
                        error,
                    );
                    toast.error(
                        `Failed to copy from previous week: ${error instanceof Error ? error.message : "Unknown error"}`,
                    );
                    setHasUnsavedChanges(false); // Revert change flag on error? Or keep true? Debatable.
                } finally {
                    setIsLoadingCopy(false); // Reset loading state
                }
            },
        );
    }, [
        date,
        showConfirmation,
        weekNumber,
        weekYear,
        queryClient,
        teamId,
        activeUserIds,
        weekId,
    ]);

    const isInitiallyLoading =
        (isLoadingAssignments && !fetchedAssignments) ||
        isLoadingStatus ||
        (isLoadingTeam && !teamData);

    if (isInitiallyLoading) {
        return (
            <div className="container mx-auto p-6">
                <LoadingSpinner text="Loading Rota Data..." />
            </div>
        );
    }

    if (isErrorAssignments || isErrorStatus) {
        const error = errorAssignments || errorStatus;
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error?.message ||
                            "Failed to load rota status or assignments."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Top Row: Week Selector & Status Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-2">
                {" "}
                {/* Adjusted for responsiveness */}
                <WeekSelector date={date} onDateChange={setDate} />
                <div className="flex items-center justify-end gap-2 flex-wrap">
                    {" "}
                    {/* Allow wrapping */}
                    {usersWithNoAssignments.length > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center text-amber-500 cursor-default">
                                        <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
                                        <span className="text-sm hidden sm:inline">
                                            {" "}
                                            {/* Hide text on xs screens */}
                                            {usersWithNoAssignments.length}{" "}
                                            user(s) unassigned
                                        </span>
                                        <span className="text-sm inline sm:hidden">
                                            {" "}
                                            {/* Show count on xs */}
                                            {usersWithNoAssignments.length}{" "}
                                            Unassigned
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Unassigned:{" "}
                                        {usersWithNoAssignments
                                            .map(
                                                (s) =>
                                                    `${s.firstName} ${s.lastName}`,
                                            )
                                            .join(", ")}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {/* StatusControls Component is now responsive internally */}
                    <StatusControls
                        currentStatus={currentStatus}
                        lastModified={lastModified}
                        isLoadingStatus={isLoadingStatus}
                        isSettingStatus={isSettingStatus}
                        isSavingAssignments={isSavingAssignments}
                        onSetStatus={handleSetStatus}
                        onSaveDraft={handleSaveDraft}
                        hasChanges={hasUnsavedChanges}
                        onSaveChanges={handleSaveChanges}
                        hasUnassignedUser={usersWithNoAssignments.length > 0}
                    />
                </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 mb-2">
                <TooltipProvider>
                    <div className="flex items-center gap-3 sm:gap-3 flex-wrap">
                        {/* Wrap buttons potentially becoming icons in TooltipProvider */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleClearRota}
                                    className="flex items-center gap-1"
                                    disabled={
                                        isDeletingAssignments ||
                                        isDeletingStatus
                                    }
                                >
                                    {(isDeletingAssignments ||
                                        isDeletingStatus) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Clear Rota & Status
                                    </span>{" "}
                                    {/* Hide text on small screens */}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="sm:hidden">
                                Clear Rota & Status
                            </TooltipContent>{" "}
                            {/* Tooltip for small screens */}
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyFromPreviousWeek}
                                    className="flex items-center gap-1"
                                    disabled={isLoadingCopy}
                                >
                                    {isLoadingCopy && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    <Copy className="h-4 w-4" /> Copy Prev. Week
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="sm:hidden">
                                Copy Prev. Week
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSendNotifications}
                                    className="flex items-center gap-1"
                                >
                                    <Bell className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Send Notifications
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="sm:hidden">
                                Send Notifications
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setExportDialog((prev) => ({
                                            ...prev,
                                            open: true,
                                        }))
                                    }
                                    className="flex items-center gap-1"
                                >
                                    <FileDown className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Export
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="sm:hidden">
                                Export
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            {/* Scrollable Table Container */}
            <div className="w-full overflow-x-auto border rounded-md">
                <Table className="w-full table-fixed min-w-[1080px]">
                    <TableCaption className="mt-4 mb-2">
                        {/* Added margin bottom */}
                        {teamName} Rota - Week {weekNumber} ({weekYear})
                    </TableCaption>
                    {/* Sticky Header */}
                    <TableHeader className="bg-muted/50 sticky top-0 z-20">
                        <TableRow>
                            {/* Sticky User Header Cell */}
                            <TableHead className="w-[200px] z-30 bg-muted/50 p-2">
                                {/* Ensure padding */}
                                User
                            </TableHead>
                            {/* Day Header Cells */}
                            {weekDays.map((day, index) => (
                                <TableHead
                                    key={index}
                                    className="w-[180px] z-30 text-center p-2"
                                >
                                    {/* Ensure padding */}
                                    <div>{format(day, "EEE")}</div>
                                    <div className="text-xs">
                                        {format(day, "MMM d")}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usersToDisplay.length === 0 && !isInitiallyLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No users selected for this rota view.
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Assuming UserRow is already updated for sticky first cell
                            usersToDisplay.map((user) => {
                                const isUnassigned =
                                    usersWithNoAssignments.some(
                                        (s) => s.id === user.id,
                                    );
                                return (
                                    <UserRow
                                        key={user.id}
                                        user={user}
                                        weekDays={weekDays}
                                        weekId={weekId}
                                        teamId={teamId}
                                        isUnassigned={isUnassigned}
                                        activeUserIds={activeUserIds}
                                        allAvailableLocations={
                                            allAvailableLocations
                                        }
                                        getCellAssignments={getCellAssignments}
                                        moveUserUp={moveUserUp}
                                        moveUserDown={moveUserDown}
                                        removeUser={removeUserFromRota}
                                        addAssignment={addAssignment}
                                        onUpdateAssignment={updateAssignment}
                                        onRemoveAssignment={removeAssignment}
                                        onAddCustomLocationAssignment={(
                                            userId,
                                            dayIndex,
                                            currentWeekId,
                                            assignmentId,
                                            customName,
                                        ) =>
                                            handleAddCustomLocationAssignment(
                                                userId,
                                                dayIndex,
                                                currentWeekId,
                                                assignmentId,
                                                customName,
                                            )
                                        }
                                        onContextMenu={handleContextMenu}
                                    />
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add User Button centered below table */}
            <div className="flex justify-center pt-4">
                <AddUserDialog
                    availableUsers={availableUsersToAdd}
                    onAddUser={addUserToRota}
                />
            </div>

            {/* Dialogs remain the same */}
            <ContextMenu
                position={contextMenu}
                onClose={closeContextMenu}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onPaste={handlePaste}
                onCopyToWeek={handleCopyToWeek}
                canPaste={!!clipboard}
            />
            <ConfirmationDialog
                open={confirmationDialog.open}
                onOpenChange={(open) =>
                    setConfirmationDialog({ ...confirmationDialog, open })
                }
                title={confirmationDialog.title}
                description={confirmationDialog.description}
                onConfirm={confirmationDialog.onConfirm}
            />
            {/*<NotificationDialog*/}
            {/*    open={notificationDialog.open}*/}
            {/*    onOpenChange={(open) =>*/}
            {/*        setNotificationDialog({ ...notificationDialog, open: open })*/}
            {/*    }*/}
            {/*    allUsers={usersToDisplay}*/}
            {/*    onSendNotifications={sendNotifications}*/}
            {/*/>*/}
            <NotificationDialog
                open={notificationDialog.open}
                onOpenChange={(open) => {
                    setNotificationDialog({ open: open });
                    if (!open) setNotificationHandler(null);
                }}
                allUsers={usersToDisplay}
                onSendNotifications={(selectedUserIds) => {
                    if (notificationHandler) {
                        notificationHandler(selectedUserIds);
                    } else {
                        console.error("Notification handler not set!");
                        toast.error(
                            "Could not send notifications. Handler missing.",
                        );
                    }
                }}
            />
            <ExportDialog
                open={exportDialog.open}
                onOpenChange={(open) =>
                    setExportDialog((prev) => ({ ...prev, open }))
                }
                onExport={handleExport}
                isExporting={exportDialog.isExporting}
            />
        </div>
    );
}
