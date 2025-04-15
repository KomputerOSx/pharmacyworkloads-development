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

interface DesktopRotaViewProps {
    weekNumber: number;
    teamName: string;
    weekDays: Date[];
    usersToDisplay: User[];
    assignmentsMap: Map<string, StoredAssignment[]>; // Key: `${userId}-${dayIndex}`
    allOrgLocationsMap: Map<string, HospLoc>;
}

export function DesktopRotaView({
    weekNumber,
    teamName,
    weekDays,
    usersToDisplay,
    assignmentsMap,
    allOrgLocationsMap,
}: DesktopRotaViewProps) {
    return (
        <div className="w-full overflow-x-auto border rounded-md">
            <Table className="w-full table-fixed min-w-[1080px]">
                <TableCaption className="mt-4 mb-2">
                    User Rota for Week {weekNumber} - Team: {teamName}
                </TableCaption>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow>
                        <TableHead className="w-[200px] sticky left-0 z-20 bg-muted/50 p-2">
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
                                colSpan={8} // 1 User + 7 Days
                                className="h-24 text-center text-muted-foreground"
                            >
                                No users with assignments found for this week.
                            </TableCell>
                        </TableRow>
                    ) : (
                        usersToDisplay.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium align-top sticky left-0 z-10 bg-background p-2">
                                    <div
                                        className="font-semibold truncate"
                                        title={`${user.firstName} ${user.lastName}`}
                                    >
                                        {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {user.jobTitle || user.role || "User"}
                                    </div>
                                </TableCell>
                                {weekDays.map((_, dayIndex) => {
                                    const cellKey = `${user.id}-${dayIndex}`;
                                    const cellAssignments =
                                        assignmentsMap.get(cellKey) || [];
                                    return (
                                        <TableCell
                                            key={cellKey}
                                            className="p-1 h-auto align-top min-w-[130px] border-l"
                                        >
                                            <div className="space-y-1">
                                                {cellAssignments.length ===
                                                0 ? (
                                                    <div className="h-16 flex items-center justify-center text-xs text-muted-foreground italic">
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
                                })}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
