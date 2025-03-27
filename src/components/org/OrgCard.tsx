"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Organisation } from "@/types/orgTypes";
import { Badge } from "@/components/ui/badge";

export function OrgCard({ org }: { org: Organisation }) {
    return (
        <Card className="container w-[350px]">
            <CardHeader>
                <CardTitle className={"text-xl"}>{org.name}</CardTitle>
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
                </CardDescription>
            </CardContent>
            <CardFooter>
                {" "}
                {org.active ? (
                    <Badge variant="default">Active</Badge>
                ) : (
                    <Badge variant="destructive">Inactive</Badge>
                )}
            </CardFooter>
            <Button>View</Button>
        </Card>
    );
}
