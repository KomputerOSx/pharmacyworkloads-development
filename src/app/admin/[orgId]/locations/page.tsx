// "use client";
//
// import React, { useState, useMemo, useCallback } from "react";
// import { useParams } from "next/navigation";
//
// // Shadcn UI Imports
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { AddHospLocForm } from "@/components/locations/AddHospLocForm";
// import { Skeleton } from "@/components/ui/skeleton"; // For loading state
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For error state
// import { Terminal } from "lucide-react"; // Icon for Alert
//
// // AG Grid Imports
// import { AgGridReact } from "ag-grid-react";
// import { themeQuartz } from "ag-grid-community";
// import { ColDef, ValueFormatterParams } from "ag-grid-community"; // AG Grid types
// import { ClientSideRowModelModule } from "ag-grid-community";
//
// // Your project imports
// import { useHospLocs } from "@/hooks/useHospLoc"; // Adjust path if needed
// import { HospLoc } from "@/types/hosLocTypes"; // Adjust path if needed
// import { Timestamp } from "firebase/firestore"; // Import Timestamp if needed for formatting
//
// // Helper function for date formatting
// const formatDate = (
//     dateInput: Timestamp | string | Date | null | undefined,
// ): string => {
//     if (!dateInput) return "";
//     try {
//         let date: Date;
//         if (dateInput instanceof Timestamp) {
//             date = dateInput.toDate();
//         } else if (typeof dateInput === "string") {
//             date = new Date(dateInput);
//         } else {
//             date = dateInput;
//         }
//         // Check if date is valid after conversion
//         if (isNaN(date.getTime())) {
//             return "Invalid Date";
//         }
//         return date.toLocaleDateString(undefined, {
//             // Use locale-specific format
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//         });
//     } catch (error) {
//         console.error("Error formatting date:", dateInput, error);
//         return "Error";
//     }
// };
//
// export default function LocationsPage() {
//     const params = useParams();
//     const orgId = params.orgId as string;
//     const [open, setOpen] = useState(false);
//
//     const myTheme = themeQuartz.withParams({
//         browserColorScheme: "light",
//         headerFontSize: 14,
//     });
//
//     // Fetch data using your React Query hook
//     const {
//         data: locations,
//         isLoading,
//         isError,
//         error,
//         refetch,
//     } = useHospLocs(orgId);
//
//     // Define AG Grid Column Definitions
//     const colDefs = useMemo<ColDef<HospLoc>[]>(
//         () => [
//             // { field: "id", headerName: "ID", width: 150, filter: true }, // Often hidden or less prominent
//             { field: "name", headerName: "Name", filter: true, flex: 2 },
//             { field: "type", headerName: "Type", filter: true, width: 120 },
//             { field: "address", headerName: "Address", filter: true, flex: 3 },
//             {
//                 field: "contactEmail",
//                 headerName: "Email",
//                 filter: true,
//                 flex: 2,
//             },
//             {
//                 field: "contactPhone",
//                 headerName: "Phone",
//                 filter: true,
//                 width: 150,
//             },
//             {
//                 field: "active",
//                 headerName: "Active",
//                 width: 100,
//                 filter: true,
//                 valueFormatter: (
//                     params: ValueFormatterParams<HospLoc, boolean>,
//                 ) => (params.value ? "Yes" : "No"),
//                 cellStyle: (params) => ({
//                     fontWeight: params.value ? "bold" : "normal",
//                     color: params.value ? "green" : "red",
//                 }),
//             },
//             {
//                 field: "createdAt",
//                 headerName: "Created At",
//                 filter: "agDateColumnFilter", // Use AG Grid's date filter
//                 valueFormatter: (
//                     params: ValueFormatterParams<
//                         HospLoc,
//                         Timestamp | string | null
//                     >,
//                 ) => formatDate(params.value),
//                 width: 180,
//             },
//             {
//                 field: "updatedAt",
//                 headerName: "Updated At",
//                 filter: "agDateColumnFilter",
//                 valueFormatter: (
//                     params: ValueFormatterParams<
//                         HospLoc,
//                         Timestamp | string | null
//                     >,
//                 ) => formatDate(params.value),
//                 width: 180,
//             },
//             // You might want to hide IDs unless necessary for debugging/admin tasks
//             { field: "hospId", headerName: "Hospital ID", hide: true },
//             { field: "orgId", headerName: "Org ID", hide: true },
//             { field: "createdById", headerName: "Created By ID", hide: true },
//             { field: "updatedById", headerName: "Updated By ID", hide: true },
//         ],
//         [],
//     );
//
//     // Define Default Column Options
//     const defaultColDef = useMemo<ColDef>(
//         () => ({
//             sortable: true,
//             resizable: true,
//             // filter: true, // Enable filtering by default on all columns if desired
//             floatingFilter: true, // Adds filter input below header
//             flex: 1, // Default flex value
//             minWidth: 100, // Minimum width for columns
//         }),
//         [],
//     );
//
//     // Handle Refresh Button Click
//     const handleRefresh = useCallback(() => {
//         console.log("Refetching locations for org:", orgId);
//         refetch().then();
//     }, [refetch, orgId]);
//
//     // --- Rendering Logic ---
//
//     const renderGrid = () => {
//         if (isLoading) {
//             // Show skeleton loaders matching grid structure (optional but good UX)
//             return (
//                 <div className="space-y-2 mt-4">
//                     <Skeleton className="h-10 w-full" />
//                     <Skeleton className="h-8 w-full" />
//                     <Skeleton className="h-8 w-full" />
//                     <Skeleton className="h-8 w-full" />
//                 </div>
//             );
//         }
//
//         if (isError) {
//             return (
//                 <Alert variant="destructive" className="mt-4">
//                     <Terminal className="h-4 w-4" />
//                     <AlertTitle>Error Fetching Locations</AlertTitle>
//                     <AlertDescription>
//                         {error?.message || "An unknown error occurred."}
//                     </AlertDescription>
//                 </Alert>
//             );
//         }
//
//         // AG Grid component
//         return (
//             <div
//                 className="ag-theme-quartz mt-4" // Apply AG Grid theme
//                 style={{ height: 600, width: "100%" }} // Set container dimensions
//             >
//                 <AgGridReact<HospLoc>
//                     theme={myTheme}
//                     rowData={locations ?? []} // Provide data, default to empty array if undefined
//                     columnDefs={colDefs} // Provide column definitions
//                     defaultColDef={defaultColDef} // Provide default column options
//                     pagination={true} // Enable pagination
//                     paginationPageSize={20} // Set page size
//                     paginationPageSizeSelector={[10, 20, 50, 100]} // Page size options
//                     domLayout="autoHeight" // Adjust grid height to content (alternative to fixed height)
//                     // Or keep fixed height: style={{ height: 600, width: '100%' }} on the container div
//                     animateRows={true} // Enable row animations
//                     modules={[ClientSideRowModelModule]}
//                 />
//             </div>
//         );
//     };
//
//     return (
//         <div className="container">
//             {" "}
//             {/* Add some padding */}
//             <div className="flex items-center gap-2">
//                 {" "}
//                 {/* Container for buttons */}
//                 <Dialog open={open} onOpenChange={setOpen}>
//                     <DialogTrigger asChild>
//                         <Button>Create Location</Button>
//                     </DialogTrigger>
//                     <DialogContent>
//                         <DialogHeader>
//                             <DialogTitle>Create Location</DialogTitle>
//                             <DialogDescription>
//                                 Enter the details for your new location
//                             </DialogDescription>
//                         </DialogHeader>
//                         {/* Pass orgId and close handler */}
//                         <AddHospLocForm
//                             onSuccessfulSubmitAction={() => setOpen(false)} // Close dialog on success
//                             orgId={orgId}
//                             // You might need hospId here depending on AddHospForm logic
//                             // hospId={"some-default-or-selected-hospId"}
//                         />
//                     </DialogContent>
//                 </Dialog>
//                 {/* Refresh Button - Use the handler */}
//                 <Button
//                     variant={"outline"}
//                     onClick={handleRefresh}
//                     disabled={isLoading}
//                 >
//                     {isLoading ? "Refreshing..." : "Refresh"}
//                 </Button>
//             </div>
//             {/* Render the AG Grid or loading/error state */}
//             {renderGrid()}
//         </div>
//     );
// }

