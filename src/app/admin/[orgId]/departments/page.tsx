"use client";

import React, { useState, useCallback } from "react"; // Added useCallback
import { useParams } from "next/navigation";
import { Loader2, Terminal } from "lucide-react"; // Added Terminal for errors

// UI Components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added for errors
import { LoadingSpinner } from "@/components/ui/loadingSpinner"; // Assuming you have this

// Custom Components & Hooks
import { AddDepFrom } from "@/components/departments/AddDepFrom";
import { DepCard } from "@/components/departments/DepCard";
import { EditDepForm } from "@/components/departments/EditDepForm"; // Import the corrected Edit form
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog"; // Import delete dialog
import { useDeps, useDeleteDep } from "@/hooks/useDeps"; // *** Assuming useDeleteDep hook exists ***

// Types
import { Department } from "@/types/depTypes";

export default function DepartmentsPage() {
    const params = useParams();
    const orgId = params.orgId as string;

    // State for Dialogs
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // State for selected item
    const [editingDepartment, setEditingDepartment] =
        useState<Department | null>(null);
    const [deletingDepartment, setDeletingDepartment] = useState<{
        id: string;
        name: string;
    } | null>(null);

    // --- Data Fetching ---
    const {
        data: deps,
        isLoading,
        isError,
        error,
        isRefetching,
        refetch: refetchDeps,
    } = useDeps(orgId);

    // --- Mutations ---
    const deleteDepMutation = useDeleteDep(); // *** Use the delete hook ***

    // --- Handlers (using useCallback) ---

    // Edit Dialog
    const handleOpenEditDialog = useCallback((departmentToEdit: Department) => {
        setEditingDepartment(departmentToEdit);
        setIsEditDialogOpen(true);
    }, []);

    const handleCloseEditDialog = useCallback(() => {
        setIsEditDialogOpen(false);
        // Optional delay to prevent UI flicker
        setTimeout(() => setEditingDepartment(null), 150);
    }, []);

    const handleSuccessfulEdit = useCallback(() => {
        handleCloseEditDialog();
        void refetchDeps(); // Refetch after successful edit
    }, [handleCloseEditDialog, refetchDeps]);

    // Delete Dialog
    const handleOpenDeleteDialog = useCallback(
        (departmentId: string, departmentName: string) => {
            setDeletingDepartment({ id: departmentId, name: departmentName });
            setIsDeleteDialogOpen(true);
        },
        [],
    );

    const handleCloseDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
        // Optional delay
        setTimeout(() => setDeletingDepartment(null), 150);
    }, []);

    // Delete Confirmation Action
    const handleConfirmDelete = useCallback(() => {
        if (!deletingDepartment || !orgId || deleteDepMutation.isPending) {
            console.warn(
                "Delete confirmation check failed or already pending.",
            );
            return;
        }

        console.log(
            `Confirming delete action for department: ${deletingDepartment.id}`,
        );
        deleteDepMutation.mutate(
            {
                id: deletingDepartment.id,
                orgId: orgId, // Pass orgId if hook needs it for cache invalidation
            },
            {
                onSuccess: () => {
                    console.log("Department deleted successfully.");
                    handleCloseDeleteDialog();
                    // Refetch likely handled by hook's onSuccess, or uncomment below:
                    // void refetchDeps();
                },
                onError: (error) => {
                    console.error("Deletion failed:", error);
                    // Error toast likely handled by hook
                    handleCloseDeleteDialog(); // Close dialog even on error
                },
            },
        );
    }, [deletingDepartment, orgId, deleteDepMutation, handleCloseDeleteDialog]); // Added refetchDeps if needed

    // Create Dialog
    const handleSuccessfulCreate = useCallback(() => {
        setIsCreateDialogOpen(false);
        void refetchDeps(); // Refresh data after adding
    }, [refetchDeps]);

    // Refresh Action
    const handleRefresh = useCallback(() => {
        void refetchDeps();
    }, [refetchDeps]);

    // --- Main Render ---
    // ** CRITICAL FIX: Moved JSX return OUTSIDE of handleConfirmDelete **

    if (isLoading) {
        // Basic loading state - enhance if needed
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner text={"Loading Departments..."} size={"lg"} />
            </div>
        );
    }

    if (isError) {
        // Basic error state - enhance if needed
        return (
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching Departments</AlertTitle>
                    <AlertDescription>
                        {error instanceof Error
                            ? error.message
                            : "An unknown error occurred."}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefetching}
                            className="ml-4"
                        >
                            {isRefetching ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        // Apply Tailwind container and padding
        <div className={"mx-auto py-6 px-4 sm:px-6 lg:px-8"}>
            {/* Header: Create Button and Refresh Button */}
            <div className="flex items-center gap-4 mb-6">
                {/* Create Department Dialog */}
                <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                >
                    <DialogTrigger asChild>
                        {/* Corrected Button Text */}
                        <Button size="sm">Create Department</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            {/* Corrected Dialog Titles/Descriptions */}
                            <DialogTitle>Create New Department</DialogTitle>
                            <DialogDescription>
                                Enter the details for the new department.
                            </DialogDescription>
                        </DialogHeader>
                        {/* Use the AddDepFrom component */}
                        <AddDepFrom
                            orgId={orgId}
                            onOpenChange={handleSuccessfulCreate} // Use callback
                        />
                    </DialogContent>
                </Dialog>

                {/* Refresh Button */}
                <Button
                    variant={"outline"}
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading || isRefetching}
                >
                    {isRefetching ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isRefetching ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            {/* Department Card Grid */}
            {/* Corrected layout using grid */}
            <div
                className={
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                }
            >
                {(deps ?? []).map((department) => (
                    // Removed the extra div wrapper unless DepCard requires it
                    <DepCard
                        key={department.id}
                        department={department}
                        orgId={orgId}
                        onEdit={handleOpenEditDialog} // Pass correct handler
                        onDelete={handleOpenDeleteDialog} // Pass correct handler
                    />
                ))}
                {/* Message for no departments */}
                {!isLoading && deps && deps.length === 0 && (
                    <p className="text-center text-gray-500 col-span-full mt-4">
                        No departments found for this organisation.
                    </p>
                )}
            </div>

            {/* --- Edit Department Dialog --- */}
            {editingDepartment && (
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={(open) => !open && handleCloseEditDialog()}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                Edit Department: {editingDepartment.name}
                            </DialogTitle>
                            <DialogDescription>
                                Update the details for this department.
                            </DialogDescription>
                        </DialogHeader>
                        <EditDepForm
                            orgId={orgId}
                            departmentToEdit={editingDepartment}
                            onSuccessfulSubmitAction={handleSuccessfulEdit}
                        />
                    </DialogContent>
                </Dialog>
            )}

            {/* --- Delete Confirmation Dialog --- */}
            {deletingDepartment && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={(open) => !open && handleCloseDeleteDialog()}
                    itemName={deletingDepartment.name}
                    itemType="department" // Specify item type
                    onConfirm={handleConfirmDelete}
                    isPending={deleteDepMutation.isPending} // Pass mutation loading state
                />
            )}
        </div>
    );
}
