//src/components/login-form.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

interface FirebaseError {
    code: string;
    message: string;
}

function isFirebaseAuthError(error: unknown): error is FirebaseError & Error {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        true &&
        (error as FirebaseError).code.startsWith("auth/") &&
        "message" in error
    );
}

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    // Get auth functions and state from context
    const { loginWithEmail, sendLoginLink, isProcessingAuthAction } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    // State for Password Login
    const [passwordEmail, setPasswordEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // State for Passwordless Login
    const [linkEmail, setLinkEmail] = useState("");
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);

    // --- Handlers ---

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        const redirectUrl = searchParams.get("redirect");

        try {
            await loginWithEmail(passwordEmail, password);
            console.log("Password login successful!");
            router.push(redirectUrl || "/main");
        } catch (err: unknown) {
            console.error("Password login error:", err);
            if (isFirebaseAuthError(err)) {
                setPasswordError(
                    "Login Failed, Please Check your credentials.",
                );
                console.error(err.message);
            } else if (err instanceof Error) {
                setPasswordError(
                    "Login Failed, Please Check your credentials.",
                );
                console.error(err.message);
            } else {
                setPasswordError("An unexpected error occurred during login.");
            }
        }
    };

    const handleMagicLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLinkError(null);
        setIsEmailSent(false);

        try {
            await sendLoginLink(linkEmail);
            setIsEmailSent(true);
            console.log("Magic link sent!");
        } catch (err: unknown) {
            // Catch as unknown
            console.error("Send magic link error:", err);
            // Check if it's a Firebase Auth error
            if (isFirebaseAuthError(err)) {
                setLinkError(err.message);
            } else if (err instanceof Error) {
                setLinkError(err.message);
            } else {
                setLinkError("An unexpected error occurred sending the link.");
            }
        }
    };

    // --- Render (No changes needed in the JSX structure) ---

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Login with your preferred method
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="passwordless" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="passwordless">
                                Email-Only
                            </TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>

                        {/* --- Password Tab --- */}
                        <TabsContent value="password">
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="flex flex-col gap-6">
                                    {passwordError && (
                                        <p className="text-sm text-red-600">
                                            {passwordError}
                                        </p>
                                    )}
                                    {/* Email Input */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            value={passwordEmail}
                                            onChange={(e) =>
                                                setPasswordEmail(e.target.value)
                                            }
                                            required
                                            disabled={isProcessingAuthAction}
                                        />
                                    </div>
                                    {/* Password Input */}
                                    <div className="grid gap-2">
                                        <div className="flex items-center">
                                            <Label htmlFor="password">
                                                Password
                                            </Label>
                                            <Link
                                                href="/reset-password"
                                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                            >
                                                Forgot your password?
                                            </Link>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                            disabled={isProcessingAuthAction}
                                        />
                                    </div>
                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isProcessingAuthAction}
                                    >
                                        {isProcessingAuthAction
                                            ? "Logging in..."
                                            : "Login"}
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>

                        {/* --- Passwordless Tab --- */}
                        <TabsContent value="passwordless">
                            {!isEmailSent ? (
                                <form onSubmit={handleMagicLinkSubmit}>
                                    <div className="flex flex-col gap-6">
                                        {linkError && (
                                            <p className="text-sm text-red-600">
                                                {linkError}
                                            </p>
                                        )}
                                        {/* Email Input */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="magic-email">
                                                Email
                                            </Label>
                                            <Input
                                                id="magic-email"
                                                type="email"
                                                placeholder="m@example.com"
                                                value={linkEmail}
                                                onChange={(e) =>
                                                    setLinkEmail(e.target.value)
                                                }
                                                required
                                                disabled={
                                                    isProcessingAuthAction
                                                }
                                            />
                                        </div>
                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={isProcessingAuthAction}
                                        >
                                            {isProcessingAuthAction
                                                ? "Sending..."
                                                : "Send Magic Link"}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col gap-6 items-center text-center">
                                    {linkError && (
                                        <p className="text-sm text-red-600">
                                            {linkError}
                                        </p>
                                    )}
                                    {/* Success Message */}
                                    <div className="grid gap-2">
                                        <h3 className="text-lg font-medium">
                                            Check your email
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            We&#39;ve sent a magic link to{" "}
                                            <span className="font-medium">
                                                {linkEmail}
                                            </span>
                                        </p>
                                    </div>
                                    {/* Back Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setIsEmailSent(false);
                                            setLinkError(null);
                                        }}
                                        disabled={isProcessingAuthAction}
                                    >
                                        Send to a different email
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
