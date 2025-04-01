"use client";

import "@/styles/console/hospConsole.css";
import React, { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { HospCard } from "@/components/hosp/HospCard";
import { useParams } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    // No AlertDialogTrigger needed here, we control it with state
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { AddHospForm } from "@/components/hosp/AddHospForm";
import { useDeleteHosp, useHosps, useUpdateHosp } from "@/hooks/useHosps";
import { Hosp } from "@/types/hospTypes";
import { EditHospForm } from "@/components/hosp/EditHospForm"; // Import the React Query hook

export default function HospitalsPage() {
    const params = useParams();
    const orgId = params.orgId as string; // Extract orgId from route params
    const [open, setOpen] = useState(false); // State for the Add Hospital Dialog

    // Use the React Query hook to fetch hospitals for the current organisation
    // It replaces the useContext call
    const {
        data: hosps,
        isLoading,
        error,
        refetch: refetchHosps,
    } = useHosps(orgId);

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingHosp, setEditingHosp] = useState<Hosp | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingHosp, setDeletingHosp] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const updateHospMutation = useUpdateHosp();
    const deleteHospMutation = useDeleteHosp();

    const handleEdit = (hospToEdit: Hosp) => {
        console.log("Editing hospital:", hospToEdit);
        setEditingHosp(hospToEdit); // Store the hospital data
        setIsEditDialogOpen(true); // Open the edit dialog
    };

    // Called by HospCard's Delete button
    const handleDelete = (hospitalId: string, hospitalName: string) => {
        console.log(
            "Requesting delete for hospital:",
            hospitalId,
            hospitalName,
        );
        setDeletingHosp({ id: hospitalId, name: hospitalName }); // Store ID and name
        setIsDeleteDialogOpen(true); // Open the delete confirmation dialog
    };

    // Called when the Delete Confirmation Dialog's "Delete" button is clicked
    const handleConfirmDelete = () => {
        if (!deletingHosp || !orgId) return; // Safety checks

        console.log(`Confirming delete for hospital: ${deletingHosp.id}`);
        deleteHospMutation.mutate(
            {
                id: deletingHosp.id,
                orgId: orgId, // Pass orgId for list invalidation
            },
            {
                onSuccess: () => {
                    // Toast is handled by the hook's onSuccess
                    setIsDeleteDialogOpen(false); // Close dialog on success
                    setDeletingHosp(null); // Clear the target hospital
                },
                onError: (error) => {
                    // Toast is handled by the hook's onError
                    console.error("Deletion failed:", error);
                    // Keep dialog open on error? Or close? User preference.
                    // Let's close it for now.
                    setIsDeleteDialogOpen(false);
                    setDeletingHosp(null);
                },
            },
        );
    };

    // Function to close edit dialog (used by Dialog's onOpenChange and form success)
    const closeEditDialog = () => {
        setIsEditDialogOpen(false);
        setEditingHosp(null); // Clear editing state when closing
    };

    if (isLoading) {
        return (
            <LoadingSpinner
                className={"flex items-center justify-center h-screen"}
                text={"Loading Hospitals..."}
                size={"xxlg"}
            />
        );
    }

    if (error) {
        console.error("7v3adTdJ - Error loading hospitals:", error);
        return <div>Error loading hospitals: {error.message}</div>;
    }

    return (
        <>
            <div className={"container"}>
                {/* Dialog for Creating a New Hospital */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Hospital</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Hospital</DialogTitle>
                            <DialogDescription>
                                Enter the details for your new hospital.
                            </DialogDescription>
                        </DialogHeader>
                        <AddHospForm onOpenChange={setOpen} orgId={orgId} />
                    </DialogContent>
                </Dialog>

                {/* Refresh Button */}
                <Button
                    className={" container w-[150px] ml-4"}
                    onClick={() => refetchHosps()}
                    variant={"outline"}
                >
                    Refresh
                </Button>

                <div className={"card-list mt-6"}>
                    {" "}
                    {(hosps ?? []).map((hosp) => (
                        <div key={hosp.id} className={"card"}>
                            <HospCard
                                hosp={hosp}
                                onEdit={handleEdit} // Pass the edit handler
                                onDelete={handleDelete} // Pass the delete handler
                            />
                        </div>
                    ))}
                    {!isLoading && hosps && hosps.length === 0 && (
                        <p className="text-center text-gray-500 col-span-full mt-4">
                            No hospitals found for this organisation.
                        </p>
                    )}
                </div>

                {/* --- Edit Hospital Dialog --- */}
                {/* Render the Dialog only when editingHosp is not null for better performance */}
                {editingHosp && (
                    <Dialog
                        open={isEditDialogOpen}
                        onOpenChange={(open) => !open && closeEditDialog()}
                    >
                        {/* Use controlled open state and handle closing */}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Edit Hospital: {editingHosp?.name}
                                </DialogTitle>
                                <DialogDescription>
                                    Update the details for this hospital.
                                </DialogDescription>
                            </DialogHeader>
                            {/* Assume EditHospForm takes hosp data and close callback */}
                            <EditHospForm
                                hospData={editingHosp}
                                orgId={orgId} // Pass orgId if needed by mutation inside form
                                onClose={closeEditDialog} // Pass function to close dialog on success
                            />
                        </DialogContent>
                    </Dialog>
                )}

                {/* --- Delete Confirmation Dialog --- */}
                <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirm Deletion
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete the hospital
                                &#34;
                                {deletingHosp?.name || ""}&#34;? This action
                                cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                disabled={deleteHospMutation.isPending}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmDelete}
                                disabled={deleteHospMutation.isPending}
                                className={buttonVariants({
                                    variant: "destructive",
                                })} // Example if using buttonVariants
                            >
                                {deleteHospMutation.isPending
                                    ? "Deleting..."
                                    : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}
