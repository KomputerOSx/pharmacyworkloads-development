"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useDep } from "@/hooks/useDeps";
import {
    useDepTeams,
    useDeleteDepTeam,
    useUpdateDepTeam,
} from "@/hooks/useDepTeams";
import { DepTeam } from "@/types/subDepTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { AddDepTeamForm } from "@/components/departments/departmentTeams/AddDepTeamForm";
import { DepTeamsTable } from "@/components/departments/departmentTeams/DepTeamsTable";
// Import Dialog components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger, // Needed to trigger the dialog open
    DialogFooter, // Optional, if needed outside the form
    // DialogClose, // Use state to control closing instead
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// --- Edit Form Schema ---
const editFormSchema = z.object({
    name: z.string().min(1, "Team name is required"),
    description: z.string().optional(),
    active: z.boolean(),
});
type EditFormValues = z.infer<typeof editFormSchema>;

export default function DepartmentTeamsManagementPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    const depId = params.depId as string;
    const router = useRouter();

    // --- State for Dialogs ---
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // Changed state name
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Changed state name
    const [editingTeam, setEditingTeam] = useState<DepTeam | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);

    // --- Data Fetching ---
    const {
        data: department,
        isLoading: isLoadingDept,
        isError: isErrorDept,
        error: errorDept,
    } = useDep(depId);
    const {
        data: teams,
        isLoading: isLoadingTeams,
        isError: isErrorTeams,
        error: errorTeams,
        refetch: refetchTeams,
    } = useDepTeams(orgId, depId);

    // --- Mutations ---
    const { mutate: deleteTeam, isPending: isDeleting } = useDeleteDepTeam();
    const { mutate: updateTeam, isPending: isUpdating } = useUpdateDepTeam();

    // --- Edit Form Initialization ---
    const editForm = useForm<EditFormValues>({
        resolver: zodResolver(editFormSchema),
    });

    // --- Effects ---
    useEffect(() => {
        if (editingTeam) {
            editForm.reset({
                name: editingTeam.name,
                description: editingTeam.description ?? "",
                active: editingTeam.active,
            });
        }
    }, [editingTeam, editForm]);

    // --- Event Handlers ---
    const handleRefresh = () => {
        void refetchTeams();
    };

    // Edit Handlers
    const handleOpenEditDialog = (team: DepTeam) => {
        // Renamed handler
        setEditingTeam(team);
        setIsEditDialogOpen(true); // Open edit dialog
    };
    const handleCloseEditDialog = () => {
        // Renamed handler
        setIsEditDialogOpen(false); // Close edit dialog
        setEditingTeam(null);
        editForm.reset();
    };
    const handleEditSubmit = (values: EditFormValues) => {
        if (!editingTeam) return;
        updateTeam(
            { id: editingTeam.id, teamData: values, orgId, depId },
            {
                onSuccess: (updated) => {
                    toast.success(`Team "${updated.name}" updated.`);
                    handleCloseEditDialog();
                },
                onError: (error) => {
                    toast.error(`Update failed: ${error.message}`);
                },
            },
        );
    };

    // Delete Handlers
    const handleOpenDeleteDialog = (teamId: string, teamName: string) => {
        setTeamToDelete({ id: teamId, name: teamName });
        setIsDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTeamToDelete(null);
    };
    const handleConfirmDelete = () => {
        if (!teamToDelete) return;
        deleteTeam(
            { id: teamToDelete.id, orgId, depId },
            {
                onSuccess: () => {
                    toast.success(`Team "${teamToDelete.name}" deleted.`);
                    handleCloseDeleteDialog();
                },
                onError: (error) => {
                    toast.error(`Delete failed: ${error.message}`);
                },
            },
        );
    };

    // --- Render Logic ---
    const renderContent = () => {
        // ... (loading and error rendering logic remains the same) ...
        const isLoading = isLoadingTeams || isLoadingDept;
        const isError = isErrorTeams || isErrorDept;
        const error = errorTeams || errorDept;

        if (isLoading && !teams) {
            // Show skeleton only on initial load
            return (
                <div className="mt-6 space-y-4 rounded-md border p-4">
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-2/3 mt-4" />
                </div>
            );
        }

        if (isError) {
            return (
                <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Data</AlertTitle>
                    <AlertDescription>
                        {error instanceof Error
                            ? error.message
                            : "An unknown error occurred."}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRefresh}
                            className="ml-4"
                        >
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <DepTeamsTable
                teams={teams ?? []}
                onDeleteRequest={handleOpenDeleteDialog}
                onEditRequest={handleOpenEditDialog} // Pass the correct handler
                isLoading={isLoading}
            />
        );
    };

    const currentDepartmentName = isLoadingDept
        ? "Department..."
        : (department?.name ?? "Manage Teams");

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Manage Teams for: {currentDepartmentName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create, view, edit, and delete teams for this
                        department.
                    </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoadingTeams || isLoadingDept}
                        aria-label="Refresh teams list"
                    >
                        {(isLoadingTeams || isLoadingDept) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}{" "}
                        Refresh
                    </Button>

                    {/* === Use DialogTrigger for Add Team === */}
                    <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" /> Create
                                Team
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px]">
                            {" "}
                            {/* Adjust width if needed */}
                            <DialogHeader>
                                <DialogTitle>Create New Team</DialogTitle>
                                <DialogDescription>
                                    Enter the details for the new team. It will
                                    be automatically associated with the '
                                    {currentDepartmentName}' department.
                                </DialogDescription>
                            </DialogHeader>
                            {/* AddDepTeamForm handles the creation logic and buttons */}
                            <AddDepTeamForm
                                onSuccess={() => setIsAddDialogOpen(false)} // Close dialog on success
                                onCancel={() => setIsAddDialogOpen(false)} // Close dialog on cancel
                            />
                            {/* No separate DialogFooter needed if buttons are in the form */}
                        </DialogContent>
                    </Dialog>
                    {/* ======================================== */}

                    <Link href={`/admin/${orgId}/departments/${depId}`}>
                        <Button size="sm" variant="outline">
                            {" "}
                            Back to Department{" "}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Table */}
            {renderContent()}

            {/* Edit Team Dialog (Not triggered by a button here, but controlled by state) */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent
                    className="sm:max-w-[480px]"
                    onInteractOutside={handleCloseEditDialog}
                    onEscapeKeyDown={handleCloseEditDialog}
                >
                    <DialogHeader>
                        <DialogTitle>
                            Edit Team: {editingTeam?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Update the details for this team. Click save when
                            you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form
                            onSubmit={editForm.handleSubmit(handleEditSubmit)}
                            className="space-y-6 py-4"
                        >
                            <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        {" "}
                                        <FormLabel>Team Name</FormLabel>{" "}
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>{" "}
                                        <FormMessage />{" "}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        {" "}
                                        <FormLabel>Description</FormLabel>{" "}
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>{" "}
                                        <FormMessage />{" "}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active Status</FormLabel>
                                            <FormMessage />
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {/* Form submit/cancel buttons act as dialog controls */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseEditDialog}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog (remains the same) */}
            {teamToDelete && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) handleCloseDeleteDialog();
                    }}
                    itemName={`team "${teamToDelete.name}"`}
                    itemType="department team"
                    onConfirm={handleConfirmDelete}
                    isPending={isDeleting}
                />
            )}
        </div>
    );
}
