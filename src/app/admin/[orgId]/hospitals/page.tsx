"use client";

import "@/styles/console/hospConsole.css";
import React, { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { useHospContext } from "@/context/HospitalContext";
import { HospCard } from "@/components/hosp/HospCard";
import { useParams } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddHospForm } from "@/components/hosp/AddHospForm";

export default function HospitalsPage() {
    const { hosps, isLoading, error, refetchHosps } = useHospContext();
    const [open, setOpen] = useState(false);
    const params = useParams();
    const orgId = params.orgId as string;

    console.log(orgId);

    if (isLoading) {
        return (
            <LoadingSpinner
                className={"flex items-center justify-center h-screen"}
                text={"Loading Hospitals..."}
                size={"xxlg"}
            />
        );
    }

    if (error) {
        return <div>7v3adTdJ - Error loading hospital: {error.message}</div>;
    }

    return (
        <>
            <div className={"container"}>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Hospital</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Hospital</DialogTitle>
                            <DialogDescription>
                                Enter the details for your new hospital.
                            </DialogDescription>
                        </DialogHeader>
                        <AddHospForm onOpenChange={setOpen} orgId={orgId} />
                    </DialogContent>
                </Dialog>

                <Button
                    className={" container w-[150px]"}
                    onClick={refetchHosps}
                    variant={"outline"}
                >
                    Refresh
                </Button>

                <div className={"card-list"}>
                    <div className={"card"}></div>

                    {hosps.map((hosp) => (
                        <div key={hosp.id} className={"card"}>
                            <HospCard key={hosp.id} hosp={hosp} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
