"use client";

import { useParams } from "next/navigation";

export default function ViewRota() {
    const params = useParams();
    const teamId = params.teamId as string;
    return (
        <div>
            <h1>View Rota for team {teamId}</h1>
        </div>
    );
}
