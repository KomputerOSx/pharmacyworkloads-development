"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useDep } from "@/hooks/useDeps";
import { useHosps } from "@/hooks/useHosps";
import { useHospLocs } from "@/hooks/useHospLoc";
import { AssignedLocationData } from "@/types/depTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { HospLoc } from "@/types/subDepTypes";
import {
    useDeleteDepHospLocAssignment,
    useDepHospLocAssignments,
} from "@/hooks/useDepHospLocAss";
import { AddDepAssForm } from "@/components/departments/depHospLocAss/AddDepHospLocAssForm";
import { DepAssignedLocTable } from "@/components/departments/depHospLocAss/DepHospLocAssTable";

export default function DepartmentAssignmentsPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    const depId = params.depId as string;

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<{
        id: string;
        name: string | null;
    } | null>(null);

    // --- Data Fetching ---
    const {
        data: department,
        isLoading: isLoadingDept,
        isError: isErrorDept,
        error: errorDept,
    } = useDep(depId);

    const {
        data: hospitals,
        isLoading: isLoadingHospitals,
        isError: isErrorHospitals,
        error: errorHospitals,
        refetch: refetchHospitals,
    } = useHosps(orgId);

    const {
        data: assignedRaw, // Raw assignment data { departmentId, locationId, ... }
        isLoading: isLoadingAssignments,
        isError: isErrorAssignments,
        error: errorAssignments,
        refetch: refetchAssignments,
    } = useDepHospLocAssignments(depId);

    const {
        data: locations, // All locations { id, name, ... }
        isLoading: isLoadingLocations,
        isError: isErrorLocations,
        error: errorLocations,
        refetch: refetchLocations,
    } = useHospLocs(orgId);

    // --- Data Processing ---

    // CORRECTED: Map for location ID -> full location object
    const locationsMap = useMemo(() => {
        if (!locations) return new Map<string, HospLoc>();
        return new Map(locations.map((loc) => [loc.id, loc]));
    }, [locations]);

    // ADDED: Map for hospital ID -> hospital name
    const hospitalNameMap = useMemo(() => {
        if (!hospitals) return new Map<string, string>();
        return new Map(
            hospitals.map((hosp) => [hosp.id, hosp.name ?? "Unnamed Hospital"]),
        );
    }, [hospitals]);

    // CORRECTED: Process assigned locations to include names AND hospId
    const processedAssignments = useMemo((): AssignedLocationData[] => {
        if (!assignedRaw) return [];

        return assignedRaw.map((ass) => {
            // Find the corresponding full location object to get name AND hospId
            const locationDetails = locationsMap.get(ass.locationId);

            // Ensure the returned object matches the AssignedLocationData type
            const processed: AssignedLocationData = {
                assignmentId: ass.id,
                locationId: ass.locationId,
                locationName: locationDetails?.name ?? null, // Get name from details
                hospId: locationDetails?.hospId ?? null, // <-- Get hospId from details
                assignedAt: ass.createdAt,
                id: ass.id,
                createdAt: ass.createdAt,
                updatedAt: ass.updatedAt,
            };
            return processed;
        }); //.filter(item => item !== null); // Filter nulls if map could potentially return null
    }, [assignedRaw, locationsMap]); // Depend on raw assignments and the locations map

    // --- Mutations ---
    const { mutate: deleteAssignment, isPending: isDeleting } =
        useDeleteDepHospLocAssignment();

    const handleRefresh = () => {
        void refetchAssignments();
        void refetchLocations();
        void refetchHospitals();
        // refetch department if needed
    };

    const handleOpenDeleteDialog = (
        assignmentId: string,
        locationName: string | null,
    ) => {
        setAssignmentToDelete({
            id: assignmentId,
            name: locationName ?? "this assignment",
        });
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setAssignmentToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (!assignmentToDelete) return;

        deleteAssignment(
            { id: assignmentToDelete.id, departmentId: depId }, // Pass assignment ID and department ID
            {
                onSuccess: () => {
                    handleCloseDeleteDialog();
                },
                onError: (error) => {
                    console.error(error);
                },
            },
        );
    };

    // --- Render Logic ---
    const renderAssignmentTable = () => {
        const isLoading =
            isLoadingAssignments ||
            isLoadingLocations ||
            isLoadingHospitals ||
            isLoadingDept;
        const isError =
            isErrorAssignments ||
            isErrorLocations ||
            isErrorHospitals ||
            isErrorDept;
        const error =
            errorAssignments || errorLocations || errorHospitals || errorDept;

        if (isLoading) {
            // Simple Skeleton for the table area
            return (
                <div className="mt-6 space-y-4 rounded-md border p-4">
                    <Skeleton className="h-8 w-1/3" /> {/* Title/Header */}
                    <Skeleton className="h-10 w-full" /> {/* Table Header */}
                    <Skeleton className="h-8 w-full" /> {/* Row 1 */}
                    <Skeleton className="h-8 w-full" /> {/* Row 2 */}
                    <Skeleton className="h-8 w-full" /> {/* Row 3 */}
                    <Skeleton className="h-8 w-2/3 mt-4" /> {/* Pagination */}
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

        // Render the actual data table
        return (
            <DepAssignedLocTable
                assignments={processedAssignments}
                onDeleteRequest={handleOpenDeleteDialog}
                isLoadingLocations={isLoadingLocations} // For location name cell skeleton
                hospitalNameMap={hospitalNameMap} // <-- Pass correct map
                isLoadingHospitals={isLoadingHospitals} // <-- Pass correct loading state
            />
        );
    };

    // Get department name for title, handle loading
    const currentDepartmentName = isLoadingDept
        ? "Department..."
        : (department?.name ?? "Department Assignments");

    return (
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Assignments for: {currentDepartmentName}
                </h1>
                <div className={"flex gap-2"}>
                    <Button
                        variant={"outline"}
                        size="sm"
                        onClick={handleRefresh}
                        // CORRECTED: Disable button based on all relevant loading states
                        disabled={
                            isLoadingAssignments ||
                            isLoadingLocations ||
                            isLoadingHospitals ||
                            isLoadingDept
                        }
                    >
                        {(isLoadingAssignments ||
                            isLoadingLocations ||
                            isLoadingHospitals ||
                            isLoadingDept) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Refresh Data
                    </Button>
                    <Link href={`/admin/${orgId}/departments/`}>
                        <Button size="sm" variant={"default"}>
                            Back to Departments
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Add Assignment Form */}
            <AddDepAssForm
                onSuccess={refetchAssignments} // Refetch assignments list on successful add
                // onCancel can be added if needed
            />

            {/* Assigned Locations Table Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold tracking-tight mb-4">
                    Currently Assigned Locations
                </h2>
                {renderAssignmentTable()}
            </div>

            {/* Delete Confirmation Dialog */}
            {assignmentToDelete && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) handleCloseDeleteDialog();
                    }}
                    itemName={`assignment for "${assignmentToDelete.name}"`}
                    itemType="location assignment"
                    onConfirm={handleConfirmDelete}
                    isPending={isDeleting} // Pass loading state to dialog
                />
            )}
        </div>
    );
}
