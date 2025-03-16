// src/app/admin/components/DepartmentManagement.tsx
"use client";

import { useState } from "react";
import { Department, useDepartments } from "@/context/DepartmentContext";
import DepartmentFilter from "./departments/DepartmentFilter";
import DepartmentCard from "./departments/DepartmentCard";
import DepartmentModal from "./departments/DepartmentModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function DepartmentManagement() {
    const {
        departments,
        departmentHierarchy,
        loading,
        error,
        filter,
        setFilter,
        addNewDepartment,
        updateExistingDepartment,
        removeDepartment,
        getDepartmentChildren,
    } = useDepartments();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDepartment, setCurrentDepartment] =
        useState<Department | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [currentParent, setCurrentParent] = useState<Department | null>(null);

    const [actionResult, setActionResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        departmentId: string;
        departmentName: string;
    }>({
        isOpen: false,
        departmentId: "",
        departmentName: "",
    });

    // For the subdepartments view
    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);
    const [subDepartments, setSubDepartments] = useState<Department[]>([]);
    const [loadingSubDepartments, setLoadingSubDepartments] = useState(false);

    const handleAddDepartment = (parentDept: Department | null = null) => {
        setCurrentDepartment(null);
        setCurrentParent(parentDept);
        setModalMode("add");
        setIsModalOpen(true);
    };

    const handleEditDepartment = (department: Department) => {
        setCurrentDepartment(department);
        setCurrentParent(null);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = (id: string, name: string) => {
        setConfirmDialog({
            isOpen: true,
            departmentId: id,
            departmentName: name,
        });
    };

    const handleDeleteDepartment = async () => {
        try {
            await removeDepartment(confirmDialog.departmentId);

            setActionResult({
                success: true,
                message: `Department "${confirmDialog.departmentName}" deleted successfully`,
            });

            // Reset the selected department if it was just deleted
            if (
                selectedDepartment &&
                selectedDepartment.id === confirmDialog.departmentId
            ) {
                setSelectedDepartment(null);
                setSubDepartments([]);
            }

            // Close the confirm dialog
            setConfirmDialog({
                isOpen: false,
                departmentId: "",
                departmentName: "",
            });
        } catch (err: any) {
            setActionResult({
                success: false,
                message: err.message || "Failed to delete department",
            });

            // Close the confirm dialog
            setConfirmDialog({
                isOpen: false,
                departmentId: "",
                departmentName: "",
            });
        }
    };

    const handleSaveDepartment = async (department: Department) => {
        try {
            if (modalMode === "add") {
                const { id, children, createdAt, updatedAt, ...newDepartment } =
                    department;
                await addNewDepartment(newDepartment);

                setActionResult({
                    success: true,
                    message: `Department "${department.name}" added successfully`,
                });

                // If we've added a subdepartment, refresh the subdepartments list
                if (
                    selectedDepartment &&
                    department.parent?.id === selectedDepartment.id
                ) {
                    handleViewSubDepartments(selectedDepartment);
                }
            } else {
                const { children, ...updateData } = department;
                await updateExistingDepartment(department.id, updateData);

                setActionResult({
                    success: true,
                    message: `Department "${department.name}" updated successfully`,
                });

                // If we've updated a department in the subdepartments view, refresh the list
                if (
                    selectedDepartment &&
                    (department.id === selectedDepartment.id ||
                        subDepartments.some((sd) => sd.id === department.id))
                ) {
                    handleViewSubDepartments(selectedDepartment);
                }
            }
            setIsModalOpen(false);
        } catch (err) {
            setActionResult({
                success: false,
                message: `Failed to ${modalMode === "add" ? "add" : "update"} department`,
            });
        }
    };

    // Handle viewing subdepartments
    const handleViewSubDepartments = async (department: Department) => {
        setSelectedDepartment(department);
        setLoadingSubDepartments(true);

        try {
            const children = await getDepartmentChildren(department.id);
            setSubDepartments(children);
        } catch (err) {
            console.error("Error fetching subdepartments:", err);
            setActionResult({
                success: false,
                message: "Failed to load subdepartments",
            });
        } finally {
            setLoadingSubDepartments(false);
        }
    };

    // Handle going back to all departments
    const handleBackToAllDepartments = () => {
        setSelectedDepartment(null);
        setSubDepartments([]);
    };

    // Clear action result after 5 seconds
    if (actionResult) {
        setTimeout(() => {
            setActionResult(null);
        }, 5000);
    }

    // Determine which departments to display
    const departmentsToDisplay = selectedDepartment
        ? subDepartments
        : departments;

    return (
        <div className="columns">
            <div className="column is-3">
                <div className="box">
                    <h3 className="title is-4 mb-4">Departments</h3>
                    <p className="subtitle is-6 mb-5">
                        Manage hospital departments
                    </p>

                    {selectedDepartment ? (
                        <div>
                            <div className="notification is-primary is-light mb-4">
                                <p className="is-size-6 mb-2">
                                    <strong>Selected Department:</strong>
                                </p>
                                <p className="is-size-5 has-text-weight-bold">
                                    {selectedDepartment.name}
                                </p>
                                <p className="is-size-7 mt-2">
                                    {selectedDepartment.description}
                                </p>
                            </div>

                            <div className="buttons">
                                <button
                                    className="button is-info is-outlined mb-4"
                                    onClick={handleBackToAllDepartments}
                                >
                                    <span className="icon">
                                        <i className="fas fa-arrow-left"></i>
                                    </span>
                                    <span>Back to All Departments</span>
                                </button>

                                <button
                                    className="button is-primary"
                                    onClick={() =>
                                        handleAddDepartment(selectedDepartment)
                                    }
                                >
                                    <span className="icon">
                                        <i className="fas fa-plus"></i>
                                    </span>
                                    <span>Add Subdepartment</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="buttons mb-4">
                            <button
                                className="button is-primary"
                                onClick={() => handleAddDepartment()}
                            >
                                <span className="icon">
                                    <i className="fas fa-plus"></i>
                                </span>
                                <span>Add Department</span>
                            </button>
                        </div>
                    )}

                    {!selectedDepartment && (
                        <DepartmentFilter
                            filter={filter}
                            setFilter={setFilter}
                        />
                    )}
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
                {loading || loadingSubDepartments ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="notification is-danger">
                        <button className="delete" onClick={() => {}}></button>
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Header if viewing subdepartments */}
                        {selectedDepartment && (
                            <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
                                <h3 className="title is-4">
                                    Subdepartments of {selectedDepartment.name}
                                </h3>
                                <span className="tag is-info is-medium">
                                    {subDepartments.length} subdepartments
                                </span>
                            </div>
                        )}

                        {/* Department listing */}
                        <div className="columns is-multiline">
                            {departmentsToDisplay.length === 0 ? (
                                <div className="column is-12">
                                    <div className="notification is-info">
                                        {selectedDepartment
                                            ? "No subdepartments found. Add a subdepartment to get started."
                                            : "No departments found. Try adjusting your filters or add a new department."}
                                    </div>
                                </div>
                            ) : (
                                departmentsToDisplay.map((department) => (
                                    <div
                                        className="column is-4"
                                        key={department.id}
                                    >
                                        <DepartmentCard
                                            department={department}
                                            onEdit={() =>
                                                handleEditDepartment(department)
                                            }
                                            onDelete={() =>
                                                handleDeleteConfirm(
                                                    department.id,
                                                    department.name,
                                                )
                                            }
                                            onViewChildren={
                                                !selectedDepartment
                                                    ? () =>
                                                          handleViewSubDepartments(
                                                              department,
                                                          )
                                                    : undefined
                                            }
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Department Modal */}
            <DepartmentModal
                isOpen={isModalOpen}
                mode={modalMode}
                department={currentDepartment}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDepartment}
                parentDepartment={currentParent}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Delete Department"
                message={`Are you sure you want to delete "${confirmDialog.departmentName}"? This action cannot be undone.`}
                confirmText="Delete Department"
                cancelText="Cancel"
                onConfirm={handleDeleteDepartment}
                onCancel={() =>
                    setConfirmDialog({
                        isOpen: false,
                        departmentId: "",
                        departmentName: "",
                    })
                }
                confirmButtonClass="is-danger"
            />
        </div>
    );
}
