import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Organisation } from "@/styles/orgTypes";
import { Badge } from "@/components/ui/badge";

interface OrgCardProps {
    org: Organisation;
}
export function OrgCard({ org }: OrgCardProps) {
    return (
        <Card className="container w-[350px]">
            <CardHeader>
                <CardTitle>{org.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                    <p>
                        <strong>Type: </strong>
                        {org.type}
                    </p>
                    <p>
                        <strong>Email: </strong>
                        {org.contactEmail}
                    </p>
                    <p>
                        <strong>Phone: </strong>
                        {org.contactPhone}
                    </p>
                    <p>
                        {org.active ? (
                            <Badge variant="default">Active</Badge>
                        ) : (
                            <Badge variant="destructive">Inactive</Badge>
                        )}
                    </p>
                </CardDescription>
            </CardContent>
            <Button>View</Button>
        </Card>
    );
}
