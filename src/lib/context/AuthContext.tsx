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
} from "firebase/auth";
import { auth } from "@/config/firebase"; // Adjust path if needed

const EMAIL_FOR_SIGN_IN_KEY = "emailForSignIn"; // Key for localStorage

interface AuthContextType {
    user: User | null;
    /** True during the initial Firebase auth state check on load. */
    loading: boolean;
    /** True when an async auth action (login, logout, link send/completion) is in progress. */
    isProcessingAuthAction: boolean;
    /** Logs the current user out. */
    logout: () => Promise<void>;
    /** Logs a user in using email and password. */
    loginWithEmail: (
        email: string,
        password: string,
    ) => Promise<UserCredential>;
    /** Sends a passwordless sign-in link to the provided email. */
    sendLoginLink: (email: string) => Promise<void>;
    // Add other methods like loginWithGoogle, signUpWithEmail as needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessingAuthAction, setIsProcessingAuthAction] = useState(false);

    useEffect(() => {
        const completeSignInWithLink = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                setIsProcessingAuthAction(true);
                const email = window.localStorage.getItem(
                    EMAIL_FOR_SIGN_IN_KEY,
                );
                if (!email) {
                    // Prompting for email is complex, handle as error or implement UI prompt separately
                    console.error(
                        "Sign-in link completion failed: Email not found in storage.",
                    );
                    setIsProcessingAuthAction(false);
                    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY); // Clean up just in case
                    // Potentially show an error message to the user
                    return; // Stop the process
                }

                try {
                    await signInWithEmailLink(
                        auth,
                        email,
                        window.location.href,
                    );
                    // Success: onAuthStateChanged below will set user.
                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname,
                    ); // Clean URL
                } catch (error) {
                    console.error("Error signing in with email link:", error);
                    // Potentially show error message
                } finally {
                    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY); // Always clean up storage
                    // onAuthStateChanged will set isProcessing to false eventually
                }
            }
        };

        completeSignInWithLink(); // Attempt on initial load

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false); // Initial check is done
            setIsProcessingAuthAction(false); // Reset processing state on any auth change
        });

        return () => unsubscribe(); // Cleanup listener
    }, []); // Runs once on mount

    const logout = useCallback(async () => {
        setIsProcessingAuthAction(true);
        try {
            await signOut(auth);
            // onAuthStateChanged handles state update & processing flag reset
        } catch (error) {
            console.error("Logout failed:", error);
            setIsProcessingAuthAction(false); // Reset on error
            throw error;
        }
    }, []);

    const loginWithEmail = useCallback(
        async (email: string, password: string) => {
            setIsProcessingAuthAction(true);
            try {
                // onAuthStateChanged handles state update & processing flag reset
                return await signInWithEmailAndPassword(auth, email, password);
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
            url: window.location.href, // Redirect back to the same page
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

    const value = {
        user,
        loading,
        isProcessingAuthAction,
        logout,
        loginWithEmail,
        sendLoginLink,
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
