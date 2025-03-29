"use client";

import React, { useEffect } from "react";
import { useOrgContext } from "@/context/OrgContext";
import { useRouter, useParams } from "next/navigation";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import data from "./data.json";

export default function OrgPage() {
    const { orgId } = useParams();
    const { orgs, isLoading } = useOrgContext();

    const router = useRouter();

    // Check if the orgId exists in the user's accessible orgs
    useEffect(() => {
        if (!isLoading && orgId) {
            const org = orgs.find((org) => org.id === orgId);

            if (!org) {
                console.warn(
                    `Org ID ${orgId} not found in user's accessible orgs. Redirecting.`,
                );
                router.replace("/404");
            }
        }
    }, [orgId, orgs, isLoading, router]);

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
