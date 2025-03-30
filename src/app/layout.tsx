import "./globals.css";
import "@/styles/themes.css";
import { ReactNode } from "react";
import { OrgProvider } from "@/context/OrgContext";

import { Toaster } from "sonner";
import { HospProvider } from "@/context/HospitalContext";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <OrgProvider>
                    <HospProvider>
                        {children}
                        <Toaster />
                    </HospProvider>
                </OrgProvider>
            </body>
        </html>
    );
}
