// import React from "react";
// import { format } from "date-fns";
// import {
//     Table,
//     TableBody,
//     TableCaption,
//     TableHead,
//     TableHeader,
//     TableRow,
//     TableCell,
// } from "@/components/ui/table";
// import { ViewOnlyAssignmentCard } from "@/components/rota/view-only-assignment-card";
// import type { StoredAssignment } from "@/types/rotaTypes";
// import type { User } from "@/types/userTypes";
// import type { HospLoc } from "@/types/subDepTypes";
//
// interface MobileRotaViewProps {
//     weekNumber: number;
//     weekDays: Date[];
//     userProfile: User | null | undefined;
//     assignmentsMap: Map<string, StoredAssignment[]>;
//     allOrgLocationsMap: Map<string, HospLoc>;
// }
//
// export function MobileMyRota({
//     weekDays,
//     userProfile,
//     assignmentsMap,
//     allOrgLocationsMap,
// }: MobileRotaViewProps) {
//     const minTableWidth = 260;
//
//     return (
//         <div className="w-full overflow-x-auto border rounded-md relative">
//             <Table
//                 className="w-full border-collapse"
//                 style={{ minWidth: `${minTableWidth}px` }}
//             >
//                 <TableCaption className=" mt-4 mb-2 text-xs">
//                     Scroll right to see all users →
//                 </TableCaption>
//                 <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
//                     <TableRow>
//                         <TableHead className="sticky left-0 z-20 bg-muted/80 backdrop-blur-sm w-[100px] p-2 text-sm font-semibold">
//                             Day
//                         </TableHead>
//
//                         <TableHead
//                             key={userProfile?.id}
//                             className="min-w-[160px] p-2 text-left align-top"
//                         >
//                             <div
//                                 className="font-semibold truncate text-sm"
//                                 title={`${userProfile?.firstName} ${userProfile?.lastName}`}
//                             >
//                                 {userProfile?.firstName} {userProfile?.lastName}
//                             </div>
//                             <div className="text-xs text-muted-foreground truncate">
//                                 {userProfile?.jobTitle ||
//                                     userProfile?.role ||
//                                     "User"}
//                             </div>
//                         </TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {weekDays.map((day, dayIndex) => (
//                         <TableRow key={dayIndex} className="border-t">
//                             <TableCell className="sticky left-0 z-0 bg-background/95 backdrop-blur-sm p-2 align-top w-[100px]">
//                                 <div className="font-semibold text-sm">
//                                     {format(day, "EEE")}
//                                 </div>
//                                 <div className="text-xs text-muted-foreground">
//                                     {format(day, "MMM d")}
//                                 </div>
//                             </TableCell>
//                             {userProfile?.length > 0 ? (
//                                 userProfile?.map((user) => {
//                                     const cellKey = `${user.id}-${dayIndex}`;
//                                     const cellAssignments =
//                                         assignmentsMap.get(cellKey) || [];
//                                     return (
//                                         <TableCell
//                                             key={cellKey}
//                                             className="p-1 h-auto align-top min-w-[160px] border-l"
//                                         >
//                                             <div className="space-y-1">
//                                                 {cellAssignments.map(
//                                                     (assignment) => (
//                                                         <ViewOnlyAssignmentCard
//                                                             key={assignment.id}
//                                                             assignment={
//                                                                 assignment
//                                                             }
//                                                             locationsMap={
//                                                                 allOrgLocationsMap
//                                                             }
//                                                         />
//                                                     ),
//                                                 )}
//                                             </div>
//                                         </TableCell>
//                                     );
//                                 })
//                             ) : (
//                                 <TableCell className="p-1 h-auto align-top min-w-[160px] border-l">
//                                     <div className="h-16 flex items-center justify-start pl-2 text-xs text-muted-foreground italic">
//                                         No users assigned
//                                     </div>
//                                 </TableCell>
//                             )}
//                         </TableRow>
//                     ))}
//                 </TableBody>
//             </Table>
//         </div>
//     );
// }

"use client";

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
import { ViewOnlyAssignmentCard } from "@/components/rota/view-only-assignment-card"; // Ensure path is correct
import type { StoredAssignment } from "@/types/rotaTypes";
import type { User } from "@/types/userTypes";
import type { HospLoc } from "@/types/subDepTypes";

interface MobileMyRotaProps {
    weekNumber: number;
    weekDays: Date[];
    userProfile: User | null | undefined; // Expecting a single user object
    assignmentsMap: Map<string, StoredAssignment[]>; // Key: `${userId}-${dayIndex}`
    allOrgLocationsMap: Map<string, HospLoc>;
}

export function MobileMyRota({
    weekNumber, // Pass weekNumber for caption
    weekDays,
    userProfile, // Single user object
    assignmentsMap,
    allOrgLocationsMap,
}: MobileMyRotaProps) {
    // Don't render if user profile isn't loaded
    if (!userProfile) {
        return (
            <div className="w-full p-4 text-center text-muted-foreground italic">
                Loading user information...
            </div>
        );
    }

    return (
        <div className="w-full border rounded-md">
            {" "}
            {/* Removed overflow-x-auto as it's less needed now */}
            <Table className="w-full border-collapse">
                <TableCaption className="mt-4 mb-2 text-xs">
                    Your Rota for Week {weekNumber}
                </TableCaption>
                <TableHeader className="bg-muted/80">
                    <TableRow>
                        {/* Day Header */}
                        <TableHead className="p-2 text-sm font-semibold">
                            Day
                        </TableHead>
                        {/* User Header (Single Column) */}
                        <TableHead
                            key={userProfile.id}
                            className="p-2 text-left align-top"
                        >
                            <div
                                className="font-semibold truncate text-sm"
                                title={`${userProfile.firstName} ${userProfile.lastName}`}
                            >
                                {userProfile.firstName} {userProfile.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {userProfile.jobTitle ||
                                    userProfile.role ||
                                    "User"}
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Map through days to create rows */}
                    {weekDays.map((day, dayIndex) => {
                        // Construct the key to look up assignments for THIS user on THIS day
                        const cellKey = `${userProfile.id}-${dayIndex}`;
                        const cellAssignments =
                            assignmentsMap.get(cellKey) || []; // Get assignments for the cell

                        return (
                            <TableRow key={dayIndex} className="border-t">
                                {/* Sticky Day Cell */}
                                <TableCell className="bg-background/95 p-2 align-top font-medium">
                                    <div className="text-sm">
                                        {format(day, "EEE")}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(day, "MMM d")}
                                    </div>
                                </TableCell>
                                {/* Assignment Cell (Single Column for the user) */}
                                <TableCell className="p-1 h-auto align-top border-l">
                                    <div className="space-y-1 min-h-[4rem]">
                                        {" "}
                                        {/* Add min-height for empty cells */}
                                        {cellAssignments.length === 0 ? (
                                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground italic">
                                                No Assignment
                                            </div>
                                        ) : (
                                            cellAssignments.map(
                                                (assignment) => (
                                                    <ViewOnlyAssignmentCard
                                                        key={assignment.id}
                                                        assignment={assignment}
                                                        locationsMap={
                                                            allOrgLocationsMap
                                                        }
                                                    />
                                                ),
                                            )
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
