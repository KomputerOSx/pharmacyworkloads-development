import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default function AddOrgCard() {
    return (
        <Card className="container w-[350px]">
            <CardTitle>Create Organisation</CardTitle>
            <Button variant={"outline"}>Create</Button>
        </Card>
    );
}
