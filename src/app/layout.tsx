// import "./globals.css";
// import "@/styles/themes.css";
// import { ReactNode } from "react";
// import { OrgProvider } from "@/context/OrgContext";
//
// import { Toaster } from "sonner";
// import { HospProvider } from "@/context/HospitalContext";
//
// export default function RootLayout({ children }: { children: ReactNode }) {
//     return (
//         <html lang="en">
//             <body>
//                 <OrgProvider>
//                     <HospProvider>
//                         {children}
//                         <Toaster />
//                     </HospProvider>
//                 </OrgProvider>
//             </body>
//         </html>
//     );
// }
// src/app/layout.tsx
import "./globals.css";
import "@/styles/themes.css"; // Ensure path is correct
import React, { ReactNode } from "react";
import Providers from "./providers"; // Import the client wrapper

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                {/* Render the Providers Client Component here */}
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
