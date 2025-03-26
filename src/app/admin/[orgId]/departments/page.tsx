"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DepartmentProvider } from "@/context/DepartmentContext";
import { useHospitals } from "@/context/HospitalContext";
import { getOrganisation } from "@/services/organisationService";
import { Organisation } from "@/context/OrganisationContext";
import DepartmentList from "@/app/admin/components/departments/DepartmentList"; // Import the new component

// Page component with provider wrapper
export default function DepartmentsPage() {
    const params = useParams();
    const orgId = params.orgId as string;

    // Get hospitals from the HospitalContext
    const { hospitals: availableHospitals } = useHospitals();

    const [organisation, setOrganisation] = useState<Organisation | null>(null);

    // Fetch organisation data
    useEffect(() => {
        const fetchOrganisation = async () => {
            try {
                const org = await getOrganisation(orgId);
                setOrganisation(org);
            } catch (err) {
                console.error(err);
            }
        };

        if (orgId) {
            fetchOrganisation();
        }
    }, [orgId]);

    return (
        <DepartmentProvider organisationId={orgId}>
            <DepartmentList
                organisationId={orgId}
                organisationName={organisation?.name}
                availableHospitals={availableHospitals}
            />

            {/* Pass modal components as props if needed */}
            {/* Alternatively, you can move these to the DepartmentList component */}
        </DepartmentProvider>
    );
}
