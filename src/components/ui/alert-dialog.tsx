"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
// Assuming you might want a close button optionally, or for consistency:
// import { Cross2Icon } from "@radix-ui/react-icons";

// Adjust path if needed
import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils"; // Adjust path if needed

// --- Root Component ---
const AlertDialog = AlertDialogPrimitive.Root;

// --- Trigger Component ---
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

// --- Portal Component ---
const AlertDialogPortal = AlertDialogPrimitive.Portal;

// --- Overlay Component (Background Dimming) ---
// This overlay is primarily just for the background dimming effect.
// The centering logic will be in a wrapper inside AlertDialogContent.
const AlertDialogOverlay = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/80", // Or bg-background/80
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className,
        )}
        {...props}
    />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

// --- Content Component (Applying the centering wrapper pattern) ---
const AlertDialogContent = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <AlertDialogPortal>
        {/* Background Overlay */}
        <AlertDialogOverlay />
        {/* Centering Wrapper (using flexbox like the working Dialog) */}
        <div
            // This div acts like the styled overlay in your Dialog example
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto",
            )}
        >
            {/* Actual Dialog Content Box */}
            <AlertDialogPrimitive.Content
                ref={ref}
                className={cn(
                    // Base styling & sizing (similar to Dialog)
                    "relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg",
                    // Ensure it doesn't overflow viewport vertically & allow internal scroll
                    "my-auto max-h-[calc(100vh-2rem)] overflow-y-auto",
                    // Animations (using simpler opacity/scale like Dialog)
                    "transition-all duration-200", // Use a duration consistent with AlertDialog's original intent
                    "opacity-0 scale-95",
                    "data-[state=open]:opacity-100 data-[state=open]:scale-100",
                    "data-[state=closed]:opacity-0 data-[state=closed]:scale-95",
                    // Removed fixed positioning, translate, slide/zoom animations
                    className,
                )}
                {...props}
            >
                {children}
                {/* Optional: Add a close button like in Dialog if needed for AlertDialog */}
                {/* <AlertDialogPrimitive.Cancel asChild> // Use Cancel for AlertDialog semantics
                    <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <Cross2Icon className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                </AlertDialogPrimitive.Cancel> */}
            </AlertDialogPrimitive.Content>
        </div>
    </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

// --- Header Component (Unchanged) ---
const AlertDialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className,
        )}
        {...props}
    />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

// --- Footer Component (Unchanged) ---
const AlertDialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className,
        )}
        {...props}
    />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

// --- Title Component (Unchanged) ---
const AlertDialogTitle = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
    />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

// --- Description Component (Unchanged) ---
const AlertDialogDescription = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
AlertDialogDescription.displayName =
    AlertDialogPrimitive.Description.displayName;

// --- Action Button Component (Unchanged) ---
const AlertDialogAction = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Action>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Action
        ref={ref}
        className={cn(buttonVariants(), className)}
        {...props}
    />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

// --- Cancel Button Component (Unchanged) ---
const AlertDialogCancel = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
        ref={ref}
        className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-2 sm:mt-0",
            className,
        )}
        {...props}
    />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

// --- Export all components ---
export {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};
