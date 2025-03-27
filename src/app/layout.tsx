import { ReactNode } from "react";
import { OrgProvider } from "@/context/OrgContext";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <OrgProvider>
                <body>{children}</body>
            </OrgProvider>
        </html>
    );
}
