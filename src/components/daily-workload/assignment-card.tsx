// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Assignment, User } from "./types/workload";
import { formatShiftTime, getShiftPreset } from "./utils/workload-utils";
import { UserSelector } from "./user-selector";
import { ShiftSelector } from "./shift-selector";
import { AssignmentNotes } from "./assignment-notes";
import { shiftPresets } from "./data/sample-data";
import { CombinedTimePicker } from "./combined-time-picker";
import { cn } from "@/lib/utils";

interface AssignmentCardProps {
    assignment: Assignment & { userId?: string };
    allUsers: User[];
    locationId: string;
    dateId: string;
    onUpdate: (
        locationId: string,
        dateId: string,
        assignmentId: string,
        data: Partial<Assignment & { userId?: string }>,
    ) => void;
    onRemove: (
        locationId: string,
        dateId: string,
        assignmentId: string,
    ) => void;
    onAddCustomUser: (name: string) => void;
    onContextMenu?: (
        e: React.MouseEvent,
        locationId: string,
        assignmentId: string,
    ) => void;
    teamId?: string;
}

export function AssignmentCard({
    assignment,
    allUsers,
    locationId,
    dateId,
    onUpdate,
    onRemove,
    onAddCustomUser,
    onContextMenu,
}: AssignmentCardProps) {
    const [userPopoverOpen, setUserPopoverOpen] = useState(false);
    const [shiftPopoverOpen, setShiftPopoverOpen] = useState(false);
    const [customStartTime, setCustomStartTime] = useState(
        assignment.customStartTime || "09:00",
    );
    const [customEndTime, setCustomEndTime] = useState(
        assignment.customEndTime || "17:00",
    );

    const shiftPreset = assignment.shiftType
        ? getShiftPreset(assignment.shiftType)
        : null;
    const colorClasses = shiftPreset?.colorClasses || {
        bg: "bg-gray-50",
        border: "border-l-gray-300",
        text: "text-gray-700",
    };

    const handleUserSelect = (userId: string | null, customUser?: string) => {
        onUpdate(locationId, dateId, assignment.id, {
            userId: userId || undefined,
            customUser,
        });
    };

    const handleShiftSelect = (shiftType: string, isCustom: boolean) => {
        onUpdate(locationId, dateId, assignment.id, {
            shiftType,
            ...(isCustom
                ? {
                      customStartTime,
                      customEndTime,
                  }
                : {}),
        });
    };

    const handleSaveNotes = useCallback(
        (notes: string) => {
            onUpdate(locationId, dateId, assignment.id, { notes });
        },
        [locationId, dateId, assignment.id, onUpdate],
    );

    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            if (onContextMenu) {
                onContextMenu(e, locationId, assignment.id);
            }
        },
        [onContextMenu, locationId, assignment.id],
    );

    const handleStartTimeChange = (time: string) => {
        setCustomStartTime(time);
        onUpdate(locationId, dateId, assignment.id, {
            customStartTime: time,
        });
    };

    const handleEndTimeChange = (time: string) => {
        setCustomEndTime(time);
        onUpdate(locationId, dateId, assignment.id, {
            customEndTime: time,
        });
    };

    return (
        <div
            className={cn(
                "border rounded-md p-1.5 sm:p-2 relative border-l-4",
                colorClasses.bg,
                colorClasses.border,
            )}
            onContextMenu={handleContextMenu}
        >
            <div className="flex justify-between items-start">
                <AssignmentNotes
                    notes={assignment.notes}
                    onSaveNotes={handleSaveNotes}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-50 hover:opacity-100"
                    onClick={() => onRemove(locationId, dateId, assignment.id)}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            {/* User Selector */}
            <UserSelector
                allUsers={allUsers}
                selectedUserId={assignment.userId || null}
                customUser={assignment.customUser}
                onUserSelect={handleUserSelect}
                onAddCustomUser={onAddCustomUser}
                popoverOpen={userPopoverOpen}
                onPopoverOpenChange={setUserPopoverOpen}
            />

            {/* Shift Selector */}
            <ShiftSelector
                shiftPresets={shiftPresets}
                selectedShiftType={assignment.shiftType}
                onShiftSelect={handleShiftSelect}
                popoverOpen={shiftPopoverOpen}
                onPopoverOpenChange={setShiftPopoverOpen}
            />

            {/* Custom Time Inputs (shown only when CUSTOM is selected) */}
            {assignment.shiftType === "custom" && (
                <div className="mt-1">
                    <CombinedTimePicker
                        startTime={
                            assignment.customStartTime || customStartTime
                        }
                        endTime={assignment.customEndTime || customEndTime}
                        onStartTimeChange={handleStartTimeChange}
                        onEndTimeChange={handleEndTimeChange}
                    />
                </div>
            )}

            {/* Display shift time if a shift is selected */}
            {assignment.shiftType && assignment.shiftType !== "custom" && (
                <div className={cn("text-xs mt-1", colorClasses.text)}>
                    {formatShiftTime(assignment)}
                </div>
            )}
        </div>
    );
}
