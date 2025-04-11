"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDep } from "@/hooks/useDeps";
import {
    useDepTeams,
    useDeleteDepTeam,
    useUpdateDepTeam,
} from "@/hooks/useDepTeams";
import { useHospLocs } from "@/hooks/useHospLoc";
import { useDepHospLocAssignments } from "@/hooks/useDepHospLocAss"; // ASSUMED HOOK
import {
    useAssignmentsByTeam,
    useCreateTeamLocAssignment,
    useDeleteTeamLocAssignment,
} from "@/hooks/useDepTeamHospLocAss";
import { DepTeam } from "@/types/subDepTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { AddDepTeamForm } from "@/components/departments/departmentTeams/AddDepTeamForm";
import { DepTeamsTable } from "@/components/departments/departmentTeams/DepTeamsTable";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<DepTeam | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [isManageLocDialogOpen, setIsManageLocDialogOpen] = useState(false);
    const [managingLocationsForTeam, setManagingLocationsForTeam] =
        useState<DepTeam | null>(null);
    const [mutatingLocationId, setMutatingLocationId] = useState<string | null>(
        null,
    );

    const { data: department, isLoading: isLoadingDept } = useDep(depId);
    const {
        data: teams,
        isLoading: isLoadingTeams,
        refetch: refetchTeams,
    } = useDepTeams(orgId, depId);
    const { data: allOrgLocations, isLoading: isLoadingOrgLocs } =
        useHospLocs(orgId);
    const { data: depLocationAssignments, isLoading: isLoadingDepLocs } =
        useDepHospLocAssignments(depId);
    const { data: teamSpecificAssignments, isLoading: isLoadingTeamAssigns } =
        useAssignmentsByTeam(managingLocationsForTeam?.id);

    const { mutate: deleteTeam, isPending: isDeletingTeam } =
        useDeleteDepTeam();
    const { mutate: updateTeam, isPending: isUpdatingTeam } =
        useUpdateDepTeam();
    const { mutate: createTeamLocAssign, isPending: isCreatingAssign } =
        useCreateTeamLocAssignment();
    const { mutate: deleteTeamLocAssign, isPending: isDeletingAssign } =
        useDeleteTeamLocAssignment();

    const editForm = useForm<EditFormValues>({
        resolver: zodResolver(editFormSchema),
    });

    useEffect(() => {
        if (editingTeam) {
            editForm.reset({
                name: editingTeam.name,
                description: editingTeam.description ?? "",
                active: editingTeam.active,
            });
        }
    }, [editingTeam, editForm]);

    const departmentLocationIds = useMemo(() => {
        if (!depLocationAssignments) return new Set<string>();
        return new Set(depLocationAssignments.map((ass) => ass.locationId));
    }, [depLocationAssignments]);

    const teamAssignmentMap = useMemo(() => {
        if (!teamSpecificAssignments) return new Map<string, string>();
        return new Map(
            teamSpecificAssignments.map((ass) => [ass.locationId, ass.id]),
        );
    }, [teamSpecificAssignments]);

    const departmentLocationsDetails = useMemo(() => {
        return (allOrgLocations ?? [])
            .filter((loc) => departmentLocationIds.has(loc.id))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [allOrgLocations, departmentLocationIds]);

    const handleRefresh = () => {
        void refetchTeams(); /* refetch locations/assignments if needed */
    };
    const handleOpenEditDialog = (team: DepTeam) => {
        setEditingTeam(team);
        setIsEditDialogOpen(true);
    };
    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
        setEditingTeam(null);
        editForm.reset();
    };
    const handleOpenDeleteDialog = (teamId: string, teamName: string) => {
        setTeamToDelete({ id: teamId, name: teamName });
        setIsDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTeamToDelete(null);
    };
    const handleOpenManageLocationsDialog = (team: DepTeam) => {
        setManagingLocationsForTeam(team);
        setIsManageLocDialogOpen(true);
    };
    const handleCloseManageLocationsDialog = () => {
        setIsManageLocDialogOpen(false);
        setManagingLocationsForTeam(null);
        setMutatingLocationId(null);
    };

    const handleEditSubmit = (values: EditFormValues) => {
        if (!editingTeam) return;
        const teamData = {
            name: values.name,
            description: values.description || null,
            active: values.active,
        };
        updateTeam(
            { id: editingTeam.id, teamData, orgId, depId },
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

    const handleLocationAssignmentToggle = (
        locationId: string,
        teamId: string,
        currentAssignmentId: string | undefined,
        isChecked: boolean,
    ) => {
        if (!orgId || !depId) return;
        setMutatingLocationId(locationId);

        if (isChecked) {
            createTeamLocAssign(
                { teamId, locationId, orgId, depId },
                {
                    onError: (err: Error) => {
                        toast.error(`Assign failed: ${err.message}`);
                    },
                    onSettled: () => setMutatingLocationId(null),
                },
            );
        } else {
            if (currentAssignmentId) {
                deleteTeamLocAssign(
                    { id: currentAssignmentId, teamId, locationId, depId },
                    {
                        onError: (err: Error) => {
                            toast.error(`Unassign failed: ${err.message}`);
                        },
                        onSettled: () => setMutatingLocationId(null),
                    },
                );
            } else {
                console.error(
                    "Attempted to delete non-existent assignment for location:",
                    locationId,
                );
                toast.error("Error: Could not find assignment to delete.");
                setMutatingLocationId(null);
            }
        }
    };

    const renderContent = () => {
        const isLoading = isLoadingTeams || isLoadingDept;
        const isError = teams === undefined || department === undefined; // Simplified error check
        const error =
            teams === undefined
                ? new Error("Failed to load teams")
                : department === undefined
                  ? new Error("Failed to load department")
                  : null; // Example error source

        if (isLoading && !teams) {
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

        if (isError && error) {
            return (
                <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Data</AlertTitle>
                    <AlertDescription>
                        {error.message}
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
                onEditRequest={handleOpenEditDialog}
                onManageLocationsRequest={handleOpenManageLocationsDialog}
                isLoading={isLoading}
            />
        );
    };

    const currentDepartmentName = isLoadingDept
        ? "Department..."
        : (department?.name ?? "Manage Teams");

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-5xl">
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
                            <DialogHeader>
                                <DialogTitle>Create New Team</DialogTitle>
                                <DialogDescription>
                                    Enter the details for the new team. It will
                                    be automatically associated with the &#39;
                                    {currentDepartmentName}&#39; department.
                                </DialogDescription>
                            </DialogHeader>
                            <AddDepTeamForm
                                onSuccess={() => setIsAddDialogOpen(false)}
                                onCancel={() => setIsAddDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                    <Link href={`/admin/${orgId}/departments/`}>
                        <Button size="sm" variant="outline">
                            {" "}
                            Back to Departments{" "}
                        </Button>
                    </Link>
                </div>
            </div>

            {renderContent()}

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
                            you&#39;re done.
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
                                            <FormLabel>Active Status</FormLabel>{" "}
                                            <FormMessage />
                                        </div>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseEditDialog}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isUpdatingTeam}>
                                    {isUpdatingTeam && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}{" "}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isManageLocDialogOpen}
                onOpenChange={setIsManageLocDialogOpen}
            >
                <DialogContent
                    className="sm:max-w-md"
                    onInteractOutside={handleCloseManageLocationsDialog}
                    onEscapeKeyDown={handleCloseManageLocationsDialog}
                >
                    <DialogHeader>
                        <DialogTitle>
                            Manage Locations for Team:{" "}
                            {managingLocationsForTeam?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Select the locations (assigned to &#39;
                            {currentDepartmentName}&#39;) that this team should
                            manage.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="space-y-3 py-4">
                            {isLoadingDepLocs || isLoadingOrgLocs ? (
                                <div className="flex justify-center items-center p-4">
                                    {" "}
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />{" "}
                                </div>
                            ) : departmentLocationsDetails.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-4">
                                    No locations assigned to this department.
                                </p>
                            ) : (
                                departmentLocationsDetails.map((loc) => {
                                    const isCurrentlyAssigned =
                                        teamAssignmentMap.has(loc.id);
                                    const currentAssignmentId =
                                        teamAssignmentMap.get(loc.id);
                                    const isMutatingThis =
                                        mutatingLocationId === loc.id;
                                    const isLoadingThisTeamAssigns =
                                        !managingLocationsForTeam ||
                                        isLoadingTeamAssigns;

                                    return (
                                        <div
                                            key={loc.id}
                                            className="flex items-center justify-between rounded-md border p-3 shadow-sm gap-2"
                                        >
                                            <Label
                                                htmlFor={`loc-${loc.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {loc.name}
                                            </Label>
                                            {isLoadingThisTeamAssigns ? (
                                                <Skeleton className="h-4 w-4" />
                                            ) : (
                                                <Checkbox
                                                    id={`loc-${loc.id}`}
                                                    checked={
                                                        isCurrentlyAssigned
                                                    }
                                                    disabled={
                                                        isCreatingAssign ||
                                                        isDeletingAssign ||
                                                        isMutatingThis
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
                                                        if (
                                                            managingLocationsForTeam
                                                        ) {
                                                            // Ensure team context exists
                                                            handleLocationAssignmentToggle(
                                                                loc.id,
                                                                managingLocationsForTeam.id,
                                                                currentAssignmentId,
                                                                !!checked,
                                                            );
                                                        }
                                                    }}
                                                />
                                            )}
                                            {isMutatingThis && (
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                    <DialogFooter className="mt-4 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseManageLocationsDialog}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {teamToDelete && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) handleCloseDeleteDialog();
                    }}
                    itemName={`team "${teamToDelete.name}"`}
                    itemType="department team"
                    onConfirm={handleConfirmDelete}
                    isPending={isDeletingTeam}
                />
            )}
        </div>
    );
}
