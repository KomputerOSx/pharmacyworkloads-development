// //src/components/password-reset-form.tsx
// import type React from "react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Link from "next/link";
//
// export function PasswordResetForm({
//     className,
//     ...props
// }: React.ComponentPropsWithoutRef<"div">) {
//     return (
//         <div className={cn("flex flex-col gap-6", className)} {...props}>
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="text-2xl">Set New Password</CardTitle>
//                     <CardDescription>
//                         Create a new password for your account
//                     </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <form>
//                         <div className="flex flex-col gap-6">
//                             <div className="grid gap-2">
//                                 <Label htmlFor="password">New Password</Label>
//                                 <Input id="password" type="password" required />
//                             </div>
//                             <div className="grid gap-2">
//                                 <Label htmlFor="confirmPassword">
//                                     Confirm Password
//                                 </Label>
//                                 <Input
//                                     id="confirmPassword"
//                                     type="password"
//                                     required
//                                 />
//                             </div>
//                             <Button type="submit" className="w-full">
//                                 Reset Password
//                             </Button>
//                         </div>
//                         <div className="mt-4 text-center text-sm">
//                             Remember your password?{" "}
//                             <Link
//                                 href="/login"
//                                 className="underline underline-offset-4"
//                             >
//                                 Back to login
//                             </Link>
//                         </div>
//                     </form>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }

// src/components/password-reset-form.tsx
"use client"; // Required for hooks

import React, { useState, useEffect, Suspense } from "react"; // Import necessary hooks & Suspense
import { useSearchParams, useRouter } from "next/navigation"; // Import Next.js navigation hooks
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
import { useAuth } from "@/lib/context/AuthContext"; // Import your auth hook
import { isFirebaseAuthError } from "@/lib/errorUtils"; // Import your error checker

// Inner component using hooks
function PasswordResetFormContent({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const { verifyResetCode, confirmResetPassword, isProcessingAuthAction } =
        useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    // State for the component
    const [code, setCode] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<
        "idle" | "verifying" | "verified" | "error"
    >("idle");
    const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null); // Optional: show email being reset
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Effect to verify the code on mount
    useEffect(() => {
        const oobCode = searchParams.get("oobCode");
        if (oobCode && verificationStatus === "idle") {
            setCode(oobCode);
            setVerificationStatus("verifying");
            setError(null);

            verifyResetCode(oobCode)
                .then((email) => {
                    setVerifiedEmail(email);
                    setVerificationStatus("verified");
                })
                .catch((err: unknown) => {
                    console.error("Code verification error:", err);
                    setVerificationStatus("error");
                    if (isFirebaseAuthError(err)) {
                        setError(
                            `Verification failed: ${err.message}. The link may be invalid or expired.`,
                        );
                    } else {
                        setError(
                            "Failed to verify password reset link. It may be invalid or expired.",
                        );
                    }
                });
        } else if (!oobCode && verificationStatus === "idle") {
            setVerificationStatus("error");
            setError(
                "No password reset code found in the URL. Please request a new link via the 'Forgot Password' option.",
            );
        }
    }, [searchParams, verifyResetCode, verificationStatus]);

    // Handler for form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (!code || verificationStatus !== "verified") {
            setError("Cannot reset password without a valid, verified code.");
            return;
        }

        try {
            await confirmResetPassword(code, newPassword);
            setSuccess(true);
            console.log("Password reset successful!");
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: unknown) {
            console.error("Confirm password reset error:", err);
            if (isFirebaseAuthError(err)) {
                setError(`Password reset failed: ${err.message}`); // e.g., weak password
            } else {
                setError(
                    "An unexpected error occurred while resetting the password.",
                );
            }
        }
    };

    // --- Render based on state ---

    if (verificationStatus === "idle" || verificationStatus === "verifying") {
        return (
            <Card className={className} {...props}>
                <CardHeader>
                    <CardTitle>Verifying Reset Link...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Please wait.</p>
                </CardContent>
            </Card>
        );
    }

    if (verificationStatus === "error") {
        return (
            <Card className={className} {...props}>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-red-600">{error}</p>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">
                            Back to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    // --- Render Verified State (Form or Success Message) ---
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Set New Password</CardTitle>
                    <CardDescription>
                        {success
                            ? "Your password has been updated."
                            : `Create a new password for ${verifiedEmail ? verifiedEmail : "your account"}.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center space-y-2">
                            <p className="text-sm text-green-600 font-medium">
                                Password successfully reset!
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Redirecting you to the login page...
                            </p>
                            <Link href="/login">
                                <Button variant="link">Go to Login now</Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                {error && (
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        required
                                        minLength={6}
                                        disabled={isProcessingAuthAction}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                        disabled={isProcessingAuthAction}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isProcessingAuthAction}
                                >
                                    {isProcessingAuthAction
                                        ? "Resetting..."
                                        : "Reset Password"}
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Exported component providing the Suspense boundary
export function PasswordResetForm(
    props: React.ComponentPropsWithoutRef<"div">,
) {
    return (
        // Fallback can be more sophisticated
        <Suspense
            fallback={
                <Card>
                    <CardHeader>
                        <CardTitle>Loading Form...</CardTitle>
                    </CardHeader>
                </Card>
            }
        >
            <PasswordResetFormContent {...props} />
        </Suspense>
    );
}
