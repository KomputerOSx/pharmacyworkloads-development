"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Hospital,
    HospitalProvider,
    useHospitals,
} from "@/context/HospitalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";
import HospitalCard from "@/app/admin/org/hospitals/HospitalCard";
import HospitalModal from "@/app/admin/org/hospitals/HospitalModal";
import { getOrganisation } from "@/services/organisationService";
import { Organisation } from "@/context/OrganisationContext";
import { HospitalDeleteModal } from "@/app/admin/org/hospitals/HospitalDeleteModal";

// Main component that will be wrapped with the provider
function HospitalsList() {
    const {
        hospitals,
        loading,
        error,
        addNewHospital,
        updateExistingHospital,
        removeHospital,
    } = useHospitals();

    const params = useParams();
    const orgId = params.orgId as string;

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentHospital, setCurrentHospital] = useState<Hospital | null>(
        null,
    );
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [actionResult, setActionResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const handleAddHospital = () => {
        setCurrentHospital(null);
        setModalMode("add");
        setIsModalOpen(true);
    };

    const handleEditHospital = (hospital: Hospital) => {
        setCurrentHospital(hospital);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleDeleteHospital = (hospital: Hospital) => {
        setCurrentHospital(hospital);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (hospital: Hospital) => {
        try {
            await removeHospital(hospital.id);
            setActionResult({
                success: true,
                message: "Hospital deleted successfully",
            });
            setIsDeleteModalOpen(false);
        } catch (err) {
            setActionResult({
                success: false,
                message: "Failed to delete hospital",
            });
            console.error(err);
        }
    };

    const handleSaveHospital = async (hospital: Hospital) => {
        try {
            if (modalMode === "add") {
                // Ensure organisation is included for new hospitals
                if (orgId) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, createdAt, updatedAt, ...newHospital } =
                        hospital;

                    await addNewHospital(newHospital, orgId);

                    setActionResult({
                        success: true,
                        message: "Hospital added successfully",
                    });
                } else {
                    throw new Error("Organisation data is missing");
                }
            } else {
                await updateExistingHospital(hospital.id, orgId, hospital);
                console.log(
                    "Updating hospital:",
                    hospital.id,
                    "with organization:",
                    orgId,
                    "and data:",
                    hospital,
                );
                setActionResult({
                    success: true,
                    message: "Hospital updated successfully",
                });
            }
            setIsModalOpen(false);
        } catch (err) {
            setActionResult({
                success: false,
                message: `Failed to ${modalMode === "add" ? "add" : "update"} hospital: ${err instanceof Error ? err.message : "Unknown error"}`,
            });
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchOrganisation = async () => {
            try {
                const org = await getOrganisation(orgId);
                setOrganisation(org);
            } catch (err) {
                console.error(err);
            }
        };
        console.log(
            "Hospital Page.tsx fetchOrganisation() called- orgId:",
            orgId,
        );
        fetchOrganisation().then((r) => r);
    }, [orgId]);
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

    // Fetch organisation data

    return (
        <div className="container py-6">
            <div className="level mb-3">
                <div className="level-left">
                    <div className="level-item">
                        <h1 className="title is-3">Hospitals</h1>
                    </div>
                </div>
                <div className="level-right">
                    <div className="level-item">
                        <button
                            className="button is-primary"
                            onClick={handleAddHospital}
                        >
                            <span className="icon">
                                <i className="fas fa-plus"></i>
                            </span>
                            <span>Add Hospital</span>
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
                    <button className="delete" onClick={() => {}}></button>
                    {error}
                </div>
            )}

            {/* Hospitals grid */}
            <div className="columns is-multiline">
                {hospitals.length === 0 ? (
                    <div className="column is-12">
                        <div className="notification is-info">
                            No hospitals found. Click &#34;Add Hospital&#34; to
                            create one.
                        </div>
                    </div>
                ) : (
                    hospitals.map((hospital) => (
                        <div key={hospital.id} className="column is-4">
                            <HospitalCard
                                hospital={hospital}
                                onEdit={() => handleEditHospital(hospital)}
                                onDelete={() => handleDeleteHospital(hospital)}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Hospital Modal */}
            <HospitalModal
                isOpen={isModalOpen}
                mode={modalMode}
                hospital={currentHospital}
                organisationName={organisation?.name}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveHospital}
            />

            {/* Hospital Delete Modal */}
            <HospitalDeleteModal
                isOpen={isDeleteModalOpen}
                hospital={currentHospital}
                organisationName={organisation?.name}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleConfirmDelete}
            />
        </div>
    );
}

// Page component with provider wrapper
export default function HospitalsPage() {
    const params = useParams();
    const orgId = params.orgId as string;

    return (
        <HospitalProvider organisationId={orgId}>
            <HospitalsList />
        </HospitalProvider>
    );
}
