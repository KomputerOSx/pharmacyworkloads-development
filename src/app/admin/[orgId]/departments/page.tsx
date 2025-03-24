// "use client";
//
// import React, { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import {
//     Department,
//     DepartmentProvider,
//     useDepartments,
// } from "@/context/DepartmentContext";
// import LoadingSpinner from "@/components/common/LoadingSpinner";
// import AlertMessage from "@/components/common/AlertMessage";
// import { getOrganisation } from "@/services/organisationService";
// import { Organisation } from "@/context/OrganisationContext";
// import { useHospitals } from "@/context/HospitalContext";
//
// // This will be created separately
// import DepartmentCard from "@/app/admin/components/departments/DepartmentCard";
// import DepartmentModal from "@/app/admin/components/departments/DepartmentModal";
// import DepartmentDeleteModal from "@/app/admin/components/departments/DepartmentDeleteModal";
//
// // Main component that will be wrapped with the provider
// function DepartmentsList() {
//     const {
//         departments,
//         loading,
//         error,
//         addNewDepartment,
//         updateExistingDepartment,
//         removeDepartment,
//         filter,
//         setFilter,
//     } = useDepartments();
//
//     // Get hospitals from the HospitalContext
//     const { hospitals: availableHospitals } = useHospitals();
//
//     const params = useParams();
//     const orgId = params.orgId as string;
//
//     const [organisation, setOrganisation] = useState<Organisation | null>(null);
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
//     // Set the organization ID in the filter when it changes
//     useEffect(() => {
//         setFilter({
//             ...filter,
//             hospital: orgId, // Use the organization ID directly
//         });
//     }, [orgId, setFilter]);
//
//     const handleAddDepartment = () => {
//         setCurrentDepartment(null);
//         setModalMode("add");
//         // Default to first hospital if available
//         setSelectedHospitalId(
//             availableHospitals.length > 0 ? availableHospitals[0].id : "",
//         );
//         setIsModalOpen(true);
//     };
//
//     const handleEditDepartment = (department: Department) => {
//         setCurrentDepartment(department);
//         setModalMode("edit");
//
//         // Set the selected hospital ID based on the department's current hospital
//         if (department.hospitalId) {
//             setSelectedHospitalId(department.hospitalId);
//         }
//
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
//             console.error(err);
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
//                 // eslint-disable-next-line @typescript-eslint/no-unused-vars
//                 const { id, createdAt, updatedAt, children, ...newDepartment } =
//                     department;
//
//                 await addNewDepartment(newDepartment, selectedHospitalId);
//
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
//         } catch (err) {
//             setActionResult({
//                 success: false,
//                 message: `Failed to ${modalMode === "add" ? "add" : "update"} department: ${err instanceof Error ? err.message : "Unknown error"}`,
//             });
//             console.error(err);
//         }
//     };
//
//     useEffect(() => {
//         const fetchOrganisation = async () => {
//             try {
//                 const org = await getOrganisation(orgId);
//                 setOrganisation(org);
//             } catch (err) {
//                 console.error(err);
//             }
//         };
//         fetchOrganisation();
//     }, [orgId]);
//
//     // Clear action result after 5 seconds
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
//             {/* No hospitals warning */}
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
//             {/* Action result message */}
//             {actionResult && (
//                 <AlertMessage
//                     type={actionResult.success ? "success" : "danger"}
//                     message={actionResult.message}
//                     onClose={() => setActionResult(null)}
//                 />
//             )}
//
//             {/* Error display */}
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
//                                 onEdit={() => handleEditDepartment(department)}
//                                 onDelete={() =>
//                                     handleDeleteDepartment(department)
//                                 }
//                                 onViewDetails={`/admin/${orgId}/departments/${department.id}`}
//                             />
//                         </div>
//                     ))
//                 )}
//             </div>
//
//             {/* Department Modal */}
//             <DepartmentModal
//                 isOpen={isModalOpen}
//                 mode={modalMode}
//                 department={currentDepartment}
//                 organisationName={organisation?.name}
//                 availableHospitals={availableHospitals}
//                 selectedHospitalId={selectedHospitalId}
//                 onHospitalChange={setSelectedHospitalId}
//                 onClose={() => setIsModalOpen(false)}
//                 onSave={handleSaveDepartment}
//             />
//
//             {/* Department Delete Modal */}
//             <DepartmentDeleteModal
//                 isOpen={isDeleteModalOpen}
//                 department={currentDepartment}
//                 organisationName={organisation?.name}
//                 onClose={() => setIsDeleteModalOpen(false)}
//                 onDelete={handleConfirmDelete}
//             />
//         </div>
//     );
// }
//
// // Page component with provider wrapper
// export default function DepartmentsPage() {
//     const params = useParams();
//     const orgId = params.orgId as string;
//
//     return (
//         <DepartmentProvider organisationId={orgId}>
//             <DepartmentsList />
//         </DepartmentProvider>
//     );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Department,
    DepartmentProvider,
    useDepartments,
} from "@/context/DepartmentContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";
import { getOrganisation } from "@/services/organisationService";
import { Organisation } from "@/context/OrganisationContext";
import { useHospitals } from "@/context/HospitalContext";

