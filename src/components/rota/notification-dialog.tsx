// "use client";
//
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
// } from "@/components/ui/dialog";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import type { User } from "@/types/userTypes";
//
// interface NotificationDialogProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     allUsers: User[];
//     onSendNotifications: (userIds: string[]) => void;
// }
//
// export function NotificationDialog({
//     open,
//     onOpenChange,
//     allUsers,
//     onSendNotifications,
// }: NotificationDialogProps) {
//     const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
//
//     // Reset selected staff when dialog opens
//     useEffect(() => {
//         if (open) {
//             setSelectedStaff([]); // All unselected by default
//         }
//     }, [open]);
//
//     const handleToggleStaff = (staffId: string, checked: boolean) => {
//         if (checked) {
//             setSelectedStaff((prev) => [...prev, staffId]);
//         } else {
//             setSelectedStaff((prev) => prev.filter((id) => id !== staffId));
//         }
//     };
//
//     const handleToggleAll = (checked: boolean) => {
//         if (checked) {
//             setSelectedStaff(allUsers.map((staff) => staff.id));
//         } else {
//             setSelectedStaff([]);
//         }
//     };
//
//     const handleSend = () => {
//         onSendNotifications(selectedStaff);
//         onOpenChange(false);
//     };
//
//     const allSelected =
//         selectedStaff.length === allUsers.length && allUsers.length > 0;
//
//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent className="max-w-md">
//                 <DialogHeader>
//                     <DialogTitle>Send Notifications</DialogTitle>
//                     <DialogDescription>
//                         Select staff members to notify about their schedule.
//                     </DialogDescription>
//                 </DialogHeader>
//
//                 <div className="py-4">
//                     <div className="flex items-center space-x-2 mb-4">
//                         <Checkbox
//                             id="select-all"
//                             checked={allSelected}
//                             onCheckedChange={(checked) =>
//                                 handleToggleAll(checked as boolean)
//                             }
//                         />
//                         <label
//                             htmlFor="select-all"
//                             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                         >
//                             Select all staff
//                         </label>
//                     </div>
//
//                     <div className="text-sm font-medium mb-2">
//                         Staff members:
//                     </div>
//                     <ScrollArea className="h-[200px] border rounded-md p-2">
//                         <div className="space-y-2">
//                             {allUsers.map((staff) => (
//                                 <div
//                                     key={staff.id}
//                                     className="flex items-center space-x-2"
//                                 >
//                                     <Checkbox
//                                         id={`staff-${staff.id}`}
//                                         checked={selectedStaff.includes(
//                                             staff.id,
//                                         )}
//                                         onCheckedChange={(checked) =>
//                                             handleToggleStaff(
//                                                 staff.id,
//                                                 checked as boolean,
//                                             )
//                                         }
//                                     />
//                                     <label
//                                         htmlFor={`staff-${staff.id}`}
//                                         className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                                     >
//                                         <div>
//                                             {staff.firstName} {staff.lastName}
//                                         </div>
//                                         <div className="text-xs text-muted-foreground">
//                                             {staff.role}
//                                         </div>
//                                     </label>
//                                 </div>
//                             ))}
//                             {allUsers.length === 0 && (
//                                 <div className="text-center py-4 text-muted-foreground">
//                                     No staff members available
//                                 </div>
//                             )}
//                         </div>
//                     </ScrollArea>
//                 </div>
//
//                 <DialogFooter>
//                     <Button
//                         variant="outline"
//                         onClick={() => onOpenChange(false)}
//                     >
//                         Cancel
//                     </Button>
//                     <Button
//                         onClick={handleSend}
//                         disabled={selectedStaff.length === 0}
//                     >
//                         Send Notifications
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// }

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Import Input
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User } from "@/types/userTypes";

interface NotificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allUsers: User[];
    onSendNotifications: (userIds: string[]) => void;
}

