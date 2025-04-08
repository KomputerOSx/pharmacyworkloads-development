// // src/app/providers.tsx
// "use client";
//
// import React from "react";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "sonner";
//
// function makeQueryClient() {
//     return new QueryClient({
//         defaultOptions: {
//             queries: {
//                 staleTime: 60 * 1000,
//             },
//         },
//     });
// }
//
// let browserQueryClient: QueryClient | undefined = undefined;
//
// function getQueryClient() {
//     if (typeof window === "undefined") {
//         return makeQueryClient();
//     } else {
//         if (!browserQueryClient) browserQueryClient = makeQueryClient();
//         return browserQueryClient;
//     }
// }
//
// export default function Providers({ children }: { children: React.ReactNode }) {
//     const queryClient = getQueryClient();
//
//     return (
//         <QueryClientProvider client={queryClient}>
//             {children}
//             <Toaster />
//         </QueryClientProvider>
//     );
// }

// src/app/providers.tsx
"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/context/AuthContext";

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
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    );
}
