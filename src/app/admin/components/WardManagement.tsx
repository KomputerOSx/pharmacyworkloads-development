// // src/app/admin/components/WardManagement.tsx
// "use client";
//
// import { useState } from "react";
// import { useWards, Ward } from "@/context/WardContext";
// import { Department, useDepartments } from "@/context/DepartmentContext";
// import WardFilter from "./wards/WardFilter";
// import WardCard from "./wards/WardCard";
// import WardModal from "./wards/WardModal";
// import WardDepartmentsModal from "./wards/WardDepartmentsModal"; // New import
// import LoadingSpinner from "@/components/common/LoadingSpinner";
// import AlertMessage from "@/components/common/AlertMessage";
// import ConfirmDialog from "@/components/common/ConfirmDialog";
//
// export default function WardManagement() {
//     const {
//         wards,
//         loading,
//         error,
//         filter,
//         setFilter,
//         addNewWard,
//         updateExistingWard,
//         removeWard,
//         getWardDepartments, // New function from context
//     } = useWards();
//
//     // We also use departments context to get the hierarchical department structure
//     const { departmentHierarchy } = useDepartments();
//
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [currentWard, setCurrentWard] = useState<Ward | null>(null);
//     const [modalMode, setModalMode] = useState<"add" | "edit">("add");
//     const [selectedDepartmentId, setSelectedDepartmentId] = useState<
//         string | undefined
//     >(undefined);
//
//     // New state for department management modal
//     const [isDepartmentsModalOpen, setIsDepartmentsModalOpen] = useState(false);
//     const [wardForDepartments, setWardForDepartments] = useState<Ward | null>(
//         null,
//     );
//
//     const [actionResult, setActionResult] = useState<{
//         success: boolean;
//         message: string;
//     } | null>(null);
//
//     const [confirmDialog, setConfirmDialog] = useState<{
//         isOpen: boolean;
//         wardId: string;
//         wardName: string;
//     }>({
//         isOpen: false,
//         wardId: "",
//         wardName: "",
//     });
//
//     // For the department selector
//     const [isDepartmentSelectorOpen, setIsDepartmentSelectorOpen] =
//         useState(false);
//
//     const handleAddWard = (departmentId?: string) => {
//         setCurrentWard(null);
//         setSelectedDepartmentId(departmentId);
//         setModalMode("add");
//         setIsModalOpen(true);
//         setIsDepartmentSelectorOpen(false);
//     };
//
//     const handleEditWard = (ward: Ward) => {
//         setCurrentWard(ward);
//         setSelectedDepartmentId(undefined);
//         setModalMode("edit");
//         setIsModalOpen(true);
//     };
//
//     // New handler for managing departments
//     const handleManageDepartments = async (ward: Ward) => {
//         // Load the ward's department assignments
//         try {
//             await getWardDepartments(ward.id);
//             setWardForDepartments(ward);
//             setIsDepartmentsModalOpen(true);
//         } catch (err) {
//             setActionResult({
//                 success: false,
//                 message: "Failed to load department assignments",
//             });
//         }
//     };
//
//     const handleDeleteConfirm = (id: string, name: string) => {
//         setConfirmDialog({
//             isOpen: true,
//             wardId: id,
//             wardName: name,
//         });
//     };
//
//     const handleDeleteWard = async () => {
//         try {
//             await removeWard(confirmDialog.wardId);
//
//             setActionResult({
//                 success: true,
//                 message: `Ward "${confirmDialog.wardName}" deleted successfully`,
//             });
//
//             // Close the confirm dialog
//             setConfirmDialog({
//                 isOpen: false,
//                 wardId: "",
//                 wardName: "",
//             });
//         } catch (err: any) {
//             setActionResult({
//                 success: false,
//                 message: err.message || "Failed to delete ward",
//             });
//
//             // Close the confirm dialog
//             setConfirmDialog({
//                 isOpen: false,
//                 wardId: "",
//                 wardName: "",
//             });
//         }
//     };
//
//     const handleSaveWard = async (ward: Ward) => {
//         try {
//             if (modalMode === "add") {
//                 const { id, createdAt, updatedAt, ...newWard } = ward;
//                 await addNewWard(newWard);
//
//                 setActionResult({
//                     success: true,
//                     message: `Ward "${ward.name}" added successfully`,
//                 });
//             } else {
//                 await updateExistingWard(ward.id, ward);
//
//                 setActionResult({
//                     success: true,
//                     message: `Ward "${ward.name}" updated successfully`,
//                 });
//             }
//             setIsModalOpen(false);
//         } catch (err) {
//             setActionResult({
//                 success: false,
//                 message: `Failed to ${modalMode === "add" ? "add" : "update"} ward`,
//             });
//         }
//     };
//
//     // Toggle the department selector dropdown
//     const toggleDepartmentSelector = () => {
//         setIsDepartmentSelectorOpen(!isDepartmentSelectorOpen);
//     };
//
//     // Build a recursive component to render the department hierarchy
//     const renderDepartmentTree = (departments: Department[], level = 0) => {
//         if (!departments || departments.length === 0) return null;
//
//         return (
//             <ul
//                 className="menu-list"
//                 style={{ marginLeft: level > 0 ? "1rem" : "0" }}
//             >
//                 {departments.map((dept) => (
//                     <li key={dept.id}>
//                         <a
//                             onClick={() => handleAddWard(dept.id)}
//                             className="is-flex is-align-items-center"
//                         >
//                             <span
//                                 className="icon is-small mr-2"
//                                 style={{
//                                     color: dept.color || "#3273dc",
//                                     borderRadius: "50%",
//                                     width: "10px",
//                                     height: "10px",
//                                     display: "inline-block",
//                                     backgroundColor: dept.color || "#3273dc",
//                                 }}
//                             ></span>
//                             <span>{dept.name}</span>
//                         </a>
//                         {dept.children &&
//                             dept.children.length > 0 &&
//                             renderDepartmentTree(dept.children, level + 1)}
//                     </li>
//                 ))}
//             </ul>
//         );
//     };
//
//     // Clear action result after 5 seconds
//     if (actionResult) {
//         setTimeout(() => {
//             setActionResult(null);
//         }, 5000);
//     }
//
//     return (
//         <div className="columns">
//             <div className="column is-3">
//                 <div className="box">
//                     <h3 className="title is-4 mb-4">Wards</h3>
//                     <p className="subtitle is-6 mb-5">Manage hospital wards</p>
//
//                     <div className="buttons mb-4">
//                         <div
//                             className={`dropdown ${isDepartmentSelectorOpen ? "is-active" : ""}`}
//                         >
//                             <div className="dropdown-trigger">
//                                 <button
//                                     className="button is-primary"
//                                     aria-haspopup="true"
//                                     aria-controls="department-dropdown-menu"
//                                     onClick={toggleDepartmentSelector}
//                                 >
//                                     <span className="icon">
//                                         <i className="fas fa-plus"></i>
//                                     </span>
//                                     <span>Add Ward</span>
//                                     <span className="icon is-small">
//                                         <i
//                                             className="fas fa-angle-down"
//                                             aria-hidden="true"
//                                         ></i>
//                                     </span>
//                                 </button>
//                             </div>
//                             <div
//                                 className="dropdown-menu"
//                                 id="department-dropdown-menu"
//                                 role="menu"
//                             >
//                                 <div className="dropdown-content">
//                                     <div className="dropdown-item">
//                                         <p className="has-text-weight-bold mb-2">
//                                             Select Department
//                                         </p>
//                                         <p className="is-size-7 mb-3">
//                                             Choose which department to add a
//                                             ward to:
//                                         </p>
//                                         {renderDepartmentTree(
//                                             departmentHierarchy,
//                                         )}
//                                     </div>
//                                     <hr className="dropdown-divider" />
//                                     <a
//                                         className="dropdown-item"
//                                         onClick={() => handleAddWard()}
//                                     >
//                                         Add without department
//                                     </a>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//
//                     <WardFilter filter={filter} setFilter={setFilter} />
//                 </div>
//             </div>
//
//             <div className="column is-9">
//                 {/* Action result message */}
//                 {actionResult && (
//                     <AlertMessage
//                         type={actionResult.success ? "success" : "danger"}
//                         message={actionResult.message}
//                         onClose={() => setActionResult(null)}
//                     />
//                 )}
//
//                 {/* Main content area */}
//                 {loading ? (
//                     <LoadingSpinner />
//                 ) : error ? (
//                     <div className="notification is-danger">
//                         <button className="delete" onClick={() => {}}></button>
//                         {error}
//                     </div>
//                 ) : (
//                     <div className="columns is-multiline">
//                         {wards.length === 0 ? (
//                             <div className="column is-12">
//                                 <div className="notification is-info">
//                                     No wards found. Try adjusting your filters
//                                     or add a new ward.
//                                 </div>
//                             </div>
//                         ) : (
//                             wards.map((ward) => (
//                                 <div className="column is-4" key={ward.id}>
//                                     <WardCard
//                                         ward={ward}
//                                         onEdit={() => handleEditWard(ward)}
//                                         onDelete={() =>
//                                             handleDeleteConfirm(
//                                                 ward.id,
//                                                 ward.name,
//                                             )
//                                         }
//                                         onManageDepartments={() =>
//                                             handleManageDepartments(ward)
//                                         }
//                                     />
//                                 </div>
//                             ))
//                         )}
//                     </div>
//                 )}
//             </div>
//
//             {/* Ward Modal */}
//             <WardModal
//                 isOpen={isModalOpen}
//                 mode={modalMode}
//                 ward={currentWard}
//                 onClose={() => setIsModalOpen(false)}
//                 onSave={handleSaveWard}
//                 departmentId={selectedDepartmentId}
//             />
//
//             {/* New Ward Departments Modal */}
//             <WardDepartmentsModal
//                 isOpen={isDepartmentsModalOpen}
//                 ward={wardForDepartments}
//                 onClose={() => {
//                     setIsDepartmentsModalOpen(false);
//                     setWardForDepartments(null);
//                 }}
//             />
//
//             {/* Confirm Delete Dialog */}
//             <ConfirmDialog
//                 isOpen={confirmDialog.isOpen}
//                 title="Delete Ward"
//                 message={`Are you sure you want to delete "${confirmDialog.wardName}"? This action cannot be undone.`}
//                 confirmText="Delete Ward"
//                 cancelText="Cancel"
//                 onConfirm={handleDeleteWard}
//                 onCancel={() =>
//                     setConfirmDialog({
//                         isOpen: false,
//                         wardId: "",
//                         wardName: "",
//                     })
//                 }
//                 confirmButtonClass="is-danger"
//             />
//         </div>
//     );
// }

