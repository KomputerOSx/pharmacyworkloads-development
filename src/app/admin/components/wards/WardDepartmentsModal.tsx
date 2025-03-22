// src/app/admin/components/wards/WardDepartmentsModal.tsx
import React, { useEffect, useState } from "react";
import { useWards, Ward } from "@/context/WardContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Hospital } from "@/context/HospitalContext";
// import {useOrganizations} from "@/context/OrganizationContext";

type WardDepartmentsModalProps = {
    isOpen: boolean;
    ward: Ward | null;
    onClose: () => void;
};

// Enhanced department type with hospital information for the dropdown
type EnhancedDepartment = {
    id: string;
    name: string;
    code: string;
    color?: string;
    hospital: {
        id: string;
        name: string;
        organization?: {
            id: string;
            name: string;
        };
    };
};

export default function WardDepartmentsModal({
    isOpen,
    ward,
    onClose,
}: WardDepartmentsModalProps) {
    const {
        departments,
        hospitals,
        currentWardDepartments,
        getWardDepartments,
        assignWardToDepartment,
        setPrimaryDepartment,
        removeWardDepartmentAssignment,
    } = useWards();

    // const { organisations } = useOrganizations();

    const [selectedDepartmentId, setSelectedDepartmentId] =
        useState<string>("");
    const [isPrimary, setIsPrimary] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filter and search states
    const [selectedOrganizationId, setSelectedOrganizationId] =
        useState<string>("");
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
    const [departmentSearchQuery, setDepartmentSearchQuery] =
        useState<string>("");

    // State to hold enhanced departments with hospital information
    const [enhancedDepartments, setEnhancedDepartments] = useState<
        EnhancedDepartment[]
    >([]);

    // Group departments by hospital for better organization in dropdown
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [departmentsByHospital, setDepartmentsByHospital] = useState<{
        [hospitalId: string]: EnhancedDepartment[];
    }>({});

    // Group hospitals by organization
    const [hospitalsByOrganization, setHospitalsByOrganization] = useState<{
        [orgId: string]: {
            organization: { id: string; name: string };
            hospitals: Hospital[];
        };
    }>({});

    // Load ward's departments when modal opens
    useEffect(
        () => {
            if (isOpen && ward) {
                loadWardDepartments().then();
                prepareEnhancedDepartments();
                organizeHospitalsByOrganization();
            } else {
                // Reset form state when modal closes
                setSelectedDepartmentId("");
                setIsPrimary(false);
                setError(null);
                setSuccess(null);
                setSelectedOrganizationId("");
                setSelectedHospitalId("");
                setDepartmentSearchQuery("");
            }
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [isOpen, ward, departments, hospitals],
    );

    // Organize hospitals by organization
    const organizeHospitalsByOrganization = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const grouped: any = {};

        hospitals.forEach((hospital) => {
            if (!hospital.organization) return;

            const orgId = hospital.organization.id;
            const orgName = hospital.organization.name;

            if (!grouped[orgId]) {
                grouped[orgId] = {
                    organization: { id: orgId, name: orgName },
                    hospitals: [],
                };
            }

            grouped[orgId].hospitals.push(hospital);
        });

        setHospitalsByOrganization(grouped);
    };

    // Prepare enhanced departments with hospital information
    const prepareEnhancedDepartments = () => {
        // Create enhanced department objects with hospital info
        const enhanced = departments.map((dept) => ({
            ...dept,
            hospital: dept.hospital || {
                id: "unknown",
                name: "Unknown Hospital",
            },
        })) as EnhancedDepartment[];

        setEnhancedDepartments(enhanced);

        // Group by hospital
        const byHospital: { [hospitalId: string]: EnhancedDepartment[] } = {};
        enhanced.forEach((dept) => {
            const hospitalId = dept.hospital?.id || "unknown";
            if (!byHospital[hospitalId]) {
                byHospital[hospitalId] = [];
            }
            byHospital[hospitalId].push(dept);
        });

        setDepartmentsByHospital(byHospital);
    };

    const loadWardDepartments = async () => {
        if (!ward) return;

        setLoading(true);
        try {
            await getWardDepartments(ward.id);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Failed to load department assignments for this ward.");
        } finally {
            setLoading(false);
        }
    };

    // Handle organization selection
    const handleOrganizationChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const orgId = e.target.value;
        setSelectedOrganizationId(orgId);
        setSelectedHospitalId(""); // Reset hospital when organization changes
        setSelectedDepartmentId(""); // Reset department when organization changes
    };

    // Handle hospital selection
    const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const hospitalId = e.target.value;
        setSelectedHospitalId(hospitalId);
        setSelectedDepartmentId(""); // Reset department when hospital changes
    };

    // Handle department selection
    const handleDepartmentChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const deptId = e.target.value;
        setSelectedDepartmentId(deptId);
    };

    // Handle search query change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDepartmentSearchQuery(e.target.value);
    };

    const handleAddDepartment = async () => {
        if (!ward || !selectedDepartmentId) {
            setError("Please select a department");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await assignWardToDepartment(
                ward.id,
                selectedDepartmentId,
                isPrimary,
            );
            setSelectedDepartmentId("");
            setIsPrimary(false);
            setSuccess("Department assigned successfully");

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Failed to assign department to ward");
        } finally {
            setLoading(false);
        }
    };

    const handleSetPrimary = async (assignmentId: string) => {
        if (!ward) return;

        setLoading(true);
        setError(null);
        try {
            await setPrimaryDepartment(assignmentId, ward.id);
            setSuccess("Primary department updated successfully");

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Failed to set primary department");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDepartment = async (assignmentId: string) => {
        if (!ward) return;

        if (
            confirm(
                "Are you sure you want to remove this department assignment?",
            )
        ) {
            setLoading(true);
            setError(null);
            try {
                await removeWardDepartmentAssignment(assignmentId);
                setSuccess("Department assignment removed successfully");

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(null), 3000);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setError("Failed to remove department assignment");
            } finally {
                setLoading(false);
            }
        }
    };

    // Filter departments based on search, organization and hospital selections
    const getFilteredDepartments = () => {
        // Start with all departments
        let filtered = [...enhancedDepartments];

        // Filter by organization if selected
        if (selectedOrganizationId) {
            filtered = filtered.filter(
                (dept) =>
                    dept.hospital?.organization?.id === selectedOrganizationId,
            );
        }

        // Filter by hospital if selected
        if (selectedHospitalId) {
            filtered = filtered.filter(
                (dept) => dept.hospital?.id === selectedHospitalId,
            );
        }

        // Filter by search query if present
        if (departmentSearchQuery) {
            const query = departmentSearchQuery.toLowerCase();
            filtered = filtered.filter(
                (dept) =>
                    dept.name.toLowerCase().includes(query) ||
                    dept.code.toLowerCase().includes(query),
            );
        }

        // Filter out departments that are already assigned to this ward
        filtered = filtered.filter(
            (dept) =>
                !currentWardDepartments.some(
                    (assignment) => assignment.department.id === dept.id,
                ),
        );

        return filtered;
    };

    const filteredDepartments = getFilteredDepartments();

    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? "is-active" : ""}`}>
            <div className="modal-background" onClick={onClose}></div>
            <div
                className="modal-card"
                style={{ maxWidth: "700px", width: "100%" }}
            >
                <header className="modal-card-head">
                    <p className="modal-card-title">Manage Ward Departments</p>
                    <button
                        className="delete"
                        aria-label="close"
                        onClick={onClose}
                        disabled={loading}
                    ></button>
                </header>

                <section className="modal-card-body">
                    {error && (
                        <div className="notification is-danger">
                            <button
                                className="delete"
                                onClick={() => setError(null)}
                            ></button>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="notification is-success">
                            <button
                                className="delete"
                                onClick={() => setSuccess(null)}
                            ></button>
                            {success}
                        </div>
                    )}

                    <h4 className="title is-5">
                        Ward: <strong>{ward?.name}</strong>
                    </h4>

                    {/* Add department section */}
                    <div className="box">
                        <h5 className="title is-6">Assign to Department</h5>

                        {/* Organization and Hospital Filter Controls */}
                        <div className="columns">
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label is-small">
                                        Organization
                                    </label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                value={selectedOrganizationId}
                                                onChange={
                                                    handleOrganizationChange
                                                }
                                                disabled={loading}
                                            >
                                                <option value="">
                                                    All Organizations
                                                </option>
                                                {Object.values(
                                                    hospitalsByOrganization,
                                                ).map((org) => (
                                                    <option
                                                        key={
                                                            org.organization.id
                                                        }
                                                        value={
                                                            org.organization.id
                                                        }
                                                    >
                                                        {org.organization.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label is-small">
                                        Hospital
                                    </label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                value={selectedHospitalId}
                                                onChange={handleHospitalChange}
                                                disabled={
                                                    loading ||
                                                    !selectedOrganizationId
                                                }
                                            >
                                                <option value="">
                                                    {selectedOrganizationId
                                                        ? "All Hospitals"
                                                        : "Select organization first"}
                                                </option>
                                                {selectedOrganizationId &&
                                                    hospitalsByOrganization[
                                                        selectedOrganizationId
                                                    ]?.hospitals.map(
                                                        (hospital) => (
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
                                                        ),
                                                    )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Department Search */}
                        <div className="field">
                            <label className="label is-small">
                                Search Departments
                            </label>
                            <div className="control has-icons-left">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Search by name or code"
                                    value={departmentSearchQuery}
                                    onChange={handleSearchChange}
                                    disabled={loading}
                                />
                                <span className="icon is-small is-left">
                                    <i className="fas fa-search"></i>
                                </span>
                            </div>
                        </div>

                        <div className="field mt-3">
                            <label className="label">Department</label>
                            <div className="control">
                                <div className="select is-fullwidth">
                                    <select
                                        value={selectedDepartmentId}
                                        onChange={handleDepartmentChange}
                                        disabled={
                                            loading ||
                                            filteredDepartments.length === 0
                                        }
                                    >
                                        <option value="">
                                            {filteredDepartments.length > 0
                                                ? "Select a department"
                                                : "No available departments match filter criteria"}
                                        </option>
                                        {filteredDepartments.map((dept) => (
                                            <option
                                                key={dept.id}
                                                value={dept.id}
                                            >
                                                {dept.name} ({dept.code}) -{" "}
                                                {dept.hospital.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {filteredDepartments.length > 0 && (
                                <p className="help has-text-info">
                                    {filteredDepartments.length} departments
                                    available
                                </p>
                            )}
                        </div>

                        <div className="field">
                            <div className="control">
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isPrimary}
                                        onChange={(e) =>
                                            setIsPrimary(e.target.checked)
                                        }
                                        disabled={loading}
                                    />
                                    &nbsp;Set as primary department
                                </label>
                            </div>
                            <p className="help">
                                A ward must have one primary department. This is
                                used for default views and assignments.
                            </p>
                        </div>

                        <div className="field">
                            <div className="control">
                                <button
                                    className={`button is-primary ${loading ? "is-loading" : ""}`}
                                    onClick={handleAddDepartment}
                                    disabled={loading || !selectedDepartmentId}
                                >
                                    Assign Department
                                </button>
                            </div>
                        </div>

                        {filteredDepartments.length === 0 &&
                            enhancedDepartments.every((dept) =>
                                currentWardDepartments.some(
                                    (assignment) =>
                                        assignment.department.id === dept.id,
                                ),
                            ) && (
                                <p className="help has-text-info">
                                    All departments have been assigned to this
                                    ward.
                                </p>
                            )}
                    </div>

                    {/* Current assignments section */}
                    <div className="mt-4">
                        <h5 className="title is-6">
                            Current Department Assignments
                        </h5>

                        {loading ? (
                            <LoadingSpinner />
                        ) : currentWardDepartments.length === 0 ? (
                            <div className="notification is-warning is-light">
                                <p>
                                    This ward is not assigned to any
                                    departments.
                                </p>
                            </div>
                        ) : (
                            <table className="table is-fullwidth is-striped">
                                <thead>
                                    <tr>
                                        <th>Department</th>
                                        <th>Hospital</th>
                                        <th>Primary</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentWardDepartments.map(
                                        (assignment) => {
                                            // Find the enhanced department to get hospital info
                                            const enhancedDept =
                                                enhancedDepartments.find(
                                                    (dept) =>
                                                        dept.id ===
                                                        assignment.department
                                                            .id,
                                                );

                                            return (
                                                <tr key={assignment.id}>
                                                    <td>
                                                        <div className="is-flex is-align-items-center">
                                                            <span
                                                                className="mr-2"
                                                                style={{
                                                                    width: "12px",
                                                                    height: "12px",
                                                                    backgroundColor:
                                                                        assignment
                                                                            .department
                                                                            .color,
                                                                    borderRadius:
                                                                        "50%",
                                                                    display:
                                                                        "inline-block",
                                                                }}
                                                            ></span>
                                                            <span>
                                                                {
                                                                    assignment
                                                                        .department
                                                                        .name
                                                                }
                                                                <span className="has-text-grey ml-1">
                                                                    (
                                                                    {
                                                                        assignment
                                                                            .department
                                                                            .code
                                                                    }
                                                                    )
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {enhancedDept?.hospital
                                                            ?.name ||
                                                            "Unknown Hospital"}
                                                        {enhancedDept?.hospital
                                                            ?.organization
                                                            ?.name && (
                                                            <span className="has-text-grey is-size-7 ml-1">
                                                                (
                                                                {
                                                                    enhancedDept
                                                                        .hospital
                                                                        .organization
                                                                        .name
                                                                }
                                                                )
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {assignment.isPrimary ? (
                                                            <span className="tag is-primary">
                                                                Primary
                                                            </span>
                                                        ) : (
                                                            <button
                                                                className="button is-small"
                                                                onClick={() =>
                                                                    handleSetPrimary(
                                                                        assignment.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    loading
                                                                }
                                                            >
                                                                Set as Primary
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="button is-small is-danger"
                                                            onClick={() =>
                                                                handleRemoveDepartment(
                                                                    assignment.id,
                                                                )
                                                            }
                                                            disabled={loading}
                                                        >
                                                            <span className="icon is-small">
                                                                <i className="fas fa-trash"></i>
                                                            </span>
                                                            <span>Remove</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                <footer className="modal-card-foot">
                    <button
                        className="button"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
}
