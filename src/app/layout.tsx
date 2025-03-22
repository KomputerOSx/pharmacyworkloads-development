// // src/app/layout.tsx
// import "bulma/css/bulma.min.css";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import "./globals.css";
// import type {Metadata} from "next";
// import {EditModeProvider} from "@/context/EditModeContext";
// import {WorkloadProvider} from "@/context/WorkloadContext";
// import {OrganisationProvider} from "@/context/OrganisationContext";
// import {HospitalProvider} from "@/context/HospitalContext";
// import {DepartmentProvider} from "@/context/DepartmentContext";
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
//                 <OrganisationProvider>
//                     <HospitalProvider>
//                         <DepartmentProvider>
//                             <WorkloadProvider>
//                                 <EditModeProvider>{children}</EditModeProvider>
//                             </WorkloadProvider>
//                         </DepartmentProvider>
//                     </HospitalProvider>
//                 </OrganisationProvider>
//             </body>
//         </html>
//     );
// }

// src/app/layout.tsx
import "bulma/css/bulma.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import type { Metadata } from "next";
import { EditModeProvider } from "@/context/EditModeContext";
import { WorkloadProvider } from "@/context/WorkloadContext";
import { OrganisationProvider } from "@/context/OrganisationContext";
import { HospitalProvider } from "@/context/HospitalContext";
import { DepartmentProvider } from "@/context/DepartmentContext";
import { WardProvider } from "@/context/WardContext";
import React from "react";
import { StaffProvider } from "@/context/StaffContext";

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
                <OrganisationProvider>
                    <HospitalProvider>
                        <DepartmentProvider>
                            <WardProvider>
                                <StaffProvider>
                                    <WorkloadProvider>
                                        <EditModeProvider>
                                            {children}
                                        </EditModeProvider>
                                    </WorkloadProvider>
                                </StaffProvider>
                            </WardProvider>
                        </DepartmentProvider>
                    </HospitalProvider>
                </OrganisationProvider>
            </body>
        </html>
    );
}
