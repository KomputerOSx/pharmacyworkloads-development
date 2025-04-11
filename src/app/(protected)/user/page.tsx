"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";

export default function UsersDashboard() {
    const { logout } = useAuth();

    return (
        <div>
            <h1>Users Dashboard</h1>
            <Button onClick={logout}>Logout</Button>
        </div>
    );
}
