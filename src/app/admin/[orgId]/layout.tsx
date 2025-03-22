// "use client";
//
// import React, { useState, useEffect } from "react";
// import Sidebar from "@/components/common/Sidebar";
// import { Organisation } from "@/context/OrganisationContext";
// import { getOrganisation } from "@/services/organisationService";
// import "../styles/sidebar.css";
// import "../styles/dashboard.css";
//
// export default function DashboardLayout({
//     children,
//     params,
// }: {
//     children: React.ReactNode;
//     params: { orgId: string };
// }) {
//     const [sidebarExpanded, setSidebarExpanded] = useState(true);
//     const [organisation, setOrganisation] = useState<Organisation | null>();
//     const [loading, setLoading] = useState(true);
//     // @ts-expect-error Using react use to unwrap regular javascript object
//     const orgId = React.use(params).orgId;
//
//     // Load organisation data
//     useEffect(() => {
//         const loadOrg = async () => {
//             try {
//                 const org = await getOrganisation(orgId);
//                 setOrganisation(org);
//             } catch (error) {
//                 console.error("Error loading organisation:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         React.use(loadOrg());
//     }, [orgId]);
//
//     const toggleSidebar = () => {
//         setSidebarExpanded(!sidebarExpanded);
//     };
//
//     // Sidebar should be expanded by default on larger screens and collapsed on smaller screens
//     useEffect(() => {
//         const handleResize = () => {
//             if (window.innerWidth < 768) {
//                 setSidebarExpanded(false);
//             } else {
//                 setSidebarExpanded(true);
//             }
//         };
//
//         // Set initial state
//         handleResize();
//
//         // Add event listener
//         window.addEventListener("resize", handleResize);
//
//         // Clean up
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);
//
//     if (loading) {
//         return <div className="loading">Loading organisation...</div>;
//     }
//
//     if (!organisation) {
//         return <div className="error">Organisation not found</div>;
//     }
//
//     return (
//         <div className="dashboard-layout">
//             <Sidebar expanded={sidebarExpanded} onToggle={toggleSidebar} />
//
//             <main
//                 className={`main-content ${sidebarExpanded ? "" : "sidebar-collapsed"}`}
//             >
//                 <div className="org-header">
//                     <h1 className="title is-4">{organisation.name}</h1>
//                     <span
//                         className={`tag ${organisation.active ? "is-success" : "is-danger"}`}
//                     >
//                         {organisation.active ? "Active" : "Inactive"}
//                     </span>
//                 </div>
//
//                 <div className="content-container">{children}</div>
//             </main>
//         </div>
//     );
// }

"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/common/Sidebar";
import { Organisation, useOrganisations } from "@/context/OrganisationContext";
import "../styles/sidebar.css";
import "../styles/dashboard.css";

export default function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { orgId: string };
}) {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    // @ts-expect-error Using react use to unwrap regular javascript object
    const orgId = React.use(params).orgId;
    const { organisations } = useOrganisations();
    const [currentOrganisation, setCurrentOrganisation] =
        useState<Organisation | null>(null);
    const [loading, setLoading] = useState(true);

    // Find the current organisation in the context
    useEffect(() => {
        if (organisations && organisations.length > 0) {
            const org = organisations.find((org) => org.id === orgId);
            if (org) {
                setCurrentOrganisation(org);
            }
            setLoading(false);
        }
    }, [orgId, organisations]);

    // Sidebar should be expanded by default on larger screens and collapsed on smaller screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarExpanded(false);
            } else {
                setSidebarExpanded(true);
            }
        };

        // Set initial state
        handleResize();

        // Add event listener
        window.addEventListener("resize", handleResize);

        // Clean up
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    if (loading) {
        return <div className="loading">Loading organisation...</div>;
    }

    if (!currentOrganisation) {
        return <div className="error">Organisation not found</div>;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar
                expanded={sidebarExpanded}
                onToggle={toggleSidebar}
                orgId={orgId}
            />

            <main
                className={`main-content ${sidebarExpanded ? "" : "sidebar-collapsed"}`}
            >
                <div className="org-header">
                    <h1 className="title is-4">{currentOrganisation.name}</h1>
                    <span
                        className={`tag ${currentOrganisation.active ? "is-success" : "is-danger"}`}
                    >
                        {currentOrganisation.active ? "Active" : "Inactive"}
                    </span>
                </div>

                <div className="content-container">{children}</div>
            </main>
        </div>
    );
}
