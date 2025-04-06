import * as React from "react";
import { Pencil, Trash2, Plus } from "lucide-react"; // Import Plus icon

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Department } from "@/types/depTypes";
import Link from "next/link";

interface DepCardProps {
    department: Department;
    onEdit: (department: Department) => void;
    onDelete: (departmentId: string, departmentName: string) => void;
    // Add a new handler prop for the Assignments button if needed
    onAssignmentsClick?: (department: Department) => void;
}

export function DepCard({
    department,
    onEdit,
    onDelete,
    onAssignmentsClick, // Use the new handler
}: DepCardProps) {
    const handleEditClick = () => {
        onEdit(department);
    };

    const handleDeleteClick = () => {
        onDelete(department.id, department.name);
    };

    // Handler for the new Assignments button
    const handleAssignmentsButtonClick = () => {
        if (onAssignmentsClick) {
            onAssignmentsClick(department);
        } else {
            console.warn("onAssignmentsClick handler not provided to DepCard");
            // Optionally implement default behavior or navigate here
        }
    };

    return (
        // Ensure card takes full height in a grid and uses flex-col
        <Card className="">
            {/* CardHeader now uses flex to position title and button */}
            <CardHeader className="flex flex-row justify-between items-start">
                {/* Title remains */}
                <CardTitle className="text-xl mr-2">
                    {" "}
                    {/* Added margin-right */}
                    {department.name}
                </CardTitle>
                {/* Assignments Button - Small size, top right */}
                <Link href="#">
                    <Button
                        variant="outline"
                        size="sm" // Keep size small as requested
                        onClick={handleAssignmentsButtonClick} // Use the new handler
                        aria-label={`Assignments for ${department.name}`}
                        className="flex-shrink-0" // Prevent shrinking if title is long
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Assignments
                    </Button>
                </Link>
            </CardHeader>

            {/* CardContent remains the same */}
            {/* Wrap content in a div to allow footer to be pushed down reliably */}
            <div className="flex-grow">
                {" "}
                {/* Added flex-grow to push footer down */}
                <CardContent>
                    <CardDescription className="space-y-1">
                        {/* Commented out fields */}
                        {/* <p><strong>Email: </strong>{department.contactEmail}</p> */}
                        {/* <p><strong>Phone: </strong>{department.contactPhone}</p> */}
                        {/* Add other relevant info here if needed later */}
                    </CardDescription>
                </CardContent>
            </div>

            {/* CardFooter remains the same */}
            <CardFooter className="flex justify-between items-center pt-4">
                {/* Badge */}
                <div>
                    {department.active ? (
                        <Badge variant="default">Active</Badge>
                    ) : (
                        <Badge variant="destructive">Inactive</Badge>
                    )}
                </div>
                {/* Edit/Delete Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditClick}
                        aria-label={`Edit ${department.name}`}
                    >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteClick}
                        aria-label={`Delete ${department.name}`}
                    >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
