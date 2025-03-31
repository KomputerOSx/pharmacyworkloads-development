// src/app/admin/orgConsole/page.tsx
"use client";

import "../../../styles/console/orgConsole.css";
import { OrgCard } from "@/components/org/OrgCard"; // Assuming this exists
import { AddOrgForm } from "@/components/org/AddOrgForm"; // Assuming this exists and uses useAddOrganisation internally
import { useOrgs } from "@/hooks/useOrgs"; // Import the new hook!
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription,
    DialogHeader,
} from "@/components/ui/dialog";
import React, { useState } from "react";

export default function OrgConsole() {
    // Use the React Query hook to get data and state
    const {
        data: orgs, // Data is in the 'data' property, renamed here to 'orgs'
        isLoading, // True on initial load when no cached data exists
        isFetching, // True whenever a fetch is in progress (initial or background)
        isError, // True if the query resulted in an error
        error, // The error object if isError is true
        refetch, // Function to manually trigger a refetch
    } = useOrgs();

    const [open, setOpen] = useState(false); // State for the dialog

    // Use isLoading for the initial loading state
    if (isLoading) {
        return (
            <LoadingSpinner
                className={"flex items-center justify-center h-screen"}
                text={"Loading organisations..."}
                size={"xxlg"}
            />
        );
    }

    // Use isError and error for error handling
    if (isError) {
        return (
            <div>
                JUPq8Mdk - Error loading organisations:{" "}
                {error?.message || "Unknown error"}
            </div>
        );
    }

    // Note: You might want to disable buttons when isFetching is true
    //       to prevent actions during background updates.
    const disableActions = isFetching;

    return (
        <div className={"container"}>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Select organisation
            </h1>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {/* Disable button if fetching */}
                    <Button disabled={disableActions}>
                        Create Organisation
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Organisation</DialogTitle>
                        <DialogDescription>
                            Enter the details for your new organisation.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Pass setOpen to close the dialog on success */}
                    {/* AddOrgForm should internally use useAddOrganisation */}
                    <AddOrgForm onOpenChange={setOpen} />
                </DialogContent>
            </Dialog>

            {/* Use the refetch function from useOrganisations */}
            <Button
                className={"container w-[150px]"}
                onClick={() => refetch()} // Call refetch directly
                variant={"outline"}
                disabled={disableActions} // Disable while fetching
            >
                {isFetching ? "Refreshing..." : "Refresh"}
            </Button>

            <div className={"card-list"}>
                {/* Make sure to handle the case where orgs might be undefined initially */}
                {orgs?.map((org) => (
                    <div key={org.id} className={"card"}>
                        {/* OrgCard might need org id for potential updates/deletes */}
                        {/* It might internally use useUpdateOrganisation/useDeleteOrganisation */}
                        <OrgCard org={org} />
                    </div>
                ))}
                {orgs?.length === 0 && !isLoading && (
                    <p>No organisations found.</p>
                )}
            </div>
        </div>
    );
}
