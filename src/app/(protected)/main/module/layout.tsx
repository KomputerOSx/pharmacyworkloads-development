"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useModule } from "@/hooks/useModules"; // Hook to fetch single module details
import { LoadingSpinner } from "@/components/ui/loadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function ModuleSpecificLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const router = useRouter();
    const moduleId = params.moduleId as string; // Get specific module ID from URL

    // Fetch details for THIS specific module
    const { data: moduleData, isLoading, isError, error } = useModule(moduleId);

    useEffect(() => {
        // Wait for loading and data check
        if (!isLoading && moduleData) {
            // Check if the fetched module is inactive
            if (moduleData.active === false) {
                console.warn(
                    `ModuleLayout: Module ${moduleId} is inactive. Redirecting user.`,
                );
                // Redirect to a safe page, e.g., the main user dashboard or app root
                router.replace("/main"); // Or just "/app"
            } else {
                console.log(
                    `ModuleLayout: Module ${moduleId} is active. Access allowed.`,
                );
            }
        } else if (!isLoading && isError) {
            console.error(
                `ModuleLayout: Error fetching module ${moduleId}. Redirecting.`,
                error,
            );
            // Handle error fetching module - maybe redirect?
            router.replace("/main?error=module_load_failed"); // Or show error inline
        } else if (!isLoading && !moduleData && !isError) {
            // Module not found after loading (and no error reported by hook?)
            console.error(
                `ModuleLayout: Module ${moduleId} not found. Redirecting.`,
            );
            router.replace("/main?error=module_not_found");
        }
    }, [isLoading, moduleData, isError, error, moduleId, router]);

    // Show loading spinner while fetching module details
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <LoadingSpinner text={`Loading module...`} />
            </div>
        );
    }

    // Show error if fetching failed (optional, could redirect instead)
    if (isError) {
        return (
            <div className="container mx-auto py-6 px-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Module</AlertTitle>
                    <AlertDescription>
                        Could not load details for this module ({moduleId}).
                        {error instanceof Error ? ` ${error.message}` : ""}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Render children ONLY if module exists and is active
    // (Redirect handled by useEffect otherwise)
    if (moduleData && moduleData.active === true) {
        return <>{children}</>;
    }

    // Fallback spinner while redirecting or if module not found/inactive
    return (
        <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner text={`Verifying module access...`} />
        </div>
    );
}
