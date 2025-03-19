// src/app/admin/components/StaffManagement.tsx
"use client";

import { useState } from "react";
import { Staff, useStaff } from "@/context/StaffContext";
import StaffFilter from "./staff/StaffFilter";
import StaffList from "./staff/StaffList";
import StaffModal from "./staff/StaffModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StaffAssignmentManager from "@/app/admin/components/staff/StaffAssignmentManager";

export default function StaffManagement() {
    const {
        staff,
        loading,
        error,
        filter,
        setFilter,
        addNewStaff,
        updateExistingStaff,
        removeStaff,
    } = useStaff();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [isAssignmentManagerOpen, setIsAssignmentManagerOpen] =
        useState(false);

    const [actionResult, setActionResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        staffId: string;
        staffName: string;
    }>({
        isOpen: false,
        staffId: "",
        staffName: "",
    });

    const handleAddStaff = () => {
        setCurrentStaff(null);
        setModalMode("add");
        setIsModalOpen(true);
    };

    const handleEditStaff = (staff: Staff) => {
        setCurrentStaff(staff);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = (id: string, name: string) => {
        setConfirmDialog({
            isOpen: true,
            staffId: id,
            staffName: name,
        });
    };

    const handleDeleteStaff = async () => {
        try {
            await removeStaff(confirmDialog.staffId);

            setActionResult({
                success: true,
                message: `Staff member "${confirmDialog.staffName}" has been removed successfully`,
            });

            // Close the confirm dialog
            setConfirmDialog({
                isOpen: false,
                staffId: "",
                staffName: "",
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setActionResult({
                success: false,
                message: "Failed to remove staff member",
            });

            // Close the confirm dialog
            setConfirmDialog({
                isOpen: false,
                staffId: "",
                staffName: "",
            });
        }
    };

    const handleSaveStaff = async (staff: Staff) => {
        try {
            if (modalMode === "add") {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, createdAt, updatedAt, ...newStaff } = staff;
                await addNewStaff(newStaff);

                setActionResult({
                    success: true,
                    message: `Staff member "${staff.name}" added successfully`,
                });
            } else {
                await updateExistingStaff(staff.id, staff);

                setActionResult({
                    success: true,
                    message: `Staff member "${staff.name}" updated successfully`,
                });
            }
            setIsModalOpen(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setActionResult({
                success: false,
                message: `Failed to ${modalMode === "add" ? "add" : "update"} staff member`,
            });
        }
    };

    const handleManageAssignments = (staff: Staff) => {
        setCurrentStaff(staff);
        setIsAssignmentManagerOpen(true);
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
                    <h3 className="title is-4 mb-4">Staff Management</h3>
                    <p className="subtitle is-6 mb-5">Manage pharmacy staff</p>

                    <div className="buttons mb-4">
                        <button
                            className="button is-primary"
                            onClick={handleAddStaff}
                        >
                            <span className="icon">
                                <i className="fas fa-user-plus"></i>
                            </span>
                            <span>Add Staff Member</span>
                        </button>
                    </div>

                    <StaffFilter filter={filter} setFilter={setFilter} />
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

                {/* Main content area */}
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="notification is-danger">
                        <button className="delete" onClick={() => {}}></button>
                        {error}
                    </div>
                ) : (
                    <div className="box">
                        <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
                            <h3 className="title is-4 mb-0">Staff Directory</h3>
                            <span className="tag is-info is-medium">
                                {staff.length} staff members
                            </span>
                        </div>

                        {staff.length === 0 ? (
                            <div className="notification is-info">
                                No staff members found. Try adjusting your
                                filters or add a new staff member.
                            </div>
                        ) : (
                            <StaffList
                                staff={staff}
                                onEdit={handleEditStaff}
                                onDelete={handleDeleteConfirm}
                                onManageAssignments={handleManageAssignments}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Staff Modal */}
            <StaffModal
                isOpen={isModalOpen}
                mode={modalMode}
                staff={currentStaff}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveStaff}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Remove Staff Member"
                message={`Are you sure you want to remove "${confirmDialog.staffName}" from the system? This will deactivate their account.`}
                confirmText="Remove Staff"
                cancelText="Cancel"
                onConfirm={handleDeleteStaff}
                onCancel={() =>
                    setConfirmDialog({
                        isOpen: false,
                        staffId: "",
                        staffName: "",
                    })
                }
                confirmButtonClass="is-danger"
            />
            {isAssignmentManagerOpen && currentStaff && (
                <div className="modal is-active">
                    <div
                        className="modal-background"
                        onClick={() => setIsAssignmentManagerOpen(false)}
                    ></div>
                    <div className="modal-content" style={{ width: "80%" }}>
                        <StaffAssignmentManager
                            staffId={currentStaff.id}
                            staffName={currentStaff.name}
                            onClose={() => setIsAssignmentManagerOpen(false)}
                        />
                    </div>
                    <button
                        className="modal-close is-large"
                        aria-label="close"
                        onClick={() => setIsAssignmentManagerOpen(false)}
                    ></button>
                </div>
            )}
        </div>
    );
}
