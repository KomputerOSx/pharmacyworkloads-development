// src/app/admin/components/OrganizationManagement.tsx
"use client";

import { useState } from "react";
import OrganizationFilter from "./organizations/OrganizationFilter";
import OrganizationTable from "./organizations/OrganizationTable";
import OrganizationModal from "./organizations/OrganizationModal";
import { Organization, useOrganizations } from "@/context/OrganizationContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";

export default function OrganizationManagement() {
    const {
        organizations,
        loading,
        error,
        filter,
        setFilter,
        addNewOrganization,
        updateExistingOrganization,
        removeOrganization,
    } = useOrganizations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrganization, setCurrentOrganization] =
        useState<Organization | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [actionResult, setActionResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const handleAddOrganization = () => {
        setCurrentOrganization(null);
        setModalMode("add");
        setIsModalOpen(true);
    };

    const handleEditOrganization = (org: Organization) => {
        setCurrentOrganization(org);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleDeleteOrganization = async (id: string) => {
        if (confirm("Are you sure you want to delete this organization?")) {
            try {
                await removeOrganization(id);
                setActionResult({
                    success: true,
                    message: "Organization deleted successfully",
                });
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setActionResult({
                    success: false,
                    message: "Failed to delete organization",
                });
            }
        }
    };

    const handleSaveOrganization = async (org: Organization) => {
        try {
            if (modalMode === "add") {
                // Strip id and other fields that shouldn't be in new record
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, hospitalCount, createdAt, updatedAt, ...newOrg } =
                    org;
                await addNewOrganization(newOrg);

                setActionResult({
                    success: true,
                    message: "Organization added successfully",
                });
            } else {
                await updateExistingOrganization(org.id, org);

                setActionResult({
                    success: true,
                    message: "Organization updated successfully",
                });
            }
            setIsModalOpen(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setActionResult({
                success: false,
                message: `Failed to ${modalMode === "add" ? "add" : "update"} organization`,
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
                        <h3 className="title is-4 mb-5">Organizations</h3>
                        <h5 className="subtitle is-6">
                            Manage healthcare organizations
                        </h5>
                    </div>

                    {/* Button in its own block */}
                    <div className="block">
                        <button
                            className="button is-primary"
                            onClick={handleAddOrganization}
                        >
                            <span className="icon">
                                <i className="fas fa-plus"></i>
                            </span>
                            <span>Add Organization</span>
                        </button>
                    </div>

                    {/* Filter in its own block */}
                    <div className="block">
                        <OrganizationFilter
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
                        <OrganizationTable
                            organizations={organizations}
                            onEdit={handleEditOrganization}
                            onDelete={handleDeleteOrganization}
                        />
                    </div>
                )}
            </div>

            {/* Organization Modal */}
            <OrganizationModal
                isOpen={isModalOpen}
                mode={modalMode}
                organization={currentOrganization}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOrganization}
            />
        </div>
    );
}
