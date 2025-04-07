// "use client";
//
// import { useParams } from "next/navigation";
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { useDepHospLocAssignments } from "@/hooks/useDepAss";
// import Link from "next/link";
// import { LoadingSpinner } from "@/components/ui/loadingSpinner";
// import { Loader2, Plus } from "lucide-react";
// import { useDep } from "@/hooks/useDeps";
// import { useState } from "react";
// import { AddDepAssForm } from "@/components/departments/AddDepAssForm";
//
// export default function DepartmentAssignmentPage() {
//     const params = useParams();
//     const orgId = params.orgId as string;
//     const depId = params.depId as string;
//
//     const {
//         data: depHospLocAssignments,
//         isLoading,
//         refetch,
//         isRefetching,
//     } = useDepHospLocAssignments(depId);
//
//     const { data: currentDep, isLoading: isLoadingDep } = useDep(depId);
//
//     const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//
//     if (isLoading || isLoadingDep) {
//         return (
//             <div className="flex h-screen items-center justify-center">
//                 <LoadingSpinner text="Loading data..." size="lg" />
//             </div>
//         );
//     }
//     return (
//         <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
//             <h1>
//                 <strong>{currentDep?.name}</strong> Assignment Page
//             </h1>
//             <p>Organisation ID: {orgId}</p>
//             <p>Department ID: {depId}</p>
//
//             <div className="flex items-center gap-2 flex-shrink-0">
//                 {" "}
//                 {/* Buttons group */}
//                 <Dialog
//                     open={isCreateDialogOpen}
//                     onOpenChange={setIsCreateDialogOpen}
//                 >
//                     <DialogTrigger asChild>
//                         <Button size="sm">
//                             <Plus className="" />
//                             Assign Location
//                         </Button>
//                     </DialogTrigger>
//                     <DialogContent className="sm:max-w-[425px]">
//                         {" "}
//                         {/* Adjust width as needed */}
//                         <DialogHeader>
//                             <DialogTitle>Create New Location</DialogTitle>
//                             <DialogDescription>
//                                 Fill in the details below. Click save when
//                                 you&#39;re done.
//                             </DialogDescription>
//                             <AddDepAssForm onSuccess={() => refetch()} />
//                         </DialogHeader>
//                     </DialogContent>
//                 </Dialog>
//                 <Button
//                     variant={"outline"}
//                     size="sm"
//                     onClick={() => refetch()}
//                     disabled={isLoading || isRefetching} // Disable while loading or refetching
//                 >
//                     {isRefetching ? (
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     ) : null}
//                     {isRefetching ? "Refreshing..." : "Refresh"}
//                 </Button>
//                 <Link href={`/admin/${orgId}/departments/`}>
//                     <Button size="sm" variant={"secondary"}>
//                         Back to Departments
//                     </Button>
//                 </Link>
//             </div>
//         </div>
//     );
// }

// src/app/(your-path)/[orgId]/departments/[depId]/page.tsx (Example Path)
"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Terminal } from "lucide-react"; // Import icons

// Your Hooks
import {
    useDepHospLocAssignments,
    useDeleteDepHospLocAssignment,
} from "@/hooks/useDepAss";
import { useHospLocs } from "@/hooks/useHospLoc"; // To get location names
import { useDep } from "@/hooks/useDeps"; // To get department name (optional)

// Your Components
import { AddDepAssForm } from "@/components/departments/AddDepAssForm"; // Your existing form
import { DepAssignedLocTable } from "@/components/departments/DepAssignedLocTable"; // The table component
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog"; // Assuming you have this
import { AssignedLocationData } from "@/types/depTypes"; // Import the processed type
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";

// --- Page Component ---
export default function DepartmentAssignmentsPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    const depId = params.depId as string;

    // State for delete confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<{
        id: string;
        name: string | null;
    } | null>(null);

    // --- Data Fetching ---
    const {
        data: department, // Fetch single department info if needed for title
        isLoading: isLoadingDept,
        isError: isErrorDept,
        error: errorDept,
    } = useDep(depId); // Assuming useDeps can fetch a single one

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

    // Create a map for quick location name lookup
    const locationNameMap = useMemo(() => {
        if (!locations) return new Map<string, string>();
        return new Map(
            locations.map((loc) => [loc.id, loc.name ?? "Unnamed Location"]),
        );
    }, [locations]);

    const processedAssignments = useMemo((): AssignedLocationData[] => {
        if (!assignedRaw) return [];

        return assignedRaw.map((ass) => {
            // Ensure createdAt is a Date object
            let assignedAtDate: Date | null = null;
            if (ass.createdAt) {
                // Check if it's a Firestore Timestamp and convert
                if (
                    typeof ass.createdAt === "object" &&
                    "toDate" in ass.createdAt
                ) {
                    assignedAtDate = (ass.createdAt as Timestamp).toDate();
                } else if (ass.createdAt instanceof Date) {
                    assignedAtDate = ass.createdAt;
                }
                // Add handling for string dates if necessary
            }

            return {
                assignmentId: ass.id,
                locationId: ass.locationId,
                locationName:
                    locationNameMap.get(ass.locationId) ?? "Unnamed Location",
                assignedAt: assignedAtDate,
                id: ass.id, // Add this property
                createdAt: ass.createdAt, // Add this property
                updatedAt: ass.updatedAt, // Add this property
            };
        });
    }, [assignedRaw, locationNameMap]);

    // --- Mutations ---
    const { mutate: deleteAssignment, isPending: isDeleting } =
        useDeleteDepHospLocAssignment();

    // --- Event Handlers ---
    const handleRefresh = () => {
        refetchAssignments();
        refetchLocations();
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
                    toast.success(
                        `Assignment for "${assignmentToDelete.name}" deleted.`,
                    );
                    handleCloseDeleteDialog();
                    // No need to manually refetch if invalidateQueries works correctly in the hook
                },
                onError: (error) => {
                    toast.error(
                        `Failed to delete assignment: ${error.message}`,
                    );
                    // Optionally keep the dialog open on error
                },
            },
        );
    };

    // --- Render Logic ---
    const renderAssignmentTable = () => {
        const isLoading =
            isLoadingAssignments || isLoadingLocations || isLoadingDept; // Combine loading states
        const isError = isErrorAssignments || isErrorLocations || isErrorDept;
        const error = errorAssignments || errorLocations || errorDept; // Show first error

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
                isLoadingLocations={isLoadingLocations} // Pass loading state for skeleton in cell
            />
        );
    };

    // Get department name for title, handle loading
    const currentDepartmentName = isLoadingDept
        ? "Department..."
        : (department?.name ?? "Department Assignments");

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
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
                        disabled={isLoadingAssignments || isLoadingLocations} // Adjust disabling logic
                    >
                        {(isLoadingAssignments || isLoadingLocations) && (
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
                    isPending={isDeleting}
                />
            )}
        </div>
    );
}
