// src/components/common/DeleteConfirmationDialog.tsx

"use client"; // Add this directive if needed for your project setup

import React, { useState, useMemo, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Adjust path if needed
import { Input } from "@/components/ui/input"; // Adjust path if needed
import { Label } from "@/components/ui/label"; // Adjust path if needed
import { Checkbox } from "@/components/ui/checkbox"; // Adjust path if needed
import { buttonVariants } from "@/components/ui/button"; // Adjust path if needed
import { LoadingSpinner } from "@/components/ui/loadingSpinner"; // Adjust path if needed
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils"; // Adjust path if needed

interface DeleteConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemName: string; // The exact name to type for confirmation
    itemType: string; // e.g., "hospital", "ward", "user" - used in text
    onConfirm: () => void; // Function to call when deletion is confirmed
    isPending: boolean; // Is the delete action currently running?
}

export const DeleteConfirmationDialog: React.FC<
    DeleteConfirmationDialogProps
> = ({ open, onOpenChange, itemName, itemType, onConfirm, isPending }) => {
    const [confirmationInput, setConfirmationInput] = useState("");
    // State for checkboxes
    const [ackChecks, setAckChecks] = useState({
        understandConsequences: false,
        actionIrreversible: false,
    });

    // Reset input and checkboxes when the dialog opens or the item changes
    useEffect(() => {
        if (open) {
            setConfirmationInput("");
            // Reset checkboxes
            setAckChecks({
                understandConsequences: false,
                actionIrreversible: false,
            });
        }
    }, [open, itemName]); // Depend on itemName in case the target changes while open

    // Check if typed input matches the required name
    const isConfirmationMatching = useMemo(() => {
        if (!itemName) return false;
        return (
            confirmationInput.trim().toLowerCase() ===
            itemName.trim().toLowerCase()
        );
    }, [confirmationInput, itemName]);

    // Check if all required acknowledgments are met
    const allChecksMet = useMemo(() => {
        return ackChecks.understandConsequences && ackChecks.actionIrreversible;
    }, [ackChecks]);

    // Handle Cancel button click
    const handleCancel = () => {
        onOpenChange(false); // Request closing
    };

    // Handle Confirm button click - only proceeds if conditions met
    const handleConfirm = () => {
        // Check all conditions before calling the parent's confirm function
        if (isConfirmationMatching && allChecksMet && !isPending) {
            onConfirm();
        }
    };

    // Prevent rendering if itemName is not available yet (avoids flicker)
    // Ideally, the parent component ensures itemName is valid before setting open=true
    if (!itemName && open) {
        return null;
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="text-destructive" /> Confirm
                        Permanent Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action is irreversible and will permanently delete
                        the {itemType}:{" "}
                        <strong className="text-foreground">{itemName}</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Warning Section */}
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive-foreground">
                    <p className="font-semibold">Warning:</p>
                    <ul className="list-disc list-inside ml-2 mt-1">
                        <li>All associated data may be affected.</li>
                        <li>This action cannot be undone.</li>
                    </ul>
                </div>

                {/* Confirmation Input Section */}
                <div className="mt-4 space-y-2">
                    <Label htmlFor="deleteConfirmInput">
                        To confirm, please type the {itemType} name:{" "}
                        <strong className="text-primary">{itemName}</strong>
                    </Label>
                    <Input
                        id="deleteConfirmInput"
                        value={confirmationInput}
                        onChange={(e) => setConfirmationInput(e.target.value)}
                        placeholder={itemName || ""}
                        className="border-border focus-visible:ring-destructive"
                        disabled={isPending}
                        autoComplete="off" // Prevent browser autocomplete suggesting the name
                    />
                    {/* Show mismatch warning only if user has started typing */}
                    {!isConfirmationMatching &&
                        confirmationInput.length > 0 && (
                            <p className="text-xs text-destructive">
                                Input does not match the {itemType} name.
                            </p>
                        )}
                </div>

                {/* Checkbox Acknowledgment Section */}
                <div className="mt-4 space-y-3 border-t pt-4">
                    <p className="text-sm font-medium text-foreground">
                        Please acknowledge the following:
                    </p>
                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="ackConsequences"
                            checked={ackChecks.understandConsequences}
                            onCheckedChange={(checked) =>
                                setAckChecks((prev) => ({
                                    ...prev,
                                    understandConsequences: !!checked, // Ensure boolean value
                                }))
                            }
                            disabled={isPending}
                            aria-label={`Acknowledge understanding consequences of deleting ${itemType}`}
                        />
                        <Label
                            htmlFor="ackConsequences"
                            className="text-sm font-normal leading-snug text-muted-foreground cursor-pointer"
                        >
                            I understand that deleting this {itemType} may
                            impact associated data and operations.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="ackIrreversible"
                            checked={ackChecks.actionIrreversible}
                            onCheckedChange={(checked) =>
                                setAckChecks((prev) => ({
                                    ...prev,
                                    actionIrreversible: !!checked, // Ensure boolean value
                                }))
                            }
                            disabled={isPending}
                            aria-label="Acknowledge that this deletion action is irreversible"
                        />
                        <Label
                            htmlFor="ackIrreversible"
                            className="text-sm font-normal leading-snug text-muted-foreground cursor-pointer"
                        >
                            I acknowledge that this action is permanent and
                            cannot be undone.
                        </Label>
                    </div>
                </div>

                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel
                        onClick={handleCancel}
                        disabled={isPending}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        // Button is disabled if name doesn't match OR checks aren't met OR deletion is pending
                        disabled={
                            !isConfirmationMatching ||
                            !allChecksMet ||
                            isPending
                        }
                        className={cn(
                            buttonVariants({ variant: "destructive" }),
                            // Apply disabled styles visually
                            (!isConfirmationMatching ||
                                !allChecksMet ||
                                isPending) &&
                                "opacity-50 cursor-not-allowed", // Example disabled style
                        )}
                    >
                        {isPending ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Permanently"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
