// "use client";
//
// import React, { useEffect, useState, useRef } from "react";
// import { Department, useDepartments } from "@/context/DepartmentContext";
// import { Hospital } from "@/context/HospitalContext";
// import DepartmentCard from "@/app/admin/components/departments/DepartmentCard";
// import DepartmentModal from "@/app/admin/components/departments/DepartmentModal";
// import DepartmentDeleteModal from "@/app/admin/components/departments/DepartmentDeleteModal";
// import LoadingSpinner from "@/components/common/LoadingSpinner";
// import AlertMessage from "@/components/common/AlertMessage";
//
// interface DepartmentListProps {
//     organisationId: string;
//     organisationName?: string;
//     availableHospitals: Hospital[];
// }
//
// const DepartmentList: React.FC<DepartmentListProps> = ({
//     organisationId,
//     organisationName,
//     availableHospitals,
// }) => {
//     const {
//         departments,
//         loading,
//         error,
//         addNewDepartment,
//         updateExistingDepartment,
//         removeDepartment,
//         filter,
//         setFilter,
//         refreshDepartments,
//     } = useDepartments();
//
//     // UI state
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//     const [currentDepartment, setCurrentDepartment] =
//         useState<Department | null>(null);
//     const [modalMode, setModalMode] = useState<"add" | "edit">("add");
//     const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
//     const [actionResult, setActionResult] = useState<{
//         success: boolean;
//         message: string;
//     } | null>(null);
//
//     // Only get root departments (no parent)
//     const rootDepartments = departments.filter((dept) => !dept.parent);
//
//     // Debug logging
//     console.log(
//         "Render count - departments:",
//         departments.length,
//         "rootDepartments:",
//         rootDepartments.length,
//     );
//
//     // Track if initial load has happened
//     const initialLoadDone = useRef(false);
//     const isProcessing = useRef(false);
//
//     // Set initial filter once
//     useEffect(() => {
//         if (!initialLoadDone.current) {
//             console.log("Setting initial organization filter");
//             setFilter((prevFilter) => ({
//                 ...prevFilter,
//                 hospital: organisationId,
//             }));
//             initialLoadDone.current = true;
//
//             // Initial data load - ONLY ONCE
//             console.log("Initial departments refresh");
//             refreshDepartments();
//         }
//     }, [organisationId, setFilter, refreshDepartments]);
//
//     // Handle hospital filter change
//     const handleHospitalFilterChange = (
//         e: React.ChangeEvent<HTMLSelectElement>,
//     ) => {
//         const value = e.target.value;
//         console.log("Hospital filter changed to:", value);
//
//         setFilter((prevFilter) => ({
//             ...prevFilter,
//             hospital: value === "all" ? organisationId : value,
//         }));
//     };
//
//     // Basic CRUD handlers
//     const handleAddDepartment = () => {
//         setCurrentDepartment(null);
//         setModalMode("add");
//         setSelectedHospitalId(
//             availableHospitals.length > 0
//                 ? String(availableHospitals[0].id)
//                 : "",
//         );
//         setIsModalOpen(true);
//     };
//
//     const handleEditDepartment = (department: Department) => {
//         setCurrentDepartment(department);
//         setModalMode("edit");
//         setSelectedHospitalId(
//             department.hospital?.id || department.hospitalId || "",
//         );
//         setIsModalOpen(true);
//     };
//
//     const handleDeleteDepartment = (department: Department) => {
//         setCurrentDepartment(department);
//         setIsDeleteModalOpen(true);
//     };
//
//     const handleConfirmDelete = async (department: Department) => {
//         try {
//             await removeDepartment(department.id);
//             setActionResult({
//                 success: true,
//                 message: "Department deleted successfully",
//             });
//             setIsDeleteModalOpen(false);
//         } catch (err) {
//             setActionResult({
//                 success: false,
//                 message: "Failed to delete department",
//             });
//             throw err;
//         }
//     };
//
//     const handleSaveDepartment = async (department: Department) => {
//         try {
//             if (!selectedHospitalId) {
//                 throw new Error("Please select a hospital for this department");
//             }
//
//             if (modalMode === "add") {
//                 const {
//                     id,
//                     createdAt,
//                     updatedAt,
//                     children,
//                     hospital,
//                     ...newDepartment
//                 } = department;
//                 await addNewDepartment(newDepartment, selectedHospitalId);
//                 setActionResult({
//                     success: true,
//                     message: "Department added successfully",
//                 });
//             } else {
//                 await updateExistingDepartment(
//                     department.id,
//                     selectedHospitalId,
//                     department,
//                 );
//                 setActionResult({
//                     success: true,
//                     message: "Department updated successfully",
//                 });
//             }
//             setIsModalOpen(false);
//
//             // Manual refresh after save
//             console.log("Manual refresh after save");
//             setTimeout(() => refreshDepartments(), 500);
//         } catch (err) {
//             setActionResult({
//                 success: false,
//                 message: `Failed to ${modalMode === "add" ? "add" : "update"} department: ${
//                     err instanceof Error ? err.message : "Unknown error"
//                 }`,
//             });
//         }
//     };
//
//     // Clear action result after timeout
//     useEffect(() => {
//         if (actionResult) {
//             const timer = setTimeout(() => {
//                 setActionResult(null);
//             }, 5000);
//             return () => clearTimeout(timer);
//         }
//     }, [actionResult]);
//
//     if (loading) return <LoadingSpinner />;
//
//     return (
//         <div className="container py-6">
//             {/* Header and action buttons */}
//             <div className="level mb-3">
//                 <div className="level-left">
//                     <div className="level-item">
//                         <h1 className="title is-3">Departments</h1>
//                     </div>
//                 </div>
//                 <div className="level-right">
//                     <div className="level-item">
//                         <button
//                             className="button is-primary"
//                             onClick={handleAddDepartment}
//                             disabled={availableHospitals.length === 0}
//                         >
//                             <span className="icon">
//                                 <i className="fas fa-plus"></i>
//                             </span>
//                             <span>Add Department</span>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//
//             {/* Hospital Filter */}
//             <div className="field mb-4">
//                 <label className="label">Filter by Hospital</label>
//                 <div className="control">
//                     <div className="select">
//                         <select
//                             value={
//                                 filter.hospital === organisationId
//                                     ? "all"
//                                     : filter.hospital
//                             }
//                             onChange={handleHospitalFilterChange}
//                         >
//                             <option value="all">All Hospitals</option>
//                             {availableHospitals.map((hospital) => (
//                                 <option key={hospital.id} value={hospital.id}>
//                                     {hospital.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//             </div>
//
//             {/* Warnings and notifications */}
//             {availableHospitals.length === 0 && (
//                 <div className="notification is-warning">
//                     <span className="icon">
//                         <i className="fas fa-exclamation-triangle"></i>
//                     </span>
//                     <span>
//                         You need to add at least one hospital before you can
//                         create departments.
//                     </span>
//                 </div>
//             )}
//
//             {actionResult && (
//                 <AlertMessage
//                     type={actionResult.success ? "success" : "danger"}
//                     message={actionResult.message}
//                     onClose={() => setActionResult(null)}
//                 />
//             )}
//
//             {error && (
//                 <div className="notification is-danger">
//                     <button className="delete" onClick={() => {}}></button>
//                     {error}
//                 </div>
//             )}
//
//             {/* Departments grid */}
//             <div className="columns is-multiline">
//                 {rootDepartments.length === 0 ? (
//                     <div className="column is-12">
//                         <div className="notification is-info">
//                             No departments found. Click &#34;Add Department&#34;
//                             to create one.
//                         </div>
//                     </div>
//                 ) : (
//                     rootDepartments.map((department) => (
//                         <div key={department.id} className="column is-4">
//                             <DepartmentCard
//                                 department={department}
//                                 hospitalName={
//                                     department.hospital?.name ||
//                                     "Unknown Hospital"
//                                 }
//                                 onEdit={() => handleEditDepartment(department)}
//                                 onDelete={() =>
//                                     handleDeleteDepartment(department)
//                                 }
//                                 onViewDetails={`/admin/${organisationId}/departments/${department.id}`}
//                             />
//                         </div>
//                     ))
//                 )}
//             </div>
//
//             {/* Modals */}
//             <DepartmentModal
//                 isOpen={isModalOpen}
//                 mode={modalMode}
//                 department={currentDepartment}
//                 organisationName={organisationName}
//                 availableHospitals={availableHospitals}
//                 selectedHospitalId={selectedHospitalId}
//                 onHospitalChange={setSelectedHospitalId}
//                 onClose={() => setIsModalOpen(false)}
//                 onSave={handleSaveDepartment}
//             />
//
//             <DepartmentDeleteModal
//                 isOpen={isDeleteModalOpen}
//                 department={currentDepartment}
//                 organisationName={organisationName}
//                 onClose={() => setIsDeleteModalOpen(false)}
//                 onDelete={handleConfirmDelete}
//             />
//         </div>
//     );
// };
//
// export default DepartmentList;
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Department, useDepartments } from "@/context/DepartmentContext";
import { Hospital } from "@/context/HospitalContext";
import DepartmentCard from "@/app/admin/components/departments/DepartmentCard";
import DepartmentModal from "@/app/admin/components/departments/DepartmentModal";
import DepartmentDeleteModal from "@/app/admin/components/departments/DepartmentDeleteModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";

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

    // UI state
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

    // Only get root departments (no parent)
    const rootDepartments = departments.filter((dept) => !dept.parent);

    // Track if initial load has happened
    const initialLoadDone = useRef(false);

    // Set initial filter once
    useEffect(() => {
        if (!initialLoadDone.current) {
            console.log("Setting initial organization filter");
            setFilter((prevFilter) => ({
                ...prevFilter,
                hospital: organisationId,
            }));

            // Initial data load - ONLY ONCE
            console.log("Initial departments refresh");
            refreshDepartments();

            initialLoadDone.current = true;
        }
    }, [organisationId, setFilter, refreshDepartments]);

    // Handle hospital filter change
    const handleHospitalFilterChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = e.target.value;
        console.log("Hospital filter changed to:", value);

        setFilter((prevFilter) => ({
            ...prevFilter,
            hospital: value === "all" ? organisationId : value,
        }));
    };

    // Basic CRUD handlers
    const handleAddDepartment = () => {
        setCurrentDepartment(null);
        setModalMode("add");
        setSelectedHospitalId(
            availableHospitals.length > 0
                ? String(availableHospitals[0].id)
                : "",
        );
        setIsModalOpen(true);
    };

    const handleEditDepartment = (department: Department) => {
        setCurrentDepartment(department);
        setModalMode("edit");
        setSelectedHospitalId(
            department.hospital?.id || department.hospitalId || "",
        );
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

            // Manual refresh after a short delay
            setTimeout(() => {
                initialLoadDone.current = false; // Allow refresh to run again
                refreshDepartments();
            }, 500);
        } catch (err) {
            setActionResult({
                success: false,
                message: "Failed to delete department",
            });
            throw err;
        }
    };

    const handleSaveDepartment = async (department: Department) => {
        try {
            if (!selectedHospitalId) {
                throw new Error("Please select a hospital for this department");
            }

            if (modalMode === "add") {
                const {
                    id,
                    createdAt,
                    updatedAt,
                    children,
                    hospital,
                    ...newDepartment
                } = department;
                await addNewDepartment(newDepartment, selectedHospitalId);
                setActionResult({
                    success: true,
                    message: "Department added successfully",
                });
            } else {
                await updateExistingDepartment(
                    department.id,
                    selectedHospitalId,
                    department,
                );
                setActionResult({
                    success: true,
                    message: "Department updated successfully",
                });
            }
            setIsModalOpen(false);

            // Manual refresh after a short delay
            setTimeout(() => {
                initialLoadDone.current = false; // Allow refresh to run again
                refreshDepartments();
            }, 500);
        } catch (err) {
            setActionResult({
                success: false,
                message: `Failed to ${modalMode === "add" ? "add" : "update"} department: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`,
            });
        }
    };

    // Clear action result after timeout
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
            {/* Header and action buttons */}
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
                            onChange={handleHospitalFilterChange}
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

            {/* Warnings and notifications */}
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

            {actionResult && (
                <AlertMessage
                    type={actionResult.success ? "success" : "danger"}
                    message={actionResult.message}
                    onClose={() => setActionResult(null)}
                />
            )}

            {error && (
                <div className="notification is-danger">
                    <button className="delete" onClick={() => {}}></button>
                    {error}
                </div>
            )}

            {/* Departments grid */}
            <div className="columns is-multiline">
                {rootDepartments.length === 0 ? (
                    <div className="column is-12">
                        <div className="notification is-info">
                            No departments found. Click &#34;Add Department&#34;
                            to create one.
                        </div>
                    </div>
                ) : (
                    rootDepartments.map((department) => (
                        <div key={department.id} className="column is-4">
                            <DepartmentCard
                                department={department}
                                hospitalName={
                                    department.hospital?.name ||
                                    (department.hospitalId
                                        ? "Hospital ID: " +
                                          department.hospitalId
                                        : "Unknown Hospital")
                                }
                                onEdit={() => handleEditDepartment(department)}
                                onDelete={() =>
                                    handleDeleteDepartment(department)
                                }
                                onViewDetails={`/admin/${organisationId}/departments/${department.id}`}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
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
