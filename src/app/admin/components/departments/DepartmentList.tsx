"use client";

import React, { useEffect, useState } from "react";
import { Department, useDepartments } from "@/context/DepartmentContext";
import { Hospital } from "@/context/HospitalContext";
import DepartmentCard from "@/app/admin/components/departments/DepartmentCard";
import DepartmentModal from "@/app/admin/components/departments/DepartmentModal";
import DepartmentDeleteModal from "@/app/admin/components/departments/DepartmentDeleteModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";
import { enhanceDepartmentsWithHospitals } from "@/utils/departmentUtils";

interface DepartmentListProps {
    organisationId: string;
    organisationName?: string;
    availableHospitals: Hospital[];
}

const DepartmentList: React.FC<DepartmentListProps> = ({
    organisationId,
    organisationName,
    availableHospitals,
}) => {
    const {
        departments,
        loading,
        error,
        addNewDepartment,
        updateExistingDepartment,
        removeDepartment,
        filter,
        setFilter,
        refreshDepartments,
    } = useDepartments();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentDepartment, setCurrentDepartment] =
        useState<Department | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
    const [actionResult, setActionResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    // State for enhanced departments with hospital information
    const [enhancedDepartments, setEnhancedDepartments] = useState<
        Department[]
    >([]);

    // Only get root departments (no parent)
    const rootDepartments = departments.filter((dept) => !dept.parent);

    // Debug logging
    useEffect(() => {
        console.log("Current departments:", departments);

        // Check if departments array exists and has items
        if (!departments || departments.length === 0) {
            console.warn("No departments found in state");
        } else {
            console.log(`Found ${departments.length} departments in state`);

            // Log first department structure for debugging
            console.log("Sample department structure:", departments[0]);

            // Check for hospitalId field
            const hasHospitalId = departments.some(
                (dept) => dept.hospitalId !== undefined,
            );
            console.log("Any departments have hospitalId?", hasHospitalId);

            // Check for hospital object
            const hasHospital = departments.some(
                (dept) => dept.hospital !== undefined,
            );
            console.log("Any departments have hospital object?", hasHospital);

            // Count departments without parent
            const rootDeptCount = departments.filter(
                (dept) => !dept.parent,
            ).length;
            console.log(
                `Found ${rootDeptCount} root departments (without parent)`,
            );
        }
    }, [departments]);

    // Enhance departments with hospital information
    useEffect(() => {
        const enhanceDepartments = async () => {
            if (rootDepartments.length > 0 && availableHospitals.length > 0) {
                console.log(
                    "Enhancing departments with hospital information...",
                );
                const enhanced = await enhanceDepartmentsWithHospitals(
                    rootDepartments,
                    availableHospitals,
                );
                setEnhancedDepartments(enhanced);
                console.log("Departments enhanced:", enhanced);
            } else {
                setEnhancedDepartments(rootDepartments);
            }
        };

        enhanceDepartments();
    }, [rootDepartments, availableHospitals]);

    // Force a refresh when component mounts
    useEffect(() => {
        const forceRefresh = async () => {
            console.log("Manually triggering department refresh...");
            try {
                await refreshDepartments();
                console.log("Department refresh completed");
            } catch (err) {
                console.error("Error during manual refresh:", err);
            }
        };

        // Wait a bit to ensure context is fully initialized
        const timer = setTimeout(forceRefresh, 1000);
        return () => clearTimeout(timer);
    }, [refreshDepartments]);

    // Set the organization ID in the filter when it changes
    useEffect(() => {
        console.log("Setting filter with orgId:", organisationId);
        setFilter((prevFilter) => ({
            ...prevFilter,
            hospital: organisationId, // Use the organization ID directly
        }));
    }, [organisationId, setFilter]);

    const handleAddDepartment = () => {
        setCurrentDepartment(null);
        setModalMode("add");

        // Default to first hospital if available
        if (availableHospitals.length > 0) {
            // Convert to string in case it's stored as a number
            const firstHospitalId = String(availableHospitals[0].id);
            console.log(
                "Setting default hospital for new department:",
                firstHospitalId,
            );
            setSelectedHospitalId(firstHospitalId);
        } else {
            setSelectedHospitalId("");
        }

        setIsModalOpen(true);
    };

    const handleEditDepartment = (department: Department) => {
        console.log("Edit department:", department);
        setCurrentDepartment(department);
        setModalMode("edit");

        // First try to get hospitalId from the hospital object (preferred)
        if (department.hospital?.id) {
            console.log(
                "Using hospitalId from department.hospital:",
                department.hospital.id,
            );
            setSelectedHospitalId(String(department.hospital.id));
        }
        // Fall back to hospitalId property if present (legacy)
        else if (department.hospitalId) {
            console.log(
                "Using legacy hospitalId property:",
                department.hospitalId,
            );
            setSelectedHospitalId(String(department.hospitalId));
        }
        // Default to first hospital if no hospital info is available
        else {
            console.log(
                "Department has no hospital info, using first available",
            );
            if (availableHospitals.length > 0) {
                console.log(
                    "Defaulting to first hospital:",
                    availableHospitals[0].id,
                );
                setSelectedHospitalId(String(availableHospitals[0].id));
            } else {
                setSelectedHospitalId("");
            }
        }

        setIsModalOpen(true);
    };

    const handleDeleteDepartment = (department: Department) => {
        setCurrentDepartment(department);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (department: Department) => {
        try {
            await removeDepartment(department.id);
            setActionResult({
                success: true,
                message: "Department deleted successfully",
            });
            setIsDeleteModalOpen(false);
        } catch (err) {
            setActionResult({
                success: false,
                message: "Failed to delete department",
            });
            console.error(err);
        }
    };

    const handleSaveDepartment = async (department: Department) => {
        try {
            if (!selectedHospitalId) {
                throw new Error("Please select a hospital for this department");
            }

            if (modalMode === "add") {
                const {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    id,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    createdAt,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    updatedAt,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    children,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    hospital,
                    ...newDepartment
                } = department;

                console.log("Adding new department:", newDepartment);
                console.log("Selected hospital ID:", selectedHospitalId);

                const result = await addNewDepartment(
                    newDepartment,
                    selectedHospitalId,
                );
                console.log("Department add result:", result);

                setActionResult({
                    success: true,
                    message: "Department added successfully",
                });
            } else {
                console.log("Updating department:", department);
                console.log("Selected hospital ID:", selectedHospitalId);

                const result = await updateExistingDepartment(
                    department.id,
                    selectedHospitalId,
                    department,
                );
                console.log("Department update result:", result);

                setActionResult({
                    success: true,
                    message: "Department updated successfully",
                });
            }
            setIsModalOpen(false);

            // Force refresh departments after add/update
            console.log("Refreshing departments after add/update");
            await refreshDepartments();
        } catch (err) {
            console.error("Error saving department:", err);
            setActionResult({
                success: false,
                message: `Failed to ${modalMode === "add" ? "add" : "update"} department: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`,
            });
        }
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
            <div className="level mb-3">
                <div className="level-left">
                    <div className="level-item">
                        <h1 className="title is-3">Departments</h1>
                    </div>
                </div>
                <div className="level-right">
                    <div className="level-item">
                        <button
                            className="button is-primary"
                            onClick={handleAddDepartment}
                            disabled={availableHospitals.length === 0}
                        >
                            <span className="icon">
                                <i className="fas fa-plus"></i>
                            </span>
                            <span>Add Department</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Hospital Filter */}
            <div className="field mb-4">
                <label className="label">Filter by Hospital</label>
                <div className="control">
                    <div className="select">
                        <select
                            value={
                                filter.hospital === organisationId
                                    ? "all"
                                    : filter.hospital
                            }
                            onChange={(e) => {
                                const value = e.target.value;
                                setFilter({
                                    ...filter,
                                    hospital:
                                        value === "all"
                                            ? organisationId
                                            : value,
                                });
                            }}
                        >
                            <option value="all">All Hospitals</option>
                            {availableHospitals.map((hospital) => (
                                <option key={hospital.id} value={hospital.id}>
                                    {hospital.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* No hospitals warning */}
            {availableHospitals.length === 0 && (
                <div className="notification is-warning">
                    <span className="icon">
                        <i className="fas fa-exclamation-triangle"></i>
                    </span>
                    <span>
                        You need to add at least one hospital before you can
                        create departments.
                    </span>
                </div>
            )}

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

            {/* Departments grid */}
            <div className="columns is-multiline">
                {enhancedDepartments.length === 0 ? (
                    <div className="column is-12">
                        <div className="notification is-info">
                            No departments found. Click &#34;Add Department&#34;
                            to create one.
                        </div>
                    </div>
                ) : (
                    enhancedDepartments.map((department) => {
                        // Get hospital name from the department.hospital object if available
                        const hospitalName =
                            department.hospital?.name || "Unknown Hospital";

                        console.log(
                            `Rendering department: ${department.name}, hospital: ${hospitalName}`,
                        );

                        return (
                            <div key={department.id} className="column is-4">
                                <DepartmentCard
                                    department={department}
                                    hospitalName={hospitalName}
                                    onEdit={() =>
                                        handleEditDepartment(department)
                                    }
                                    onDelete={() =>
                                        handleDeleteDepartment(department)
                                    }
                                    onViewDetails={`/admin/${organisationId}/departments/${department.id}`}
                                />
                            </div>
                        );
                    })
                )}
            </div>

            {/* Department Modal */}
            <DepartmentModal
                isOpen={isModalOpen}
                mode={modalMode}
                department={currentDepartment}
                organisationName={organisationName}
                availableHospitals={availableHospitals}
                selectedHospitalId={selectedHospitalId}
                onHospitalChange={setSelectedHospitalId}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDepartment}
            />

            {/* Department Delete Modal */}
            <DepartmentDeleteModal
                isOpen={isDeleteModalOpen}
                department={currentDepartment}
                organisationName={organisationName}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleConfirmDelete}
            />
        </div>
    );
};

export default DepartmentList;
