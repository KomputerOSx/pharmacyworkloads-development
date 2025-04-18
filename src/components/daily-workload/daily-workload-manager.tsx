"use client";

import type React from "react";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Copy, AlertTriangle, FileDown, Bell } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Timestamp } from "firebase/firestore";
import type {
    Assignment,
    HospLoc,
    WeekStatus,
    ClipboardItem,
    ContextMenuPosition,
    User,
    HistoryEntry,
    ReviewItem,
    UrgentQuery,
    LocationData,
    LocationNote,
    StoredAssignment,
} from "./types/workload";
import { allUsers, predefinedLocations } from "./data/sample-data";
import {
    generateAssignmentId,
    createStoredAssignment,
} from "./utils/workload-utils";
import { WeekSelector } from "./week-selector";
import { StatusControls } from "./status-controls";
import { ContextMenu } from "./context-menu";
import { ConfirmationDialog } from "./confirmation-dialog";
import { LocationRow } from "./location-row";
import { AddLocationDialog } from "./add-location-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationDialog } from "./notification-dialog";

export function DailyWorkloadManager() {
    // Current user and organization info (would come from auth in a real app)
    const currentUserId = "user1";
    const currentOrgId = "org1";
    const currentTeamId = "team1";

    // State
    const [date, setDate] = useState<Date>(new Date());
    const [assignments, setAssignments] = useState<
        Record<string, (Assignment & { userId?: string })[]>
    >({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [storedAssignments, setStoredAssignments] = useState<
        StoredAssignment[]
    >([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [previousAssignments, setPreviousAssignments] = useState<
        Record<string, (Assignment & { userId?: string })[]>
    >({});
    const [activeLocations, setActiveLocations] = useState<string[]>([
        "loc1",
        "loc2",
        "loc3",
    ]);
    const [customLocations, setCustomLocations] = useState<HospLoc[]>([]);
    const [customUsers, setCustomUsers] = useState<User[]>([]);
    const [weekStatuses, setWeekStatuses] = useState<WeekStatus[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(
        null,
    );
    const [locationData, setLocationData] = useState<
        Record<string, LocationData>
    >({});
    const [confirmationDialog, setConfirmationDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        description: "",
        onConfirm: () => {},
    });
    const [notificationDialog, setNotificationDialog] = useState<{
        open: boolean;
    }>({
        open: false,
    });

    // Derived values
    const dateId = format(date, "yyyy-MM-dd");
    const weekYear = format(date, "yyyy");
    const weekNumber = format(date, "ww");
    const weekId = `${weekYear}-W${weekNumber}`;
    const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Sunday=6

    // Memoized values
    const activeLocationObjects = useMemo(() => {
        return [...predefinedLocations, ...customLocations]
            .filter((location) => activeLocations.includes(location.id))
            .sort(
                (a, b) =>
                    activeLocations.indexOf(a.id) -
                    activeLocations.indexOf(b.id),
            );
    }, [activeLocations, customLocations]);

    const availableLocations = useMemo(() => {
        return [...predefinedLocations, ...customLocations].filter(
            (location) => !activeLocations.includes(location.id),
        );
    }, [activeLocations, customLocations]);

    const allUsersList = useMemo(
        () => [...allUsers, ...customUsers],
        [customUsers],
    );

    const locationsWithNoAssignments = useMemo(() => {
        return activeLocationObjects.filter((location) => {
            const cellKey = `${dateId}-${location.id}`;
            return !assignments[cellKey] || assignments[cellKey].length === 0;
        });
    }, [activeLocationObjects, dateId, assignments]);

    // Check if the current week is published
    const isWeekPublished = useCallback(() => {
        return weekStatuses.some(
            (s) =>
                s.weekId === weekId &&
                s.teamId === currentTeamId &&
                s.orgId === currentOrgId &&
                s.status === "published",
        );
    }, [weekId, weekStatuses, currentTeamId, currentOrgId]);

    // Initialize location data for new locations
    useEffect(() => {
        activeLocations.forEach((locationId) => {
            if (!locationData[locationId]) {
                setLocationData((prev) => ({
                    ...prev,
                    [locationId]: {
                        locationId,
                        history: [],
                        reviewItems: [],
                        urgentQueries: [],
                        notes: [],
                    },
                }));
            }
        });
    }, [activeLocations, locationData]);

    // Track changes after publishing
    useEffect(() => {
        if (isWeekPublished()) {
            setHasUnsavedChanges(true);
        }
    }, [assignments, isWeekPublished]);

    // Save previous assignments when date changes
    useEffect(() => {
        setPreviousAssignments({ ...assignments });
    }, [assignments, dateId]);

    // Add a new assignment to a location
    const addAssignment = useCallback((locationId: string, dateId: string) => {
        const cellKey = `${dateId}-${locationId}`;
        setAssignments((prev) => {
            const currentAssignments = prev[cellKey] || [];
            return {
                ...prev,
                [cellKey]: [
                    ...currentAssignments,
                    {
                        id: generateAssignmentId(),
                        locationId,
                        shiftType: null,
                    },
                ],
            };
        });
        setHasUnsavedChanges(true);
    }, []);

    // Update an assignment
    const updateAssignment = useCallback(
        (
            locationId: string,
            dateId: string,
            assignmentId: string,
            data: Partial<Assignment & { userId?: string }>,
        ) => {
            const cellKey = `${dateId}-${locationId}`;

            // Update UI assignments
            setAssignments((prev) => {
                const currentAssignments = prev[cellKey] || [];
                return {
                    ...prev,
                    [cellKey]: currentAssignments.map((assignment) =>
                        assignment.id === assignmentId
                            ? { ...assignment, ...data }
                            : assignment,
                    ),
                };
            });

            setHasUnsavedChanges(true);

            // If this assignment has a userId, update the storedAssignments as well
            if (data.userId) {
                const updatedAssignment = assignments[cellKey]?.find(
                    (a) => a.id === assignmentId,
                );
                if (updatedAssignment) {
                    try {
                        // Create a stored assignment
                        const storedAssignment = createStoredAssignment(
                            { ...updatedAssignment, ...data },
                            currentTeamId,
                            weekId,
                            dayIndex,
                        );

                        // Update stored assignments
                        setStoredAssignments((prev) => {
                            const existingIndex = prev.findIndex(
                                (a) => a.id === assignmentId,
                            );
                            if (existingIndex >= 0) {
                                const updated = [...prev];
                                updated[existingIndex] = storedAssignment;
                                return updated;
                            }
                            return [...prev, storedAssignment];
                        });
                    } catch (error) {
                        console.error(
                            "Failed to create stored assignment:",
                            error,
                        );
                    }
                }
            }
        },
        [assignments, currentTeamId, weekId, dayIndex],
    );

    // Remove an assignment
    const removeAssignment = useCallback(
        (locationId: string, dateId: string, assignmentId: string) => {
            const cellKey = `${dateId}-${locationId}`;

            // Remove from UI assignments
            setAssignments((prev) => {
                const currentAssignments = prev[cellKey] || [];
                return {
                    ...prev,
                    [cellKey]: currentAssignments.filter(
                        (assignment) => assignment.id !== assignmentId,
                    ),
                };
            });

            // Remove from stored assignments
            setStoredAssignments((prev) =>
                prev.filter((a) => a.id !== assignmentId),
            );

            setHasUnsavedChanges(true);
        },
        [],
    );

    // Add location to the table
    const addLocation = useCallback(
        (locationId: string) => {
            if (!activeLocations.includes(locationId)) {
                setActiveLocations((prev) => [...prev, locationId]);
                setLocationData((prev) => ({
                    ...prev,
                    [locationId]: {
                        locationId,
                        history: [],
                        reviewItems: [],
                        urgentQueries: [],
                        notes: [],
                    },
                }));
                setHasUnsavedChanges(true);
            }
        },
        [activeLocations],
    );

    // Add custom location
    const addCustomLocation = useCallback(
        (name: string, capacity?: number) => {
            if (name.trim() === "") return;

            // Generate a unique ID
            const newId = `custom-${Date.now()}`;
            const now = Timestamp.now();

            const newLocation: HospLoc = {
                id: newId,
                name,
                type: "Custom",
                hospId: "hosp1",
                orgId: currentOrgId,
                description: capacity
                    ? `Custom location with capacity ${capacity}`
                    : null,
                address: null,
                contactEmail: null,
                contactPhone: null,
                active: true,
                createdAt: now,
                updatedAt: now,
                createdById: currentUserId,
                updatedById: currentUserId,
            };

            setCustomLocations((prev) => [...prev, newLocation]);
            addLocation(newId); // Automatically add the new location to active locations
        },
        [addLocation, currentOrgId, currentUserId],
    );

    // Add custom user
    const addCustomUser = useCallback(
        (name: string) => {
            if (name.trim() === "") return;

            // Parse the name to get first and last name
            const nameParts = name.trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName =
                nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
            const now = Timestamp.now();

            // Generate a unique ID
            const newId = `custom-${Date.now()}`;

            const newUser: User = {
                id: newId,
                authUid: null,
                firstName,
                lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                phoneNumber: "",
                orgId: currentOrgId,
                departmentId: "dept1",
                role: "Custom",
                jobTitle: "Custom User",
                specialty: "",
                active: true,
                lastLogin: null,
                createdAt: now,
                updatedAt: now,
                createdById: currentUserId,
                updatedById: currentUserId,
            };

            setCustomUsers((prev) => [...prev, newUser]);
        },
        [currentOrgId, currentUserId],
    );

    // Remove location from the table
    const removeLocation = useCallback((locationId: string) => {
        setActiveLocations((prev) => prev.filter((id) => id !== locationId));
        setHasUnsavedChanges(true);
    }, []);

    // Move location up/down in the list
    const moveLocationUp = useCallback(
        (locationId: string) => {
            const index = activeLocations.indexOf(locationId);
            if (index > 0) {
                const newActiveLocations = [...activeLocations];
                const temp = newActiveLocations[index];
                newActiveLocations[index] = newActiveLocations[index - 1];
                newActiveLocations[index - 1] = temp;
                setActiveLocations(newActiveLocations);
                setHasUnsavedChanges(true);
            }
        },
        [activeLocations],
    );

    const moveLocationDown = useCallback(
        (locationId: string) => {
            const index = activeLocations.indexOf(locationId);
            if (index < activeLocations.length - 1) {
                const newActiveLocations = [...activeLocations];
                const temp = newActiveLocations[index];
                newActiveLocations[index] = newActiveLocations[index + 1];
                newActiveLocations[index + 1] = temp;
                setActiveLocations(newActiveLocations);
                setHasUnsavedChanges(true);
            }
        },
        [activeLocations],
    );

    // Location data management
    const addHistoryEntry = useCallback(
        (locationId: string, entry: Omit<HistoryEntry, "id">) => {
            setLocationData((prev) => {
                const locationInfo = prev[locationId] || {
                    locationId,
                    history: [],
                    reviewItems: [],
                    urgentQueries: [],
                    notes: [],
                };
                return {
                    ...prev,
                    [locationId]: {
                        ...locationInfo,
                        history: [
                            ...locationInfo.history,
                            {
                                id: generateAssignmentId(),
                                ...entry,
                            },
                        ],
                    },
                };
            });
        },
        [],
    );

    const addReviewItem = useCallback(
        (locationId: string, item: Omit<ReviewItem, "id">) => {
            setLocationData((prev) => {
                const locationInfo = prev[locationId] || {
                    locationId,
                    history: [],
                    reviewItems: [],
                    urgentQueries: [],
                    notes: [],
                };
                return {
                    ...prev,
                    [locationId]: {
                        ...locationInfo,
                        reviewItems: [
                            ...locationInfo.reviewItems,
                            {
                                id: generateAssignmentId(),
                                ...item,
                            },
                        ],
                    },
                };
            });
        },
        [],
    );

    const updateReviewItem = useCallback(
        (locationId: string, itemId: string, data: Partial<ReviewItem>) => {
            setLocationData((prev) => {
                const locationInfo = prev[locationId];
                if (!locationInfo) return prev;

                return {
                    ...prev,
                    [locationId]: {
                        ...locationInfo,
                        reviewItems: locationInfo.reviewItems.map((item) =>
                            item.id === itemId ? { ...item, ...data } : item,
                        ),
                    },
                };
            });
        },
        [],
    );

    const addUrgentQuery = useCallback(
        (locationId: string, query: Omit<UrgentQuery, "id">) => {
            setLocationData((prev) => {
                const locationInfo = prev[locationId] || {
                    locationId,
                    history: [],
                    reviewItems: [],
                    urgentQueries: [],
                    notes: [],
                };
                return {
                    ...prev,
                    [locationId]: {
                        ...locationInfo,
                        urgentQueries: [
                            ...locationInfo.urgentQueries,
                            {
                                id: generateAssignmentId(),
                                ...query,
                            },
                        ],
                    },
                };
            });
        },
        [],
    );

    const updateUrgentQuery = useCallback(
        (locationId: string, queryId: string, data: Partial<UrgentQuery>) => {
            setLocationData((prev) => {
                const locationInfo = prev[locationId];
                if (!locationInfo) return prev;

                return {
                    ...prev,
                    [locationId]: {
                        ...locationInfo,
                        urgentQueries: locationInfo.urgentQueries.map(
                            (query) =>
                                query.id === queryId
                                    ? { ...query, ...data }
                                    : query,
                        ),
                    },
                };
            });
        },
        [],
    );

    const addNote = useCallback(
        (locationId: string, note: Omit<LocationNote, "id">) => {
            setLocationData((prev) => {
                const locationInfo = prev[locationId] || {
                    locationId,
                    history: [],
                    reviewItems: [],
                    urgentQueries: [],
                    notes: [],
                };
                return {
                    ...prev,
                    [locationId]: {
                        ...locationInfo,
                        notes: [
                            ...locationInfo.notes,
                            {
                                id: generateAssignmentId(),
                                ...note,
                            },
                        ],
                    },
                };
            });
        },
        [],
    );

    const updateNote = useCallback(
        (locationId: string, noteId: string, data: Partial<LocationNote>) => {
            setLocationData((prev) => {
                const locationInfo = prev[locationId];
                if (!locationInfo) return prev;

                return {
                    ...prev,
                    [locationId]: {
                        ...locationInfo,
                        notes: locationInfo.notes.map((note) =>
                            note.id === noteId ? { ...note, ...data } : note,
                        ),
                    },
                };
            });
        },
        [],
    );

    const deleteNote = useCallback((locationId: string, noteId: string) => {
        setLocationData((prev) => {
            const locationInfo = prev[locationId];
            if (!locationInfo) return prev;

            return {
                ...prev,
                [locationId]: {
                    ...locationInfo,
                    notes: locationInfo.notes.filter(
                        (note) => note.id !== noteId,
                    ),
                },
            };
        });
    }, []);

    // Week status management

    const updateWeekStatus = useCallback(
        (weekId: string, status: "draft" | "published") => {
            setWeekStatuses((prev) => {
                const existing = prev.findIndex(
                    (s) =>
                        s.weekId === weekId &&
                        s.teamId === currentTeamId &&
                        s.orgId === currentOrgId,
                );

                if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = {
                        weekId,
                        teamId: currentTeamId,
                        orgId: currentOrgId,
                        status,
                        lastModified: Timestamp.now(),
                        lastModifiedById: currentUserId,
                    };
                    return updated;
                }

                return [
                    ...prev,
                    {
                        weekId,
                        teamId: currentTeamId,
                        orgId: currentOrgId,
                        status,
                        lastModified: Timestamp.now(),
                        lastModifiedById: currentUserId,
                    },
                ];
            });
        },
        [currentTeamId, currentOrgId, currentUserId],
    );

    const publishWorkload = useCallback(
        (weekId: string) => {
            updateWeekStatus(weekId, "published");
            setPreviousAssignments({ ...assignments });
            setHasUnsavedChanges(false);

            // Convert UI assignments to stored assignments
            const newStoredAssignments: StoredAssignment[] = [];

            Object.entries(assignments).forEach(
                ([cellKey, cellAssignments]) => {
                    if (cellKey.startsWith(dateId)) {
                        cellAssignments.forEach((assignment) => {
                            if (assignment.userId) {
                                try {
                                    const storedAssignment =
                                        createStoredAssignment(
                                            assignment,
                                            currentTeamId,
                                            weekId,
                                            dayIndex,
                                        );
                                    newStoredAssignments.push(storedAssignment);
                                } catch (error) {
                                    console.error(
                                        "Failed to create stored assignment:",
                                        error,
                                    );
                                }
                            }
                        });
                    }
                },
            );

            // Update stored assignments
            setStoredAssignments((prev) => {
                // Remove existing assignments for this day
                const filtered = prev.filter(
                    (a) => !(a.weekId === weekId && a.dayIndex === dayIndex),
                );
                // Add new assignments
                return [...filtered, ...newStoredAssignments];
            });

            toast({
                title: "Workload Published",
                description:
                    "The daily workload has been published successfully.",
                duration: 3000,
            });
        },
        [assignments, dateId, updateWeekStatus, currentTeamId, dayIndex],
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

    const setWeekStatus = useCallback(
        (weekId: string, status: "draft" | "published") => {
            if (
                status === "published" &&
                locationsWithNoAssignments.length > 0
            ) {
                showConfirmation(
                    "Warning: Unassigned Locations",
                    `${locationsWithNoAssignments.length} locations have no users assigned. Do you still want to publish?`,
                    () => publishWorkload(weekId),
                );
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                status === "published"
                    ? publishWorkload(weekId)
                    : updateWeekStatus(weekId, status);
            }
        },
        [
            locationsWithNoAssignments.length,
            publishWorkload,
            showConfirmation,
            updateWeekStatus,
        ],
    );

    const saveChanges = useCallback(() => {
        showConfirmation(
            "Save Changes",
            "Are you sure you want to save these changes to the published workload?",
            () => {
                setHasUnsavedChanges(false);
                setPreviousAssignments({ ...assignments });

                // Update stored assignments
                const newStoredAssignments: StoredAssignment[] = [];

                Object.entries(assignments).forEach(
                    ([cellKey, cellAssignments]) => {
                        if (cellKey.startsWith(dateId)) {
                            cellAssignments.forEach((assignment) => {
                                if (assignment.userId) {
                                    try {
                                        const storedAssignment =
                                            createStoredAssignment(
                                                assignment,
                                                currentTeamId,
                                                weekId,
                                                dayIndex,
                                            );
                                        newStoredAssignments.push(
                                            storedAssignment,
                                        );
                                    } catch (error) {
                                        console.error(
                                            "Failed to create stored assignment:",
                                            error,
                                        );
                                    }
                                }
                            });
                        }
                    },
                );

                setStoredAssignments((prev) => {
                    const filtered = prev.filter(
                        (a) =>
                            !(a.weekId === weekId && a.dayIndex === dayIndex),
                    );
                    return [...filtered, ...newStoredAssignments];
                });

                // Update week status
                setWeekStatuses((prev) => {
                    const existing = prev.findIndex(
                        (s) =>
                            s.weekId === weekId &&
                            s.teamId === currentTeamId &&
                            s.orgId === currentOrgId,
                    );

                    if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = {
                            ...updated[existing],
                            lastModified: Timestamp.now(),
                            lastModifiedById: currentUserId,
                        };
                        return updated;
                    }
                    return prev;
                });

                toast({
                    title: "Changes Saved",
                    description:
                        "Your changes to the published workload have been saved.",
                    duration: 3000,
                });
            },
        );
    }, [showConfirmation, assignments, dateId, weekId, dayIndex]);

    const hasNoAssignments = useCallback(
        (locationId: string) => {
            const cellKey = `${dateId}-${locationId}`;
            return !assignments[cellKey] || assignments[cellKey].length === 0;
        },
        [dateId, assignments],
    );

    // Clear all assignments for the current day
    const clearAllAssignments = useCallback(() => {
        showConfirmation(
            "Clear All Assignments",
            "Are you sure you want to clear all assignments for this day? This action cannot be undone.",
            () => {
                const keysToRemove = Object.keys(assignments).filter((key) =>
                    key.startsWith(dateId),
                );
                if (keysToRemove.length === 0) return;

                setAssignments((prev) => {
                    const newAssignments = { ...prev };
                    keysToRemove.forEach((key) => {
                        delete newAssignments[key];
                    });
                    return newAssignments;
                });

                // Also remove from stored assignments
                setStoredAssignments((prev) =>
                    prev.filter(
                        (a) =>
                            !(a.weekId === weekId && a.dayIndex === dayIndex),
                    ),
                );

                setHasUnsavedChanges(true);
                toast({
                    title: "Assignments Cleared",
                    description:
                        "All assignments for this day have been cleared.",
                    duration: 3000,
                });
            },
        );
    }, [showConfirmation, assignments, dateId, weekId, dayIndex]);

    // Copy assignments from previous day
    const copyFromPreviousDay = useCallback(() => {
        // Get yesterday's date ID
        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);
        const previousDateId = format(yesterday, "yyyy-MM-dd");

        // Check if previous day has any assignments
        const hasPreviousDayAssignments = Object.keys(assignments).some((key) =>
            key.startsWith(previousDateId),
        );

        if (!hasPreviousDayAssignments) {
            toast({
                title: "No Data Found",
                description: "No assignments found for the previous day.",
                variant: "destructive",
                duration: 3000,
            });
            return;
        }

        showConfirmation(
            "Copy from Previous Day",
            "This will overwrite any existing assignments for the current day. Continue?",
            () => {
                // Get all assignments from previous day
                const previousDayAssignments: Record<
                    string,
                    (Assignment & { userId?: string })[]
                > = {};
                Object.entries(assignments).forEach(([key, value]) => {
                    if (key.startsWith(previousDateId)) {
                        // Create a new key for the current day
                        const newKey = key.replace(previousDateId, dateId);
                        // Deep clone the assignments to avoid reference issues
                        previousDayAssignments[newKey] = value.map(
                            (assignment) => ({
                                ...assignment,
                                id: generateAssignmentId(), // Generate new IDs
                            }),
                        );
                    }
                });

                // Merge with current assignments (overwrite existing)
                setAssignments((prev) => ({
                    ...prev,
                    ...previousDayAssignments,
                }));

                // Create stored assignments for the copied assignments
                const newStoredAssignments: StoredAssignment[] = [];

                Object.entries(previousDayAssignments).forEach(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ([_cellKey, cellAssignments]) => {
                        cellAssignments.forEach((assignment) => {
                            if (assignment.userId) {
                                try {
                                    const storedAssignment =
                                        createStoredAssignment(
                                            assignment,
                                            currentTeamId,
                                            weekId,
                                            dayIndex,
                                        );
                                    newStoredAssignments.push(storedAssignment);
                                } catch (error) {
                                    console.error(
                                        "Failed to create stored assignment:",
                                        error,
                                    );
                                }
                            }
                        });
                    },
                );

                // Update stored assignments
                setStoredAssignments((prev) => {
                    // Remove existing assignments for this day
                    const filtered = prev.filter(
                        (a) =>
                            !(a.weekId === weekId && a.dayIndex === dayIndex),
                    );
                    // Add new assignments
                    return [...filtered, ...newStoredAssignments];
                });

                setHasUnsavedChanges(true);
                toast({
                    title: "Assignments Copied",
                    description:
                        "Assignments from the previous day have been copied to the current day.",
                    duration: 3000,
                });
            },
        );
    }, [date, assignments, showConfirmation, dateId, weekId, dayIndex]);

    // Context menu handling
    const handleContextMenu = useCallback(
        (e: React.MouseEvent, locationId: string, assignmentId: string) => {
            e.preventDefault();
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                locationId,
                assignmentId,
            });
        },
        [],
    );

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    const handleDelete = useCallback(() => {
        if (!contextMenu || !contextMenu.assignmentId) return;
        removeAssignment(
            contextMenu.locationId,
            dateId,
            contextMenu.assignmentId,
        );
        closeContextMenu();
    }, [contextMenu, removeAssignment, dateId, closeContextMenu]);

    const handleCopy = useCallback(() => {
        if (!contextMenu || !contextMenu.assignmentId) return;

        // Find the assignment to copy
        const cellKey = `${dateId}-${contextMenu.locationId}`;
        const cellAssignments = assignments[cellKey] || [];
        const assignmentToCopy = cellAssignments.find(
            (a) => a.id === contextMenu.assignmentId,
        );

        if (assignmentToCopy) {
            setClipboard({
                assignment: { ...assignmentToCopy },
            });
            toast({
                title: "Assignment Copied",
                description: "Assignment has been copied to clipboard.",
                duration: 3000,
            });
        }

        closeContextMenu();
    }, [contextMenu, assignments, dateId, closeContextMenu]);

    const handlePaste = useCallback(() => {
        if (!contextMenu || !clipboard) return;

        const cellKey = `${dateId}-${contextMenu.locationId}`;
        setAssignments((prev) => {
            const currentAssignments = prev[cellKey] || [];
            return {
                ...prev,
                [cellKey]: [
                    ...currentAssignments,
                    {
                        ...clipboard.assignment,
                        id: generateAssignmentId(), // Generate a new ID for the pasted assignment
                        locationId: contextMenu.locationId, // Update the location ID
                    },
                ],
            };
        });

        setHasUnsavedChanges(true);
        toast({
            title: "Assignment Pasted",
            description: "Assignment has been pasted successfully.",
            duration: 3000,
        });

        closeContextMenu();
    }, [contextMenu, clipboard, dateId, closeContextMenu]);

    // Notification handling
    const handleSendNotifications = useCallback(() => {
        setNotificationDialog({ open: true });
    }, []);

    const sendNotifications = useCallback(
        (userIds: string[]) => {
            const usersToNotify = allUsersList.filter((user) =>
                userIds.includes(user.id),
            );

            toast({
                title: "Notifications Sent",
                description: `${usersToNotify.length} users have been notified of their assignments.`,
                duration: 3000,
            });
        },
        [allUsersList],
    );

    // Get all users assigned to any location for the current day
    const getAssignedUsers = useCallback(() => {
        const assignedUserIds = new Set<string>();

        // Loop through all assignments for the current day
        Object.entries(assignments).forEach(([key, assignmentList]) => {
            // Only consider assignments for the current day
            if (key.startsWith(dateId)) {
                // Add each assigned user ID to the set
                assignmentList.forEach((assignment) => {
                    if (assignment.userId) {
                        assignedUserIds.add(assignment.userId);
                    }
                });
            }
        });

        // Return only users who are assigned
        return allUsersList.filter((user) => assignedUserIds.has(user.id));
    }, [assignments, dateId, allUsersList]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <WeekSelector date={date} onDateChange={setDate} />
                <div className="flex flex-wrap items-center gap-2">
                    {locationsWithNoAssignments.length > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center text-amber-500">
                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                        <span className="text-sm">
                                            {locationsWithNoAssignments.length}{" "}
                                            locations unassigned
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        The following locations have no users
                                        assigned:
                                    </p>
                                    <ul className="list-disc pl-4 mt-1">
                                        {locationsWithNoAssignments.map(
                                            (location) => (
                                                <li key={location.id}>
                                                    {location.name}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <StatusControls
                        weekId={weekId}
                        teamId={currentTeamId}
                        orgId={currentOrgId}
                        weekStatuses={weekStatuses}
                        onStatusChange={setWeekStatus}
                        hasChanges={hasUnsavedChanges}
                        onSaveChanges={saveChanges}
                        hasUnassignedLocations={
                            locationsWithNoAssignments.length > 0
                        }
                        currentUserId={currentUserId}
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 mb-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllAssignments}
                    className="flex items-center gap-1"
                >
                    <Trash className="h-4 w-4" />{" "}
                    <span className="hidden sm:inline">Clear All</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyFromPreviousDay}
                    className="flex items-center gap-1"
                >
                    <Copy className="h-4 w-4" />{" "}
                    <span className="hidden sm:inline">
                        Copy from Previous Day
                    </span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendNotifications}
                    className="flex items-center gap-1"
                >
                    <Bell className="h-4 w-4" />{" "}
                    <span className="hidden sm:inline">Send Notifications</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                >
                    <FileDown className="h-4 w-4" />{" "}
                    <span className="hidden sm:inline">Export</span>
                </Button>
            </div>

            <div className="overflow-x-auto border rounded-md">
                <Table className="min-w-[1000px]">
                    <TableCaption>
                        Daily Workload for {format(date, "EEEE, MMMM d, yyyy")}
                    </TableCaption>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[180px]">
                                Location
                            </TableHead>
                            <TableHead className="w-[300px]">
                                User Assignments
                            </TableHead>
                            <TableHead className="w-[80px]">History</TableHead>
                            <TableHead className="w-[80px]">
                                Items to Review
                            </TableHead>
                            <TableHead className="w-[80px]">UQs</TableHead>
                            <TableHead className="w-[200px]">Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeLocationObjects.map((location) => {
                            const isUnassigned = hasNoAssignments(location.id);
                            const locData = locationData[location.id] || {
                                locationId: location.id,
                                history: [],
                                reviewItems: [],
                                urgentQueries: [],
                                notes: [],
                            };

                            return (
                                <LocationRow
                                    key={location.id}
                                    location={location}
                                    dateId={dateId}
                                    weekId={weekId}
                                    teamId={currentTeamId}
                                    dayIndex={dayIndex}
                                    assignments={assignments}
                                    allUsers={allUsersList}
                                    locationData={locData}
                                    onRemoveLocation={removeLocation}
                                    onUpdateAssignment={updateAssignment}
                                    onRemoveAssignment={removeAssignment}
                                    onAddAssignment={addAssignment}
                                    onAddCustomUser={addCustomUser}
                                    onContextMenu={handleContextMenu}
                                    isUnassigned={isUnassigned}
                                    moveLocationUp={moveLocationUp}
                                    moveLocationDown={moveLocationDown}
                                    activeLocations={activeLocations}
                                    allLocations={activeLocationObjects}
                                    onAddHistory={addHistoryEntry}
                                    onAddReviewItem={addReviewItem}
                                    onUpdateReviewItem={updateReviewItem}
                                    onAddUrgentQuery={addUrgentQuery}
                                    onUpdateUrgentQuery={updateUrgentQuery}
                                    onAddNote={addNote}
                                    onUpdateNote={updateNote}
                                    onDeleteNote={deleteNote}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-center">
                <AddLocationDialog
                    availableLocations={availableLocations}
                    onAddLocation={addLocation}
                    onAddCustomLocation={addCustomLocation}
                />
            </div>

            {/* Context Menu */}
            <ContextMenu
                position={contextMenu}
                onClose={closeContextMenu}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onPaste={handlePaste}
                canPaste={!!clipboard}
            />

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={confirmationDialog.open}
                onOpenChange={(open) =>
                    setConfirmationDialog({ ...confirmationDialog, open })
                }
                title={confirmationDialog.title}
                description={confirmationDialog.description}
                onConfirm={confirmationDialog.onConfirm}
            />

            {/* Notification Dialog */}
            <NotificationDialog
                open={notificationDialog.open}
                onOpenChange={(open) =>
                    setNotificationDialog({ ...notificationDialog, open: open })
                }
                allUsers={getAssignedUsers()}
                onSendNotifications={sendNotifications}
            />

            <Toaster />
        </div>
    );
}
