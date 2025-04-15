// // src/components/rota/user-row.tsx
// "use client";
//
// import type React from "react";
// import { TableRow, TableCell } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { ArrowUp, ArrowDown, X, Plus } from "lucide-react";
// import type { StoredAssignment, Assignment } from "@/types/rotaTypes";
// import type { User } from "@/types/userTypes";
// import type { HospLoc } from "@/types/subDepTypes";
// import { AssignmentCard } from "./assignment-card";
//
// // --- Component Props Interface ---
// interface UserRowProps {
//     user: User;
//     weekDays: Date[];
//     weekId: string;
//     teamId: string;
//     isUnassigned: boolean;
//     activeUserIds: string[]; // Needed for disabling move buttons
//     allAvailableLocations: HospLoc[];
//     getCellAssignments: (
//         userId: string,
//         dayIndex: number,
//         currentWeekId: string,
//     ) => StoredAssignment[];
//     moveUserUp: (userId: string) => void;
//     moveUserDown: (userId: string) => void;
//     removeUser: (userId: string) => void;
//     addAssignment: (
//         userId: string,
//         dayIndex: number,
//         currentWeekId: string,
//     ) => void;
//     // Prop names match what AssignmentCard expects
//     onUpdateAssignment: (
//         userId: string,
//         dayIndex: number,
//         currentWeekId: string,
//         assignmentId: string,
//         data: Partial<Assignment>,
//     ) => void;
//     onRemoveAssignment: (
//         userId: string,
//         dayIndex: number,
//         currentWeekId: string,
//         assignmentId: string,
//     ) => void;
//     onAddCustomLocation: (name: string) => void;
//     onContextMenu: (
//         e: React.MouseEvent,
//         userId: string,
//         dayIndex: number,
//         assignmentId: string,
//     ) => void;
// }
//
// export function UserRow({
//     user,
//     weekDays,
//     weekId,
//     isUnassigned,
//     activeUserIds,
//     allAvailableLocations,
//     getCellAssignments,
//     moveUserUp,
//     moveUserDown,
//     removeUser,
//     addAssignment,
//     onUpdateAssignment,
//     onRemoveAssignment,
//     onAddCustomLocation,
//     onContextMenu,
// }: UserRowProps) {
//     const isFirstUser = activeUserIds.indexOf(user.id) === 0;
//     const isLastUser =
//         activeUserIds.indexOf(user.id) === activeUserIds.length - 1;
//     return (
//         <>
//             {/* --- Desktop View (Medium screens and up) --- */}
//             <TableRow
//                 key={`${user.id}-desktop`}
//                 className={`hidden md:table-row ${isUnassigned ? "bg-amber-50 hover:bg-amber-100" : ""}`}
//             >
//                 {/* Staff Info Cell (Desktop) */}
//                 <TableCell
//                     className={`sticky left-0 z-10 bg-background p-1 align-top w-[220px] font-medium ${isUnassigned ? "border-l-4 border-amber-400" : ""}`}
//                 >
//                     <div className="flex justify-between items-start h-full">
//                         {/* Changed to items-start */}
//                         <div className="flex items-start gap-1">
//                             {/* Reordering Buttons (Desktop) */}
//                             <div className="flex flex-col items-center pt-1">
//                                 <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-5 w-5"
//                                     onClick={() => moveUserUp(user.id)}
//                                     disabled={isFirstUser}
//                                     aria-label={`Move ${user.firstName} up`}
//                                 >
//                                     <ArrowUp className="h-3 w-3" />
//                                 </Button>
//                                 <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-5 w-5"
//                                     onClick={() => moveUserDown(user.id)}
//                                     disabled={isLastUser}
//                                     aria-label={`Move ${user.firstName} down`}
//                                 >
//                                     <ArrowDown className="h-3 w-3" />
//                                 </Button>
//                             </div>
//                             {/* User Name/Role (Desktop) */}
//                             <div className="overflow-hidden flex-grow pt-1">
//                                 <div
//                                     className="font-semibold truncate text-sm leading-tight"
//                                     title={`${user.firstName} ${user.lastName}`}
//                                 >
//                                     {user.firstName} {user.lastName}
//                                 </div>
//                                 <div className="text-xs text-muted-foreground truncate">
//                                     {user.jobTitle || user.role || "User"}
//                                 </div>
//                                 {isUnassigned && (
//                                     <span className="mt-1 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full inline-block">
//                                         Unassigned
//                                     </span>
//                                 )}
//                             </div>
//                         </div>
//                         {/* Remove User Button (Desktop) */}
//                         <div className="pt-1">
//                             <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="h-6 w-6 opacity-50 hover:opacity-100 flex-shrink-0"
//                                 onClick={() => removeUser(user.id)}
//                                 aria-label={`Remove ${user.firstName}`}
//                             >
//                                 <X className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     </div>
//                 </TableCell>
//
//                 {/* Assignment Cells (Desktop) */}
//                 {weekDays.map((_, dayIndex) => {
//                     const cellAssignments = getCellAssignments(
//                         user.id,
//                         dayIndex,
//                         weekId,
//                     );
//                     const isEmpty = cellAssignments.length === 0;
//                     return (
//                         <TableCell
//                             key={`${user.id}-${dayIndex}-desktop`}
//                             className="p-1 h-auto align-top min-w-[130px] border-l"
//                         >
//                             <div className="space-y-1">
//                                 {cellAssignments.map((assignment) => (
//                                     <AssignmentCard
//                                         key={assignment.id}
//                                         assignment={assignment}
//                                         allLocations={allAvailableLocations}
//                                         userId={user.id} // Pass userId here, maybe rename prop in AssignmentCard?
//                                         dayIndex={dayIndex}
//                                         weekId={weekId}
//                                         onUpdate={onUpdateAssignment} // Pass down the correctly named prop
//                                         onRemove={onRemoveAssignment} // Pass down the correctly named prop
//                                         onAddCustomLocation={
//                                             onAddCustomLocation
//                                         }
//                                         onContextMenu={onContextMenu}
//                                     />
//                                 ))}
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className={`w-full h-7 text-xs mt-1 ${isEmpty ? "border-dashed" : ""}`}
//                                     onClick={() =>
//                                         addAssignment(user.id, dayIndex, weekId)
//                                     }
//                                 >
//                                     <Plus className="h-3 w-3 mr-1" /> Assign
//                                 </Button>
//                             </div>
//                         </TableCell>
//                     );
//                 })}
//             </TableRow>
//         </>
//     );
// }

