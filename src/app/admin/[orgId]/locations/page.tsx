// src/app/admin/[orgId]/locations/page.tsx
"use client";

import { useCallback, useState } from "react";
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
import { useHospLocs } from "@/hooks/useHospLoc"; // Ensure path is correct
import { AddHospLocForm } from "@/components/locations/AddHospLocForm"; // Ensure path is correct
import { HospLocDataTable } from "@/components/locations/HospLocDataTable"; // *** IMPORT THE DATA TABLE COMPONENT ***

export default function LocationsPage() {
    const params = useParams();
    const orgId = params.orgId as string; // Assert type as orgId should be present
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Fetch data using your React Query hook
    const {
        data: locations, // locations will be HospLoc[] | undefined
        isLoading,
        isError,
        error,
        refetch,
        isRefetching, // Use isRefetching for refresh button state
    } = useHospLocs(orgId);

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

    // --- Rendering Logic ---
    const renderContent = () => {
        if (isLoading) {
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

        if (isError) {
            return (
                <Alert variant="destructive" className="mt-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching Locations</AlertTitle>
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

        // Render the actual data table when data is ready
        // Pass the locations array (or an empty array if undefined/null)
        return <HospLocDataTable locations={locations ?? []} />;
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
        </div>
    );
}
