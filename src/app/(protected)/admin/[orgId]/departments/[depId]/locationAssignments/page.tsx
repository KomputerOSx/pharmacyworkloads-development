"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDep } from "@/hooks/admin/useDeps";
import { useHosps } from "@/hooks/admin/useHosps";
import { useHospLocs } from "@/hooks/admin/useHospLoc";
import { AssignedLocationData } from "@/types/depTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { HospLoc } from "@/types/subDepTypes";
import {
    useDeleteDepHospLocAssignment,
    useDepHospLocAssignments,
} from "@/hooks/admin/useDepHospLocAss";
import { AddDepAssForm } from "@/components/departments/depHospLocAss/AddDepHospLocAssForm";
import { DepAssignedLocTable } from "@/components/departments/depHospLocAss/DepHospLocAssTable";

export default function DepartmentAssignmentsPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    const depId = params.depId as string;
    const router = useRouter();
    // State for delete confirmation
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

    // ADDED: Fetch Hospitals
    const {
        data: hospitals,
        isLoading: isLoadingHospitals,
        isError: isErrorHospitals,
        error: errorHospitals,
        refetch: refetchHospitals,
        isRefetching: isRefetchingHospitals,
    } = useHosps(orgId);

    const {
        data: assignedRaw,
        isLoading: isLoadingAssignments,
        isError: isErrorAssignments,
        error: errorAssignments,
        refetch: refetchAssignments,
        isRefetching: isRefetchingAssignments,
    } = useDepHospLocAssignments(depId);

    const {
        data: locations,
        isLoading: isLoadingLocations,
        isError: isErrorLocations,
        error: errorLocations,
        refetch: refetchLocations,
        isRefetching: isRefetchingLocations,
    } = useHospLocs(orgId);

    const isRefetching =
        isRefetchingAssignments ||
        isRefetchingLocations ||
        isRefetchingHospitals;

    // --- Data Processing ---
    const locationsMap = useMemo(() => {
        if (!locations) return new Map<string, HospLoc>();
        return new Map(locations.map((loc) => [loc.id, loc]));
    }, [locations]);

    const hospitalNameMap = useMemo(() => {
        if (!hospitals) return new Map<string, string>();
        return new Map(
            hospitals.map((hosp) => [hosp.id, hosp.name ?? "Unnamed Hospital"]),
        );
    }, [hospitals]);

    const processedAssignments = useMemo((): AssignedLocationData[] => {
        if (!assignedRaw) return [];

        return assignedRaw.map((ass) => {
            const locationDetails = locationsMap.get(ass.locationId);

            const processed: AssignedLocationData = {
                assignmentId: ass.id,
                locationId: ass.locationId,
                locationName: locationDetails?.name ?? null,
                hospId: locationDetails?.hospId ?? null,
                assignedAt: ass.createdAt,
                id: ass.id,
                createdAt: ass.createdAt,
                updatedAt: ass.updatedAt,
            };
            return processed;
        });
    }, [assignedRaw, locationsMap]);

    // --- Mutations ---
    const { mutate: deleteAssignment, isPending: isDeleting } =
        useDeleteDepHospLocAssignment();

    useEffect(() => {
        if (!isLoadingDept) {
            if (depId !== department?.id) {
                router.replace("/404");
            }
        }
    }, [depId, department, isLoadingDept, router]);

    // --- Event Handlers ---
    const handleRefresh = () => {
        void refetchAssignments();
        void refetchLocations();
        void refetchHospitals();
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
                    Locations Assignments for: {currentDepartmentName}
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

                        {isRefetching ? "Refreshing..." : "Refresh"}
                    </Button>

                    <Link
                        href={`/admin/${orgId}/departments/${depId}/departmentTeams`}
                        className="col-span-2 sm:col-span-1"
                    >
                        <Button size="sm" variant="outline" className="w-full">
                            <MapPin className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                            Assignments
                        </Button>
                    </Link>
                    <Link
                        href={`/admin/${orgId}/departments/`}
                        className="col-span-2 sm:col-span-1"
                    >
                        <Button size="sm" variant="default" className="w-full">
                            Back to Departments
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Add Assignment Form */}
            <div className={"mt-4"}>
                <AddDepAssForm onSuccess={refetchAssignments} />
            </div>

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
                    itemName={`assignment ${assignmentToDelete.name}`}
                    itemType="location assignment"
                    onConfirm={handleConfirmDelete}
                    isPending={isDeleting} // Pass loading state to dialog
                />
            )}
        </div>
    );
}
