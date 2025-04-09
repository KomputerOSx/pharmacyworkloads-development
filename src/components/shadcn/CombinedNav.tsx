"use client";

import * as React from "react";
import { usePathname, useParams } from "next/navigation";
import { CombinedNavItem } from "./admin-sidebar"; // Import types from AppSidebar or a shared types file
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"; // Adjust path
import { Button } from "@/components/ui/button"; // Adjust path

import { cn } from "@/lib/utils"; // Adjust path

interface CombinedNavProps {
    items: CombinedNavItem[];
    onNavigate: (url: string) => void; // Re-use existing navigation handler
}

export function CombinedNav({ items, onNavigate }: CombinedNavProps) {
    const pathname = usePathname(); // Get the full current path
    const { orgId } = useParams(); // Get orgId to construct full paths for comparison

    const isSubItemActive = (baseUrl: string, subUrl: string): boolean => {
        if (!orgId) return false;
        const fullPath = `/admin/${orgId}/${subUrl}`.replace(/\/$/, ""); // Normalize path
        // Check if the current pathname starts with the sub-item's full path
        // Use startsWith for broader matching (e.g., /admin/org1/settings/general matches settings/general)
        return pathname.startsWith(fullPath);
    };

    const isLinkActive = (baseUrl: string, linkUrl: string): boolean => {
        if (!orgId || (linkUrl === "/" && pathname !== `/admin/${orgId}`))
            return false; // Handle root case specifically

        // Handle root dashboard link
        if (linkUrl === "/") {
            return pathname === `/admin/${orgId}`;
        }

        const fullPath = `/admin/${orgId}/${linkUrl}`.replace(/\/$/, ""); // Normalize path
        // Use startsWith for top-level items like /hospitals to match /hospitals/details etc.
        return pathname.startsWith(fullPath);
    };

    return (
        <nav className="grid items-start gap-1 px-2">
            {items.map((item, index) =>
                item.type === "link" ? (
                    // Render Direct Link
                    <Button
                        key={`${item.title}-${index}`}
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "w-full justify-start gap-2",
                            isLinkActive(`/admin/${orgId}`, item.url) &&
                                "bg-accent text-accent-foreground", // Active state styling
                        )}
                        onClick={() => !item.disabled && onNavigate(item.url)}
                        disabled={item.disabled}
                        aria-current={
                            isLinkActive(`/admin/${orgId}`, item.url)
                                ? "page"
                                : undefined
                        }
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Button>
                ) : (
                    // Render Menu (Accordion)
                    <Accordion
                        key={`${item.title}-${index}`}
                        type="single" // Only one menu open at a time
                        collapsible
                        className="w-full"
                        // Check if any sub-item is active to potentially highlight the trigger
                    >
                        <AccordionItem
                            value={item.title}
                            className="border-b-0"
                        >
                            <AccordionTrigger
                                className={cn(
                                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180",
                                    // Optional: Highlight trigger if a child is active
                                    item.items.some((sub) =>
                                        isSubItemActive(
                                            `/admin/${orgId}`,
                                            sub.url,
                                        ),
                                    ) && "text-accent-foreground",
                                )}
                                disabled={item.disabled}
                            >
                                <div className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </div>
                                {/* Chevron is added by AccordionTrigger */}
                            </AccordionTrigger>
                            <AccordionContent className="py-1 pl-5 pr-1">
                                <div className="ml-1 flex flex-col gap-1 border-l pl-3">
                                    {item.items.map((subItem, subIndex) => (
                                        <Button
                                            key={`${subItem.title}-${subIndex}`}
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "w-full justify-start gap-2",
                                                isSubItemActive(
                                                    `/admin/${orgId}`,
                                                    subItem.url,
                                                ) &&
                                                    "bg-accent text-accent-foreground", // Active state
                                            )}
                                            onClick={() =>
                                                !subItem.disabled &&
                                                onNavigate(subItem.url)
                                            }
                                            disabled={subItem.disabled}
                                            aria-current={
                                                isSubItemActive(
                                                    `/admin/${orgId}`,
                                                    subItem.url,
                                                )
                                                    ? "page"
                                                    : undefined
                                            }
                                        >
                                            {/* No icon for sub-items usually, but could add one */}
                                            {subItem.title}
                                        </Button>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ),
            )}
        </nav>
    );
}
