// src/app/admin/components/staff/StaffAssignmentManager.tsx
import React, { useState, useEffect } from "react";
import {
    useStaff,
    StaffOrganisationAssignment,
    StaffHospitalAssignment,
    StaffDepartmentAssignment,
} from "@/context/StaffContext";
import { useOrganisations } from "@/context/OrganisationContext";
import { useHospitals } from "@/context/HospitalContext";
import { useDepartments } from "@/context/DepartmentContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AlertMessage from "@/components/common/AlertMessage";

type StaffAssignmentManagerProps = {
    staffId: string;
    staffName: string;
    onClose?: () => void;
};

export default function StaffAssignmentManager({
    staffId,
    staffName,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClose,
}: StaffAssignmentManagerProps) {
    // Tabs for different assignment types
    const tabs = ["organisation", "hospital", "department"] as const;
    type TabType = (typeof tabs)[number];
    const [activeTab, setActiveTab] = useState<TabType>("organisation");

    // Assignment data
    const [orgAssignments, setOrgAssignments] = useState<
        StaffOrganisationAssignment[]
    >([]);
    const [hospitalAssignments, setHospitalAssignments] = useState<
        StaffHospitalAssignment[]
    >([]);
    const [deptAssignments, setDeptAssignments] = useState<
        StaffDepartmentAssignment[]
    >([]);

    // Loading and error states
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form states for new assignments
    const [selectedOrgId, setSelectedOrgId] = useState<string>("");
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
    const [selectedDepartmentId, setSelectedDepartmentId] =
        useState<string>("");
    const [startDate, setStartDate] = useState<string>(
        new Date().toISOString().split("T")[0],
    );
    const [endDate, setEndDate] = useState<string>("");
    const [isPrimary, setIsPrimary] = useState<boolean>(false);
    const [role, setRole] = useState<string>("pharmacist");
    const [departmentRole, setDepartmentRole] = useState<string>("staff");

    // Get contexts
    const {
        getStaffAssignments,
        assignStaffToOrganisation,
        assignStaffToHospital,
        assignStaffToDepartment,
        removeStaffOrganisationAssignment,
        removeStaffHospitalAssignment,
        removeStaffDepartmentAssignment,
        setPrimaryHospital,
    } = useStaff();
    const { organisations } = useOrganisations();
    const { hospitals } = useHospitals();
    const { departments } = useDepartments();

    // Available roles and department roles
    const availableRoles = [
        { id: "pharmacist", name: "Pharmacist" },
        { id: "technician", name: "Pharmacy Technician" },
        { id: "doctor", name: "Doctor" },
        { id: "nurse", name: "Nurse" },
        { id: "admin", name: "Administrative" },
    ];

    const availableDepartmentRoles = [
        { id: "manager", name: "Manager" },
        { id: "lead", name: "Team Lead" },
        { id: "coordinator", name: "Coordinator" },
        { id: "staff", name: "Staff" },
    ];

    // Load the staff assignments
    useEffect(() => {
        const loadAssignments = async () => {
            setLoading(true);
            setError(null);
            try {
                const {
                    organisationAssignments,
                    hospitalAssignments,
                    departmentAssignments,
                } = await getStaffAssignments(staffId);

                setOrgAssignments(organisationAssignments);
                setHospitalAssignments(hospitalAssignments);
                setDeptAssignments(departmentAssignments);
            } catch (err) {
                console.error("Error loading staff assignments:", err);
                setError("Failed to load staff assignments");
            } finally {
                setLoading(false);
            }
        };

        loadAssignments();
    }, [staffId, getStaffAssignments]);

    // Clear success message after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Helper function to format date
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Ongoing";

        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Handlers for adding new assignments
    const handleAddOrganisationAssignment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOrgId) {
            setError("Please select an organisation");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await assignStaffToOrganisation(staffId, selectedOrgId);

            // Refresh assignments
            const { organisationAssignments } =
                await getStaffAssignments(staffId);
            setOrgAssignments(organisationAssignments);

            // Reset form
            setSelectedOrgId("");
            setIsPrimary(false);
            setEndDate("");

            setSuccess("Organisation assignment added successfully");
        } catch (err) {
            console.error("Error adding organisation assignment:", err);
            setError("Failed to add organisation assignment");
        } finally {
            setLoading(false);
        }
    };

    const handleAddHospitalAssignment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedHospitalId) {
            setError("Please select a hospital");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await assignStaffToHospital(staffId, selectedHospitalId);

            // Refresh assignments
            const { hospitalAssignments } = await getStaffAssignments(staffId);
            setHospitalAssignments(hospitalAssignments);

            // Reset form
            setSelectedHospitalId("");
            setIsPrimary(false);
            setEndDate("");

            setSuccess("Hospital assignment added successfully");
        } catch (err) {
            console.error("Error adding hospital assignment:", err);
            setError("Failed to add hospital assignment");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDepartmentAssignment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDepartmentId) {
            setError("Please select a department");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await assignStaffToDepartment(staffId, selectedDepartmentId);

            // Refresh assignments
            const { departmentAssignments } =
                await getStaffAssignments(staffId);
            setDeptAssignments(departmentAssignments);

            // Reset form
            setSelectedDepartmentId("");
            setRole("pharmacist");
            setDepartmentRole("staff");
            setIsPrimary(false);
            setEndDate("");

            setSuccess("Department assignment added successfully");
        } catch (err) {
            console.error("Error adding department assignment:", err);
            setError("Failed to add department assignment");
        } finally {
            setLoading(false);
        }
    };

    // Handlers for removing assignments
    const handleRemoveOrgAssignment = async (assignmentId: string) => {
        if (
            confirm(
                "Are you sure you want to remove this organisation assignment?",
            )
        ) {
            setLoading(true);
            try {
                await removeStaffOrganisationAssignment(assignmentId);

                // Refresh assignments
                const { organisationAssignments } =
                    await getStaffAssignments(staffId);
                setOrgAssignments(organisationAssignments);

                setSuccess("Organisation assignment removed successfully");
            } catch (err) {
                console.error("Error removing organisation assignment:", err);
                setError("Failed to remove organisation assignment");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRemoveHospitalAssignment = async (assignmentId: string) => {
        if (
            confirm("Are you sure you want to remove this hospital assignment?")
        ) {
            setLoading(true);
            try {
                await removeStaffHospitalAssignment(assignmentId);

                // Refresh assignments
                const { hospitalAssignments } =
                    await getStaffAssignments(staffId);
                setHospitalAssignments(hospitalAssignments);

                setSuccess("Hospital assignment removed successfully");
            } catch (err) {
                console.error("Error removing hospital assignment:", err);
                setError("Failed to remove hospital assignment");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRemoveDepartmentAssignment = async (assignmentId: string) => {
        if (
            confirm(
                "Are you sure you want to remove this department assignment?",
            )
        ) {
            setLoading(true);
            try {
                await removeStaffDepartmentAssignment(assignmentId);

                // Refresh assignments
                const { departmentAssignments } =
                    await getStaffAssignments(staffId);
                setDeptAssignments(departmentAssignments);

                setSuccess("Department assignment removed successfully");
            } catch (err) {
                console.error("Error removing department assignment:", err);
                setError("Failed to remove department assignment");
            } finally {
                setLoading(false);
            }
        }
    };

    // Handlers for setting primary assignments
    // const handleSetPrimaryOrg = async (assignmentId: string) => {
    //     setLoading(true);
    //     try {
    //         await setPrimaryOrganisation(staffId, assignmentId);
    //
    //         // Refresh assignments
    //         const { organisationAssignments } = await getStaffAssignments(staffId);
    //         setOrgAssignments(organisationAssignments);
    //
    //         setSuccess("Primary organisation updated successfully");
    //     } catch (err) {
    //         console.error("Error setting primary organisation:", err);
    //         setError("Failed to update primary organisation");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleSetPrimaryHospital = async (assignmentId: string) => {
        setLoading(true);
        try {
            await setPrimaryHospital(staffId, assignmentId);

            // Refresh assignments
            const { hospitalAssignments } = await getStaffAssignments(staffId);
            setHospitalAssignments(hospitalAssignments);

            setSuccess("Primary hospital updated successfully");
        } catch (err) {
            console.error("Error setting primary hospital:", err);
            setError("Failed to update primary hospital");
        } finally {
            setLoading(false);
        }
    };

    // const handleSetPrimaryDepartment = async (assignmentId: string) => {
    //     setLoading(true);
    //     try {
    //         await setPrimaryDepartment(staffId, assignmentId);
    //
    //         // Refresh assignments
    //         const { departmentAssignments } = await getStaffAssignments(staffId);
    //         setDeptAssignments(departmentAssignments);
    //
    //         setSuccess("Primary department updated successfully");
    //     } catch (err) {
    //         console.error("Error setting primary department:", err);
    //         setError("Failed to update primary department");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Filter hospitals based on selected organisation in the org tab
    const filteredHospitals = hospitals.filter((hospital) => {
        // If no org is selected, show all hospitals
        if (!selectedOrgId) return true;

        // Otherwise, filter by the selected org
        return hospital.organisation?.id === selectedOrgId;
    });

    // Filter departments based on selected hospital in the department tab
    const filteredDepartments = departments.filter((dept) => {
        // If no hospital is selected, show all departments
        if (!selectedHospitalId) return true;

        // Otherwise, filter by the selected hospital
        return dept.hospital?.id === selectedHospitalId;
    });

    return (
        <div className="box">
            <h3 className="title is-4">Assignments for {staffName}</h3>

            {/* Feedback Messages */}
            {error && (
                <AlertMessage
                    type="danger"
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            {success && (
                <AlertMessage
                    type="success"
                    message={success}
                    onClose={() => setSuccess(null)}
                />
            )}

            {/* Tabs */}
            <div className="tabs">
                <ul>
                    {" "}
                    {tabs.map((tab) => (
                        <li
                            key={tab}
                            className={activeTab === tab ? "is-active" : ""}
                        >
                            <a onClick={() => setActiveTab(tab)}>
                                <span className="icon is-small">
                                    <i
                                        className={`fas fa-${
                                            tab === "organisation"
                                                ? "building"
                                                : tab === "hospital"
                                                  ? "hospital"
                                                  : "sitemap"
                                        }`}
                                    ></i>
                                </span>
                                <span>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {/* Organisation Tab */}
                    <div
                        className={
                            activeTab === "organisation" ? "" : "is-hidden"
                        }
                    >
                        <div className="columns">
                            <div className="column is-5">
                                {/* Organisation Assignment Form */}
                                <div className="box">
                                    <h4 className="title is-5">
                                        Add Organisation Assignment
                                    </h4>
                                    <form
                                        onSubmit={
                                            handleAddOrganisationAssignment
                                        }
                                    >
                                        <div className="field">
                                            <label className="label">
                                                Organisation
                                            </label>
                                            <div className="control">
                                                <div className="select is-fullwidth">
                                                    <select
                                                        value={selectedOrgId}
                                                        onChange={(e) =>
                                                            setSelectedOrgId(
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    >
                                                        <option value="">
                                                            Select an
                                                            organisation
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

                                        <div className="field">
                                            <label className="label">
                                                Start Date
                                            </label>
                                            <div className="control">
                                                <input
                                                    type="date"
                                                    className="input"
                                                    value={startDate}
                                                    onChange={(e) =>
                                                        setStartDate(
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="field">
                                            <label className="label">
                                                End Date (Optional)
                                            </label>
                                            <div className="control">
                                                <input
                                                    type="date"
                                                    className="input"
                                                    value={endDate}
                                                    onChange={(e) =>
                                                        setEndDate(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <p className="help">
                                                Leave blank for ongoing
                                                assignments
                                            </p>
                                        </div>

                                        <div className="field">
                                            <div className="control">
                                                <label className="checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={isPrimary}
                                                        onChange={(e) =>
                                                            setIsPrimary(
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                    />
                                                    &nbsp;Set as primary
                                                    organisation
                                                </label>
                                            </div>
                                        </div>

                                        <div className="field">
                                            <div className="control">
                                                <button
                                                    type="submit"
                                                    className="button is-primary"
                                                    disabled={loading}
                                                >
                                                    Add Assignment
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="column is-7">
                                {/* Organisation Assignment List */}
                                <div className="box">
                                    <h4 className="title is-5">
                                        Current Organisation Assignments
                                    </h4>

                                    {orgAssignments.length === 0 ? (
                                        <div className="notification is-warning is-light">
                                            No organisation assignments found.
                                        </div>
                                    ) : (
                                        <table className="table is-fullwidth">
                                            <thead>
                                                <tr>
                                                    <th>Organisation</th>
                                                    <th>Period</th>
                                                    <th>Primary</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orgAssignments.map(
                                                    (assignment) => (
                                                        <tr key={assignment.id}>
                                                            <td>
                                                                <div className="is-flex is-align-items-center">
                                                                    <span className="icon is-small mr-2">
                                                                        <i className="fas fa-building"></i>
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            assignment
                                                                                .organisation
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {formatDate(
                                                                    assignment.startDate,
                                                                )}{" "}
                                                                -{" "}
                                                                {formatDate(
                                                                    assignment.endDate !==
                                                                        null
                                                                        ? formatDate(
                                                                              assignment.endDate,
                                                                          )
                                                                        : "N/A",
                                                                )}
                                                            </td>
                                                            <td>
                                                                {assignment.isPrimary ? (
                                                                    <span className="tag is-success">
                                                                        Primary
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        className="button is-small"
                                                                        // We need to comment this out since the function is commented out in the provided code
                                                                        // onClick={() => handleSetPrimaryOrg(assignment.id)}
                                                                        disabled={
                                                                            true
                                                                        } // Disabled since function is not available
                                                                    >
                                                                        Set
                                                                        Primary
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="button is-small is-danger"
                                                                    onClick={() =>
                                                                        handleRemoveOrgAssignment(
                                                                            assignment.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loading
                                                                    }
                                                                >
                                                                    <span className="icon is-small">
                                                                        <i className="fas fa-trash"></i>
                                                                    </span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hospital Tab */}
                    <div
                        className={activeTab === "hospital" ? "" : "is-hidden"}
                    >
                        <div className="columns">
                            <div className="column is-5">
                                {/* Hospital Assignment Form */}
                                <div className="box">
                                    <h4 className="title is-5">
                                        Add Hospital Assignment
                                    </h4>
                                    <form
                                        onSubmit={handleAddHospitalAssignment}
                                    >
                                        <div className="field">
                                            <label className="label">
                                                Organisation Filter
                                            </label>
                                            <div className="control">
                                                <div className="select is-fullwidth">
                                                    <select
                                                        value={selectedOrgId}
                                                        onChange={(e) =>
                                                            setSelectedOrgId(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
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
                                            <p className="help">
                                                Optional - Filter hospitals by
                                                organisation
                                            </p>
                                        </div>

                                        <div className="field">
                                            <label className="label">
                                                Hospital
                                            </label>
                                            <div className="control">
                                                <div className="select is-fullwidth">
                                                    <select
                                                        value={
                                                            selectedHospitalId
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedHospitalId(
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    >
                                                        <option value="">
                                                            Select a hospital
                                                        </option>
                                                        {filteredHospitals.map(
                                                            (hospital) => (
                                                                <option
                                                                    key={
                                                                        hospital.id
                                                                    }
                                                                    value={
                                                                        hospital.id
                                                                    }
                                                                >
                                                                    {
                                                                        hospital.name
                                                                    }
                                                                    {hospital.organisation &&
                                                                        ` (${hospital.organisation.name})`}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="field">
                                            <label className="label">
                                                Start Date
                                            </label>
                                            <div className="control">
                                                <input
                                                    type="date"
                                                    className="input"
                                                    value={startDate}
                                                    onChange={(e) =>
                                                        setStartDate(
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="field">
                                            <label className="label">
                                                End Date (Optional)
                                            </label>
                                            <div className="control">
                                                <input
                                                    type="date"
                                                    className="input"
                                                    value={endDate}
                                                    onChange={(e) =>
                                                        setEndDate(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <p className="help">
                                                Leave blank for ongoing
                                                assignments
                                            </p>
                                        </div>

                                        <div className="field">
                                            <div className="control">
                                                <label className="checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={isPrimary}
                                                        onChange={(e) =>
                                                            setIsPrimary(
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                    />
                                                    &nbsp;Set as primary
                                                    hospital
                                                </label>
                                            </div>
                                        </div>

                                        <div className="field">
                                            <div className="control">
                                                <button
                                                    type="submit"
                                                    className="button is-primary"
                                                    disabled={loading}
                                                >
                                                    Add Assignment
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="column is-7">
                                {/* Hospital Assignment List */}
                                <div className="box">
                                    <h4 className="title is-5">
                                        Current Hospital Assignments
                                    </h4>

                                    {hospitalAssignments.length === 0 ? (
                                        <div className="notification is-warning is-light">
                                            No hospital assignments found.
                                        </div>
                                    ) : (
                                        <table className="table is-fullwidth">
                                            <thead>
                                                <tr>
                                                    <th>Hospital</th>
                                                    <th>Organisation</th>
                                                    <th>Period</th>
                                                    <th>Primary</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {hospitalAssignments.map(
                                                    (assignment) => (
                                                        <tr key={assignment.id}>
                                                            <td>
                                                                <div className="is-flex is-align-items-center">
                                                                    <span className="icon is-small mr-2">
                                                                        <i className="fas fa-hospital"></i>
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            assignment
                                                                                .hospital
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {assignment
                                                                    .hospital
                                                                    .organisation
                                                                    ?.name ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {formatDate(
                                                                    assignment.startDate,
                                                                )}{" "}
                                                                -{" "}
                                                                {formatDate(
                                                                    assignment.endDate !==
                                                                        null
                                                                        ? formatDate(
                                                                              assignment.endDate,
                                                                          )
                                                                        : "N/A",
                                                                )}
                                                            </td>
                                                            <td>
                                                                {assignment.isPrimary ? (
                                                                    <span className="tag is-success">
                                                                        Primary
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        className="button is-small"
                                                                        onClick={() =>
                                                                            handleSetPrimaryHospital(
                                                                                assignment.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            loading
                                                                        }
                                                                    >
                                                                        Set
                                                                        Primary
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="button is-small is-danger"
                                                                    onClick={() =>
                                                                        handleRemoveHospitalAssignment(
                                                                            assignment.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loading
                                                                    }
                                                                >
                                                                    <span className="icon is-small">
                                                                        <i className="fas fa-trash"></i>
                                                                    </span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Department Tab */}
                    <div
                        className={
                            activeTab === "department" ? "" : "is-hidden"
                        }
                    >
                        <div className="columns">
                            <div className="column is-5">
                                {/* Department Assignment Form */}
                                <div className="box">
                                    <h4 className="title is-5">
                                        Add Department Assignment
                                    </h4>
                                    <form
                                        onSubmit={handleAddDepartmentAssignment}
                                    >
                                        <div className="field">
                                            <label className="label">
                                                Hospital Filter
                                            </label>
                                            <div className="control">
                                                <div className="select is-fullwidth">
                                                    <select
                                                        value={
                                                            selectedHospitalId
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedHospitalId(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            All Hospitals
                                                        </option>
                                                        {hospitals.map(
                                                            (hospital) => (
                                                                <option
                                                                    key={
                                                                        hospital.id
                                                                    }
                                                                    value={
                                                                        hospital.id
                                                                    }
                                                                >
                                                                    {
                                                                        hospital.name
                                                                    }
                                                                    {hospital.organisation &&
                                                                        ` (${hospital.organisation.name})`}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                            <p className="help">
                                                Optional - Filter departments by
                                                hospital
                                            </p>
                                        </div>

                                        <div className="field">
                                            <label className="label">
                                                Department
                                            </label>
                                            <div className="control">
                                                <div className="select is-fullwidth">
                                                    <select
                                                        value={
                                                            selectedDepartmentId
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedDepartmentId(
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    >
                                                        <option value="">
                                                            Select a department
                                                        </option>
                                                        {filteredDepartments.map(
                                                            (dept) => (
                                                                <option
                                                                    key={
                                                                        dept.id
                                                                    }
                                                                    value={
                                                                        dept.id
                                                                    }
                                                                >
                                                                    {dept.name}
                                                                    {dept.hospital &&
                                                                        ` (${dept.hospital.name})`}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="field">
                                            <label className="label">
                                                Role
                                            </label>
                                            <div className="control">
                                                <div className="select is-fullwidth">
                                                    <select
                                                        value={role}
                                                        onChange={(e) =>
                                                            setRole(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        {availableRoles.map(
                                                            (r) => (
                                                                <option
                                                                    key={r.id}
                                                                    value={r.id}
                                                                >
                                                                    {r.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="field">
                                            <label className="label">
                                                Department Role
                                            </label>
                                            <div className="control">
                                                <div className="select is-fullwidth">
                                                    <select
                                                        value={departmentRole}
                                                        onChange={(e) =>
                                                            setDepartmentRole(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        {availableDepartmentRoles.map(
                                                            (r) => (
                                                                <option
                                                                    key={r.id}
                                                                    value={r.id}
                                                                >
                                                                    {r.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="field">
                                            <label className="label">
                                                Start Date
                                            </label>
                                            <div className="control">
                                                <input
                                                    type="date"
                                                    className="input"
                                                    value={startDate}
                                                    onChange={(e) =>
                                                        setStartDate(
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="field">
                                            <label className="label">
                                                End Date (Optional)
                                            </label>
                                            <div className="control">
                                                <input
                                                    type="date"
                                                    className="input"
                                                    value={endDate}
                                                    onChange={(e) =>
                                                        setEndDate(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <p className="help">
                                                Leave blank for ongoing
                                                assignments
                                            </p>
                                        </div>

                                        <div className="field">
                                            <div className="control">
                                                <label className="checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={isPrimary}
                                                        onChange={(e) =>
                                                            setIsPrimary(
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                    />
                                                    &nbsp;Set as primary
                                                    department
                                                </label>
                                            </div>
                                        </div>

                                        <div className="field">
                                            <div className="control">
                                                <button
                                                    type="submit"
                                                    className="button is-primary"
                                                    disabled={loading}
                                                >
                                                    Add Assignment
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="column is-7">
                                {/* Department Assignment List */}
                                <div className="box">
                                    <h4 className="title is-5">
                                        Current Department Assignments
                                    </h4>

                                    {deptAssignments.length === 0 ? (
                                        <div className="notification is-warning is-light">
                                            No department assignments found.
                                        </div>
                                    ) : (
                                        <table className="table is-fullwidth">
                                            <thead>
                                                <tr>
                                                    <th>Department</th>
                                                    <th>Hospital</th>
                                                    <th>Role</th>
                                                    <th>Primary</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {deptAssignments.map(
                                                    (assignment) => (
                                                        <tr key={assignment.id}>
                                                            <td>
                                                                <div className="is-flex is-align-items-center">
                                                                    <span className="icon is-small mr-2">
                                                                        <i className="fas fa-sitemap"></i>
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            assignment
                                                                                .department
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {assignment
                                                                    .department
                                                                    .hospital
                                                                    ?.name ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {assignment.role ||
                                                                    "Staff"}{" "}
                                                                -{" "}
                                                                {assignment.departmentRole ||
                                                                    "Member"}
                                                            </td>
                                                            <td>
                                                                {assignment.isPrimary ? (
                                                                    <span className="tag is-success">
                                                                        Primary
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        className="button is-small"
                                                                        // We need to comment this out since the function is commented out in the provided code
                                                                        // onClick={() => handleSetPrimaryDepartment(assignment.id)}
                                                                        disabled={
                                                                            true
                                                                        } // Disabled since function is not available
                                                                    >
                                                                        Set
                                                                        Primary
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="button is-small is-danger"
                                                                    onClick={() =>
                                                                        handleRemoveDepartmentAssignment(
                                                                            assignment.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loading
                                                                    }
                                                                >
                                                                    <span className="icon is-small">
                                                                        <i className="fas fa-trash"></i>
                                                                    </span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
