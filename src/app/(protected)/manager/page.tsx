// src/app/(protected)/manager/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext"; // Adjust path
import { useUser } from "@/hooks/useUsers"; // Adjust path
import { LoadingSpinner } from "@/components/ui/loadingSpinner"; // Adjust path

export default function ManagerPortalRedirectPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const {
        data: userProfile,
        isLoading: profileLoading,
        error: profileError,
    } = useUser(authUser?.uid);

    const router = useRouter();

    const isLoading = authLoading || (!!authUser && profileLoading);

    useEffect(() => {
        if (isLoading) {
            return;
        }
        if (!authUser) {
            console.log(
                "Manager Portal: User not authenticated. Redirecting to login.",
            );
            router.replace("/login?redirect=/manager");
            return;
        }

        if (profileError) {
            console.error(
                "Manager Portal: Error fetching user profile:",
                profileError,
            );
            router.replace("/login?error=profile_fetch_failed");
            return;
        }

        if (!userProfile) {
            console.warn(
                `Manager Portal: User ${authUser.uid} authenticated but profile not found. Redirecting.`,
            );
            router.replace("/login?error=profile_missing");
            return;
        }

        console.log(
            `Manager Portal: User ${authUser.uid} Role: ${userProfile.role}, OrgId: ${userProfile.orgId}`,
        );

        if (userProfile.role === "admin") {
            console.log(
                "Manager Portal: User is admin. Redirecting to orgs console.",
            );
            router.replace("/admin/orgsConsole");
        } else if (userProfile.role === "manager") {
            if (userProfile.orgId) {
                // Managers should go to their specific org's manager section
                console.log(
                    `Manager Portal: User is manager for org ${userProfile.orgId}. Redirecting.`,
                );
                router.replace(`/manager/${userProfile.orgId}`);
            } else {
                console.error(
                    `Manager Portal: User ${authUser.uid} has role 'manager' but no orgId found in profile! Redirecting.`,
                );
                router.replace("/login?error=manager_missing_orgId");
            }
        } else {
            console.warn(
                `Manager Portal: User ${authUser.uid} has unauthorized role '${userProfile.role}'. Redirecting.`,
            );
            router.replace("/login");
        }
    }, [
        isLoading,
        authUser,
        userProfile,
        profileError,
        router,
        authLoading,
        profileLoading,
    ]);

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner text="Verifying manager access..." />
        </div>
    );
}
