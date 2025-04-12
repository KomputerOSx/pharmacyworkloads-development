"use client";

import { useParams } from "next/navigation";

export default function EditRota() {
    const params = useParams();
    const teamId = params.teamId as string;
    return (
        <div>
            <h1>Edit Rota for team {teamId}</h1>
        </div>
    );
}
