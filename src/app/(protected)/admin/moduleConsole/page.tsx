// src/app/(protected)/admin/moduleConsole/page.tsx

"use client";

import React, { useState } from "react";
import { useAllModules, useDeleteModule } from "@/hooks/admin/useModules";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleTable } from "@/components/modules/ModuleTable";
import { AddModuleForm } from "@/components/modules/AddModuleForm";
import { EditModuleForm } from "@/components/modules/EditModuleForm";

import {
    Loader2,
    Terminal,
    PlusCircle,
    RefreshCw,
    Settings2,
} from "lucide-react";

import { Module } from "@/types/moduleTypes";
import Link from "next/link";
import { ManageModuleAssignmentsDialogContent } from "@/components/modules/ManageModuleAssignmentsDialogContent";

export default function ModuleConsolePage() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<{
        id: string;
        displayName: string;
    } | null>(null);
    const [isManageAssignmentsDialogOpen, setIsManageAssignmentsDialogOpen] =
        useState(false);
    const [managingAssignmentsForModule, setManagingAssignmentsForModule] =
        useState<Module | null>(null);

    // Data Fetching
    const {
        data: modules,
        isLoading: isLoadingModules,
        isError: isErrorModules,
        error: errorModules,
        refetch: refetchModules,
        isRefetching: isRefetchingModules,
    } = useAllModules();

    // Mutations (Only Delete is needed directly here)
    const deleteMutation = useDeleteModule();
    // --- Handlers ---
    const handleRefresh = () => {
        void refetchModules();
    };

    const handleOpenEditDialog = (module: Module) => {
        setEditingModule(module);
        setIsEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
        // Delay clearing editingModule slightly to avoid flicker if form needs it briefly on close
        setTimeout(() => setEditingModule(null), 150);
    };

    const handleOpenDeleteDialog = (id: string, displayName: string) => {
        setModuleToDelete({ id, displayName });
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setModuleToDelete(null);
    };

    const handleOpenManageAssignmentsDialog = (module: Module) => {
        setManagingAssignmentsForModule(module);
        setIsManageAssignmentsDialogOpen(true);
    };

    const handleCloseManageAssignmentsDialog = () => {
        setIsManageAssignmentsDialogOpen(false);
        // Optional: Delay clearing state slightly for transition
        setTimeout(() => setManagingAssignmentsForModule(null), 150);
    };

    const handleEditSuccess = () => {
        handleCloseEditDialog();
    };

    const handleConfirmDelete = () => {
        if (!moduleToDelete) return;
        deleteMutation.mutate(
            { id: moduleToDelete.id },
            {
                onSuccess: () => {
                    handleCloseDeleteDialog();
                },
                onError: () => {
                    // Error toast handled by hook
                    handleCloseDeleteDialog();
                },
            },
        );
    };

    // --- Render Logic ---
    const renderContent = () => {
        // Loading/Error states handled within ModuleTable now for initial load
        // Still need page-level error display for fetch failure
        if (isErrorModules && !isLoadingModules) {
            // Check if error occurred after initial load attempt
            return (
                <CardContent>
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error Loading Modules</AlertTitle>
                        <AlertDescription>
                            {errorModules?.message ||
                                "An unexpected error occurred."}
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isRefetchingModules}
                                className="ml-4 mt-2 sm:mt-0"
                            >
                                {isRefetchingModules ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            );
        }
        // Pass data and handlers to the ModuleTable
        return (
            <CardContent className="p-0">
                {" "}
                {/* Remove padding if table handles it */}
                <ModuleTable
                    modules={modules ?? []}
                    isLoading={isLoadingModules || isRefetchingModules} // Pass combined loading state
                    onEditRequest={handleOpenEditDialog}
                    onDeleteRequest={handleOpenDeleteDialog}
                    onManageAssignmentsRequest={
                        handleOpenManageAssignmentsDialog
                    }
                />
            </CardContent>
        );
    };

    return (
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Header remains similar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Module Console
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage global modules available for assignment to
                        departments.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={"outline"}
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoadingModules || isRefetchingModules}
                    >
                        {isLoadingModules || isRefetchingModules ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-1 h-4 w-4" />
                        )}
                        Refresh
                    </Button>

                    <Link href="/admin/orgConsole">
                        <Button variant={"outline"} size="sm">
                            Orgs Console
                        </Button>
                    </Link>

                    <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <PlusCircle className="mr-1 h-4 w-4" />
                                Create Module
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px]">
                            <DialogHeader>
                                <DialogTitle>Create New Module</DialogTitle>
                                <DialogDescription>
                                    Enter details for the new global module.
                                </DialogDescription>
                            </DialogHeader>
                            {/* Use AddModuleForm */}
                            <AddModuleForm
                                onSuccess={() => setIsAddDialogOpen(false)}
                                onCancel={() => setIsAddDialogOpen(false)} // Pass cancel handler
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Modules</CardTitle>
                </CardHeader>
                {renderContent()}
            </Card>

            {/* --- Edit Dialog --- */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                {/* Render DialogContent only when editingModule is available to prevent form init issues */}
                {editingModule && (
                    <DialogContent
                        className="sm:max-w-[480px]"
                        // Keep interaction handlers if needed, check conditions based on mutation *inside* EditModuleForm if possible
                        // onInteractOutside={(e) => { ... }}
                        // onEscapeKeyDown={(e) => { ... }}
                    >
                        <DialogHeader>
                            <DialogTitle>
                                Edit Module: {editingModule?.displayName}
                            </DialogTitle>
                            <DialogDescription>
                                Update the details for this module. Click save
                                when done.
                            </DialogDescription>
                        </DialogHeader>
                        {/* Use EditModuleForm */}
                        <EditModuleForm
                            moduleToEdit={editingModule}
                            onSuccess={handleEditSuccess}
                            onCancel={handleCloseEditDialog}
                        />
                    </DialogContent>
                )}
            </Dialog>

            {/* --- Manage Assignments Dialog --- */}
            <Dialog
                open={isManageAssignmentsDialogOpen}
                onOpenChange={setIsManageAssignmentsDialogOpen}
            >
                {managingAssignmentsForModule && (
                    <DialogContent className="sm:max-w-lg">
                        {" "}
                        {/* Make it slightly wider? */}
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5" /> Manage
                                Assignments for:{" "}
                                {managingAssignmentsForModule.displayName}
                            </DialogTitle>
                            <DialogDescription>
                                View which departments this module is currently
                                assigned to.
                                {/* Add note about adding/removing assignments elsewhere for now */}
                                (Assignment changes are managed in department
                                settings).
                            </DialogDescription>
                        </DialogHeader>
                        {/* Render the dedicated content component */}
                        <ManageModuleAssignmentsDialogContent
                            module={managingAssignmentsForModule}
                        />
                        <DialogFooter className="mt-4">
                            <Button
                                variant="outline"
                                onClick={handleCloseManageAssignmentsDialog}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>

            {/* --- Delete Confirmation Dialog --- */}
            {moduleToDelete && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen} // Simplified change handler
                    itemName={`module ${moduleToDelete.displayName}`}
                    itemType="global module"
                    onConfirm={handleConfirmDelete}
                    isPending={deleteMutation.isPending}
                />
            )}
        </div>
    );
}
