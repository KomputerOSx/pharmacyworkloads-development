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
import { AddHospForm } from "@/components/hosp/AddHospForm";
import { Loader2 } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DepAssignmentsPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    return (
        <div>
            <h1>Assignments</h1>

            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Dialog for Creating a New Hospital */}
                {/*<Dialog open={open} onOpenChange={setOpen}>*/}
                {/*    /!* ... DialogTrigger, DialogContent, AddHospForm ... *!/*/}
                {/*    <DialogTrigger asChild>*/}
                {/*        <Button size="sm">Create Hospital</Button>*/}
                {/*    </DialogTrigger>*/}
                {/*    <DialogContent>*/}
                {/*        <DialogHeader>*/}
                {/*            <DialogTitle>Create Hospital</DialogTitle>*/}
                {/*            <DialogDescription>*/}
                {/*                Enter the details for your new hospital.*/}
                {/*            </DialogDescription>*/}
                {/*        </DialogHeader>*/}
                {/*        <AddHospForm onOpenChange={setOpen} orgId={orgId} />*/}
                {/*    </DialogContent>*/}
                {/*</Dialog>*/}

                {/* Refresh Button */}
                <Button
                    variant={"outline"}
                    size="sm"
                    // onClick={() => refetchHosps()}
                    // disabled={isLoading || isRefetching} // Disable while loading or refetching
                >
                    {/*{isRefetching ? (*/}
                    {/*    <Loader2 className="mr-2 h-4 w-4 animate-spin" />*/}
                    {/*) : null}*/}
                    {/*{isRefetching ? "Refreshing..." : "Refresh"}*/}
                </Button>

                <Link href={`/admin/${orgId}/departments`}>
                    <Button variant={"default"} size="sm">
                        {" "}
                        Go Back
                    </Button>
                </Link>
            </div>
        </div>
    );
}
