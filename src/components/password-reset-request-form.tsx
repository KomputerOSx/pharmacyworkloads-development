// src/components/password-reset-request-form.tsx
"use client"; // <-- Required for hooks and state

import React, { useState } from "react"; // <-- Import useState
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext"; // <-- Import auth hook
import { isFirebaseAuthError } from "@/lib/errorUtils"; // <-- Import error checker

export function PasswordResetRequestForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    // --- Hooks and State ---
    const { sendPasswordResetLink, isProcessingAuthAction } = useAuth();
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSent, setIsSent] = useState(false); // <-- State for success message

    // --- Form Submission Handler ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setIsSent(false); // Reset success state

        try {
            await sendPasswordResetLink(email);
            setIsSent(true); // <-- Show success message on success
            // Keep email in state to display in the success message
            // setEmail(""); // Optional: clear input only if you don't display it
        } catch (err: unknown) {
            console.error("Password reset request error:", err);
            if (isFirebaseAuthError(err)) {
                setError(err.message);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>
                        {/* Change description based on state */}
                        {!isSent
                            ? "Enter your email to receive a password reset link"
                            : "Check your inbox!"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Conditionally render form or success message */}
                    {!isSent ? (
                        <form onSubmit={handleSubmit}>
                            {" "}
                            {/* <-- Add onSubmit handler */}
                            <div className="flex flex-col gap-6">
                                {/* Error Display */}
                                {error && (
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email} // <-- Bind value to state
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        } // <-- Update state on change
                                        disabled={isProcessingAuthAction} // <-- Disable during processing
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isProcessingAuthAction} // <-- Disable during processing
                                >
                                    {/* Change button text during processing */}
                                    {isProcessingAuthAction
                                        ? "Sending..."
                                        : "Send Reset Link"}
                                </Button>
                            </div>
                            <div className="mt-4 text-center text-sm">
                                Remember your password?{" "}
                                <Link
                                    href="/login"
                                    className="underline underline-offset-4"
                                >
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        // --- Success Message UI ---
                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                If an account exists for{" "}
                                <span className="font-medium">{email}</span>,
                                you will receive an email with instructions to
                                reset your password. Please check your spam
                                folder as well.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                // Allow user to go back and try again
                                onClick={() => {
                                    setIsSent(false);
                                    setError(null);
                                    setEmail("");
                                }}
                            >
                                Send to a different email
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
