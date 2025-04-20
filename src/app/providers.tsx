"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ThemeProvider } from "@/components/common/theme-provider";
// Function to create a QueryClient instance
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    });
}

// Singleton QueryClient for the browser
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (typeof window === "undefined") {
        return makeQueryClient();
    } else {
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                    <Toaster
                        richColors={true}
                        toastOptions={{
                            closeButton: true,
                            closeButtonAriaLabel: "Close",
                            duration: 3000,
                        }}
                    />
                </QueryClientProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
