"use client";

import React from "react";
import { useParams } from "next/navigation";

import { ChartAreaInteractive } from "@/components/shadcn/chart-area-interactive";
import { DataTable } from "@/components/shadcn/data-table";
import { SectionCards } from "@/components/shadcn/section-cards";

import data from "./data.json";
import { useOrgs } from "@/hooks/useOrgs";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { Redirector } from "@/components/shadcn/Redirector";

export default function OrgPage() {
    const params = useParams();
    const orgId = typeof params?.orgId === "string" ? params.orgId : undefined;

    // 2. Use the React Query hook
    const {
        data: orgs,
        isLoading,
        isSuccess, // Use isSuccess to know when data is available
        isError, // Use isError for error handling
        error, // The actual error object
    } = useOrgs();

    if (isLoading) {
        // Render a loading indicator while fetching
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner text="Loading organisation data..." size="lg" />
            </div>
        );
    }

    if (isError) {
        // Render an error message if the query failed
        console.error("kJ2Xd8Ju - Error loading organisations:", error);
        return (
            <div className="flex h-screen flex-col items-center justify-center text-red-600">
                <p>Failed to load organisation data.</p>
                <p>{error?.message || "An unknown error occurred."}</p>
                {/* Optionally add a retry button if your hook supports refetch */}
            </div>
        );
    }

    if (isSuccess) {
        // --- Condition 1: No orgId in URL ---
        if (!orgId) {
            console.warn(
                "No Organisation ID found in URL. Redirecting to dashboard.",
            );
            return <Redirector to="/dashboard" />;
        }

        // --- Condition 2: OrgId exists, check if it's in the user's list ---
        const orgExists = orgs?.find((org) => org.id === orgId);

        if (!orgExists) {
            console.warn(
                `Org ID ${orgId} not found in user's accessible orgs. Redirecting to /404.`,
            );
            return <Redirector to="/404" />;
        }

        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <SectionCards />
                        <div className="px-4 lg:px-6">
                            <ChartAreaInteractive />
                        </div>
                        <DataTable data={data} />
                    </div>
                </div>
            </div>
        );
    }
}
