import React from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { ViewOnlyAssignmentCard } from "@/components/rota/view-only-assignment-card";
import type { StoredAssignment } from "@/types/rotaTypes";
import type { User } from "@/types/userTypes";
import type { HospLoc } from "@/types/subDepTypes";

interface MobileRotaViewProps {
    weekNumber: number;
    teamName: string;
    weekDays: Date[];
    usersToDisplay: User[];
    assignmentsMap: Map<string, StoredAssignment[]>; // Key: `${userId}-${dayIndex}`
    allOrgLocationsMap: Map<string, HospLoc>;
}

export function MobileRotaView({
    weekDays,
    usersToDisplay,
    assignmentsMap,
    allOrgLocationsMap,
}: MobileRotaViewProps) {
    const minTableWidth = 100 + usersToDisplay.length * 160; // Adjust as needed

    return (
        <div className="w-full overflow-x-auto border rounded-md relative">
            <Table
                className="w-full border-collapse"
                style={{ minWidth: `${minTableWidth}px` }}
            >
                <TableCaption className="mt-4 mb-2 text-xs">
                    Scroll right to see all users →
                </TableCaption>
                <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                    <TableRow>
                        <TableHead className="sticky left-0 z-20 bg-muted/80 backdrop-blur-sm w-[100px] p-2 text-sm font-semibold">
                            Day
                        </TableHead>
                        {usersToDisplay.map((user) => (
                            <TableHead
                                key={user.id}
                                className="min-w-[160px] p-2 text-left align-top"
                            >
                                <div
                                    className="font-semibold truncate text-sm"
                                    title={`${user.firstName} ${user.lastName}`}
                                >
                                    {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {user.jobTitle || user.role || "User"}
                                </div>
                            </TableHead>
                        ))}
                        {usersToDisplay.length === 0 && (
                            <TableHead className="p-2 min-w-[160px]"></TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {weekDays.length === 0 && usersToDisplay.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={2}
                                className="h-48 text-center text-muted-foreground italic p-4"
                            >
                                No rota data available.
                            </TableCell>
                        </TableRow>
                    ) : (
                        weekDays.map((day, dayIndex) => (
                            <TableRow key={dayIndex} className="border-t">
                                <TableCell className="sticky left-0 z-0 bg-background/95 backdrop-blur-sm p-2 align-top w-[100px]">
                                    <div className="font-semibold text-sm">
                                        {format(day, "EEE")}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(day, "MMM d")}
                                    </div>
                                </TableCell>
                                {usersToDisplay.length > 0 ? (
                                    usersToDisplay.map((user) => {
                                        const cellKey = `${user.id}-${dayIndex}`;
                                        const cellAssignments =
                                            assignmentsMap.get(cellKey) || [];
                                        return (
                                            <TableCell
                                                key={cellKey}
                                                className="p-1 h-auto align-top min-w-[160px] border-l"
                                            >
                                                <div className="space-y-1">
                                                    {cellAssignments.length ===
                                                    0 ? (
                                                        <div className="h-16 flex items-center justify-start pl-2 text-xs text-muted-foreground italic">
                                                            {/* Empty cell */}
                                                        </div>
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
                                                                    }
                                                                />
                                                            ),
                                                        )
                                                    )}
                                                </div>
                                            </TableCell>
                                        );
                                    })
                                ) : (
                                    <TableCell className="p-1 h-auto align-top min-w-[160px] border-l">
                                        <div className="h-16 flex items-center justify-start pl-2 text-xs text-muted-foreground italic">
                                            No users assigned
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {/* Scroll indicators */}
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            <div className="absolute left-[100px] top-0 bottom-0 w-3 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        </div>
    );
}
