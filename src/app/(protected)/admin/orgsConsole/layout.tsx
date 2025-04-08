// src/app/admin/orgConsole/layout.tsx
import React, { ReactNode } from "react";

export default function OrgConsoleLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
        </div>
    );
}
