"use client";

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
import { useDepHospLocAssignments } from "@/hooks/useDepAss";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { Loader2, Plus } from "lucide-react";
import { useDep } from "@/hooks/useDeps";
import { useState } from "react";
import { AddDepAssForm } from "@/components/departments/AddDepAssForm";

export default function DepartmentAssignmentPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    const depId = params.depId as string;

    const {
        data: depHospLocAssignments,
        isLoading,
        refetch,
        isRefetching,
    } = useDepHospLocAssignments(depId);

    const { data: currentDep, isLoading: isLoadingDep } = useDep(depId);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    if (isLoading || isLoadingDep) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner text="Loading data..." size="lg" />
            </div>
        );
    }
    return (
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1>
                <strong>{currentDep?.name}</strong> Assignment Page
            </h1>
            <p>Organisation ID: {orgId}</p>
            <p>Department ID: {depId}</p>

            <div className="flex items-center gap-2 flex-shrink-0">
                {" "}
                {/* Buttons group */}
                <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="" />
                            Assign Location
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        {" "}
                        {/* Adjust width as needed */}
                        <DialogHeader>
                            <DialogTitle>Create New Location</DialogTitle>
                            <DialogDescription>
                                Fill in the details below. Click save when
                                you&#39;re done.
                            </DialogDescription>
                            <AddDepAssForm onSuccess={() => refetch()} />
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                <Button
                    variant={"outline"}
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading || isRefetching} // Disable while loading or refetching
                >
                    {isRefetching ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isRefetching ? "Refreshing..." : "Refresh"}
                </Button>
                <Link href={`/admin/${orgId}/departments/`}>
                    <Button size="sm" variant={"secondary"}>
                        Back to Departments
                    </Button>
                </Link>
            </div>
        </div>
    );
}
