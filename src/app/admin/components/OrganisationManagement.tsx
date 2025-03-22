// src/app/admin/components/OrganisationManagement.tsx
"use client";

import { useState } from "react";
import OrganisationFilter from "./organisations/OrganisationFilter";
import OrganisationTable from "./organisations/OrganisationTable";
import OrganisationModal from "./organisations/OrganisationModal";
import { Organisation, useOrganisations } from "@/context/OrganisationContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";

export default function OrganisationManagement() {
    const {
        organisations,
        loading,
        error,
        filter,
        setFilter,
        addNewOrganisation,
        updateExistingOrganisation,
        removeOrganisation,
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

    const handleEditOrganisation = (org: Organisation) => {
        setCurrentOrganisation(org);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleDeleteOrganisation = async (id: string) => {
        if (confirm("Are you sure you want to delete this organisation?")) {
            try {
                await removeOrganisation(id);
                setActionResult({
                    success: true,
                    message: "Organisation deleted successfully",
                });
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setActionResult({
                    success: false,
                    message: "Failed to delete organisation",
                });
            }
        }
    };

    const handleSaveOrganisation = async (org: Organisation) => {
        try {
            if (modalMode === "add") {
                // Strip id and other fields that shouldn't be in new record
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, hospitalCount, createdAt, updatedAt, ...newOrg } =
                    org;
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setActionResult({
                success: false,
                message: `Failed to ${modalMode === "add" ? "add" : "update"} organisation`,
            });
        }
    };

    // Clear action result after 5 seconds
    if (actionResult) {
        setTimeout(() => {
            setActionResult(null);
        }, 5000);
    }

    return (
        <div className="columns">
            <div className="column is-3">
                <div className="box">
                    {/* Properly structured title and subtitle */}
                    <div className="block">
                        <h3 className="title is-4 mb-5">Organisations</h3>
                        <h5 className="subtitle is-6">
                            Manage healthcare organisations
                        </h5>
                    </div>

                    {/* Button in its own block */}
                    <div className="block">
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

                    {/* Filter in its own block */}
                    <div className="block">
                        <OrganisationFilter
                            filter={filter}
                            setFilter={setFilter}
                        />
                    </div>
                </div>
            </div>

            <div className="column is-9">
                {/* Action result message */}
                {actionResult && (
                    <AlertMessage
                        type={actionResult.success ? "success" : "danger"}
                        message={actionResult.message}
                        onClose={() => setActionResult(null)}
                    />
                )}

                {/* Loading indicator or error message */}
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="notification is-danger">
                        <button className="delete" onClick={() => {}}></button>
                        {error}
                    </div>
                ) : (
                    <div className="box">
                        <OrganisationTable
                            organisations={organisations}
                            onEdit={handleEditOrganisation}
                            onDelete={handleDeleteOrganisation}
                        />
                    </div>
                )}
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
