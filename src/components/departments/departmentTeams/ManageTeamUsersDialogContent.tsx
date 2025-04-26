// "use client";
//
// import React, { useMemo, useState } from "react";
// import { DepTeam } from "@/types/subDepTypes";
// import { User, UserTeamAss } from "@/types/userTypes";
// import { useUserTeamAssignmentsByTeam } from "@/hooks/useUserTeamAss"; // Only need this query hook here
// import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button"; // For Edit button
// import { Edit } from "lucide-react";
// import { AssignUsersPopover } from "./AssignUsersPopover"; // Import the popover
// import { EditUserTeamAssignmentDatesDialog } from "./EditUserTeamAssignmentDatesDialog"; // Import the date edit dialog
// import { formatDateNoTime } from "@/lib/utils";
// import { AlertCircle } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
//
// interface ManageTeamUsersDialogContentProps {
//     team: DepTeam;
//     orgId: string;
//     depId: string;
//     allDepUsers: User[] | undefined;
//     isLoadingOrgUsers: boolean;
// }
//
// export function ManageTeamUsersDialogContent({
//     team,
//     orgId,
//     depId,
//     allDepUsers,
//     isLoadingOrgUsers,
// }: ManageTeamUsersDialogContentProps) {
//     // State for the date editing dialog
//     const [isEditDatesDialogOpen, setIsEditDatesDialogOpen] = useState(false);
//     const [editingAssignment, setEditingAssignment] =
//         useState<UserTeamAss | null>(null);
//     const [editingUserName, setEditingUserName] = useState<string>(""); // Store name for dialog title
//
//     // Fetch assignments specifically for this team
//     const {
//         data: teamUserAssignments,
//         isLoading: isLoadingTeamAssigns,
//         isError: isErrorTeamAssigns,
//         error: errorTeamAssigns,
//     } = useUserTeamAssignmentsByTeam(team.id);
//
//     // Map user IDs to user objects for quick name lookup
//     const depUsersMap = useMemo(() => {
//         if (!allDepUsers) return new Map<string, User>();
//         return new Map(allDepUsers.map((user) => [user.id, user]));
//     }, [allDepUsers]);
//
//     // Handler to open the date editing dialog
//     const handleOpenEditDatesDialog = (assignment: UserTeamAss) => {
//         const user = depUsersMap.get(assignment.userId);
//         setEditingAssignment(assignment);
//         setEditingUserName(
//             user ? `${user.firstName} ${user.lastName}` : "Unknown User",
//         );
//         setIsEditDatesDialogOpen(true);
//     };
//
//     // Combine loading states
//     const isLoading = isLoadingOrgUsers || isLoadingTeamAssigns;
//
//     return (
//         <div className="space-y-6 py-4">
//             {/* Section 1: Assign Users Popover */}
//             <div>
//                 <h4 className="text-sm font-medium mb-2">Assign Users</h4>
//                 <AssignUsersPopover
//                     team={team}
//                     orgId={orgId}
//                     depId={depId}
//                     allDepUsers={allDepUsers}
//                     isLoadingOrgUsers={isLoadingOrgUsers}
//                 />
//                 <p className="text-xs text-muted-foreground mt-1">
//                     Use the popover above to add or remove users from the team.
//                 </p>
//             </div>
//
//             {/* Divider */}
//             <hr className="my-4" />
//
//             {/* Section 2: Currently Assigned Users & Date Editing */}
//             <div>
//                 <h4 className="text-sm font-medium mb-2">
//                     Current Assignments & Dates
//                 </h4>
//                 {isLoading ? (
//                     <div className="space-y-2">
//                         <Skeleton className="h-10 w-full" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                 ) : isErrorTeamAssigns ? (
//                     <Alert variant="destructive" className="my-4">
//                         <AlertCircle className="h-4 w-4" />{" "}
//                         <AlertTitle>Error Loading Assignments</AlertTitle>
//                         <AlertDescription>
//                             {errorTeamAssigns?.message ||
//                                 "Could not load assignments."}
//                         </AlertDescription>
//                     </Alert>
//                 ) : !teamUserAssignments || teamUserAssignments.length === 0 ? (
//                     <p className="text-sm text-center text-muted-foreground py-4">
//                         No users currently assigned via popover above.
//                     </p>
//                 ) : (
//                     <div className="space-y-2">
//                         {teamUserAssignments
//                             .map((ass) => ({
//                                 ...ass,
//                                 user: depUsersMap.get(ass.userId),
//                             })) // Combine assignment with user details
//                             .sort((a, b) =>
//                                 (a.user?.lastName ?? "").localeCompare(
//                                     b.user?.lastName ?? "",
//                                 ),
//                             ) // Sort by user last name
//                             .map((assWithUser) => (
//                                 <div
//                                     key={assWithUser.id}
//                                     className="flex items-center justify-between rounded-md border p-3 gap-2"
//                                 >
//                                     <div className="flex-1 min-w-0">
//                                         {" "}
//                                         {/* Allow text to wrap/truncate */}
//                                         <p className="text-sm font-medium truncate">
//                                             {assWithUser.user
//                                                 ? `${assWithUser.user.firstName} ${assWithUser.user.lastName}`
//                                                 : "Unknown User"}
//                                         </p>
//                                         <p className="text-xs text-muted-foreground">
//                                             {assWithUser.startDate
//                                                 ? `Starts: ${formatDateNoTime(assWithUser.startDate)}`
//                                                 : "Start date not set"}
//                                             <span className="mx-1">|</span>
//                                             {assWithUser.endDate
//                                                 ? `Ends: ${formatDateNoTime(assWithUser.endDate)}`
//                                                 : "Ongoing"}
//                                         </p>
//                                     </div>
//                                     <Button
//                                         variant="ghost"
//                                         size="sm"
//                                         onClick={() =>
//                                             handleOpenEditDatesDialog(
//                                                 assWithUser,
//                                             )
//                                         }
//                                         className="px-2" // Reduce padding
//                                     >
//                                         <Edit className="h-4 w-4" />
//                                         <span className="sr-only">
//                                             Edit dates
//                                         </span>
//                                     </Button>
//                                 </div>
//                             ))}
//                     </div>
//                 )}
//             </div>
//
//             {/* The Date Editing Dialog itself (controlled by state) */}
//             <EditUserTeamAssignmentDatesDialog
//                 assignment={editingAssignment}
//                 userName={editingUserName}
//                 teamName={team.name}
//                 isOpen={isEditDatesDialogOpen}
//                 onOpenChange={setIsEditDatesDialogOpen}
//             />
//         </div>
//     );
// }

