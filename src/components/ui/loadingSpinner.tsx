import * as React from "react";
import { cn } from "@/lib/utils"; // Assuming you have a utils file for class name merging (like clsx or classnames)
import { Loader2 } from "lucide-react"; // Using lucide-react for a simple spinner icon, you can use any icon library

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xlg" | "xxlg";
    color?: "primary" | "secondary" | "destructive" | "muted";
    text?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
    ({ className, size = "md", color = "primary", text, ...props }, ref) => {
        const sizeClasses = {
            sm: "h-4 w-4",
            md: "h-6 w-6",
            lg: "h-8 w-8",
            xlg: "h-10 w-10",
            xxlg: "h-16 w-16",
        };

        const colorClasses = {
            primary: "text-primary",
            secondary: "text-secondary",
            destructive: "text-destructive",
            muted: "text-muted-foreground",
        };

        return (
            <div
                ref={ref}
                className={cn("flex items-center gap-2", className)}
                {...props}
            >
                <Loader2
                    className={cn(
                        "animate-spin",
                        sizeClasses[size],
                        colorClasses[color],
                    )}
                />
                {text && <span className="text-sm">{text}</span>}
            </div>
        );
    },
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
