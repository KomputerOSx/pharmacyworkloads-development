// src/app/layout.tsx
import "./globals.css";
import "@/styles/themes.css";
import React, { ReactNode } from "react";
import Providers from "./providers";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pharmacy Workloads",
    description: "Manage your pharmacy workloads",
};
export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
