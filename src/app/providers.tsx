// src/app/providers.tsx
"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Example: Data stays fresh for 1 minute
                staleTime: 60 * 1000,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (typeof window === "undefined") {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: make a new query client if we don't already have one
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

export default function Providers({ children }: { children: React.ReactNode }) {
    // NOTE: Avoid useState when initializing the query client if you are
    //       rendering on the server. See https://tanstack.com/query/v5/docs/react/guides/ssr
    const queryClient = getQueryClient(); // Get the client instance *inside* the Client Component

    return (
        // Render the provider INSIDE the client component boundary
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
        </QueryClientProvider>
    );
}
