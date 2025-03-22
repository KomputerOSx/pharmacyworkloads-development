"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Organisation, useOrganisations } from "@/context/OrganisationContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";
import OrganisationCard from "./componenets/OrganisationCard";
import OrganisationModal from "../components/organisations/OrganisationModal";

export default function OrganisationsPage() {
    const router = useRouter();
    const {
        organisations,
        loading,
        error,
        addNewOrganisation,
        updateExistingOrganisation,
    } = useOrganisations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrganisation, setCurrentOrganisation] =
        useState<Organisation | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [actionResult, setActionResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const handleAddOrganisation = () => {
        setCurrentOrganisation(null);
        setModalMode("add");
        setIsModalOpen(true);
    };

    // noinspection DuplicatedCode
    const handleSaveOrganisation = async (org: Organisation) => {
        try {
            if (modalMode === "add") {
                // Strip id and other fields that shouldn't be in new record
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, createdAt, updatedAt, ...newOrg } = org;
                await addNewOrganisation(newOrg);

                setActionResult({
                    success: true,
                    message: "Organisation added successfully",
                });
            } else {
                await updateExistingOrganisation(org.id, org);

                setActionResult({
                    success: true,
                    message: "Organisation updated successfully",
                });
            }
            setIsModalOpen(false);
        } catch (err) {
            setActionResult({
                success: false,
                message: `Failed to ${modalMode === "add" ? "add" : "update"} organisation`,
            });
            console.error(err);
        }
    };

    const navigateToOrganisation = (orgId: string) => {
        router.push(`/admin/${orgId}`);
    };

    // Clear action result after 5 seconds
    useEffect(() => {
        if (actionResult) {
            const timer = setTimeout(() => {
                setActionResult(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [actionResult]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container py-6">
            <div className="columns">
                <div className="column">
                    <div className="level mb-6">
                        <div className="level-left">
                            <div className="level-item">
                                <h1 className="title is-3">Organisations</h1>
                            </div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">
                                <button
                                    className="button is-primary"
                                    onClick={handleAddOrganisation}
                                >
                                    <span className="icon">
                                        <i className="fas fa-plus"></i>
                                    </span>
                                    <span>Add Organisation</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action result message */}
                    {actionResult && (
                        <AlertMessage
                            type={actionResult.success ? "success" : "danger"}
                            message={actionResult.message}
                            onClose={() => setActionResult(null)}
                        />
                    )}

                    {/* Error display */}
                    {error && (
                        <div className="notification is-danger">
                            <button
                                className="delete"
                                onClick={() => {}}
                            ></button>
                            {error}
                        </div>
                    )}

                    {/* Organisations grid */}
                    <div className="columns is-multiline">
                        {organisations.length === 0 ? (
                            <div className="column is-12">
                                <div className="notification is-info">
                                    No organisations found. Click &#34;Add
                                    Organisation&#34; to create one.
                                </div>
                            </div>
                        ) : (
                            organisations.map((org) => (
                                <div key={org.id} className="column is-4">
                                    <OrganisationCard
                                        organisation={org}
                                        onClick={() =>
                                            navigateToOrganisation(org.id)
                                        }
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Organisation Modal */}
            <OrganisationModal
                isOpen={isModalOpen}
                mode={modalMode}
                organisation={currentOrganisation}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOrganisation}
            />
        </div>
    );
}
