"use client";

import React, { useEffect } from "react";
import { UserTeamAss } from "@/types/userTypes";
import { useUpdateUserTeamAssignmentDates } from "@/hooks/admin/useUserTeamAss";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatDateNoTime } from "@/lib/utils"; // Assuming formatDate exists

// Schema for the date editing form
const dateFormSchema = z
    .object({
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
        isEndDateOngoing: z.boolean(),
    })
    .refine((data) => !data.endDate || !data.isEndDateOngoing, {
        // Cannot have both end date and ongoing checked
        message: "End date must be empty if 'Ongoing' is checked.",
        path: ["isEndDateOngoing"], // Attach error to the checkbox
    })
    .refine(
        (data) =>
            !data.startDate || !data.endDate || data.endDate >= data.startDate,
        {
            message: "End date must be on or after the start date.",
            path: ["endDate"],
        },
    );

type DateFormValues = z.infer<typeof dateFormSchema>;

interface EditUserTeamAssignmentDatesDialogProps {
    assignment: UserTeamAss | null; // The assignment being edited
    userName: string;
    teamName: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void; // Optional callback on successful update
}

export function EditUserTeamAssignmentDatesDialog({
    assignment,
    userName,
    teamName,
    isOpen,
    onOpenChange,
    onSuccess,
}: EditUserTeamAssignmentDatesDialogProps) {
    const { mutate: updateDates, isPending: isUpdating } =
        useUpdateUserTeamAssignmentDates();

    const form = useForm<DateFormValues>({
        resolver: zodResolver(dateFormSchema),
        defaultValues: {
            startDate: null,
            endDate: null,
            isEndDateOngoing: true, // Default to ongoing
        },
    });

    const isEndDateOngoing = form.watch("isEndDateOngoing");

    // Reset form when assignment changes or dialog opens
    useEffect(() => {
        if (assignment && isOpen) {
            const initialStartDate = assignment.startDate?.toDate() ?? null;
            const initialEndDate = assignment.endDate?.toDate() ?? null;
            form.reset({
                startDate: initialStartDate,
                endDate: initialEndDate,
                isEndDateOngoing: initialEndDate === null, // Check if initially ongoing
            });
        } else {
            // Reset fully if no assignment or dialog closes
            form.reset({
                startDate: null,
                endDate: null,
                isEndDateOngoing: true,
            });
        }
    }, [assignment, isOpen, form]);

    // Handle "Ongoing" checkbox changes
    const handleOngoingChange = (checked: boolean) => {
        form.setValue("isEndDateOngoing", checked);
        if (checked) {
            form.setValue("endDate", null); // Clear end date if ongoing
        }
        // Trigger validation after programmatic change
        void form.trigger(["endDate", "isEndDateOngoing"]);
    };

    const onSubmit = (values: DateFormValues) => {
        if (!assignment) return;

        const finalEndDate = values.isEndDateOngoing ? null : values.endDate;

        updateDates(
            {
                id: assignment.id,
                startDate: values.startDate,
                endDate: finalEndDate,
                updatedBy: "system",
                userId: assignment.userId,
                teamId: assignment.teamId,
            },
            {
                onSuccess: () => {
                    toast.success(`Updated assignment dates for ${userName}.`);
                    onOpenChange(false); // Close dialog
                    if (onSuccess) onSuccess();
                },
                onError: (error) => {
                    toast.error(`Update failed: ${error.message}`);
                },
            },
        );
    };

    // Prevent closing if no assignment (shouldn't happen with state logic)
    if (!assignment && isOpen) {
        console.error("Edit dates dialog opened without an assignment!");
        onOpenChange(false); // Force close
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Assignment Dates</DialogTitle>
                    <DialogDescription>
                        Set start/end dates for {userName}&#39;s assignment to
                        Team {teamName}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-5 py-4"
                    >
                        {/* Start Date */}
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Start Date (Optional)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "pl-3 text-left font-normal",
                                                        !field.value &&
                                                            "text-muted-foreground",
                                                    )}
                                                >
                                                    {field.value ? (
                                                        formatDateNoTime(
                                                            field.value,
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    field.value ?? undefined
                                                } // Pass undefined if null
                                                onSelect={(date) =>
                                                    field.onChange(date ?? null)
                                                } // Handle undefined from picker
                                                // disabled={(date) => date < new Date("1900-01-01")} // Optional constraints
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* End Date */}
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>End Date (Optional)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "pl-3 text-left font-normal",
                                                        !field.value &&
                                                            "text-muted-foreground",
                                                        // Disable if 'Ongoing' is checked
                                                        form.getValues(
                                                            "isEndDateOngoing",
                                                        ) &&
                                                            "opacity-50 cursor-not-allowed",
                                                    )}
                                                    disabled={form.getValues(
                                                        "isEndDateOngoing",
                                                    )} // Disable button too
                                                >
                                                    {field.value ? (
                                                        formatDateNoTime(
                                                            field.value,
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    field.value ?? undefined
                                                }
                                                onSelect={(date) =>
                                                    field.onChange(date ?? null)
                                                }
                                                disabled={isEndDateOngoing}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Ongoing Checkbox */}
                        <FormField
                            control={form.control}
                            name="isEndDateOngoing"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            // Use custom handler to clear end date
                                            onCheckedChange={
                                                handleOngoingChange
                                            }
                                            id="ongoing-end-date"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel htmlFor="ongoing-end-date">
                                            {" "}
                                            Assignment is Ongoing{" "}
                                        </FormLabel>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Dates
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
