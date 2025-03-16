// src/app/admin/components/HospitalManagement.tsx
"use client";

import { useState } from "react";
import HospitalFilter from "./hospitals/HospitalFilter";
import HospitalCard from "./hospitals/HospitalCard";
import HospitalModal from "./hospitals/HospitalModal";
import { Hospital, useHospitals } from "@/context/HospitalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function HospitalManagement() {
    const {
        hospitals,
        loading,
        error,
        filter,
        setFilter,
        addNewHospital,
        updateExistingHospital,
        removeHospital,
    } = useHospitals();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHospital, setCurrentHospital] = useState<Hospital | null>(
        null,
    );
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    const [actionResult, setActionResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        hospitalId: string;
        hospitalName: string;
    }>({
        isOpen: false,
        hospitalId: "",
        hospitalName: "",
    });

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

    const handleDeleteConfirm = (id: string, name: string) => {
        setConfirmDialog({
            isOpen: true,
            hospitalId: id,
            hospitalName: name,
        });
    };

    const handleDeleteHospital = async () => {
        try {
            await removeHospital(confirmDialog.hospitalId);

            setActionResult({
                success: true,
                message: `Hospital "${confirmDialog.hospitalName}" deleted successfully`,
            });

            // Close the confirm dialog
            setConfirmDialog({
                isOpen: false,
                hospitalId: "",
                hospitalName: "",
            });
        } catch (err) {
            setActionResult({
                success: false,
                message: "Failed to delete hospital",
            });
        }
    };

    const handleSaveHospital = async (hospital: Hospital) => {
        try {
            if (modalMode === "add") {
                const {
                    id,
                    departments,
                    wards,
                    staff,
                    createdAt,
                    updatedAt,
                    ...newHospital
                } = hospital;
                await addNewHospital(newHospital);

                setActionResult({
                    success: true,
                    message: `Hospital "${hospital.name}" added successfully`,
                });
            } else {
                await updateExistingHospital(hospital.id, hospital);

                setActionResult({
                    success: true,
                    message: `Hospital "${hospital.name}" updated successfully`,
                });
            }
            setIsModalOpen(false);
        } catch (err) {
            setActionResult({
                success: false,
                message: `Failed to ${modalMode === "add" ? "add" : "update"} hospital`,
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
                    <h3 className="title is-4 mb-5">Hospitals</h3>
                    <p className="subtitle is-6">Manage hospital facilities</p>
                    <div className="buttons">
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

                    <HospitalFilter filter={filter} setFilter={setFilter} />
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
                    <div className="columns is-multiline">
                        {hospitals.length === 0 ? (
                            <div className="column is-12">
                                <div className="notification is-info">
                                    No hospitals found. Try adjusting your
                                    filters or add a new hospital.
                                </div>
                            </div>
                        ) : (
                            hospitals.map((hospital) => (
                                <div className="column is-4" key={hospital.id}>
                                    <HospitalCard
                                        hospital={hospital}
                                        onEdit={() =>
                                            handleEditHospital(hospital)
                                        }
                                        onDelete={() =>
                                            handleDeleteConfirm(
                                                hospital.id,
                                                hospital.name,
                                            )
                                        }
                                    />
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Hospital Modal */}
            <HospitalModal
                isOpen={isModalOpen}
                mode={modalMode}
                hospital={currentHospital}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveHospital}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Delete Hospital"
                message={`Are you sure you want to delete "${confirmDialog.hospitalName}"? This action cannot be undone.`}
                confirmText="Delete Hospital"
                cancelText="Cancel"
                onConfirm={handleDeleteHospital}
                onCancel={() =>
                    setConfirmDialog({
                        isOpen: false,
                        hospitalId: "",
                        hospitalName: "",
                    })
                }
                confirmButtonClass="is-danger"
            />
        </div>
    );
}
