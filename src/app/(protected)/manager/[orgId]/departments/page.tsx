"use client";

import React, { useCallback, useEffect } from "react"; // Added useCallback
import { useRouter } from "next/navigation";
import { Loader2, Terminal } from "lucide-react"; // Added Terminal for errors

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added for errors
import { LoadingSpinner } from "@/components/ui/loadingSpinner"; // Assuming you have this

import { useAuth } from "@/lib/context/AuthContext";
import { useUser } from "@/hooks/useUsers";

export default function DepartmentsPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const {
        data: userProfile,
        isLoading: profileLoading,
        error: profileError,
        refetch,
        isRefetching,
    } = useUser(authUser?.uid);

    const router = useRouter();

    // Combined loading state
    const isLoading = authLoading || (!!authUser && profileLoading);
    const isError = !!authUser && !profileLoading && !!profileError;
    const handleRefresh = useCallback(() => {
        if (refetch) {
            void refetch();
        }
    }, [refetch]);

    useEffect(() => {
        if (
            !isLoading &&
            !isError &&
            userProfile?.orgId &&
            userProfile?.departmentId
        ) {
            const assignmentsUrl = `/manager/${userProfile.orgId}/departments/${userProfile.departmentId}`;
            console.log("Redirecting to:", assignmentsUrl); // Good for debugging
            router.push(assignmentsUrl);
        }
    }, [isLoading, isError, userProfile, router]);

    if (isLoading) {
        // Basic loading state - enhance if needed
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner text={"Loading Departments..."} size={"lg"} />
            </div>
        );
    }

    if (isError) {
        // Use the actual error object from the hook
        const error = profileError;
        return (
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    {/* More specific error title */}
                    <AlertTitle>Error Fetching User Profile</AlertTitle>
                    <AlertDescription>
                        {error instanceof Error
                            ? error.message
                            : "An unknown error occurred while fetching your profile."}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefetching}
                            className="ml-4"
                        >
                            {isRefetching ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Retry
                        </Button>
                        )
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (
        !isLoading &&
        !isError &&
        userProfile?.orgId &&
        userProfile?.departmentId
    ) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner text={"Redirecting..."} size={"lg"} />
            </div>
        );
    }

    if (
        !isLoading &&
        !isError &&
        (!userProfile?.orgId || !userProfile?.departmentId)
    ) {
        return (
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Incomplete Profile</AlertTitle>
                    <AlertDescription>
                        Your profile is missing organization or department
                        details needed to proceed. Please contact support.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return null;
}
