"use client";

import "../styles/orgConsole.css";
import { OrgCard } from "@/components/org/OrgCard";
import AddOrgCard from "@/components/org/AddOrgCard";
import { useOrgContext } from "@/context/OrgContext";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";

export default function OrgConsole() {
    const { orgs, isLoading, error, refetchOrgs } = useOrgContext();

    if (isLoading) {
        return (
            <LoadingSpinner
                className={"flex items-center justify-center h-screen"}
                text={"Loading organisations..."}
                size={"xxlg"}
            />
        );
    }

    if (error) {
        return (
            <div>JUPq8Mdk - Error loading organisations: {error.message}</div>
        );
    }

    return (
        <div>
            <h1 className="container scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Select organisation
            </h1>
            <Button className={"container max-w-1/12"} onClick={refetchOrgs}>
                Refresh
            </Button>
            <div className={"card-list"}>
                <div className={"card"}>
                    <AddOrgCard />
                </div>

                {orgs.map((org) => (
                    <div key={org.id} className={"card"}>
                        <OrgCard key={org.id} org={org} />
                    </div>
                ))}
            </div>
        </div>
    );
}
