// src/app/admin/orgConsole/page.tsx
"use client";

import "../../../../styles/console/orgConsole.css";
import { OrgCard } from "@/components/org/OrgCard"; // Assuming this exists
import { AddOrgForm } from "@/components/org/AddOrgForm"; // Assuming this exists and uses useAddOrganisation internally
import { useOrgs } from "@/hooks/admin/useOrgs"; // Import the new hook!
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
import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function OrgConsole() {
    // Use the React Query hook to get data and state
    const {
        data: orgs,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useOrgs();

    const [open, setOpen] = useState(false); // State for the dialog
    const [searchTerm, setSearchTerm] = useState(""); // State for the search term

    const filteredOrgs = orgs?.filter((org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    // Function to close the dialog

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
        // 1. Main Page Container: Centered, Max Width, Padding
        <div className="w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-center sm:text-left">
                {" "}
                Select Organisation
            </h1>

            {/* 2. Controls Section: Flexbox for alignment and wrapping */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                {" "}
                {/* Space between items, wrap, add bottom margin */}
                {/* Left aligned controls */}
                <div className="flex items-center gap-4">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
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
                            <AddOrgForm onOpenChange={setOpen} />
                        </DialogContent>
                    </Dialog>

                    <Button
                        onClick={() => refetch()}
                        variant={"outline"}
                        disabled={disableActions}
                        size="icon" // Make refresh button smaller (optional)
                        aria-label="Refresh organisations"
                    >
                        {/* Replace text with an icon for smaller button */}
                        {isFetching ? (
                            <LoadingSpinner size="sm" /> // Show small spinner when fetching
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                    </Button>

                    <Link href="/admin/moduleConsole">
                        <Button variant={"outline"} size="sm">
                            Modules Console
                        </Button>
                    </Link>
                </div>
                {/* Right aligned search */}
                <div className="relative w-full sm:w-auto">
                    {" "}
                    {/* Full width on small screens, auto on larger */}
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search Organisations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full sm:w-[300px]" // Padding for icon, specific width on larger screens
                    />
                </div>
            </div>

            {/* 3. Grid Container - Inherits padding/centering from parent */}
            {/*    Use grid classes directly */}
            <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mr-8" // Slightly larger gap
            >
                {/* Check if filteredOrgs exists and has items */}
                {filteredOrgs && filteredOrgs.length > 0 ? (
                    filteredOrgs.map((org) => (
                        <OrgCard key={org.id} org={org} />
                    ))
                ) : (
                    // Show message if no orgs match search OR if no orgs exist at all
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center py-12">
                        {" "}
                        {/* Span all columns, center text, add padding */}
                        <p className="text-muted-foreground">
                            {orgs && orgs.length > 0
                                ? "No organisations found matching your search."
                                : "No organisations created yet."}
                        </p>
                        {orgs?.length === 0 && !isLoading && (
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="mt-4">
                                        Create First Organisation
                                    </Button>
                                </DialogTrigger>
                                {/* Re-use DialogContent from above */}
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Create Organisation
                                        </DialogTitle>
                                        <DialogDescription>
                                            Enter the details for your new
                                            organisation.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <AddOrgForm onOpenChange={setOpen} />
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
