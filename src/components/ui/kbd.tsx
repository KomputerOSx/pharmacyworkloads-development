// src/components/ui/kbd.tsx
import * as React from "react";
import { cn } from "@/lib/utils"; // Make sure you have this utility

export type KbdProps = React.HTMLAttributes<HTMLElement>;

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
    ({ className, children, ...props }, ref) => {
        return (
            // Use the semantic <kbd> HTML element
            <kbd
                ref={ref}
                className={cn(
                    // Standard Shadcn-like styling for a Kbd element
                    "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
                    "bg-muted border rounded-md shadow-sm", // Background, border, rounding
                    "inline-flex items-center justify-center", // Flex properties if needed
                    className, // Allow overriding classes
                )}
                {...props}
            >
                {children}
            </kbd>
        );
    },
);
Kbd.displayName = "Kbd";

export { Kbd };
