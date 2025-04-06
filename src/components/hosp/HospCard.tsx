"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react"; // Import icons

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Hosp } from "@/types/hospTypes";
import { Badge } from "@/components/ui/badge";

interface HospCardProps {
    hosp: Hosp;
    onEdit: (hospital: Hosp) => void;
    onDelete: (hospitalId: string, hospitalName: string) => void;
}

export function HospCard({ hosp, onEdit, onDelete }: HospCardProps) {
    const handleEditClick = () => {
        onEdit(hosp);
    };

    const handleDeleteClick = () => {
        onDelete(hosp.id, hosp.name);
    };

    return (
        // Adjusted width slightly to accommodate buttons if needed
        <Card className="container w-full sm:w-[380px] flex flex-col justify-between">
            {" "}
            <div>
                {" "}
                <CardHeader>
                    <CardTitle className={"text-xl"}>{hosp.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="space-y-1">
                        {" "}
                        <p>
                            <strong>Address: </strong>
                            {hosp.address}, {hosp.city}, {hosp.postCode}
                        </p>
                        <p>
                            <strong>Email: </strong>
                            {hosp.contactEmail}
                        </p>
                        <p>
                            <strong>Phone: </strong>
                            {hosp.contactPhone}
                        </p>
                    </CardDescription>
                </CardContent>
            </div>
            <CardFooter className="flex justify-between items-center pt-4">
                {" "}
                <div>
                    {" "}
                    {hosp.active ? (
                        <Badge variant="default">Active</Badge>
                    ) : (
                        <Badge variant="destructive">Inactive</Badge>
                    )}
                </div>
                <div className="flex gap-2">
                    {" "}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditClick}
                        aria-label={`Edit ${hosp.name}`}
                    >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteClick}
                        aria-label={`Delete ${hosp.name}`}
                    >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
