// Example path: src/app/(protected)/admin/[orgId]/settings/page.tsx
// Or: src/app/(protected)/superuser/[orgId]/settings/page.tsx

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrg, useUpdateOrg, useDeleteOrg } from "@/hooks/useOrgs"; // Adjust path
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog"; // Adjust path
import { LoadingSpinner } from "@/components/ui/loadingSpinner"; // Adjust path
import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { Input } from "@/components/ui/input"; // Adjust path
import { Label } from "@/components/ui/label"; // Adjust path
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // Import ToggleGroup
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"; // Adjust path
import { Separator } from "@/components/ui/separator"; // Adjust path
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Adjust path
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function OrgSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [active, setActive] = useState(false); // Reflects DB state
    const [uiActiveSelection, setUiActiveSelection] = useState<
        "active" | "inactive" | ""
    >(""); // Controls ToggleGroup UI

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeactivationDialogOpen, setIsDeactivationDialogOpen] =
        useState(false);
    const [isTogglingActive, setIsTogglingActive] = useState(false);

    const {
        data: orgData,
        isLoading: isLoadingOrg,
        isError: isErrorOrg,
        error: errorOrg,
        refetch: refetchOrgData,
    } = useOrg(orgId);

    const updateMutation = useUpdateOrg(); // For name, type, contacts
    const updateActiveStatusMutation = useUpdateOrg(); // For immediate active toggle
    const deleteMutation = useDeleteOrg();

    // Populate form state when orgData loads
    useEffect(() => {
        if (orgData) {
            setName(orgData.name || "");
            setType(orgData.type || "");
            setContactEmail(orgData.contactEmail || "");
            setContactPhone(orgData.contactPhone || "");
            const currentDbActiveState = orgData.active ?? false;
            setActive(currentDbActiveState);
            setUiActiveSelection(currentDbActiveState ? "active" : "inactive");
        }
    }, [orgData]);

    // Redirect on successful deletion
    useEffect(() => {
        if (deleteMutation.isSuccess) {
            toast.info(`Organisation ${orgData?.name} deleted. Redirecting...`);
            router.push("/admin/orgsConsole"); // Adjust target route if needed
        }
    }, [deleteMutation.isSuccess, router, orgData?.name]);

    const handleSaveChanges = async (e: FormEvent) => {
        e.preventDefault();
        if (!orgId || !orgData) return;

        const fieldsToUpdate = { name, type, contactEmail, contactPhone };

        updateMutation.mutate(
            { id: orgId, orgData: fieldsToUpdate },
            {
                onError: (error) => {
                    console.error("Failed to update non-active fields:", error);
                },
            },
        );
    };

    const handleDeleteConfirm = () => {
        if (!orgId) return;
        deleteMutation.mutate(orgId, {
            onSuccess: () => setIsDeleteDialogOpen(false),
            onError: (error) => console.error("Delete failed:", error),
        });
    };

    const handleActiveToggleChange = (newValue: string) => {
        if (!newValue || isTogglingActive) return; // Can be "" if deselected

        const intendedToBeActive = newValue === "active";
        const currentDbState = active;

        if (intendedToBeActive === currentDbState) {
            setUiActiveSelection(newValue as "active" | "inactive");
            return;
        }

        setUiActiveSelection(newValue as "active" | "inactive"); // Optimistic UI update

        if (intendedToBeActive) {
            // Activate Immediately
            setIsTogglingActive(true);
            updateActiveStatusMutation.mutate(
                { id: orgId, orgData: { active: true } },
                {
                    onSuccess: () => {
                        toast.success(
                            `Organisation "${orgData?.name}" activated.`,
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

    const handleConfirmDeactivation = () => {
        if (!orgId) return;
        setIsDeactivationDialogOpen(false);
        setIsTogglingActive(true);

        updateActiveStatusMutation.mutate(
            { id: orgId, orgData: { active: false } },
            {
                onSuccess: () => {
                    toast.warning(
                        `Organisation "${orgData?.name}" deactivated.`,
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

    const handleCancelDeactivation = () => {
        setIsDeactivationDialogOpen(false);
        setUiActiveSelection("active"); // Revert optimistic UI selection
    };

    // --- Render Logic ---
    if (isLoadingOrg) {
        return (
            <div className="flex justify-center items-center min-h-[300px] p-4">
                <LoadingSpinner text="Loading organisation details..." />
            </div>
        );
    }

    if (isErrorOrg || !orgData) {
        return (
            <div className="text-center text-red-600 py-10 px-4">
                Error loading organisation:{" "}
                {errorOrg?.message || "Organisation not found."}
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="mt-4"
                >
                    Go Back
                </Button>
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
                <h1 className="text-3xl font-bold tracking-tight">
                    Organisation Settings: {orgData.name}
                </h1>

                {/* Card for Name, Type, Contacts */}
                <Card>
                    <form onSubmit={handleSaveChanges}>
                        <CardHeader>
                            <CardTitle>Details & Contacts</CardTitle>
                            <CardDescription>
                                Update organisation name, type, and contact
                                information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="org-name">
                                    Organisation Name
                                </Label>
                                <Input
                                    id="org-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isProcessingGeneral}
                                    className="max-w-lg"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="org-type">Type</Label>
                                <Input
                                    id="org-type"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    placeholder="e.g., NHS Trust"
                                    disabled={isProcessingGeneral}
                                    className="max-w-lg"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="org-email">Contact Email</Label>
                                <Input
                                    id="org-email"
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) =>
                                        setContactEmail(e.target.value)
                                    }
                                    placeholder="e.g., admin@org.com"
                                    disabled={isProcessingGeneral}
                                    className="max-w-lg"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="org-phone">Contact Phone</Label>
                                <Input
                                    id="org-phone"
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) =>
                                        setContactPhone(e.target.value)
                                    }
                                    placeholder="e.g., 01234 567890"
                                    disabled={isProcessingGeneral}
                                    className="max-w-lg"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6 mt-6">
                            <Button
                                type="submit"
                                disabled={isProcessingGeneral || !orgData}
                            >
                                {updateMutation.isPending ? (
                                    <LoadingSpinner
                                        size="sm"
                                        className="mr-2"
                                    />
                                ) : null}
                                Save Detail Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Card for Active Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Organisation Status</CardTitle>
                        <CardDescription>
                            Set the organisation active or inactive. Changes are
                            applied immediately.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 rounded-md border border-border p-4 max-w-lg">
                            <Label className="font-medium text-base flex items-center gap-2">
                                Current Status:
                                {isTogglingActive ? (
                                    <LoadingSpinner size="sm" />
                                ) : active ? (
                                    <span className="flex items-center gap-1 text-green-600">
                                        <CheckCircle className="h-4 w-4" />{" "}
                                        Active
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
                                aria-label="Organisation status toggle"
                            >
                                <ToggleGroupItem
                                    value="active"
                                    aria-label="Set active"
                                    className="data-[state=on]:bg-green-100 data-[state=on]:text-green-700 dark:data-[state=on]:bg-green-900/50 dark:data-[state=on]:text-green-300 border-green-300 dark:border-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />{" "}
                                    Active
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                    value="inactive"
                                    aria-label="Set inactive"
                                    className="data-[state=on]:bg-red-100 data-[state=on]:text-red-700 dark:data-[state=on]:bg-red-900/50 dark:data-[state=on]:text-red-300 border-red-300 dark:border-red-700"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />{" "}
                                    Inactive
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <p className="text-xs text-muted-foreground pt-2">
                                Toggling to &apos;Inactive&apos; requires
                                confirmation.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Section */}
                <Separator className="my-8" />
                <Card className="border-destructive bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-destructive/90">
                            Permanently delete this organisation ({orgData.name}
                            ).
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
                                "Delete Organisation Permanently"
                            )}
                        </Button>
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
                                {orgData.name}
                            </strong>{" "}
                            as inactive may prevent user access and hide data.
                            This change is applied immediately. Are you sure?
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
                    itemName={orgData.name}
                    itemType="organisation"
                    onConfirm={handleDeleteConfirm}
                    isPending={deleteMutation.isPending}
                />
            )}

            <footer className="py-4"></footer>
        </div>
    );
}
