// src/app/admin/[orgId]/users/page.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
// ... other imports ...
import { useUsers, useDeleteUser, useUser } from "@/hooks/useUsers";
import { useDeps } from "@/hooks/useDeps";
import { useAuth } from "@/lib/context/AuthContext";
import { UserDataTable } from "@/components/users/UserDataTable";
import { AddUserForm } from "@/components/users/AddUserForm";
import { EditUserForm } from "@/components/users/EditUserForm";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Users as UsersIcon } from "lucide-react";
import { User } from "@/types/userTypes";
import { Department } from "@/types/depTypes";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";

export default function UsersPage() {
    const params = useParams();
    const orgId = params.orgId as string;

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userForEdit, setUserForEdit] = useState<User | null>(null);
    const [userForDelete, setUserForDelete] = useState<User | null>(null);
    const { user: authUser, loading: authLoading } = useAuth();

    const {
        data: allUsers,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: errorUsers,
        refetch: refetchUsers,
        isRefetching: isRefetchingUsers,
    } = useUsers(orgId);

    const { data: userProfile, isLoading: profileLoading } = useUser(
        authUser?.uid,
    );

    const {
        data: departments,
        isLoading: isLoadingDeps,
        isError: isErrorDeps,
        error: errorDeps,
    } = useDeps(orgId);

    // Filter users by department
    const filteredUsers = useMemo(() => {
        if (!allUsers || !userProfile) {
            return [];
        }
        return allUsers.filter(
            (user) => user.departmentId === userProfile.departmentId,
        );
    }, [allUsers, userProfile]);

    // Get current user's department(s)
    const currentUserDepartments = useMemo(() => {
        if (userProfile?.departmentId && departments) {
            return departments.find(
                (dep) => dep.id === userProfile.departmentId,
            );
        }
        return null;
    }, [userProfile, departments]);

    const isLoading =
        authLoading || isLoadingUsers || profileLoading || isLoadingDeps;
    const isDataReady =
        !isLoading && !!allUsers && !!departments && !!userProfile;

    // Map ALL department IDs to names for display in the table
    const departmentNameMap = useMemo(() => {
        const map = new Map<string, string>();
        if (departments) {
            departments.forEach((dep: Department) => {
                map.set(dep.id, dep.name);
            });
        }
        return map;
    }, [departments]);

    const handleOpenEditDialog = useCallback((user: User) => {
        setUserForEdit(user);
        setIsEditDialogOpen(true);
    }, []);

    const handleCloseEditDialog = useCallback(() => {
        setIsEditDialogOpen(false);
        setTimeout(() => setUserForEdit(null), 150);
    }, []);

    const handleOpenDeleteDialog = useCallback((user: User) => {
        setUserForDelete(user);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
        setTimeout(() => setUserForDelete(null), 150);
    }, []);

    const handleRefresh = useCallback(() => {
        void refetchUsers();
    }, [refetchUsers]);

    const handleSuccessfulCreate = useCallback(() => {
        setIsCreateDialogOpen(false);
    }, []);

    const handleSuccessfulEdit = useCallback(() => {
        handleCloseEditDialog();
    }, [handleCloseEditDialog]);

    const deleteUserMutation = useDeleteUser();

    const handleConfirmDelete = useCallback(() => {
        if (!userForDelete || !orgId) return;
        deleteUserMutation.mutate(
            { id: userForDelete.id, orgId: orgId },
            {
                onSuccess: () => handleCloseDeleteDialog(),
                onError: (error) => {
                    console.error("Failed to delete user:", error);
                    handleCloseDeleteDialog();
                },
            },
        );
    }, [userForDelete, orgId, deleteUserMutation, handleCloseDeleteDialog]);

    // --- Rendering Logic ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4 mt-4">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 rounded-md border p-4">
                        <Skeleton className="h-9 w-full sm:w-1/3" />
                        <Skeleton className="h-9 w-44" />
                        <div className="flex-grow" />
                        <Skeleton className="h-9 w-28" />
                    </div>
                    <div className="rounded-md border p-4 space-y-2">
                        <Skeleton className="h-10 w-full" />
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex flex-wrap items-center gap-4">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                    </div>
                </div>
            );
        }

        if (
            isErrorUsers ||
            isErrorDeps ||
            (!profileLoading && !userProfile && authUser)
        ) {
            const errorToShow =
                errorUsers ??
                errorDeps ??
                new Error("Could not load user profile.");
            const errorTitle = isErrorUsers
                ? "Error Fetching Users"
                : isErrorDeps
                  ? "Error Fetching Departments"
                  : "Error Fetching User Profile";
            return (
                <Alert variant="destructive" className="mt-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>{errorTitle}</AlertTitle>
                    <AlertDescription>
                        {errorToShow.message}
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

        if (!isDataReady) {
            return (
                <div className="flex justify-center items-center p-8">
                    <LoadingSpinner text="Loading..." />
                </div>
            );
        }

        // Render the actual data table
        return (
            <UserDataTable
                users={filteredUsers ?? []} // Pass ALL users
                departments={
                    currentUserDepartments ? [currentUserDepartments] : []
                }
                departmentNameMap={departmentNameMap}
                isLoadingDepartmentMap={isLoadingDeps}
                onEditRequest={handleOpenEditDialog}
                onDeleteRequest={handleOpenDeleteDialog}
            />
        );
    };

    // --- Main Component Return ---
    return (
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <UsersIcon className="h-6 w-6" /> Manage Users
                </h1>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Create User Button & Dialog */}
                    <Dialog
                        open={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                disabled={!currentUserDepartments || isLoading}
                            >
                                Create User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New User</DialogTitle>
                                <DialogDescription>
                                    Fill in the user details below.
                                </DialogDescription>
                            </DialogHeader>
                            {currentUserDepartments ? (
                                <AddUserForm
                                    orgId={orgId}
                                    departments={[currentUserDepartments]}
                                    onSuccessfulSubmitAction={
                                        handleSuccessfulCreate
                                    }
                                />
                            ) : (
                                <div className="flex justify-center items-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                    {/* Refresh Button */}
                    <Button
                        variant={"outline"}
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading || isRefetchingUsers}
                    >
                        {(isLoadingUsers || isRefetchingUsers) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isLoadingUsers || isRefetchingUsers
                            ? "Refreshing..."
                            : "Refresh"}
                    </Button>
                </div>
            </div>

            {renderContent()}

            {/* Edit User Dialog */}
            {userForEdit && (
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={(open) => !open && handleCloseEditDialog()}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Make changes to {userForEdit.firstName}{" "}
                                {userForEdit.lastName}.
                            </DialogDescription>
                        </DialogHeader>
                        {currentUserDepartments ? (
                            <EditUserForm
                                orgId={orgId}
                                userToEdit={userForEdit}
                                departments={[currentUserDepartments]}
                                onSuccessfulSubmitAction={handleSuccessfulEdit}
                            />
                        ) : (
                            <div className="flex justify-center items-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            {userForDelete && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={(open) => !open && handleCloseDeleteDialog()}
                    itemName={`${userForDelete.firstName} ${userForDelete.lastName}`}
                    itemType="user"
                    onConfirm={handleConfirmDelete}
                    isPending={deleteUserMutation.isPending}
                />
            )}
        </div>
    );
}
