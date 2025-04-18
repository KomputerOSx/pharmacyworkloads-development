"use client";

import type React from "react";
import { X, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type {
    Assignment,
    HospLoc,
    User,
    HistoryEntry,
    ReviewItem,
    UrgentQuery,
    LocationNote,
} from "./types/workload";
import { AssignmentCard } from "./assignment-card";
import { HistoryColumn } from "./history-column";
import { ReviewItemsColumn } from "./review-items-column";
import { UrgentQueriesColumn } from "./urgent-queries-column";
import { NotesColumn } from "./notes-column";

interface LocationRowProps {
    location: HospLoc;
    dateId: string;
    weekId: string;
    teamId: string;
    dayIndex: number;
    assignments: Record<string, (Assignment & { userId?: string })[]>;
    allUsers: User[];
    locationData: {
        history: HistoryEntry[];
        reviewItems: ReviewItem[];
        urgentQueries: UrgentQuery[];
        notes: LocationNote[];
    };
    onRemoveLocation: (locationId: string) => void;
    onUpdateAssignment: (
        locationId: string,
        dateId: string,
        assignmentId: string,
        data: Partial<Assignment & { userId?: string }>,
    ) => void;
    onRemoveAssignment: (
        locationId: string,
        dateId: string,
        assignmentId: string,
    ) => void;
    onAddAssignment: (locationId: string, dateId: string) => void;
    onAddCustomUser: (name: string) => void;
    onContextMenu: (
        e: React.MouseEvent,
        locationId: string,
        assignmentId: string,
    ) => void;
    isUnassigned: boolean;
    moveLocationUp: (locationId: string) => void;
    moveLocationDown: (locationId: string) => void;
    activeLocations: string[];
    allLocations: HospLoc[];
    onAddHistory: (locationId: string, entry: Omit<HistoryEntry, "id">) => void;
    onAddReviewItem: (locationId: string, item: Omit<ReviewItem, "id">) => void;
    onUpdateReviewItem: (
        locationId: string,
        itemId: string,
        data: Partial<ReviewItem>,
    ) => void;
    onAddUrgentQuery: (
        locationId: string,
        query: Omit<UrgentQuery, "id">,
    ) => void;
    onUpdateUrgentQuery: (
        locationId: string,
        queryId: string,
        data: Partial<UrgentQuery>,
    ) => void;
    onAddNote: (locationId: string, note: Omit<LocationNote, "id">) => void;
    onUpdateNote: (
        locationId: string,
        noteId: string,
        data: Partial<LocationNote>,
    ) => void;
    onDeleteNote: (locationId: string, noteId: string) => void;
}

export function LocationRow({
    location,
    dateId,
    teamId,
    assignments,
    allUsers,
    locationData,
    onRemoveLocation,
    onUpdateAssignment,
    onRemoveAssignment,
    onAddAssignment,
    onAddCustomUser,
    onContextMenu,
    isUnassigned,
    moveLocationUp,
    moveLocationDown,
    activeLocations,
    allLocations,
    onAddHistory,
    onAddReviewItem,
    onUpdateReviewItem,
    onAddUrgentQuery,
    onUpdateUrgentQuery,
    onAddNote,
    onUpdateNote,
    onDeleteNote,
}: LocationRowProps) {
    // Get assignments for this location on this date
    const getCellAssignments = (
        locationId: string,
        dateId: string,
    ): (Assignment & { userId?: string })[] => {
        const cellKey = `${dateId}-${locationId}`;
        return assignments[cellKey] || [];
    };

    const cellAssignments = getCellAssignments(location.id, dateId);
    // We don't have capacity in our HospLoc type, so we'll assume there's no capacity limit
    const isAtCapacity = false;

    return (
        <TableRow className="border-b border-gray-200 hover:bg-gray-50">
            <TableCell
                className={`font-medium ${isUnassigned ? "border-l-4 border-amber-400" : ""}`}
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveLocationUp(location.id)}
                                disabled={
                                    activeLocations.indexOf(location.id) === 0
                                }
                            >
                                <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveLocationDown(location.id)}
                                disabled={
                                    activeLocations.indexOf(location.id) ===
                                    allLocations.length - 1
                                }
                            >
                                <ArrowDown className="h-3 w-3" />
                            </Button>
                        </div>
                        <div>
                            <div className="flex items-center flex-wrap">
                                <span className="mr-1">{location.name}</span>
                                {isUnassigned && (
                                    <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                                        !
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {location.type}
                            </div>
                            {location.description && (
                                <div className="text-xs text-muted-foreground">
                                    {location.description}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-50 hover:opacity-100"
                        onClick={() => onRemoveLocation(location.id)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
            <TableCell className="p-2 h-auto">
                <div className="space-y-2">
                    {cellAssignments.map((assignment) => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            allUsers={allUsers}
                            locationId={location.id}
                            dateId={dateId}
                            onUpdate={onUpdateAssignment}
                            onRemove={onRemoveAssignment}
                            onAddCustomUser={onAddCustomUser}
                            onContextMenu={onContextMenu}
                            teamId={teamId}
                        />
                    ))}

                    {/* Add Assignment Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={() => onAddAssignment(location.id, dateId)}
                        disabled={isAtCapacity}
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        {isAtCapacity ? "At Capacity" : "Add User"}
                    </Button>
                </div>
            </TableCell>
            <TableCell className="p-2 h-auto">
                <HistoryColumn
                    locationId={location.id}
                    dateId={dateId}
                    history={locationData.history}
                    onAddHistory={onAddHistory}
                />
            </TableCell>
            <TableCell className="p-2 h-auto">
                <ReviewItemsColumn
                    locationId={location.id}
                    dateId={dateId}
                    reviewItems={locationData.reviewItems}
                    onAddReviewItem={onAddReviewItem}
                    onUpdateReviewItem={onUpdateReviewItem}
                />
            </TableCell>
            <TableCell className="p-2 h-auto">
                <UrgentQueriesColumn
                    locationId={location.id}
                    dateId={dateId}
                    urgentQueries={locationData.urgentQueries}
                    onAddUrgentQuery={onAddUrgentQuery}
                    onUpdateUrgentQuery={onUpdateUrgentQuery}
                />
            </TableCell>
            <TableCell className="p-2 h-auto">
                <NotesColumn
                    locationId={location.id}
                    notes={locationData.notes}
                    onAddNote={onAddNote}
                    onUpdateNote={onUpdateNote}
                    onDeleteNote={onDeleteNote}
                />
            </TableCell>
        </TableRow>
    );
}
