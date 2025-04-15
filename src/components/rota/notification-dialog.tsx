"use client";

import { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User } from "@/types/userTypes";

interface NotificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allUsers: User[];
    onSendNotifications: (staffIds: string[]) => void;
}

export function NotificationDialog({
    open,
    onOpenChange,
    allUsers,
    onSendNotifications,
}: NotificationDialogProps) {
    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

    // Reset selected staff when dialog opens
    useEffect(() => {
        if (open) {
            setSelectedStaff([]); // All unselected by default
        }
    }, [open]);

    const handleToggleStaff = (staffId: string, checked: boolean) => {
        if (checked) {
            setSelectedStaff((prev) => [...prev, staffId]);
        } else {
            setSelectedStaff((prev) => prev.filter((id) => id !== staffId));
        }
    };

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedStaff(allUsers.map((staff) => staff.id));
        } else {
            setSelectedStaff([]);
        }
    };

    const handleSend = () => {
        onSendNotifications(selectedStaff);
        onOpenChange(false);
    };

    const allSelected =
        selectedStaff.length === allUsers.length && allUsers.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Send Notifications</DialogTitle>
                    <DialogDescription>
                        Select staff members to notify about their schedule.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                            id="select-all"
                            checked={allSelected}
                            onCheckedChange={(checked) =>
                                handleToggleAll(checked as boolean)
                            }
                        />
                        <label
                            htmlFor="select-all"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Select all staff
                        </label>
                    </div>

                    <div className="text-sm font-medium mb-2">
                        Staff members:
                    </div>
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                        <div className="space-y-2">
                            {allUsers.map((staff) => (
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
                                    />
                                    <label
                                        htmlFor={`staff-${staff.id}`}
                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        <div>
                                            {staff.firstName} {staff.lastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {staff.role}
                                        </div>
                                    </label>
                                </div>
                            ))}
                            {allUsers.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground">
                                    No staff members available
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
                        Send Notifications
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
