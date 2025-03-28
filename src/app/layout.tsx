import "./globals.css";
import "@/styles/themes.css";
import { ReactNode } from "react";
import { OrgProvider } from "@/context/OrgContext";

import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <OrgProvider>
                    {children}
                    <Toaster />
                </OrgProvider>
            </body>
        </html>
    );
}
