"use client";

import React, { useEffect, useState } from "react";
import { HospitalProvider } from "@/context/HospitalContext";
import { getOrganisation } from "@/services/organisationService";
import {
    Organisation,
    OrganisationProvider,
} from "@/context/OrganisationContext";
import { DepartmentProvider } from "@/context/DepartmentContext";
import { WardProvider } from "@/context/WardContext";
import { StaffProvider } from "@/context/StaffContext";
import { WorkloadProvider } from "@/context/WorkloadContext";
import { EditModeProvider } from "@/context/EditModeContext";

export default function OrganisationLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { orgId: string };
}) {
    const [loading, setLoading] = useState(true);
    const [organisation, setOrganisation] = useState(null);
    const orgId = params.orgId;

    useEffect(() => {
        const loadOrg = async () => {
            try {
                const org = await getOrganisation(orgId);
                setOrganisation(org as Organisation);
            } catch (error) {
                console.error("Error loading organisation:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOrg();
    }, [orgId]);

    if (loading) return <div>Loading organisation...</div>;
    if (!organisation) return <div>Organisation not found</div>;

    return (
        <div>
            <div className="org-header">
                <h1>{organisation.name}</h1>
            </div>

            {/* All child components will have access to hospital data for this org */}
            <OrganisationProvider>
                <HospitalProvider organisationId={orgId}>
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
        </div>
    );
}
