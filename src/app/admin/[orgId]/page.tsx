// src/app/organisations/[orgId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Organisation } from "@/context/OrganisationContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getOrganisation } from "@/services/organisationService";

export default function OrganisationPage() {
    const params = useParams();
    const orgId = params.orgId as string;

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrganisation = async () => {
            if (!orgId) return;

            try {
                setLoading(true);
                const data = await getOrganisation(orgId);
                setOrganisation(data);
            } catch (err) {
                console.error("Error fetching organisation:", err);
                setError("Failed to load organisation details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrganisation();
    }, [orgId]);

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="notification is-danger">
                <p>{error}</p>
            </div>
        );
    }

    if (!organisation) {
        return (
            <div className="notification is-warning">
                <p>Organisation not found</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="box">
                <h1 className="title">{organisation.name}</h1>
                <h2 className="subtitle">{organisation.type}</h2>

                <div className="content">
                    <p>
                        <strong>Contact Email:</strong>{" "}
                        {organisation.contactEmail}
                    </p>
                    <p>
                        <strong>Contact Phone:</strong>{" "}
                        {organisation.contactPhone}
                    </p>
                    <p>
                        <strong>Status:</strong>{" "}
                        {organisation.active ? "Active" : "Inactive"}
                    </p>
                </div>

                <div className="field">
                    <div className="control">
                        <button
                            className="button is-primary"
                            onClick={() => window.history.back()}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