// Shadcn UI Imports

"use client";

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
import { Terminal } from "lucide-react";

// Your project imports
import { useHospLocs } from "@/hooks/useHospLoc";
import { AddHospLocForm } from "@/components/locations/AddHospLocForm"; // Corrected form import path
import { HospLocGrid } from "@/components/locations/HospLocGrid";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react"; // Import the new Grid component

// AG Grid related imports are removed from here unless needed elsewhere

export default function LocationsPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    const [open, setOpen] = useState(false);

    // Fetch data using your React Query hook
    const {
        data: locations,
        isLoading,
        isError,
        error,
        refetch,
    } = useHospLocs(orgId);

    // Handle Refresh Button Click (Remains the same)
    const handleRefresh = useCallback(() => {
        console.log("Refetching locations for org:", orgId);
        void refetch();
    }, [refetch, orgId]);

    // --- Rendering Logic ---
    const renderGridContent = () => {
        if (isLoading) {
            // Show skeleton loaders matching grid structure
            return (
                <div className="space-y-2 mt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            );
        }

        if (isError) {
            return (
                <Alert variant="destructive" className="mt-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching Locations</AlertTitle>
                    <AlertDescription>
                        {error?.message || "An unknown error occurred."}
                    </AlertDescription>
                </Alert>
            );
        }

        // Render the dedicated Grid component when data is ready
        return <HospLocGrid locations={locations ?? []} />; // Pass locations data
    };

    return (
        <div className="container py-6">
            {" "}
            {/* Added padding */}
            <div className="flex justify-between items-center mb-4">
                {" "}
                {/* Improved header layout */}
                {/* Added Title */}
                <div className="flex items-center gap-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>Create Location</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Location</DialogTitle>
                                <DialogDescription>
                                    Enter the details for your new location
                                </DialogDescription>
                            </DialogHeader>
                            <AddHospLocForm
                                // Rename prop to avoid TS error if needed, or suppress error
                                onSuccessfulSubmitAction={() => setOpen(false)} // Standard callback name
                                // onSuccessfulSubmitAction={() => setOpen(false)} // Alternative if TS insists
                                orgId={orgId}
                            />
                        </DialogContent>
                    </Dialog>
                    <Button
                        variant={"outline"}
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        {isLoading ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </div>
            {/* Render the appropriate content (loading, error, or grid) */}
            {renderGridContent()}
        </div>
    );
}
