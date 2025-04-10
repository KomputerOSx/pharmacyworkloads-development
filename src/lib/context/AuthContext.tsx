// src/context/AuthContext.tsx
"use client";

import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    AuthError,
    isSignInWithEmailLink,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    signInWithEmailAndPassword,
    signInWithEmailLink,
    signOut,
    User,
    UserCredential,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset,
} from "firebase/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation"; // Adjust path if needed
import { updateLastLogin } from "@/services/userService";
import { toast } from "sonner";

const EMAIL_FOR_SIGN_IN_KEY = "emailForSignIn"; // Key for localStorage

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isProcessingAuthAction: boolean;
    logout: () => Promise<void>;
    loginWithEmail: (
        email: string,
        password: string,
    ) => Promise<UserCredential>;
    sendLoginLink: (email: string) => Promise<void>;
    sendPasswordResetLink: (email: string) => Promise<void>;
    verifyResetCode: (code: string) => Promise<string>;
    confirmResetPassword: (code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessingAuthAction, setIsProcessingAuthAction] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const completeSignInWithLink = async () => {
            console.log(
                "Checking for sign-in link. Current URL:",
                window.location.href,
            ); // Log URL
            if (isSignInWithEmailLink(auth, window.location.href)) {
                console.log("Sign-in link detected."); // Log detection
                setIsProcessingAuthAction(true);
                const email = window.localStorage.getItem(
                    EMAIL_FOR_SIGN_IN_KEY,
                );
                console.log("Email from localStorage:", email); // Log email retrieval

                if (!email) {
                    console.error(
                        "Sign-in link completion failed: Email not found in storage.",
                    );
                    // Consider adding a user-facing message or redirect here
                    router.push("/login?error=session_expired");
                    setIsProcessingAuthAction(false);
                    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
                    return;
                }
                try {
                    console.log("Attempting signInWithEmailLink..."); // Log attempt
                    const userCredential = await signInWithEmailLink(
                        auth,
                        email,
                        window.location.href,
                    );
                    console.log("signInWithEmailLink SUCCESSFUL!"); // Log success

                    if (userCredential.user) {
                        try {
                            console.log(
                                `Attempting to update lastLogin for ${userCredential.user.uid} via magic link.`,
                            );
                            await updateLastLogin(userCredential.user.uid);
                            console.log(
                                "LastLogin updated successfully via magic link.",
                            );
                        } catch (updateError) {
                            console.error(
                                "Failed to update lastLogin after magic link sign-in:",
                                updateError,
                            );
                            toast.warning(
                                "Login successful, but failed to record login time.",
                            );
                        }
                    }

                    // *** THE REDIRECT ***
                    console.log("Attempting redirect to /user..."); // Log redirect attempt
                    setTimeout(() => router.push("/user"), 1000);

                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname,
                    );
                } catch (error) {
                    console.error("Error during signInWithEmailLink:", error); // Log specific error
                } finally {
                    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
                }
            } else {
                console.log("Not a sign-in link or already processed."); // Log if not detected
            }
        };

        void completeSignInWithLink();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false); // Initial check is done
            setIsProcessingAuthAction(false); // Reset processing state on any auth change
        });

        return () => unsubscribe(); // Cleanup listener
    }, [router]);

    const logout = useCallback(async () => {
        setIsProcessingAuthAction(true);
        try {
            await signOut(auth);
            // onAuthStateChanged handles state update & processing flag reset
        } catch (error) {
            console.error("Logout failed:", error);
            setIsProcessingAuthAction(false);
            throw error;
        }
    }, []);

    const loginWithEmail = useCallback(
        async (email: string, password: string) => {
            setIsProcessingAuthAction(true);
            try {
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password,
                );

                if (userCredential.user) {
                    try {
                        console.log(
                            `Attempting to update lastLogin for ${userCredential.user.uid} via password.`,
                        );
                        await updateLastLogin(userCredential.user.uid);
                        console.log(
                            "LastLogin updated successfully via password.",
                        );
                    } catch (updateError) {
                        console.error(
                            "Failed to update lastLogin after password sign-in:",
                            updateError,
                        );
                        toast.warning(
                            "Login successful, but failed to record login time.",
                        );
                    }
                }
                return userCredential;
            } catch (error) {
                console.error("Email login failed:", error);
                setIsProcessingAuthAction(false); // Reset on error
                throw error as AuthError;
            }
        },
        [],
    );

    const sendLoginLink = useCallback(async (email: string) => {
        setIsProcessingAuthAction(true);
        const actionCodeSettings = {
            url: `${window.location.origin}/login`,
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
            setIsProcessingAuthAction(false); // Sending action is done
            // Inform user: "Check your email"
        } catch (error) {
            console.error("Failed to send sign-in link:", error);
            window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY); // Clean up storage on error
            setIsProcessingAuthAction(false); // Reset on error
            throw error as AuthError;
        }
    }, []);

    // --- Password Reset Functions ---

    const sendPasswordResetLink = useCallback(async (email: string) => {
        setIsProcessingAuthAction(true);
        // IMPORTANT: The URL here MUST point to the page where the user
        // will enter their new password (the page with PasswordResetForm).
        // Firebase will append the oobCode (token) and other params to this URL.
        const actionCodeSettings = {
            url: `${window.location.origin}/reset-password`, // Or your specific deployed URL base + route
            handleCodeInApp: true,
        };
        try {
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            setIsProcessingAuthAction(false); // Sending action is done
        } catch (error) {
            console.error("Failed to send password reset link:", error);
            setIsProcessingAuthAction(false);
            throw error;
        }
    }, []);

    const verifyResetCode = useCallback(
        async (code: string): Promise<string> => {
            setIsProcessingAuthAction(true);
            try {
                const email = await verifyPasswordResetCode(auth, code);
                setIsProcessingAuthAction(false);
                return email;
            } catch (error) {
                console.error("Failed to verify password reset code:", error);
                setIsProcessingAuthAction(false);
                throw error; // Re-throw for component handling (e.g., invalid/expired code)
            }
        },
        [],
    );

    const confirmResetPassword = useCallback(
        async (code: string, newPassword: string) => {
            setIsProcessingAuthAction(true);
            try {
                await confirmPasswordReset(auth, code, newPassword);
                setIsProcessingAuthAction(false);
                // Consider logging the user out here if they were somehow still logged in,
                // although typically they wouldn't be during this flow.
                await signOut(auth);
            } catch (error) {
                console.error("Failed to confirm password reset:", error);
                setIsProcessingAuthAction(false);
                throw error; // Re-throw for component handling (e.g., weak password)
            }
        },
        [],
    );

    const value = {
        user,
        loading,
        isProcessingAuthAction,
        logout,
        loginWithEmail,
        sendLoginLink,
        sendPasswordResetLink,
        verifyResetCode,
        confirmResetPassword,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
