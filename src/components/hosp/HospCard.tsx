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
import { Hosp } from "@/types/hospTypes";
import { Badge } from "@/components/ui/badge";

interface HospCardProps {
    hosp: Hosp;
    orgId: string;
}

export function HospCard({ hosp }: HospCardProps) {
    // const handleClick = (id: string) => () => {
    //     window.location.href = `/admin/${id}`;
    // };
    return (
        <Card className="container w-[350px]">
            <CardHeader>
                <CardTitle className={"text-xl"}>{hosp.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
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
            <CardFooter>
                {" "}
                {hosp.active ? (
                    <Badge variant="default">Active</Badge>
                ) : (
                    <Badge variant="destructive">Inactive</Badge>
                )}
            </CardFooter>
        </Card>
    );
}