export function NotificationDialog({
    open,
    onOpenChange,
    allUsers,
    onSendNotifications,
}: NotificationDialogProps) {
    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setSelectedStaff([]);
            setSearchTerm("");
        }
    }, [open]);

    // Filter users based on search term
    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return allUsers;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return allUsers.filter(
            (user) =>
                user.firstName?.toLowerCase().includes(lowerCaseSearch) ||
                user.lastName?.toLowerCase().includes(lowerCaseSearch) ||
                `${user.firstName} ${user.lastName}`
                    .toLowerCase()
                    .includes(lowerCaseSearch),
        );
    }, [allUsers, searchTerm]);

    // Toggle individual staff selection
    const handleToggleStaff = (staffId: string, checked: boolean) => {
        setSelectedStaff((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(staffId);
            } else {
                newSet.delete(staffId);
            }
            return Array.from(newSet);
        });
    };

    // Determine the state of the "Select All" checkbox based on filtered users
    const filteredUserIds = useMemo(
        () => new Set(filteredUsers.map((u) => u.id)),
        [filteredUsers],
    );
    const selectedFilteredCount = useMemo(
        () => selectedStaff.filter((id) => filteredUserIds.has(id)).length,
        [selectedStaff, filteredUserIds],
    );

    const selectAllCheckedState = useMemo(() => {
        if (filteredUsers.length === 0) return false;
        if (selectedFilteredCount === filteredUsers.length) return true;
        if (selectedFilteredCount > 0) return "indeterminate";
        return false;
    }, [selectedFilteredCount, filteredUsers.length]);

    // Toggle all *filtered* staff
    const handleToggleAllFiltered = (checked: boolean | "indeterminate") => {
        setSelectedStaff((prev) => {
            const newSet = new Set(prev);
            const idsToToggle = filteredUsers.map((user) => user.id);

            if (checked === true) {
                // Selecting all filtered
                idsToToggle.forEach((id) => newSet.add(id));
            } else {
                // Deselecting all filtered (when checked is false or indeterminate -> false)
                idsToToggle.forEach((id) => newSet.delete(id));
            }
            return Array.from(newSet);
        });
    };

    const handleSend = () => {
        onSendNotifications(selectedStaff);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Send Notifications</DialogTitle>
                    <DialogDescription>
                        Select staff members to notify about their schedule.
                    </DialogDescription>
                </DialogHeader>

                {/* Search Input */}
                <div className="py-2">
                    <Input
                        placeholder="Search staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="pb-4 pt-2">
                    {/* Select All (filtered) Checkbox */}
                    <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                            id="select-all-filtered"
                            checked={selectAllCheckedState}
                            onCheckedChange={(checkedState) =>
                                handleToggleAllFiltered(
                                    checkedState as boolean | "indeterminate",
                                )
                            }
                            aria-label="Select all currently filtered staff"
                        />
                        <label
                            htmlFor="select-all-filtered"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Select all ({filteredUsers.length} matching)
                        </label>
                    </div>

                    <div className="text-sm font-medium mb-2">
                        Staff members:
                    </div>
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                        <div className="space-y-2">
                            {filteredUsers.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`staff-${staff.id}`}
                                        checked={selectedStaff.includes(
                                            staff.id,
                                        )}
                                        onCheckedChange={(checked) =>
                                            handleToggleStaff(
                                                staff.id,
                                                checked as boolean,
                                            )
                                        }
                                        aria-labelledby={`staff-label-${staff.id}`}
                                    />
                                    <label
                                        id={`staff-label-${staff.id}`}
                                        htmlFor={`staff-${staff.id}`}
                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow"
                                    >
                                        <div>
                                            {staff.firstName} {staff.lastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {staff.role ||
                                                staff.jobTitle ||
                                                "User"}
                                        </div>
                                    </label>
                                </div>
                            ))}
                            {allUsers.length > 0 &&
                                filteredUsers.length === 0 && (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No staff members match your search.
                                    </div>
                                )}
                            {allUsers.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground">
                                    No staff members available.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={selectedStaff.length === 0}
                    >
                        Send Notifications ({selectedStaff.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
