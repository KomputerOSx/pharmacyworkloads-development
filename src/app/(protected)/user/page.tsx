"use client";

import { StaffRotaManager } from "@/components/rota/staff-rota-manager";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function UsersDashboard() {
    const { logout } = useAuth();

    return (
        <>
            <div>
                <h1>Users Dashboard</h1>
                <Button onClick={logout}>Logout</Button>
            </div>
            <Link href={"/admin"}>
                <Button>Admin</Button>
            </Link>
            <div className="container mx-auto py-4 px-2 sm:px-4 sm:py-8">
                <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                    Weekly Staff Rota
                </h1>
                <StaffRotaManager />
            </div>
        </>
    );
}
