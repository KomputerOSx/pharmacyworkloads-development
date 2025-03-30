"use client";

import "@/styles/console/hospConsole.css";
import React, { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { useHospContext } from "@/context/HospitalContext";
import { HospCard } from "@/components/hosp/HospCard";
import { useParams } from "next/navigation";

export default function HospitalsPage() {
    const { hosps, isLoading, error, refetchHosps } = useHospContext();
    const [open, setOpen] = useState(false);
    const orgId = useParams().toString();

    if (isLoading) {
        return (
            <LoadingSpinner
                className={"flex items-center justify-center h-screen"}
                text={"Loading Hospitals..."}
                size={"xxlg"}
            />
        );
    }
    return (
        <div className={"container"}>
            <div className={"card-list"}>
                <div className={"card"}></div>

                {hosps.map((hosp) => (
                    <div key={hosp.id} className={"card"}>
                        <HospCard key={hosp.id} hosp={hosp} orgId={orgId} />
                    </div>
                ))}
            </div>
        </div>
    );
}
