// src/components/rota/assignment-card.tsx
"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Assignment, StoredAssignment } from "@/types/rotaTypes";
import type { HospLoc } from "@/types/subDepTypes";
import { formatShiftTime } from "./utils/rota-utils";
import { LocationSelector } from "./location-selector";
import { ShiftSelector } from "./shift-selector";
import { AssignmentNotes } from "./assignment-notes";
import { CombinedTimePicker } from "./combined-time-picker";
import { getShiftPreset } from "@/lib/rota-utils";
import { shiftPresets } from "@/types/rotaTypes";
import { cn } from "@/lib/utils";

interface AssignmentCardProps {
    assignment: StoredAssignment;
    allLocations: HospLoc[];
    userId: string;
    dayIndex: number;
    weekId: string;
    onUpdate: (
        userId: string,
        dayIndex: number,
        weekId: string,
        assignmentId: string,
        data: Partial<Assignment>,
    ) => void;
    onRemove: (
        userId: string,
        dayIndex: number,
        weekId: string,
        assignmentId: string,
    ) => void;
    onAddCustomLocation: (name: string) => void;
    onContextMenu?: (
        e: React.MouseEvent,
        userId: string,
        dayIndex: number,
        assignmentId: string,
    ) => void;
}

export function AssignmentCard({
    assignment,
    allLocations,
    userId,
    dayIndex,
    weekId,
    onUpdate,
    onRemove,
    onAddCustomLocation,
    onContextMenu,
}: AssignmentCardProps) {
    const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
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

    const handleLocationSelect = (
        locationId: string | null,
        customLocationName?: string,
    ) => {
        const updateData: Partial<Assignment> = {
            locationId: customLocationName ? null : locationId,
            customLocation: customLocationName || undefined,
        };
        onUpdate(userId, dayIndex, weekId, assignment.id, updateData);
        setLocationPopoverOpen(false);
    };

    const handleShiftSelect = (shiftType: string, isCustom: boolean) => {
        onUpdate(userId, dayIndex, weekId, assignment.id, {
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
            onUpdate(userId, dayIndex, weekId, assignment.id, { notes });
        },
        [userId, dayIndex, weekId, assignment.id, onUpdate],
    );

    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            if (onContextMenu) {
                onContextMenu(e, userId, dayIndex, assignment.id);
            }
        },
        [onContextMenu, userId, dayIndex, assignment.id],
    );

    const handleStartTimeChange = (time: string) => {
        setCustomStartTime(time);
        onUpdate(userId, dayIndex, weekId, assignment.id, {
            customStartTime: time,
        });
    };

    const handleEndTimeChange = (time: string) => {
        setCustomEndTime(time);
        onUpdate(userId, dayIndex, weekId, assignment.id, {
            customEndTime: time,
        });
    };

    const addCustomLocation = (name: string) => {
        onAddCustomLocation(name);
    };

    return (
        <div
            className={cn(
                "border-l-4 rounded-md p-2 relative flex flex-col",
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
                    onClick={() =>
                        onRemove(userId, dayIndex, weekId, assignment.id)
                    }
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            {/* Location Selector */}
            <LocationSelector
                allLocations={allLocations}
                selectedLocationId={assignment.locationId}
                customLocation={assignment.customLocation}
                onLocationSelect={handleLocationSelect}
                onAddCustomLocation={addCustomLocation}
                popoverOpen={locationPopoverOpen}
                onPopoverOpenChange={setLocationPopoverOpen}
            />

            {/* Shift Selector */}
            <div className={"mt-1"}>
                <ShiftSelector
                    shiftPresets={shiftPresets}
                    selectedShiftType={assignment.shiftType}
                    onShiftSelect={handleShiftSelect}
                    popoverOpen={shiftPopoverOpen}
                    onPopoverOpenChange={setShiftPopoverOpen}
                />
            </div>

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
                <div
                    className={cn(
                        "text-xs text-muted-foreground mt-1",
                        colorClasses.text,
                    )}
                >
                    {formatShiftTime(assignment)}
                </div>
            )}
        </div>
    );
}
