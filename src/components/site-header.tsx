"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

function formatRouteSegments(segments: string[]): string {
    if (segments.length === 0) {
        // Handle the base case for /admin/[orgId]/
        return "Dashboard"; // Or "Dashboard", etc.
    }

    return segments
        .map((segment) => {
            // Decode URI component in case of encoded characters
            const decodedSegment = decodeURIComponent(segment);
            // Replace hyphens with spaces and capitalize words
            return decodedSegment
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        })
        .join(" / "); // Join multiple segments with a separator like ' / '
}

export function SiteHeader() {
    const pathname = usePathname(); // Get the current path
    const [title, setTitle] = useState<string>(""); // State to hold the title

    // Update the title based on the current path
    useEffect(() => {
        const allSegments = pathname.split("/").filter(Boolean);
        if (allSegments.length >= 2 && allSegments[0] === "admin") {
            const relevantSegments = allSegments.slice(2);
            const formattedTitle = formatRouteSegments(relevantSegments);
            setTitle(formattedTitle);
        } else {
            setTitle("Dashboard");
        }
    }, [pathname]);

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">{title}</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="ghost"
                        asChild
                        size="sm"
                        className="hidden sm:flex"
                    >
                        <Link
                            href="#"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="dark:text-foreground"
                        >
                            Users Portal
                        </Link>
                    </Button>

                    <Button
                        variant="ghost"
                        asChild
                        size="sm"
                        className="hidden sm:flex"
                    >
                        <Link
                            href="#"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="dark:text-foreground"
                        >
                            Manager Portal
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
