import { ReactNode } from "react";
import { OrgProvider } from "@/context/OrgContext";
import "./globals.css";
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
