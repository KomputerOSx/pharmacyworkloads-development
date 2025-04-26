"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DepTeam } from "@/types/subDepTypes";
import { User } from "@/types/userTypes";
import {
    useUserTeamAssignmentsByTeam,
    useCreateUserTeamAssignment,
    useDeleteUserTeamAssignment,
} from "@/hooks/admin/useUserTeamAss";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea

interface AssignUsersPopoverProps {
    team: DepTeam;
    orgId: string;
    depId: string;
    allDepUsers: User[] | undefined;
    isLoadingOrgUsers: boolean;
}

export function AssignUsersPopover({
    team,
    orgId,
    depId,
    allDepUsers,
    isLoadingOrgUsers,
}: AssignUsersPopoverProps) {
    const [open, setOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
        new Set(),
    );
    // Track mutations per user ID
    const [mutatingUserIds, setMutatingUserIds] = useState<Set<string>>(
        new Set(),
    );

    // Fetch existing assignments for this team
    const { data: teamUserAssignments, isLoading: isLoadingTeamAssigns } =
        useUserTeamAssignmentsByTeam(team.id);

    // Mutations
    const { mutate: assignUser, isPending: isAssigning } =
        useCreateUserTeamAssignment();
    const { mutate: unassignUser, isPending: isUnassigning } =
        useDeleteUserTeamAssignment();

    // Memoized map for quick lookup: userId -> assignmentId
    const teamUserAssignmentMap = useMemo(() => {
        if (!teamUserAssignments) return new Map<string, string>();
        return new Map(teamUserAssignments.map((ass) => [ass.userId, ass.id]));
    }, [teamUserAssignments]);

    // Initialize selectedUserIds based on fetched assignments when data loads
    useEffect(() => {
        if (teamUserAssignments) {
            setSelectedUserIds(
                new Set(teamUserAssignments.map((ass) => ass.userId)),
            );
        }
    }, [teamUserAssignments]);

    const handleUserAssignmentToggle = (
        user: User,
        isCurrentlySelectedInUI: boolean,
    ) => {
        const userId = user.id;
        const userName = `${user.firstName} ${user.lastName}`;
        const currentAssignmentId = teamUserAssignmentMap.get(userId); // Get ID from *fetched* data

        setMutatingUserIds((prev) => new Set(prev).add(userId)); // Start mutation state

        const updatedSelectedIds = new Set(selectedUserIds); // Copy current UI selection

        if (isCurrentlySelectedInUI) {
            // --- User is being DESELECTED ---
            updatedSelectedIds.delete(userId); // Update UI state optimistically
            setSelectedUserIds(updatedSelectedIds);

            if (currentAssignmentId) {
                // Only try to delete if assignment exists
                unassignUser(
                    { id: currentAssignmentId, userId, teamId: team.id },
                    {
                        onSuccess: () => {
                            toast.success(
                                `Unassigned ${userName} from ${team.name}.`,
                            );
                        },
                        onError: (err: Error) => {
                            toast.error(`Unassign failed: ${err.message}`);
                            // Revert optimistic UI update on error
                            setSelectedUserIds((prev) =>
                                new Set(prev).add(userId),
                            );
                        },
                        onSettled: () =>
                            setMutatingUserIds((prev) => {
                                const next = new Set(prev);
                                next.delete(userId);
                                return next;
                            }),
                    },
                );
            } else {
                // Should not happen if UI state and fetched state are in sync, but handle defensively
                console.warn(
                    `Attempted to unassign user ${userId} who had no existing assignment ID.`,
                );
                setMutatingUserIds((prev) => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            }
        } else {
            // --- User is being SELECTED ---
            updatedSelectedIds.add(userId); // Update UI state optimistically
            setSelectedUserIds(updatedSelectedIds);

            assignUser(
                { userIdToAssign: userId, teamId: team.id, orgId, depId },
                {
                    onSuccess: (newAssignment) => {
                        toast.success(`Assigned ${userName} to ${team.name}.`);
                        // IMPORTANT: Update the assignment map after successful creation
                        teamUserAssignmentMap.set(userId, newAssignment.id);
                    },
                    onError: (err: Error) => {
                        toast.error(`Assign failed: ${err.message}`);
                        // Revert optimistic UI update
                        setSelectedUserIds((prev) => {
                            const next = new Set(prev);
                            next.delete(userId);
                            return next;
                        });
                    },
                    onSettled: () =>
                        setMutatingUserIds((prev) => {
                            const next = new Set(prev);
                            next.delete(userId);
                            return next;
                        }),
                },
            );
        }
    };

    // Memoized list of selected user details for badge display
    const selectedUsersDetails = useMemo(() => {
        return (allDepUsers ?? [])
            .filter((user) => selectedUserIds.has(user.id))
            .sort((a, b) => (a.lastName ?? "").localeCompare(b.lastName ?? "")); // Sort by last name
    }, [allDepUsers, selectedUserIds]);

    const isLoading = isLoadingOrgUsers || isLoadingTeamAssigns;
    const buttonText = isLoading
        ? "Loading..."
        : selectedUserIds.size > 0
          ? `${selectedUserIds.size} User(s) Assigned`
          : "Assign Users";

    return (
        <div className="flex flex-col gap-2 items-start w-full">
            {/* Display selected users as badges */}
            <div className="flex flex-wrap gap-1">
                {selectedUsersDetails.length === 0 && !isLoading && (
                    <span className="text-xs text-muted-foreground italic">
                        No users currently assigned.
                    </span>
                )}
                {selectedUsersDetails.map((user) => (
                    <Badge
                        key={user.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                    >
                        {user.firstName} {user.lastName}
                        <button
                            type="button"
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                            onClick={() =>
                                handleUserAssignmentToggle(user, true)
                            } // Trigger deselect
                            disabled={
                                mutatingUserIds.has(user.id) ||
                                isAssigning ||
                                isUnassigning
                            }
                            aria-label={`Remove ${user.firstName} ${user.lastName}`}
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    </Badge>
                ))}
            </div>

            {/* Popover for selection */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={isLoading}
                    >
                        {buttonText}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput placeholder="Search users by name/email..." />
                        <CommandList>
                            <ScrollArea className="h-72">
                                {/* Make list scrollable */}
                                <CommandEmpty>No users found.</CommandEmpty>
                                <CommandGroup>
                                    {(allDepUsers ?? [])
                                        .sort((a, b) =>
                                            (a.lastName ?? "").localeCompare(
                                                b.lastName ?? "",
                                            ),
                                        ) // Sort list display
                                        .map((user) => {
                                            const isSelected =
                                                selectedUserIds.has(user.id);
                                            const isMutating =
                                                mutatingUserIds.has(user.id);
                                            const userName = `${user.firstName} ${user.lastName}`;
                                            const searchValue =
                                                `${userName} ${user.email ?? ""}`.toLowerCase();

                                            return (
                                                <CommandItem
                                                    key={user.id}
                                                    value={searchValue} // Value used for searching
                                                    onSelect={() => {
                                                        if (!isMutating) {
                                                            handleUserAssignmentToggle(
                                                                user,
                                                                isSelected,
                                                            );
                                                        }
                                                    }}
                                                    disabled={isMutating}
                                                    className="flex items-center justify-between" // Ensure space for spinner
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Check
                                                            className={cn(
                                                                "h-4 w-4",
                                                                isSelected
                                                                    ? "opacity-100"
                                                                    : "opacity-0",
                                                            )}
                                                        />
                                                        <span
                                                            title={
                                                                user.email
                                                                    ? `${userName} (${user.email})`
                                                                    : userName
                                                            }
                                                        >
                                                            {userName}
                                                        </span>
                                                        {user.email && (
                                                            <span className="text-xs text-muted-foreground truncate">
                                                                ({user.email})
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isMutating && (
                                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    )}
                                                </CommandItem>
                                            );
                                        })}
                                </CommandGroup>
                            </ScrollArea>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
