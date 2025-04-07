// src/app/admin/[orgId]/users/page.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Users as UsersIcon } from "lucide-react"; // Added UsersIcon

// Custom Hooks and Components
import {
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
} from "@/hooks/useUsers"; // Ensure path is correct
import { useDeps } from "@/hooks/useDeps"; // Ensure path is correct for fetching departments
import { AddUserForm } from "@/components/users/AddUserForm"; // Create this component
import { EditUserForm } from "@/components/users/EditUserForm"; // Create this component
import { UserDataTable } from "@/components/users/UserDataTable"; // Create this component
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog"; // Assuming this exists
import { User } from "@/types/userTypes"; // Ensure path is correct
import { Department } from "@/types/depTypes"; // Ensure path is correct

export default function UsersPage() {
    const params = useParams();
    const orgId = params.orgId as string; // Assert type as orgId should be present

    // State for Dialogs and selected items
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userForEdit, setUserForEdit] = useState<User | null>(null);
    const [userForDelete, setUserForDelete] = useState<User | null>(null);

    // --- Data Fetching ---
    const {
        data: users,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: errorUsers,
        refetch: refetchUsers,
        isRefetching: isRefetchingUsers,
    } = useUsers(orgId);

    const {
        data: departments,
        isLoading: isLoadingDeps,
        isError: isErrorDeps,
        error: errorDeps,
    } = useDeps(orgId); // Fetch departments for dropdowns and display names

    // --- Mutations ---
    const deleteUserMutation = useDeleteUser();

    // --- Memoized Data ---
    // Create a map for quickly looking up department names by ID
    const departmentNameMap = useMemo(() => {
        const map = new Map<string, string>();
        if (departments) {
            departments.forEach((dep: Department) => {
                map.set(dep.id, dep.name);
            });
        }
        return map;
    }, [departments]);

    // --- Callback Handlers ---
    const handleOpenEditDialog = useCallback((user: User) => {
        console.log("Opening edit dialog for user:", user.email);
        setUserForEdit(user);
        setIsEditDialogOpen(true);
    }, []);

    const handleCloseEditDialog = useCallback(() => {
        setIsEditDialogOpen(false);
        setTimeout(() => setUserForEdit(null), 150); // Delay clearing to prevent UI flicker
    }, []);

    const handleOpenDeleteDialog = useCallback((user: User) => {
        console.log("Opening delete dialog for user:", user.email);
        setUserForDelete(user);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
        setTimeout(() => setUserForDelete(null), 150);
    }, []);

    const handleRefresh = useCallback(() => {
        console.log("Refetching users for org:", orgId);
        void refetchUsers();
    }, [refetchUsers, orgId]);

    // Callbacks for form success actions
    const handleSuccessfulCreate = useCallback(() => {
        setIsCreateDialogOpen(false);
        // Data invalidation/refetch is handled by the useCreateUser hook's onSuccess
    }, []);

    const handleSuccessfulEdit = useCallback(() => {
        handleCloseEditDialog();
        // Data invalidation/refetch is handled by the useUpdateUser hook's onSuccess
    }, [handleCloseEditDialog]);

    // Handle delete confirmation
    const handleConfirmDelete = useCallback(() => {
        if (!userForDelete || !orgId) return;

        console.log("Confirming delete for user:", userForDelete.id);
        deleteUserMutation.mutate(
            {
                id: userForDelete.id,
                orgId: orgId, // Pass orgId for cache invalidation in the hook
            },
            {
                onSuccess: () => {
                    console.log("User deleted successfully (page callback)");
                    handleCloseDeleteDialog();
                    // Refetch/invalidation handled by useDeleteUser hook
                },
                onError: (error) => {
                    console.error(
                        "Failed to delete user (page callback):",
                        error,
                    );
                    // Error toast is likely handled by the hook, but you could add more here
                    handleCloseDeleteDialog();
                },
            },
        );
    }, [userForDelete, orgId, deleteUserMutation, handleCloseDeleteDialog]);

    // --- Rendering Logic ---
    const renderContent = () => {
        // Combined loading state
        if (isLoadingUsers || isLoadingDeps) {
            return (
                <div className="space-y-4 mt-4">
                    {/* Skeleton for Controls (Filter, View Options etc. - part of DataTable) */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 rounded-md border p-4">
                        <Skeleton className="h-9 w-full sm:w-1/3" />{" "}
                        {/* Filter Placeholder */}
                        <div className="flex-grow" /> {/* Spacer */}
                        <Skeleton className="h-9 w-28" />{" "}
                        {/* View Options Placeholder */}
                    </div>
                    {/* Skeleton for Table */}
                    <div className="rounded-md border p-4 space-y-2">
                        <Skeleton className="h-10 w-full" /> {/* Header */}
                        <Skeleton className="h-8 w-full" /> {/* Row 1 */}
                        <Skeleton className="h-8 w-full" /> {/* Row 2 */}
                        <Skeleton className="h-8 w-full" /> {/* Row 3 */}
                        <Skeleton className="h-8 w-full" /> {/* Row 4 */}
                        <Skeleton className="h-8 w-full" /> {/* Row 5 */}
                    </div>
                    {/* Skeleton for Pagination */}
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

        // Combined error state
        if (isErrorUsers || isErrorDeps) {
            const errorToShow = errorUsers ?? errorDeps; // Show the first error encountered
            const errorTitle = isErrorUsers
                ? "Error Fetching Users"
                : "Error Fetching Departments";
            return (
                <Alert variant="destructive" className="mt-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>{errorTitle}</AlertTitle>
                    <AlertDescription>
                        {errorToShow instanceof Error
                            ? errorToShow.message
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

        // Render the actual data table when data is ready
        return (
            <UserDataTable
                users={users ?? []} // Pass users data
                departments={departments ?? []} // Pass departments for filtering options if needed
                departmentNameMap={departmentNameMap} // Pass map for displaying names
                isLoadingDepartmentMap={isLoadingDeps} // Indicate if map is still loading
                onEditRequest={handleOpenEditDialog}
                onDeleteRequest={handleOpenDeleteDialog}
            />
        );
    };

    return (
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                {/* Page Title (Optional but nice) */}
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
                            {/* Disable button if departments haven't loaded yet for the form dropdown */}
                            <Button size="sm" disabled={isLoadingDeps}>
                                Create User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            {" "}
                            {/* Adjust size if needed */}
                            <DialogHeader>
                                <DialogTitle>Create New User</DialogTitle>
                                <DialogDescription>
                                    Fill in the user details below.
                                </DialogDescription>
                            </DialogHeader>
                            {/* Render form only when departments are loaded */}
                            {departments ? (
                                <AddUserForm
                                    orgId={orgId}
                                    departments={departments} // Pass departments for selection
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
                        disabled={isLoadingUsers || isRefetchingUsers}
                    >
                        {isRefetchingUsers ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isRefetchingUsers ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </div>

            {/* Render Table or Loading/Error State */}
            {renderContent()}

            {/* --- Edit User Dialog --- */}
            {userForEdit && (
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) handleCloseEditDialog();
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Make changes to {userForEdit.firstName}{" "}
                                {userForEdit.lastName} ({userForEdit.email}).
                            </DialogDescription>
                        </DialogHeader>
                        {/* Render form only when departments are loaded */}
                        {departments ? (
                            <EditUserForm
                                orgId={orgId}
                                userToEdit={userForEdit}
                                departments={departments} // Pass departments for selection
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

            {/* --- Delete Confirmation Dialog --- */}
            {userForDelete && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) handleCloseDeleteDialog();
                    }}
                    itemName={
                        `${userForDelete.firstName} ${userForDelete.lastName}` ??
                        "this user"
                    }
                    itemType="user"
                    onConfirm={handleConfirmDelete}
                    isPending={deleteUserMutation.isPending}
                />
            )}
        </div>
    );
}
