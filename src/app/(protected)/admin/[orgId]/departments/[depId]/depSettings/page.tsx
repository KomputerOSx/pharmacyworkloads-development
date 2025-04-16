// src/app/(protected)/admin/[orgId]/departments/[depId]/settings/page.tsx

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link"; // Import Link

// Hooks (Assuming these exist based on your other components)
import { useDep, useUpdateDep, useDeleteDep } from "@/hooks/useDeps";

// Common Components
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog"; // Adjust path if needed
import { LoadingSpinner } from "@/components/ui/loadingSpinner"; // Adjust path if needed

// Shadcn UI Imports
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { DepartmentModuleAssignmentSection } from "@/components/modules/DepartmentModuleAssignmentSection"; // Added Icons

export default function DepartmentSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;
    const depId = params.depId as string; // Get depId from params

    // State for form fields and UI control
    const [name, setName] = useState("");
    const [active, setActive] = useState(false); // Reflects DB state
    const [uiActiveSelection, setUiActiveSelection] = useState<
        "active" | "inactive" | ""
    >(""); // Controls ToggleGroup UI

    // State for dialogs and loading
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeactivationDialogOpen, setIsDeactivationDialogOpen] =
        useState(false);
    const [isTogglingActive, setIsTogglingActive] = useState(false);

    // Data Fetching and Mutations
    const {
        data: depData,
        isLoading: isLoadingDep,
        isError: isErrorDep,
        error: errorDep,
        refetch: refetchDep, // Add refetch if needed
    } = useDep(depId); // Use useDep hook

    const updateMutation = useUpdateDep(); // For name update
    const updateActiveStatusMutation = useUpdateDep(); // For immediate active toggle
    const deleteMutation = useDeleteDep(); // Use useDeleteDep hook

    // Populate form state when department data loads
    useEffect(() => {
        if (depData) {
            setName(depData.name || "");
            const currentDbActiveState = depData.active ?? false;
            setActive(currentDbActiveState);
            setUiActiveSelection(currentDbActiveState ? "active" : "inactive");
        }
    }, [depData]);

    // Redirect on successful deletion
    useEffect(() => {
        if (deleteMutation.isSuccess) {
            toast.info(`Department ${depData?.name} deleted. Redirecting...`);
            // Redirect back to the main departments list for the org
            router.push(`/admin/${orgId}/departments`);
        }
    }, [deleteMutation.isSuccess, router, orgId, depData?.name]);

    // Handler for saving name changes
    const handleSaveChanges = async (e: FormEvent) => {
        e.preventDefault();
        if (!orgId || !depId || !depData) return;
        void refetchDep();

        // Basic validation (can be enhanced with zod if needed)
        if (!name.trim()) {
            toast.error("Department name cannot be empty.");
            return;
        }

        const fieldsToUpdate = { name: name.trim() }; // Only update name here

        updateMutation.mutate(
            { id: depId, data: fieldsToUpdate, orgId: orgId }, // Pass necessary IDs and data
            {
                onSuccess: (updatedDep) => {
                    toast.success(`Department "${updatedDep.name}" updated.`);
                    // Optionally refetch data if needed, though mutation might handle cache update
                    // refetchDep();
                },
                onError: (error) => {
                    console.error("Failed to update department name:", error);
                    toast.error(`Update failed: ${error.message}`);
                },
            },
        );
    };

    // Handler for confirming deletion
    const handleDeleteConfirm = () => {
        if (!orgId || !depId) return;
        // Assuming useDeleteDep needs { id, orgId } or similar context
        deleteMutation.mutate(
            { id: depId, orgId: orgId },
            {
                onSuccess: () => setIsDeleteDialogOpen(false), // Dialog closed automatically on success redirect
                onError: (error) => {
                    console.error("Delete failed:", error);
                    toast.error(`Delete failed: ${error.message}`);
                },
            },
        );
    };

    // Handler for toggling the active/inactive status
    const handleActiveToggleChange = (newValue: string) => {
        if (!newValue || isTogglingActive || !orgId || !depId) return;

        const intendedToBeActive = newValue === "active";
        const currentDbState = active;

        if (intendedToBeActive === currentDbState) {
            setUiActiveSelection(newValue as "active" | "inactive");
            return; // No change needed
        }

        setUiActiveSelection(newValue as "active" | "inactive"); // Optimistic UI update

        if (intendedToBeActive) {
            // Activate Immediately
            setIsTogglingActive(true);
            updateActiveStatusMutation.mutate(
                { id: depId, data: { active: true }, orgId: orgId },
                {
                    onSuccess: (updatedDep) => {
                        toast.success(
                            `Department "${updatedDep.name}" activated.`,
                        );
                        setActive(true);
                        setUiActiveSelection("active");
                    },
                    onError: (error) => {
                        toast.error(`Failed to activate: ${error.message}`);
                        setUiActiveSelection(
                            currentDbState ? "active" : "inactive",
                        ); // Revert UI
                    },
                    onSettled: () => setIsTogglingActive(false),
                },
            );
        } else {
            // Deactivate: Show Confirmation Dialog
            setIsDeactivationDialogOpen(true);
        }
    };

    // Handler for confirming deactivation from the dialog
    const handleConfirmDeactivation = () => {
        if (!orgId || !depId) return;
        setIsDeactivationDialogOpen(false);
        setIsTogglingActive(true);

        updateActiveStatusMutation.mutate(
            { id: depId, data: { active: false }, orgId: orgId },
            {
                onSuccess: (updatedDep) => {
                    toast.warning(
                        `Department "${updatedDep.name}" deactivated.`,
                    );
                    setActive(false);
                    setUiActiveSelection("inactive");
                },
                onError: (error) => {
                    toast.error(`Failed to deactivate: ${error.message}`);
                    setUiActiveSelection("active"); // Revert UI (it was active before failure)
                },
                onSettled: () => setIsTogglingActive(false),
            },
        );
    };

    // Handler for cancelling deactivation
    const handleCancelDeactivation = () => {
        setIsDeactivationDialogOpen(false);
        // Revert optimistic UI selection only if deactivation was attempted
        if (uiActiveSelection === "inactive") {
            setUiActiveSelection("active");
        }
    };

    // --- Render Logic ---
    if (isLoadingDep) {
        return (
            <div className="flex justify-center items-center min-h-[300px] p-4">
                <LoadingSpinner text="Loading department details..." />
            </div>
        );
    }

    if (isErrorDep || !depData) {
        return (
            <div className="text-center text-red-600 py-10 px-4">
                Error loading department:{" "}
                {errorDep?.message || "Department not found."}
                <div className="mt-4">
                    <Link href={`/admin/${orgId}/departments`} passHref>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Departments
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const isProcessingGeneral =
        updateMutation.isPending ||
        deleteMutation.isPending ||
        isTogglingActive;
    const isToggleDisabled = isTogglingActive || isDeactivationDialogOpen;

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow w-full max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
                {/* Header and Back Button */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Department Settings: {depData.name}
                    </h1>
                    <Link href={`/admin/${orgId}/departments`} passHref>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Departments List
                        </Button>
                    </Link>
                </div>

                {/* Card for Name */}
                <Card>
                    <form onSubmit={handleSaveChanges}>
                        <CardHeader>
                            <CardTitle>Department Details</CardTitle>
                            <CardDescription></CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2 mt-4">
                                <Label htmlFor="dep-name">
                                    Department Name
                                </Label>
                                <Input
                                    id="dep-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isProcessingGeneral}
                                    className="max-w-lg"
                                    placeholder="e.g., Cardiology, Emergency"
                                />
                                {updateMutation.isError && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {updateMutation.error?.message ||
                                            "Failed to save name."}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6 mt-6">
                            <Button
                                type="submit"
                                disabled={
                                    isProcessingGeneral || name === depData.name
                                } // Disable if name hasn't changed
                            >
                                {updateMutation.isPending ? (
                                    <LoadingSpinner
                                        size="sm"
                                        className="mr-2"
                                    />
                                ) : null}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Card for Active Status */}

                <div className="space-y-3 rounded-md border border-border p-4 max-w-lg">
                    <Label className="font-medium text-base flex items-center gap-2">
                        Current Status:
                        {isTogglingActive ? (
                            <LoadingSpinner size="sm" />
                        ) : active ? (
                            <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" /> Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-destructive">
                                <XCircle className="h-4 w-4" /> Inactive
                            </span>
                        )}
                    </Label>
                    <ToggleGroup
                        type="single"
                        value={uiActiveSelection}
                        onValueChange={handleActiveToggleChange}
                        disabled={isToggleDisabled}
                        className="justify-start gap-2"
                        aria-label="Department status toggle"
                    >
                        <ToggleGroupItem
                            value="active"
                            aria-label="Set active"
                            className="data-[state=on]:bg-green-100 data-[state=on]:text-green-700 dark:data-[state=on]:bg-green-900/50 dark:data-[state=on]:text-green-300 border-green-300 dark:border-green-700"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" /> Active
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="inactive"
                            aria-label="Set inactive"
                            className="data-[state=on]:bg-red-100 data-[state=on]:text-red-700 dark:data-[state=on]:bg-red-900/50 dark:data-[state=on]:text-red-300 border-red-300 dark:border-red-700"
                        >
                            <XCircle className="h-4 w-4 mr-2" /> Inactive
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <p className="text-xs text-muted-foreground pt-2">
                        Toggling to &#39;Inactive&#39; requires confirmation.
                    </p>
                    {updateActiveStatusMutation.isError && (
                        <p className="text-sm text-red-600 mt-1">
                            {updateActiveStatusMutation.error?.message ||
                                "Failed to update status."}
                        </p>
                    )}
                </div>

                <DepartmentModuleAssignmentSection
                    depId={depId}
                    orgId={orgId}
                    departmentName={depData.name}
                />

                {/* Delete Section */}
                <Separator className="my-8" />
                <Card className="border-destructive bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-destructive/90">
                            Permanently delete this department ({depData.name}).
                            This action cannot be undone and will remove
                            associated teams and assignments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            disabled={
                                isProcessingGeneral || deleteMutation.isSuccess
                            }
                            className="w-full sm:w-auto"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <LoadingSpinner
                                        size="sm"
                                        className="mr-2"
                                    />{" "}
                                    Deleting...
                                </>
                            ) : (
                                "Delete Department Permanently"
                            )}
                        </Button>
                        {deleteMutation.isError && (
                            <p className="text-sm text-red-600 mt-2">
                                {deleteMutation.error?.message ||
                                    "Failed to delete department."}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Deactivation Confirmation Dialog */}
            <AlertDialog open={isDeactivationDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-destructive" />{" "}
                            Confirm Deactivation
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Setting{" "}
                            <strong className="text-foreground">
                                {depData.name}
                            </strong>{" "}
                            as inactive may prevent assigning users/locations to
                            it and hide it in some lists. Are you sure?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={handleCancelDeactivation}
                            disabled={isTogglingActive}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className={buttonVariants({
                                variant: "destructive",
                            })}
                            onClick={handleConfirmDeactivation}
                            disabled={isTogglingActive}
                        >
                            {isTogglingActive ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                            ) : null}
                            Confirm Deactivation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            {isDeleteDialogOpen && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    itemName={depData.name}
                    itemType="department"
                    onConfirm={handleDeleteConfirm}
                    isPending={deleteMutation.isPending}
                />
            )}
        </div>
    );
}
