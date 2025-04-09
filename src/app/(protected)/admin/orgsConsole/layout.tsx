// src/app/admin/orgConsole/layout.tsx
import React, { ReactNode } from "react";

export default function OrgConsoleLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="">
            <main className="">{children}</main>
        </div>
    );
}
