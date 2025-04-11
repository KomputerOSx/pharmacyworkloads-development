// src/app/admin/[orgId]/locations/page.tsx
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
import { Loader2, Terminal } from "lucide-react"; // Added Loader2 for loading state, Building for title icon

// Custom Hooks and Components
import { useDeleteHospLoc, useHospLocs } from "@/hooks/useHospLoc"; // Ensure path is correct
import { AddHospLocForm } from "@/components/locations/AddHospLocForm"; // Ensure path is correct
import { HospLocDataTable } from "@/components/locations/HospLocDataTable";
// *** IMPORT THE DATA TABLE COMPONENT ***
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { EditHospLocForm } from "@/components/locations/EditHospLocForm";
import { Hosp } from "@/types/hospTypes";
import { useHosps } from "@/hooks/useHosps";
import { HospLoc } from "@/types/subDepTypes";

export default function LocationsPage() {
    const params = useParams();
    const orgId = params.orgId as string; // Assert type as orgId should be present
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [hospLocForEdit, setHospLocForEdit] = useState<HospLoc | null>(null);
    const [hospLocForDelete, setHospLocForDelete] = useState<HospLoc | null>(
        null,
    );

    // Fetch data using your React Query hook
    const {
        data: locations, // locations will be HospLoc[] | undefined
        isLoading,
        isError,
        refetch,
        isRefetching, // Use isRefetching for refresh button state
    } = useHospLocs(orgId);

    const {
        data: hosps,
        isLoading: isLoadingHosps,
        isError: isErrorHosps,
        error: errorHosps,
    } = useHosps(orgId);

    const hospitalNameMap = useMemo(() => {
        const map = new Map<string, string>();
        if (hosps) {
            hosps.forEach((hosp: Hosp) => {
                map.set(hosp.id, hosp.name);
            });
        }
        return map;
    }, [hosps]);

    const deleteHospLocMutation = useDeleteHospLoc();

    const handleOpenEditDialog = useCallback((location: HospLoc) => {
        console.log("Opening edit dialog for:", location.name);
        setHospLocForEdit(location);
        setIsEditDialogOpen(true);
    }, []);

    const handleCloseEditDialog = useCallback(() => {
        setIsEditDialogOpen(false);
        // Optionally clear selection after a short delay to avoid UI flicker
        setTimeout(() => setHospLocForEdit(null), 150);
    }, []);

    const handleOpenDeleteDialog = useCallback((location: HospLoc) => {
        console.log("Opening delete dialog for:", location.name);
        setHospLocForDelete(location);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
        // Optionally clear selection after a short delay
        setTimeout(() => setHospLocForDelete(null), 150);
    }, []);

    // Handle Refresh Button Click
    const handleRefresh = useCallback(() => {
        console.log("Refetching locations for org:", orgId);
        void refetch(); // Use void for promises you don't need to await
    }, [refetch, orgId]);

    // Close dialog and refetch after successful form submission
    const handleSuccessfulCreate = useCallback(() => {
        setIsCreateDialogOpen(false);
        void refetch(); // Refresh data after adding a new location
    }, [refetch]);

    const handleSuccessfulEdit = useCallback(() => {
        handleCloseEditDialog();
        void refetch();
    }, [refetch, handleCloseEditDialog]);

    const handleConfirmDelete = useCallback(() => {
        if (!hospLocForDelete || !orgId) return;

        console.log("Confirming delete for:", hospLocForDelete.id);
        deleteHospLocMutation.mutate(
            {
                id: hospLocForDelete.id,
                orgId: orgId, // Needed by the hook for cache invalidation
                // No hospId needed here based on the hook definition
            },
            {
                onSuccess: () => {
                    console.log(
                        "Location deleted successfully (via page callback, hook also runs)",
                    );
                    handleCloseDeleteDialog();
                    void refetch();
                },
                onError: (error) => {
                    console.error(
                        "Failed to delete location (via page callback, hook also runs):",
                        error,
                    );
                    handleCloseDeleteDialog();
                },
            },
        );
    }, [
        hospLocForDelete,
        orgId,
        deleteHospLocMutation,
        handleCloseDeleteDialog,
        refetch,
    ]);

    // --- Rendering Logic ---
    const renderContent = () => {
        if (isLoading || isLoadingHosps) {
            // Show skeleton loaders matching table structure more closely
            return (
                <div className="space-y-4 mt-4">
                    {/* Skeleton for Controls */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 rounded-md border p-4">
                        <Skeleton className="h-9 w-full sm:w-1/3" />
                        <Skeleton className="h-9 w-full sm:w-[180px]" />
                        <div className="flex items-center gap-2 pt-2 sm:pt-0">
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-28" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                        <Skeleton className="ml-auto h-9 w-[75px]" />
                    </div>
                    {/* Skeleton for Table */}
                    <div className="rounded-md border p-4 space-y-2">
                        <Skeleton className="h-10 w-full" /> {/* Header */}
                        <Skeleton className="h-8 w-full" /> {/* Row 1 */}
                        <Skeleton className="h-8 w-full" /> {/* Row 2 */}
                        <Skeleton className="h-8 w-full" /> {/* Row 3 */}
                        <Skeleton className="h-8 w-full" /> {/* Row 4 */}
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

        if (isError || isErrorHosps) {
            const errorToShow = isError ? isError : errorHosps;
            const errorTitle = isError
                ? "Error Fetching Locations"
                : "Error Fetching Hospitals";
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
        // Pass the locations array (or an empty array if undefined/null)
        return (
            <HospLocDataTable
                locations={locations ?? []}
                onEditRequest={handleOpenEditDialog}
                onDeleteRequest={handleOpenDeleteDialog}
                hospitalNameMap={hospitalNameMap}
                isLoadingHospitalMap={isLoadingHosps}
            />
        );
    };

    return (
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {" "}
            {/* Added container and padding */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                {" "}
                {/* Improved header layout */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {" "}
                    {/* Buttons group */}
                    <Dialog
                        open={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button size="sm">Create Location</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            {" "}
                            {/* Adjust width as needed */}
                            <DialogHeader>
                                <DialogTitle>Create New Location</DialogTitle>
                                <DialogDescription>
                                    Fill in the details below. Click save when
                                    you&#39;re done.
                                </DialogDescription>
                            </DialogHeader>
                            <AddHospLocForm
                                orgId={orgId}
                                // Pass the callback to handle success
                                onSuccessfulSubmitAction={
                                    handleSuccessfulCreate
                                }
                            />
                        </DialogContent>
                    </Dialog>
                    <Button
                        variant={"outline"}
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading || isRefetching} // Disable while loading or refetching
                    >
                        {isRefetching ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isRefetching ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </div>
            {/* Render the appropriate content (loading, error, or table) */}
            {renderContent()}
            {/* --- Edit Dialog --- */}
            {/* Render only when a location is selected */}
            {hospLocForEdit && (
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) handleCloseEditDialog();
                    }}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Location</DialogTitle>
                            <DialogDescription>
                                Make changes to {hospLocForEdit.name}.
                            </DialogDescription>
                        </DialogHeader>
                        {/* Important: Ensure locationToEdit is not null before rendering */}
                        <EditHospLocForm
                            orgId={orgId}
                            locationToEdit={hospLocForEdit}
                            onSuccessfulSubmitAction={handleSuccessfulEdit}
                        />
                    </DialogContent>
                </Dialog>
            )}
            {/* --- Delete Confirmation Dialog --- */}
            {/* Render only when a location is selected for deletion */}
            {hospLocForDelete && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) handleCloseDeleteDialog();
                    }}
                    itemName={hospLocForDelete.name ?? "this location"} // Provide a fallback name
                    itemType="location"
                    onConfirm={handleConfirmDelete}
                    isPending={deleteHospLocMutation.isPending} // Pass loading state
                />
            )}
        </div>
    );
}
