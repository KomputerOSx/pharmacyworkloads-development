"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/common/Sidebar";
import { Organisation } from "@/context/OrganisationContext";
import { getOrganisation } from "@/services/organisationService";
import styles from "../styles/Dashboard.module.css";
import { HospitalProvider } from "@/context/HospitalContext";

export default function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { orgId: string };
}) {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [loading, setLoading] = useState(true);
    // @ts-expect-error Using react use to unwrap regular javascript object
    const orgId = React.use(params).orgId;

    // Load organisation data
    useEffect(() => {
        const loadOrg = async () => {
            try {
                const org = await getOrganisation(orgId);
                setOrganisation(org);
            } catch (error) {
                console.error("Error loading organisation:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOrg();
    }, [orgId]);

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

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

    if (loading) {
        return <div className={styles.loading}>Loading organisation...</div>;
    }

    if (!organisation) {
        return <div className={styles.error}>Organisation not found</div>;
    }

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar
                expanded={sidebarExpanded}
                onToggle={toggleSidebar}
                orgId={orgId}
            />

            <main
                className={`${styles.mainContent} ${!sidebarExpanded ? styles.sidebarCollapsed : ""}`}
            >
                <div className={styles.orgHeader}>
                    <h1 className="title is-1">{organisation.name}</h1>
                    <span
                        className={`tag ${organisation.active ? "is-success" : "is-danger"}`}
                    >
                        {organisation.active ? "Active" : "Inactive"}
                    </span>
                </div>

                <HospitalProvider organisationId={orgId}>
                    <div className={styles.contentContainer}>{children}</div>
                </HospitalProvider>
            </main>
        </div>
    );
}
