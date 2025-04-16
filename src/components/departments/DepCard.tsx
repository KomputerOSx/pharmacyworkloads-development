import * as React from "react";
import { Pencil, Plus, Goal } from "lucide-react";
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
    orgId: string;
    onEdit: (department: Department) => void;
    onDelete: (departmentId: string, departmentName: string) => void;
    // Add a new handler prop for the Assignments button if needed
}

export function DepCard({ department, orgId }: DepCardProps) {
    const assignmentsUrl = `/admin/${orgId}/departments/${department.id}/locationAssignments`;
    const teamsUrl = `/admin/${orgId}/departments/${department.id}/departmentTeams`;
    const settingsUrl = `/admin/${orgId}/departments/${department.id}/depSettings`;

    // const handleEditClick = () => {
    //     onEdit(department);
    // };

    // const handleDeleteClick = () => {
    //     onDelete(department.id, department.name);
    // };

    return (
        // Ensure card takes full height in a grid and uses flex-col
        <Card className="">
            {/* CardHeader now uses flex to position title and button */}
            <CardHeader className="flex justify-between items-center pt-4">
                {/* Title remains */}
                <CardTitle className="text-xl mr-2">
                    {" "}
                    {/* Added margin-right */}
                    {department.name}
                </CardTitle>
                {/* Assignments Button - Small size, top right */}
                <Link href={assignmentsUrl}>
                    <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Assignments for ${department.name}`}
                        className="flex-shrink-0"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Locations
                    </Button>
                </Link>
                <Link href={teamsUrl}>
                    <Button
                        variant="outline"
                        size="sm" // Keep size small as requested
                        aria-label={`Assignments for ${department.name}`}
                        className="flex-shrink-0" // Prevent shrinking if title is long
                    >
                        <Goal className="h-4 w-4 mr-1" />
                        Teams
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
                    <Link href={settingsUrl}>
                        <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Edit ${department.name}`}
                        >
                            <Pencil className="h-4 w-4 mr-1" /> Settings
                        </Button>
                    </Link>
                    {/*<Button*/}
                    {/*    variant="destructive"*/}
                    {/*    size="sm"*/}
                    {/*    onClick={handleDeleteClick}*/}
                    {/*    aria-label={`Delete ${department.name}`}*/}
                    {/*>*/}
                    {/*    <Trash2 className="h-4 w-4 mr-1" /> Delete*/}
                    {/*</Button>*/}
                </div>
            </CardFooter>
        </Card>
    );
}
