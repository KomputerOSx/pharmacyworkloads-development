// // app/layout.tsx (Root layout with providers)
// import "bulma/css/bulma.min.css";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import "./globals.css";
// import type {Metadata} from "next";
// import {EditModeProvider} from "@/context/EditModeContext";
// import {WorkloadProvider} from "@/context/WorkloadContext";
// import {OrganizationProvider} from "@/context/OrganizationContext";
// import React from "react";
//
// export const metadata: Metadata = {
//     title: "Pharmacy Directorate Workload Tracker",
//     description:
//         "A tracking system for pharmacy directorate workload management",
// };
//
// export default function RootLayout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     return (
//         <html lang="en" className={"theme-light"}>
//             <body>
//                 <OrganizationProvider>
//                     <WorkloadProvider>
//                         <EditModeProvider>{children}</EditModeProvider>
//                     </WorkloadProvider>
//                 </OrganizationProvider>
//             </body>
//         </html>
//     );
// }

// src/app/layout.tsx
import "bulma/css/bulma.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import type {Metadata} from "next";
import {EditModeProvider} from "@/context/EditModeContext";
import {WorkloadProvider} from "@/context/WorkloadContext";
import {OrganizationProvider} from "@/context/OrganizationContext";
import {HospitalProvider} from "@/context/HospitalContext";
import React from "react";

export const metadata: Metadata = {
    title: "Pharmacy Directorate Workload Tracker",
    description:
        "A tracking system for pharmacy directorate workload management",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={"theme-light"}>
            <body>
                <OrganizationProvider>
                    <HospitalProvider>
                        <WorkloadProvider>
                            <EditModeProvider>{children}</EditModeProvider>
                        </WorkloadProvider>
                    </HospitalProvider>
                </OrganizationProvider>
            </body>
        </html>
    );
}