// This will be created separately
import DepartmentCard from "@/app/admin/components/departments/DepartmentCard";
import DepartmentModal from "@/app/admin/components/departments/DepartmentModal";
import DepartmentDeleteModal from "@/app/admin/components/departments/DepartmentDeleteModal";

// Main component that will be wrapped with the provider
function DepartmentsList() {
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

    // Get hospitals from the HospitalContext
    const { hospitals: availableHospitals } = useHospitals();

    const params = useParams();
    const orgId = params.orgId as string;

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
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

    // Add debugging for departments
    useEffect(() => {
        console.log("Current departments:", departments);

        // Check if departments array exists and has items
        if (!departments || departments.length === 0) {
            console.warn("No departments found in state");
        } else {
            console.log(`Found ${departments.length} departments in state`);

            // Log first department structure for debugging
            console.log("Sample department structure:", departments[0]);

            // Check for parent field structure
            const parentTypes = departments.map((dept) =>
                dept.parent ? typeof dept.parent : "undefined/null",
            );
            console.log("Parent field types:", [...new Set(parentTypes)]);

            // Count departments without parent
            const rootDeptCount = departments.filter(
                (dept) => !dept.parent,
            ).length;
            console.log(
                `Found ${rootDeptCount} root departments (without parent)`,
            );
        }
    }, [departments]);

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

    // Only get root departments (no parent)
    const rootDepartments = departments.filter((dept) => !dept.parent);

    // Log root departments for debugging
    console.log("Filtered root departments:", rootDepartments);

    // Set the organization ID in the filter when it changes
    useEffect(() => {
        console.log("Setting filter with orgId:", orgId);
        setFilter({
            ...filter,
            hospital: orgId, // Use the organization ID directly
        });
    }, [orgId]);

    const handleAddDepartment = () => {
        setCurrentDepartment(null);
        setModalMode("add");
        // Default to first hospital if available
        setSelectedHospitalId(
            availableHospitals.length > 0 ? availableHospitals[0].id : "",
        );
        setIsModalOpen(true);
    };

    const handleEditDepartment = (department: Department) => {
        setCurrentDepartment(department);
        setModalMode("edit");

        // Set the selected hospital ID based on the department's current hospital
        if (department.hospitalId) {
            setSelectedHospitalId(department.hospitalId);
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, createdAt, updatedAt, children, ...newDepartment } =
                    department;

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
                message: `Failed to ${modalMode === "add" ? "add" : "update"} department: ${err instanceof Error ? err.message : "Unknown error"}`,
            });
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
        fetchOrganisation();
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
                                onEdit={() => handleEditDepartment(department)}
                                onDelete={() =>
                                    handleDeleteDepartment(department)
                                }
                                onViewDetails={`/admin/${orgId}/departments/${department.id}`}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Department Modal */}
            <DepartmentModal
                isOpen={isModalOpen}
                mode={modalMode}
                department={currentDepartment}
                organisationName={organisation?.name}
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
                organisationName={organisation?.name}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleConfirmDelete}
            />
        </div>
    );
}

// Page component with provider wrapper
export default function DepartmentsPage() {
    const params = useParams();
    const orgId = params.orgId as string;

    return (
        <DepartmentProvider organisationId={orgId}>
            <DepartmentsList />
        </DepartmentProvider>
    );
}