// src/app/admin/components/WardManagement.tsx
"use client";

import { useEffect, useState } from "react";
import { useWards, Ward } from "@/context/WardContext";
import { Department } from "@/context/DepartmentContext";
import { useOrganisations } from "@/context/OrganisationContext"; // Add this import
import WardFilter from "./wards/WardFilter";
import WardCard from "./wards/WardCard";
import WardModal from "./wards/WardModal";
import WardDepartmentsModal from "./wards/WardDepartmentsModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Hospital } from "@/context/HospitalContext";

export default function WardManagement() {
    const {
        wards,
        loading,
        error,
        filter,
        setFilter,
        departments,
        hospitals,
        addNewWard,
        updateExistingWard,
        removeWard,
        getWardDepartments,
    } = useWards();

    // We also use departments context to get the hierarchical department structure
    // Get organisations directly
    const { organisations } = useOrganisations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWard, setCurrentWard] = useState<Ward | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<
        string | undefined
    >(undefined);

    // New state for department management modal
    const [isDepartmentsModalOpen, setIsDepartmentsModalOpen] = useState(false);
    const [wardForDepartments, setWardForDepartments] = useState<Ward | null>(
        null,
    );

    const [actionResult, setActionResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        wardId: string;
        wardName: string;
    }>({
        isOpen: false,
        wardId: "",
        wardName: "",
    });

    // Enhanced department selector states
    const [isDepartmentSelectorOpen, setIsDepartmentSelectorOpen] =
        useState(false);
    const [selectedOrganisationFilter, setSelectedOrganisationFilter] =
        useState<string>("all");
    const [selectedHospitalFilter, setSelectedHospitalFilter] =
        useState<string>("all");
    const [departmentSearchQuery, setDepartmentSearchQuery] =
        useState<string>("");

    // Create a mapping of hospitals to organisations
    const [hospitalOrgMap, setHospitalOrgMap] = useState<{
        [hospitalId: string]: { id: string; name: string };
    }>({});

    // Grouped departments state
    const [groupedDepartments, setGroupedDepartments] = useState<{
        [orgId: string]: {
            organisation: { id: string; name: string };
            hospitals: {
                [hospitalId: string]: {
                    hospital: Hospital;
                    departments: Department[];
                };
            };
        };
    }>({});

    // Build hospital to organisation mapping
    useEffect(() => {
        const mapping: { [hospitalId: string]: { id: string; name: string } } =
            {};

        // First try to get organisation data directly from hospitals
        hospitals.forEach((hospital) => {
            if (hospital.organisation) {
                mapping[hospital.id] = {
                    id: hospital.organisation.id,
                    name: hospital.organisation.name,
                };
            }
        });

        // If that didn't work, try to determine organisations from their IDs
        if (Object.keys(mapping).length === 0 && organisations.length > 0) {
            // Create a lookup table for organisations
            const orgLookup: { [id: string]: string } = {};
            organisations.forEach((org) => {
                orgLookup[org.id] = org.name;
            });

            // Try to extract organisation IDs from hospitals
            hospitals.forEach((hospital) => {
                // This assumes hospital might have organisationId property instead
                const orgId = hospital.organisation.id;
                if (orgId && orgLookup[orgId]) {
                    mapping[hospital.id] = {
                        id: orgId,
                        name: orgLookup[orgId],
                    };
                }
            });
        }

        setHospitalOrgMap(mapping);
    }, [hospitals, organisations]);

    // Organize departments by organisation and hospital
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const grouped: any = {};

        departments.forEach((dept) => {
            if (!dept.hospital) return;

            const hospitalId = dept.hospital.id;

            // Get organisation from our mapping
            const orgInfo = hospitalOrgMap[hospitalId] || {
                id: "unknown",
                name: "Unknown Organisation",
            };
            const orgId = orgInfo.id;
            const orgName = orgInfo.name;

            if (!grouped[orgId]) {
                grouped[orgId] = {
                    organisation: { id: orgId, name: orgName },
                    hospitals: {},
                };
            }

            if (!grouped[orgId].hospitals[hospitalId]) {
                grouped[orgId].hospitals[hospitalId] = {
                    hospital: {
                        ...dept.hospital,
                        organisation: orgInfo,
                    },
                    departments: [],
                };
            }

            // Add the department with enhanced hospital info
            grouped[orgId].hospitals[hospitalId].departments.push({
                ...dept,
                hospital: {
                    ...dept.hospital,
                    organisation: orgInfo,
                },
            });
        });

        setGroupedDepartments(grouped);
    }, [departments, hospitalOrgMap]);

    const handleAddWard = (departmentId?: string) => {
        setCurrentWard(null);
        setSelectedDepartmentId(departmentId);
        setModalMode("add");
        setIsModalOpen(true);
        setIsDepartmentSelectorOpen(false);
    };

    const handleEditWard = (ward: Ward) => {
        setCurrentWard(ward);
        setSelectedDepartmentId(undefined);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    // New handler for managing departments
    const handleManageDepartments = async (ward: Ward) => {
        // Load the ward's department assignments
        try {
            await getWardDepartments(ward.id);
            setWardForDepartments(ward);
            setIsDepartmentsModalOpen(true);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setActionResult({
                success: false,
                message: "Failed to load department",
            });
        }
    };

    const handleDeleteConfirm = (id: string, name: string) => {
        setConfirmDialog({
            isOpen: true,
            wardId: id,
            wardName: name,
        });
    };

    const handleDeleteWard = async () => {
        try {
            await removeWard(confirmDialog.wardId);

            setActionResult({
                success: true,
                message: `Ward "${confirmDialog.wardName}" deleted successfully`,
            });

            // Close the confirm dialog
            setConfirmDialog({
                isOpen: false,
                wardId: "",
                wardName: "",
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setActionResult({
                success: false,
                message: "Failed to delete ward",
            });

            // Close the confirm dialog
            setConfirmDialog({
                isOpen: false,
                wardId: "",
                wardName: "",
            });
        }
    };

    const handleSaveWard = async (ward: Ward) => {
        try {
            if (modalMode === "add") {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, createdAt, updatedAt, ...newWard } = ward;
                await addNewWard(newWard);

                setActionResult({
                    success: true,
                    message: `Ward "${ward.name}" added successfully`,
                });
            } else {
                await updateExistingWard(ward.id, ward);

                setActionResult({
                    success: true,
                    message: `Ward "${ward.name}" updated successfully`,
                });
            }
            setIsModalOpen(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setActionResult({
                success: false,
                message: `Failed to ${modalMode === "add" ? "add" : "update"} ward`,
            });
        }
    };

    // Enhanced department selector handlers
    const handleOrgFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOrganisationFilter(e.target.value);
        setSelectedHospitalFilter("all"); // Reset hospital filter when org changes
    };

    const handleHospitalFilterChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setSelectedHospitalFilter(e.target.value);
    };

    const handleDepartmentSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDepartmentSearchQuery(e.target.value);
    };

    // Get hospitals for a specific organisation
    const getHospitalsByOrganisation = (organisationId: string) => {
        if (organisationId === "all") return hospitals;

        return hospitals.filter((hospital) => {
            const orgInfo = hospitalOrgMap[hospital.id];
            return orgInfo && orgInfo.id === organisationId;
        });
    };

    // Toggle the department selector dropdown
    const toggleDepartmentSelector = () => {
        setIsDepartmentSelectorOpen(!isDepartmentSelectorOpen);
        // Reset filters when opening
        if (!isDepartmentSelectorOpen) {
            setSelectedOrganisationFilter("all");
            setSelectedHospitalFilter("all");
            setDepartmentSearchQuery("");
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
                    <h3 className="title is-4 mb-4">Wards</h3>
                    <p className="subtitle is-6 mb-5">Manage hospital wards</p>

                    {/* Enhanced Department Selector Dropdown */}
                    <div className="buttons mb-4">
                        <div
                            className={`dropdown ${isDepartmentSelectorOpen ? "is-active" : ""}`}
                        >
                            <div className="dropdown-trigger">
                                <button
                                    className="button is-primary"
                                    aria-haspopup="true"
                                    aria-controls="department-dropdown-menu"
                                    onClick={toggleDepartmentSelector}
                                >
                                    <span className="icon">
                                        <i className="fas fa-plus"></i>
                                    </span>
                                    <span>Add Ward</span>
                                    <span className="icon is-small">
                                        <i
                                            className="fas fa-angle-down"
                                            aria-hidden="true"
                                        ></i>
                                    </span>
                                </button>
                            </div>
                            <div
                                className="dropdown-menu"
                                id="department-dropdown-menu"
                                role="menu"
                                style={{ width: "350px", maxHeight: "500px" }}
                            >
                                <div className="dropdown-content">
                                    <div className="dropdown-item">
                                        <p className="has-text-weight-bold mb-2">
                                            Add Ward to Department
                                        </p>

                                        {/* Organisation Filter */}
                                        <div className="field">
                                            <label className="label is-small">
                                                Organisation
                                            </label>
                                            <div className="control">
                                                <div className="select is-small is-fullwidth">
                                                    <select
                                                        value={
                                                            selectedOrganisationFilter
                                                        }
                                                        onChange={
                                                            handleOrgFilterChange
                                                        }
                                                    >
                                                        <option value="all">
                                                            All Organisations
                                                        </option>
                                                        {organisations.map(
                                                            (org) => (
                                                                <option
                                                                    key={org.id}
                                                                    value={
                                                                        org.id
                                                                    }
                                                                >
                                                                    {org.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hospital Filter */}
                                        <div className="field">
                                            <label className="label is-small">
                                                Hospital
                                            </label>
                                            <div className="control">
                                                <div className="select is-small is-fullwidth">
                                                    <select
                                                        value={
                                                            selectedHospitalFilter
                                                        }
                                                        onChange={
                                                            handleHospitalFilterChange
                                                        }
                                                        disabled={
                                                            selectedOrganisationFilter ===
                                                            "all"
                                                        }
                                                    >
                                                        <option value="all">
                                                            {selectedOrganisationFilter ===
                                                            "all"
                                                                ? "Select organisation first"
                                                                : "All Hospitals"}
                                                        </option>
                                                        {getHospitalsByOrganisation(
                                                            selectedOrganisationFilter,
                                                        ).map((hospital) => (
                                                            <option
                                                                key={
                                                                    hospital.id
                                                                }
                                                                value={
                                                                    hospital.id
                                                                }
                                                            >
                                                                {hospital.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Search Box */}
                                        <div className="field">
                                            <label className="label is-small">
                                                Search Departments
                                            </label>
                                            <div className="control has-icons-left">
                                                <input
                                                    className="input is-small"
                                                    type="text"
                                                    placeholder="Search departments..."
                                                    value={
                                                        departmentSearchQuery
                                                    }
                                                    onChange={
                                                        handleDepartmentSearch
                                                    }
                                                />
                                                <span className="icon is-small is-left">
                                                    <i className="fas fa-search"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="dropdown-divider" />

                                    {/* Department List */}
                                    <div
                                        className="dropdown-item"
                                        style={{
                                            maxHeight: "250px",
                                            overflow: "auto",
                                        }}
                                    >
                                        {Object.entries(groupedDepartments)
                                            .filter(
                                                ([orgId]) =>
                                                    selectedOrganisationFilter ===
                                                        "all" ||
                                                    orgId ===
                                                        selectedOrganisationFilter,
                                            )
                                            .map(([orgId, orgGroup]) => (
                                                <div
                                                    key={orgId}
                                                    className="mb-4"
                                                >
                                                    <p className="is-size-6 has-text-weight-bold has-background-light p-2">
                                                        {
                                                            orgGroup
                                                                .organisation
                                                                .name
                                                        }
                                                    </p>
                                                    {Object.entries(
                                                        orgGroup.hospitals,
                                                    )
                                                        .filter(
                                                            ([hospitalId]) =>
                                                                selectedHospitalFilter ===
                                                                    "all" ||
                                                                hospitalId ===
                                                                    selectedHospitalFilter,
                                                        )
                                                        .map(
                                                            ([
                                                                hospitalId,
                                                                hospitalGroup,
                                                            ]) => {
                                                                // Filter departments by search query
                                                                const filteredDepts =
                                                                    hospitalGroup.departments.filter(
                                                                        (
                                                                            dept,
                                                                        ) => {
                                                                            if (
                                                                                !departmentSearchQuery
                                                                            )
                                                                                return true;

                                                                            const lowerQuery =
                                                                                departmentSearchQuery.toLowerCase();
                                                                            return (
                                                                                dept.name
                                                                                    .toLowerCase()
                                                                                    .includes(
                                                                                        lowerQuery,
                                                                                    ) ||
                                                                                (
                                                                                    dept.code?.toLowerCase() ||
                                                                                    ""
                                                                                ).includes(
                                                                                    lowerQuery,
                                                                                )
                                                                            );
                                                                        },
                                                                    );

                                                                if (
                                                                    filteredDepts.length ===
                                                                    0
                                                                )
                                                                    return null;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            hospitalId
                                                                        }
                                                                        className="ml-3 mb-3"
                                                                    >
                                                                        <p className="is-size-7 has-text-weight-semibold has-text-grey-dark mb-1">
                                                                            {
                                                                                hospitalGroup
                                                                                    .hospital
                                                                                    .name
                                                                            }
                                                                        </p>
                                                                        <ul className="menu-list ml-4">
                                                                            {filteredDepts.map(
                                                                                (
                                                                                    dept,
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            dept.id
                                                                                        }
                                                                                    >
                                                                                        <a
                                                                                            onClick={() => {
                                                                                                handleAddWard(
                                                                                                    dept.id,
                                                                                                );
                                                                                                setIsDepartmentSelectorOpen(
                                                                                                    false,
                                                                                                );
                                                                                            }}
                                                                                            className="is-flex is-align-items-center py-1"
                                                                                        >
                                                                                            <span
                                                                                                style={{
                                                                                                    backgroundColor:
                                                                                                        dept.color ||
                                                                                                        "#3273dc",
                                                                                                    width: "10px",
                                                                                                    height: "10px",
                                                                                                    borderRadius:
                                                                                                        "50%",
                                                                                                    display:
                                                                                                        "inline-block",
                                                                                                    marginRight:
                                                                                                        "8px",
                                                                                                }}
                                                                                            ></span>
                                                                                            <span>
                                                                                                {
                                                                                                    dept.name
                                                                                                }
                                                                                                {dept.code && (
                                                                                                    <span className="has-text-grey ml-1">
                                                                                                        (
                                                                                                        {
                                                                                                            dept.code
                                                                                                        }

                                                                                                        )
                                                                                                    </span>
                                                                                                )}
                                                                                            </span>
                                                                                        </a>
                                                                                    </li>
                                                                                ),
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                </div>
                                            ))}

                                        {/* Empty state */}
                                        {(Object.keys(groupedDepartments)
                                            .length === 0 ||
                                            Object.entries(
                                                groupedDepartments,
                                            ).filter(
                                                ([orgId]) =>
                                                    selectedOrganisationFilter ===
                                                        "all" ||
                                                    orgId ===
                                                        selectedOrganisationFilter,
                                            ).length === 0) && (
                                            <div className="has-text-centered my-4">
                                                <p className="has-text-grey">
                                                    No departments found
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <hr className="dropdown-divider" />

                                    <a
                                        className="dropdown-item"
                                        onClick={() => {
                                            handleAddWard();
                                            setIsDepartmentSelectorOpen(false);
                                        }}
                                    >
                                        <span className="icon mr-2">
                                            <i className="fas fa-plus-circle"></i>
                                        </span>
                                        Add ward without department
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <WardFilter filter={filter} setFilter={setFilter} />
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
                    <div className="columns is-multiline">
                        {wards.length === 0 ? (
                            <div className="column is-12">
                                <div className="notification is-info">
                                    No wards found. Try adjusting your filters
                                    or add a new ward.
                                </div>
                            </div>
                        ) : (
                            wards.map((ward) => (
                                <div className="column is-4" key={ward.id}>
                                    <WardCard
                                        ward={ward}
                                        onEdit={() => handleEditWard(ward)}
                                        onDelete={() =>
                                            handleDeleteConfirm(
                                                ward.id,
                                                ward.name,
                                            )
                                        }
                                        onManageDepartments={() =>
                                            handleManageDepartments(ward)
                                        }
                                    />
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Ward Modal */}
            <WardModal
                isOpen={isModalOpen}
                mode={modalMode}
                ward={currentWard}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveWard}
                departmentId={selectedDepartmentId}
            />

            {/* Ward Departments Modal */}
            <WardDepartmentsModal
                isOpen={isDepartmentsModalOpen}
                ward={wardForDepartments}
                onClose={() => {
                    setIsDepartmentsModalOpen(false);
                    setWardForDepartments(null);
                }}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Delete Ward"
                message={`Are you sure you want to delete "${confirmDialog.wardName}"? This action cannot be undone.`}
                confirmText="Delete Ward"
                cancelText="Cancel"
                onConfirm={handleDeleteWard}
                onCancel={() =>
                    setConfirmDialog({
                        isOpen: false,
                        wardId: "",
                        wardName: "",
                    })
                }
                confirmButtonClass="is-danger"
            />
        </div>
    );
}
