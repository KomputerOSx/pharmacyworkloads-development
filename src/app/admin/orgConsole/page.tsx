"use client";

import "../styles/orgConsole.css";
import { OrgCard } from "@/app/admin/orgConsole/components/OrgCard";
import AddOrgCard from "@/app/admin/orgConsole/components/AddOrgCard";
import { useOrgContext } from "@/context/OrgContext";

export default function OrgConsole() {
    const { orgs, isLoading, error, refetchOrgs } = useOrgContext();

    // Optional: Button to trigger refetch
    // const handleRefresh = () => {
    //   refetchOrgs();
    // };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading organisations: {error.message}</div>;
    }

    return (
        <div>
            <h1 className="container scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Select organisation
            </h1>
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