// src/components/rota/user-row.tsx
"use client";

import type React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, X, Plus } from "lucide-react"; // Removed unused Chevron icons
import type { StoredAssignment, Assignment } from "@/types/rotaTypes";
import type { User } from "@/types/userTypes";
import type { HospLoc } from "@/types/subDepTypes";
import { AssignmentCard } from "./assignment-card";
// Removed unused 'format' import from date-fns if not used elsewhere in this file

// --- Component Props Interface --- (Keep as is)
interface UserRowProps {
    user: User;
    weekDays: Date[];
    weekId: string;
    teamId: string;
    isUnassigned: boolean;
    activeUserIds: string[];
    allAvailableLocations: HospLoc[];
    getCellAssignments: (
        userId: string,
        dayIndex: number,
        currentWeekId: string,
    ) => StoredAssignment[];
    moveUserUp: (userId: string) => void;
    moveUserDown: (userId: string) => void;
    removeUser: (userId: string) => void;
    addAssignment: (
        userId: string,
        dayIndex: number,
        currentWeekId: string,
    ) => void;
    onUpdateAssignment: (
        userId: string,
        dayIndex: number,
        currentWeekId: string,
        assignmentId: string,
        data: Partial<Assignment>,
    ) => void;
    onRemoveAssignment: (
        userId: string,
        dayIndex: number,
        currentWeekId: string,
        assignmentId: string,
    ) => void;
    onAddCustomLocation: (name: string) => void;
    onContextMenu: (
        e: React.MouseEvent,
        userId: string,
        dayIndex: number,
        assignmentId: string,
    ) => void;
}