"use client";

import React, { useMemo, useState, useEffect } from "react";
// Types
import { DepTeam } from "@/types/subDepTypes"; // Assuming User type location
import { User } from "@/types/userTypes";
// Hooks
import {
    useUserTeamAssignmentsByTeam,
    useUpdateUserTeamAssignmentDates,
} from "@/hooks/admin/useUserTeamAss";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// UI Components
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, CalendarIcon } from "lucide-react";
import { AssignUsersPopover } from "./AssignUsersPopover";
import { formatDate } from "@/lib/utils"; // Use the version WITHOUT time
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- Date Form Schema (Moved inside) ---
const dateFormSchema = z
    .object({
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
        isEndDateOngoing: z.boolean(),
    })
    .refine((data) => !data.endDate || !data.isEndDateOngoing, {
        message: "End date must be empty if 'Ongoing' is checked.",
        path: ["isEndDateOngoing"],
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

// --- Main Component ---
interface ManageTeamUsersDialogContentProps {
    team: DepTeam;
    orgId: string;
    depId: string;
    allDepUsers: User[] | undefined;
    isLoadingDepUsers: boolean;
}

export function ManageTeamUsersDialogContent({
    team,
    orgId,
    depId,
    allDepUsers,
    isLoadingDepUsers,
}: ManageTeamUsersDialogContentProps) {
    // State to track which assignment's edit form is open
    const [editingAssignmentId, setEditingAssignmentId] = useState<
        string | null
    >(null);

    // Fetch assignments for this team
    const {
        data: teamUserAssignments,
        isLoading: isLoadingTeamAssigns,
        isError: isErrorTeamAssigns,
        error: errorTeamAssigns,
    } = useUserTeamAssignmentsByTeam(team.id);

    // Date update mutation hook
    const { mutate: updateDates, isPending: isUpdatingDates } =
        useUpdateUserTeamAssignmentDates();

    // react-hook-form instance for the inline date editor
    const form = useForm<DateFormValues>({
        resolver: zodResolver(dateFormSchema),
        defaultValues: {
            startDate: null,
            endDate: null,
            isEndDateOngoing: true,
        },
    });
    const isEndDateOngoing_watched = form.watch("isEndDateOngoing"); // Watch for reactive disabling

    // Map users for name lookup
    const depUsersMap = useMemo(() => {
        if (!allDepUsers) return new Map<string, User>();
        return new Map(allDepUsers.map((user) => [user.id, user]));
    }, [allDepUsers]);

    // Effect to reset form when the editing target changes
    useEffect(() => {
        if (editingAssignmentId && teamUserAssignments) {
            const assignmentToEdit = teamUserAssignments.find(
                (ass) => ass.id === editingAssignmentId,
            );
            if (assignmentToEdit) {
                const initialStartDate =
                    assignmentToEdit.startDate?.toDate() ?? null;
                const initialEndDate =
                    assignmentToEdit.endDate?.toDate() ?? null;
                form.reset({
                    startDate: initialStartDate,
                    endDate: initialEndDate,
                    isEndDateOngoing: initialEndDate === null,
                });
            } else {
                // Assignment not found? Close editor.
                setEditingAssignmentId(null);
                form.reset({
                    startDate: null,
                    endDate: null,
                    isEndDateOngoing: true,
                });
            }
        } else {
            // No assignment being edited, reset form to defaults
            form.reset({
                startDate: null,
                endDate: null,
                isEndDateOngoing: true,
            });
        }
    }, [editingAssignmentId, teamUserAssignments, form]);

    // Handler to open/close the inline editor for a specific assignment
    const handleToggleEditDates = (assignmentId: string) => {
        setEditingAssignmentId((currentId) =>
            currentId === assignmentId ? null : assignmentId,
        );
    };

    // Handler for the "Ongoing" checkbox within the inline form
    const handleOngoingChange = (checked: boolean) => {
        form.setValue("isEndDateOngoing", checked);
        if (checked) {
            form.setValue("endDate", null);
        }
        void form.trigger(["endDate", "isEndDateOngoing"]);
    };

    // Handler for submitting the inline date form
    const onDateSubmit = (values: DateFormValues) => {
        if (!editingAssignmentId) return; // Should have an ID if form is visible

        // Find the original assignment to get userId/teamId for the hook
        const originalAssignment = teamUserAssignments?.find(
            (ass) => ass.id === editingAssignmentId,
        );
        if (!originalAssignment) {
            toast.error("Could not find assignment data to update.");
            return;
        }

        const finalEndDate = values.isEndDateOngoing ? null : values.endDate;

        updateDates(
            {
                id: editingAssignmentId,
                startDate: values.startDate,
                endDate: finalEndDate,
                updatedBy: "system", // Replace with actual user
                // Pass IDs needed for hook's cache update/invalidation
                userId: originalAssignment.userId,
                teamId: originalAssignment.teamId,
            },
            {
                onSuccess: () => {
                    const user = depUsersMap.get(originalAssignment.userId);
                    const userName = user
                        ? `${user.firstName} ${user.lastName}`
                        : "User";
                    toast.success(`Updated assignment dates for ${userName}.`);
                    setEditingAssignmentId(null); // Close editor on success
                    // No explicit refetch needed, hook updates cache
                },
                onError: (error) => {
                    toast.error(`Update failed: ${error.message}`);
                },
            },
        );
    };

    // Combine loading states
    const isLoading = isLoadingDepUsers || isLoadingTeamAssigns;

    return (
        <div className="space-y-6 py-4">
            {/* Section 1: Assign Users Popover (No Change) */}
            <div>
                <h4 className="text-sm font-medium mb-2">Assign Users</h4>
                <AssignUsersPopover
                    team={team}
                    orgId={orgId}
                    depId={depId}
                    allDepUsers={allDepUsers}
                    isLoadingOrgUsers={isLoadingDepUsers}
                />
                <p className="text-xs text-muted-foreground mt-1">
                    {" "}
                    Use the popover above to add or remove users from the
                    team.{" "}
                </p>
            </div>

            <hr className="my-4" />

            {/* Section 2: Currently Assigned Users & Inline Date Editing */}
            <div>
                <h4 className="text-sm font-medium mb-2">
                    Current Assignments & Dates
                </h4>
                {/* Loading/Error/Empty States */}
                {isLoading && !teamUserAssignments ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                ) : isErrorTeamAssigns ? (
                    <Alert variant="destructive" className="my-4">
                        <AlertCircle className="h-4 w-4" />{" "}
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {errorTeamAssigns?.message ||
                                "Could not load assignments."}
                        </AlertDescription>
                    </Alert>
                ) : !teamUserAssignments || teamUserAssignments.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-4">
                        No users currently assigned.
                    </p>
                ) : (
                    // Render List of Assigned Users
                    <div className="space-y-2">
                        {teamUserAssignments
                            .map((ass) => ({
                                ...ass,
                                user: depUsersMap.get(ass.userId),
                            }))
                            .sort(
                                (a, b) =>
                                    (a.user?.lastName ?? "").localeCompare(
                                        b.user?.lastName ?? "",
                                    ) ||
                                    (a.user?.firstName ?? "").localeCompare(
                                        b.user?.firstName ?? "",
                                    ),
                            )
                            .map((assWithUser) => (
                                <div
                                    key={assWithUser.id}
                                    className="rounded-md border"
                                >
                                    {" "}
                                    {/* Wrap each item */}
                                    {/* User Info Row */}
                                    <div className="flex items-center justify-between p-3 gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-sm font-medium truncate"
                                                title={
                                                    assWithUser.user?.email ??
                                                    ""
                                                }
                                            >
                                                {assWithUser.user
                                                    ? `${assWithUser.user.firstName} ${assWithUser.user.lastName}`
                                                    : `Unknown User (ID: ${assWithUser.userId.substring(0, 6)}...)`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {assWithUser.startDate
                                                    ? `Starts: ${formatDate(assWithUser.startDate)}`
                                                    : "Start date not set"}
                                                <span className="mx-1">|</span>
                                                {assWithUser.endDate
                                                    ? `Ends: ${formatDate(assWithUser.endDate)}`
                                                    : "Ongoing"}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleToggleEditDates(
                                                    assWithUser.id,
                                                )
                                            }
                                            className={cn(
                                                "h-8 w-8 flex-shrink-0",
                                                // Indicate if editor is open for this item
                                                editingAssignmentId ===
                                                    assWithUser.id &&
                                                    "bg-muted",
                                            )}
                                            aria-label={`Edit dates for ${assWithUser.user ? `${assWithUser.user.firstName} ${assWithUser.user.lastName}` : "Unknown User"}`}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {/* --- Inline Date Editor (Conditionally Rendered) --- */}
                                    {editingAssignmentId === assWithUser.id && (
                                        <div className="border-t p-4 bg-muted/50">
                                            <Form {...form}>
                                                <form
                                                    onSubmit={form.handleSubmit(
                                                        onDateSubmit,
                                                    )}
                                                    className="space-y-4"
                                                >
                                                    {/* Start Date Field */}
                                                    <FormField
                                                        control={form.control}
                                                        name="startDate"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                {" "}
                                                                <FormLabel className="text-xs">
                                                                    Start Date
                                                                </FormLabel>
                                                                <Popover>
                                                                    <PopoverTrigger
                                                                        asChild
                                                                    >
                                                                        <FormControl>
                                                                            <Button
                                                                                variant={
                                                                                    "outline"
                                                                                }
                                                                                size="sm"
                                                                                className={cn(
                                                                                    "w-full justify-start text-left font-normal h-9",
                                                                                    !field.value &&
                                                                                        "text-muted-foreground",
                                                                                )}
                                                                            >
                                                                                <CalendarIcon className="mr-2 h-4 w-4" />{" "}
                                                                                {field.value ? (
                                                                                    formatDate(
                                                                                        field.value,
                                                                                    )
                                                                                ) : (
                                                                                    <span>
                                                                                        Pick
                                                                                        date
                                                                                    </span>
                                                                                )}
                                                                            </Button>
                                                                        </FormControl>
                                                                    </PopoverTrigger>{" "}
                                                                    <PopoverContent className="w-auto p-0">
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={
                                                                                field.value ??
                                                                                undefined
                                                                            }
                                                                            onSelect={(
                                                                                d,
                                                                            ) =>
                                                                                field.onChange(
                                                                                    d ??
                                                                                        null,
                                                                                )
                                                                            }
                                                                            initialFocus
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                                <FormMessage className="text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    {/* End Date Field */}
                                                    <FormField
                                                        control={form.control}
                                                        name="endDate"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                {" "}
                                                                <FormLabel className="text-xs">
                                                                    End Date
                                                                </FormLabel>
                                                                <Popover>
                                                                    <PopoverTrigger
                                                                        asChild
                                                                    >
                                                                        <FormControl>
                                                                            <Button
                                                                                variant={
                                                                                    "outline"
                                                                                }
                                                                                size="sm"
                                                                                className={cn(
                                                                                    "w-full justify-start text-left font-normal h-9",
                                                                                    !field.value &&
                                                                                        "text-muted-foreground",
                                                                                    isEndDateOngoing_watched &&
                                                                                        "opacity-50 cursor-not-allowed",
                                                                                )}
                                                                                disabled={
                                                                                    isEndDateOngoing_watched
                                                                                }
                                                                            >
                                                                                <CalendarIcon className="mr-2 h-4 w-4" />{" "}
                                                                                {field.value ? (
                                                                                    formatDate(
                                                                                        field.value,
                                                                                    )
                                                                                ) : (
                                                                                    <span>
                                                                                        Pick
                                                                                        date
                                                                                    </span>
                                                                                )}
                                                                            </Button>
                                                                        </FormControl>
                                                                    </PopoverTrigger>{" "}
                                                                    <PopoverContent className="w-auto p-0">
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={
                                                                                field.value ??
                                                                                undefined
                                                                            }
                                                                            onSelect={(
                                                                                d,
                                                                            ) =>
                                                                                field.onChange(
                                                                                    d ??
                                                                                        null,
                                                                                )
                                                                            }
                                                                            disabled={(
                                                                                date,
                                                                            ) => {
                                                                                const sd =
                                                                                    form.getValues(
                                                                                        "startDate",
                                                                                    );
                                                                                return sd
                                                                                    ? date <
                                                                                          sd
                                                                                    : false;
                                                                            }}
                                                                            initialFocus
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                                <FormMessage className="text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    {/* Ongoing Checkbox */}
                                                    <FormField
                                                        control={form.control}
                                                        name="isEndDateOngoing"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-1">
                                                                {" "}
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={
                                                                            field.value
                                                                        }
                                                                        onCheckedChange={
                                                                            handleOngoingChange
                                                                        }
                                                                        id={`ongoing-${assWithUser.id}`}
                                                                    />
                                                                </FormControl>{" "}
                                                                <FormLabel
                                                                    htmlFor={`ongoing-${assWithUser.id}`}
                                                                    className="text-xs font-normal"
                                                                >
                                                                    Assignment
                                                                    is Ongoing
                                                                </FormLabel>{" "}
                                                                <FormMessage className="text-xs" />{" "}
                                                            </FormItem>
                                                        )}
                                                    />
                                                    {/* Save/Cancel Buttons */}
                                                    <div className="flex justify-end gap-2 pt-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                setEditingAssignmentId(
                                                                    null,
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdatingDates
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            disabled={
                                                                isUpdatingDates
                                                            }
                                                        >
                                                            {" "}
                                                            {isUpdatingDates && (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            )}{" "}
                                                            Save
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </div>
                                    )}
                                    {/* --- End Inline Editor --- */}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