export function UserRow({
    user,
    weekDays,
    weekId,
    isUnassigned,
    activeUserIds,
    allAvailableLocations,
    getCellAssignments,
    moveUserUp,
    moveUserDown,
    removeUser,
    addAssignment,
    onUpdateAssignment,
    onRemoveAssignment,
    onAddCustomLocation,
    onContextMenu,
}: UserRowProps) {
    const isFirstUser = activeUserIds.indexOf(user.id) === 0;
    const isLastUser =
        activeUserIds.indexOf(user.id) === activeUserIds.length - 1;

    // --- Return only the TableRow structure ---
    // REMOVED Fragment (<>) and REMOVED 'hidden md:table-row' from TableRow className
    return (
        <TableRow
            key={user.id} // Use the user id directly as key
            className={`${isUnassigned ? "bg-amber-50 hover:bg-amber-100" : ""}`} // No hiding classes here
        >
            {/* Staff Info Cell - Make Sticky */}
            <TableCell
                className={`bg-background p-1 align-top w-[220px] font-medium ${isUnassigned ? "border-l-4 border-amber-400" : ""}`}
            >
                {/* Keep the well-organized layout for the user cell */}
                <div className="flex justify-between items-start h-full">
                    <div className="flex items-start gap-1">
                        {/* Reordering Buttons */}
                        <div className="flex flex-col items-center pt-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveUserUp(user.id)}
                                disabled={isFirstUser}
                                aria-label={`Move ${user.firstName} up`}
                            >
                                <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveUserDown(user.id)}
                                disabled={isLastUser}
                                aria-label={`Move ${user.firstName} down`}
                            >
                                <ArrowDown className="h-3 w-3" />
                            </Button>
                        </div>
                        {/* User Name/Role */}
                        <div className="overflow-hidden flex-grow pt-1">
                            <div
                                className="font-semibold truncate text-sm leading-tight"
                                title={`${user.firstName} ${user.lastName}`}
                            >
                                {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {user.jobTitle || user.role || "User"}
                            </div>
                            {isUnassigned && (
                                <span className="mt-1 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full inline-block">
                                    Unassigned
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Remove User Button */}
                    <div className="pt-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-50 hover:opacity-100 flex-shrink-0"
                            onClick={() => removeUser(user.id)}
                            aria-label={`Remove ${user.firstName}`}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </TableCell>

            {/* Assignment Cells */}
            {weekDays.map((_, dayIndex) => {
                const cellAssignments = getCellAssignments(
                    user.id,
                    dayIndex,
                    weekId,
                );
                const isEmpty = cellAssignments.length === 0;
                return (
                    <TableCell
                        key={`${user.id}-${dayIndex}`} // Unique key per cell
                        // Ensure minimum width and add border
                        className="p-1 h-auto align-top min-w-[130px] border-l"
                    >
                        <div className="space-y-1">
                            {cellAssignments.map((assignment) => (
                                <AssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    allLocations={allAvailableLocations}
                                    userId={user.id}
                                    dayIndex={dayIndex}
                                    weekId={weekId}
                                    onUpdate={onUpdateAssignment}
                                    onRemove={onRemoveAssignment}
                                    onAddCustomLocation={onAddCustomLocation}
                                    onContextMenu={onContextMenu}
                                />
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                className={`w-full h-7 text-xs mt-1 ${isEmpty ? "border-dashed" : ""}`}
                                onClick={() =>
                                    addAssignment(user.id, dayIndex, weekId)
                                }
                            >
                                <Plus className="h-3 w-3 mr-1" /> Assign
                            </Button>
                        </div>
                    </TableCell>
                );
            })}
        </TableRow>
    );
}
