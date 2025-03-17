// src/app/admin/components/staff/StaffModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    departmentRoles,
    nhsBands,
    Staff,
    trainingOptions,
    useStaff,
    WorkingDay,
} from "@/context/StaffContext";

type StaffModalProps = {
    isOpen: boolean;
    mode: "add" | "edit";
    staff: Staff | null;
    onClose: () => void;
    onSave: (staff: Staff) => void;
};

export default function StaffModal({
    isOpen,
    mode,
    staff,
    onClose,
    onSave,
}: StaffModalProps) {
    const { organizations, hospitals, departments, staffRoles } = useStaff();

    // Default empty staff
    const emptyStaff = useMemo(
        () => ({
            id: "",
            name: "",
            email: "",
            phone: "",
            primaryRole: { id: "", name: "" },
            departmentRole: { id: "staff", name: "Staff" },
            nhsBand: "",
            organization: { id: "", name: "" },
            defaultHospital: { id: "", name: "" },
            departments: [],
            usualWorkingHours: {
                monday: { start: "09:00", end: "17:00" },
                tuesday: { start: "09:00", end: "17:00" },
                wednesday: { start: "09:00", end: "17:00" },
                thursday: { start: "09:00", end: "17:00" },
                friday: { start: "09:00", end: "17:00" },
                saturday: null,
                sunday: null,
            },
            additionalTraining: [],
            startDate: new Date().toISOString().split("T")[0],
            active: true,
        }),
        [],
    );

    const [formData, setFormData] = useState<Staff>(emptyStaff);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "basic" | "departments" | "schedule" | "training"
    >("basic");

    // Multi-select state for departments
    const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<
        string[]
    >([]);

    // Multi-select state for training
    const [selectedTraining, setSelectedTraining] = useState<string[]>([]);

    useEffect(() => {
        if (mode === "edit" && staff) {
            setFormData({
                ...staff,
            });

            // Set selected departments for multi-select
            if (staff.departments) {
                setSelectedDepartmentIds(
                    staff.departments.map((dept) => dept.id),
                );
            }

            // Set selected training options
            if (staff.additionalTraining) {
                setSelectedTraining(staff.additionalTraining);
            }
        } else {
            // Reset form for add mode
            const initialStaff = {
                ...emptyStaff,
            };

            // Set defaults if we have data
            if (organizations.length > 0) {
                initialStaff.organization = {
                    id: organizations[0].id,
                    name: organizations[0].name,
                };
            }

            if (hospitals.length > 0) {
                initialStaff.defaultHospital = {
                    id: hospitals[0].id,
                    name: hospitals[0].name,
                };
            }

            if (staffRoles.length > 0) {
                initialStaff.primaryRole = {
                    id: staffRoles[0].id,
                    name: staffRoles[0].name,
                };
            }

            setFormData(initialStaff);
            setSelectedDepartmentIds([]);
            setSelectedTraining([]);
        }

        setFormError("");
        setIsSubmitting(false);
        setActiveTab("basic");
    }, [
        mode,
        staff,
        organizations,
        hospitals,
        departments,
        staffRoles,
        isOpen,
        emptyStaff,
    ]);

    // Fix for the handleInputChange function in StaffModal.tsx

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value, type } = e.target;

        if (name === "organizationId") {
            const selectedOrg = organizations.find((org) => org.id === value);
            if (selectedOrg) {
                setFormData({
                    ...formData,
                    organization: {
                        id: selectedOrg.id,
                        name: selectedOrg.name,
                    },
                });
            }
        } else if (name === "hospitalId") {
            const selectedHospital = hospitals.find((h) => h.id === value);
            if (selectedHospital) {
                setFormData({
                    ...formData,
                    defaultHospital: {
                        id: selectedHospital.id,
                        name: selectedHospital.name,
                    },
                });
            }
        } else if (name === "primaryRoleId") {
            const selectedRole = staffRoles.find((r) => r.id === value);
            if (selectedRole) {
                setFormData({
                    ...formData,
                    primaryRole: {
                        id: selectedRole.id,
                        name: selectedRole.name,
                    },
                });
            }
        } else if (name === "departmentRoleId") {
            const selectedRole = departmentRoles.find((r) => r.id === value);
            if (selectedRole) {
                setFormData({
                    ...formData,
                    departmentRole: {
                        id: selectedRole.id,
                        name: selectedRole.name,
                    },
                });
            }
        } else if (name.startsWith("workingHours.")) {
            // Handle working hours updates
            const parts = name.split(".");
            const day = parts[1] as WorkingDay;
            const field = parts[2];

            setFormData({
                ...formData,
                usualWorkingHours: {
                    ...formData.usualWorkingHours,
                    [day]: {
                        ...(formData.usualWorkingHours?.[day] || {}),
                        [field]: value,
                    },
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]:
                    type === "checkbox"
                        ? (e.target as HTMLInputElement).checked
                        : value,
            });
        }
    };

    // Handle department multi-select
    const handleDepartmentChange = (departmentId: string) => {
        let newSelectedDepartments: string[];

        // Toggle selection
        if (selectedDepartmentIds.includes(departmentId)) {
            newSelectedDepartments = selectedDepartmentIds.filter(
                (id) => id !== departmentId,
            );
        } else {
            newSelectedDepartments = [...selectedDepartmentIds, departmentId];
        }

        setSelectedDepartmentIds(newSelectedDepartments);

        // Update formData.departments
        const departmentObjects = newSelectedDepartments.map((id) => {
            const dept = departments.find((d) => d.id === id);
            return {
                id,
                name: dept?.name || "Unknown Department",
            };
        });

        setFormData({
            ...formData,
            departments: departmentObjects,
        });
    };

    // Handle training multi-select
    const handleTrainingChange = (trainingId: string) => {
        let newSelectedTraining: string[];

        // Toggle selection
        if (selectedTraining.includes(trainingId)) {
            newSelectedTraining = selectedTraining.filter(
                (id) => id !== trainingId,
            );
        } else {
            newSelectedTraining = [...selectedTraining, trainingId];
        }

        setSelectedTraining(newSelectedTraining);

        setFormData({
            ...formData,
            additionalTraining: newSelectedTraining,
        });
    };

    // Handle day off toggle
    const handleDayOffToggle = (day: string) => {
        const typedDay = day as WorkingDay;

        if (formData.usualWorkingHours?.[typedDay]) {
            // If the day has hours, set to null (day off)
            setFormData({
                ...formData,
                usualWorkingHours: {
                    ...formData.usualWorkingHours,
                    [typedDay]: null,
                },
            });
        } else {
            // If the day is null, set default hours (9-5)
            setFormData({
                ...formData,
                usualWorkingHours: {
                    ...formData.usualWorkingHours,
                    [typedDay]: { start: "09:00", end: "17:00" },
                },
            });
        }
    };

    const validateForm = () => {
        // Basic validation
        if (!formData.name.trim()) {
            setFormError("Name is required");
            setActiveTab("basic");
            return false;
        }

        if (!formData.email.trim()) {
            setFormError("Email is required");
            setActiveTab("basic");
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormError("Please enter a valid email address");
            setActiveTab("basic");
            return false;
        }

        if (!formData.primaryRole?.id) {
            setFormError("Primary role is required");
            setActiveTab("basic");
            return false;
        }

        if (!formData.organization?.id) {
            setFormError("Organization is required");
            setActiveTab("basic");
            return false;
        }

        if (!formData.defaultHospital?.id) {
            setFormError("Default hospital is required");
            setActiveTab("basic");
            return false;
        }

        // Validate working hours if any are set
        const daysOfWeek = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ];
        for (const day of daysOfWeek) {
            const typedDay = day as WorkingDay;
            const hours = formData.usualWorkingHours?.[typedDay];
            if (hours) {
                if (!hours.start || !hours.end) {
                    setFormError(
                        `Please enter both start and end time for ${day.charAt(0).toUpperCase() + day.slice(1)}`,
                    );
                    setActiveTab("schedule");
                    return false;
                }

                // Check if end time is after start time
                if (hours.start >= hours.end) {
                    setFormError(
                        `End time must be after start time for ${day.charAt(0).toUpperCase() + day.slice(1)}`,
                    );
                    setActiveTab("schedule");
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Save the staff member
        try {
            onSave(formData);
        } catch (error) {
            console.error("Error saving staff:", error);
            setFormError("An error occurred while saving. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? "is-active" : ""}`}>
            <div className="modal-background" onClick={onClose}></div>
            <div
                className="modal-card"
                style={{ maxWidth: "800px", width: "100%" }}
            >
                <header className="modal-card-head">
                    <p className="modal-card-title">
                        {mode === "add"
                            ? "Add New Staff Member"
                            : "Edit Staff Member"}
                    </p>
                    <button
                        className="delete"
                        aria-label="close"
                        onClick={onClose}
                        disabled={isSubmitting}
                    ></button>
                </header>

                <form onSubmit={handleSubmit}>
                    <section className="modal-card-body">
                        {formError && (
                            <div className="notification is-danger">
                                <button
                                    className="delete"
                                    type="button"
                                    onClick={() => setFormError("")}
                                ></button>
                                {formError}
                            </div>
                        )}

                        {/* Tabs for sections */}
                        <div className="tabs">
                            <ul>
                                <li
                                    className={
                                        activeTab === "basic" ? "is-active" : ""
                                    }
                                >
                                    <a onClick={() => setActiveTab("basic")}>
                                        <span className="icon is-small">
                                            <i className="fas fa-user"></i>
                                        </span>
                                        <span>Basic Info</span>
                                    </a>
                                </li>
                                <li
                                    className={
                                        activeTab === "departments"
                                            ? "is-active"
                                            : ""
                                    }
                                >
                                    <a
                                        onClick={() =>
                                            setActiveTab("departments")
                                        }
                                    >
                                        <span className="icon is-small">
                                            <i className="fas fa-hospital"></i>
                                        </span>
                                        <span>Departments</span>
                                    </a>
                                </li>
                                <li
                                    className={
                                        activeTab === "schedule"
                                            ? "is-active"
                                            : ""
                                    }
                                >
                                    <a onClick={() => setActiveTab("schedule")}>
                                        <span className="icon is-small">
                                            <i className="fas fa-calendar-alt"></i>
                                        </span>
                                        <span>Schedule</span>
                                    </a>
                                </li>
                                <li
                                    className={
                                        activeTab === "training"
                                            ? "is-active"
                                            : ""
                                    }
                                >
                                    <a onClick={() => setActiveTab("training")}>
                                        <span className="icon is-small">
                                            <i className="fas fa-graduation-cap"></i>
                                        </span>
                                        <span>Training</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Basic Info Tab */}
                        <div
                            className={activeTab === "basic" ? "" : "is-hidden"}
                        >
                            <div className="columns">
                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">
                                            Full Name
                                        </label>
                                        <div className="control has-icons-left">
                                            <input
                                                className="input"
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Enter full name"
                                                required
                                            />
                                            <span className="icon is-small is-left">
                                                <i className="fas fa-user"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Email</label>
                                        <div className="control has-icons-left">
                                            <input
                                                className="input"
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Enter email address"
                                                required
                                            />
                                            <span className="icon is-small is-left">
                                                <i className="fas fa-envelope"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="columns">
                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Phone</label>
                                        <div className="control has-icons-left">
                                            <input
                                                className="input"
                                                type="text"
                                                name="phone"
                                                value={formData.phone || ""}
                                                onChange={handleInputChange}
                                                placeholder="Enter phone number"
                                            />
                                            <span className="icon is-small is-left">
                                                <i className="fas fa-phone"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">
                                            Start Date
                                        </label>
                                        <div className="control has-icons-left">
                                            <input
                                                className="input"
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate || ""}
                                                onChange={handleInputChange}
                                            />
                                            <span className="icon is-small is-left">
                                                <i className="fas fa-calendar"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="columns">
                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">
                                            Primary Role
                                        </label>
                                        <div className="control">
                                            <div className="select is-fullwidth">
                                                <select
                                                    name="primaryRoleId"
                                                    value={
                                                        formData.primaryRole
                                                            ?.id || ""
                                                    }
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">
                                                        Select a role
                                                    </option>
                                                    {staffRoles.map((role) => (
                                                        <option
                                                            key={role.id}
                                                            value={role.id}
                                                        >
                                                            {role.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">
                                            Department Role
                                        </label>
                                        <div className="control">
                                            <div className="select is-fullwidth">
                                                <select
                                                    name="departmentRoleId"
                                                    value={
                                                        formData.departmentRole
                                                            ?.id || "staff"
                                                    }
                                                    onChange={handleInputChange}
                                                >
                                                    {departmentRoles.map(
                                                        (role) => (
                                                            <option
                                                                key={role.id}
                                                                value={role.id}
                                                            >
                                                                {role.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="columns">
                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">
                                            NHS Band
                                        </label>
                                        <div className="control">
                                            <div className="select is-fullwidth">
                                                <select
                                                    name="nhsBand"
                                                    value={
                                                        formData.nhsBand || ""
                                                    }
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">
                                                        Not Applicable
                                                    </option>
                                                    {nhsBands.map((band) => (
                                                        <option
                                                            key={band.id}
                                                            value={band.id}
                                                        >
                                                            {band.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <p className="help">
                                            Optional - Leave blank if not
                                            applicable
                                        </p>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <div className="control">
                                            <label className="checkbox mt-5">
                                                <input
                                                    type="checkbox"
                                                    name="active"
                                                    checked={formData.active}
                                                    onChange={handleInputChange}
                                                />
                                                &nbsp;Active
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="columns">
                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">
                                            Organization
                                        </label>
                                        <div className="control">
                                            <div className="select is-fullwidth">
                                                <select
                                                    name="organizationId"
                                                    value={
                                                        formData.organization
                                                            ?.id || ""
                                                    }
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">
                                                        Select an organization
                                                    </option>
                                                    {organizations.map(
                                                        (org) => (
                                                            <option
                                                                key={org.id}
                                                                value={org.id}
                                                            >
                                                                {org.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">
                                            Default Hospital
                                        </label>
                                        <div className="control">
                                            <div className="select is-fullwidth">
                                                <select
                                                    name="hospitalId"
                                                    value={
                                                        formData.defaultHospital
                                                            ?.id || ""
                                                    }
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">
                                                        Select a hospital
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
                        </div>

                        {/* Departments Tab */}
                        <div
                            className={
                                activeTab === "departments" ? "" : "is-hidden"
                            }
                        >
                            <div className="field">
                                <label className="label">
                                    Assigned Departments
                                </label>
                                <p className="help mb-3">
                                    Select the departments this staff member
                                    works in
                                </p>

                                <div className="columns is-multiline">
                                    {departments.map((dept) => (
                                        <div
                                            className="column is-4"
                                            key={dept.id}
                                        >
                                            <div className="field">
                                                <div className="control">
                                                    <label className="checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedDepartmentIds.includes(
                                                                dept.id,
                                                            )}
                                                            onChange={() =>
                                                                handleDepartmentChange(
                                                                    dept.id,
                                                                )
                                                            }
                                                        />
                                                        <span className="ml-2">
                                                            {dept.name}
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedDepartmentIds.length === 0 && (
                                    <p className="has-text-grey-light has-text-centered mt-4">
                                        No departments selected
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Schedule Tab */}
                        <div
                            className={
                                activeTab === "schedule" ? "" : "is-hidden"
                            }
                        >
                            <div className="field">
                                <label className="label">
                                    Usual Working Hours
                                </label>
                                <p className="help mb-3">
                                    Set the staff member&apos;s typical working
                                    schedule
                                </p>

                                <table className="table is-fullwidth">
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            "monday",
                                            "tuesday",
                                            "wednesday",
                                            "thursday",
                                            "friday",
                                            "saturday",
                                            "sunday",
                                        ].map((day) => (
                                            <tr key={day}>
                                                <td className="has-text-weight-medium">
                                                    {day
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        day.slice(1)}
                                                </td>
                                                {formData.usualWorkingHours?.[
                                                    day as WorkingDay
                                                ] ? (
                                                    <>
                                                        <td>
                                                            <input
                                                                className="input is-small"
                                                                type="time"
                                                                name={`workingHours.${day}.start`}
                                                                value={
                                                                    formData
                                                                        .usualWorkingHours[
                                                                        day as WorkingDay
                                                                    ]?.start ||
                                                                    ""
                                                                }
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className="input is-small"
                                                                type="time"
                                                                name={`workingHours.${day}.end`}
                                                                value={
                                                                    formData
                                                                        .usualWorkingHours[
                                                                        day as WorkingDay
                                                                    ]?.end || ""
                                                                }
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="button is-small is-danger is-light"
                                                                onClick={() =>
                                                                    handleDayOffToggle(
                                                                        day,
                                                                    )
                                                                }
                                                            >
                                                                Set as day off
                                                            </button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <td colSpan={3}>
                                                        <span className="tag is-light is-info">
                                                            Day Off
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="button is-small is-info is-light ml-4"
                                                            onClick={() =>
                                                                handleDayOffToggle(
                                                                    day,
                                                                )
                                                            }
                                                        >
                                                            Set working hours
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Training Tab */}
                        <div
                            className={
                                activeTab === "training" ? "" : "is-hidden"
                            }
                        >
                            <div className="field">
                                <label className="label">
                                    Additional Training & Specializations
                                </label>
                                <p className="help mb-3">
                                    Select all training and specializations
                                    completed by this staff member
                                </p>

                                <div className="columns is-multiline">
                                    {trainingOptions.map((training) => (
                                        <div
                                            className="column is-4"
                                            key={training.id}
                                        >
                                            <div className="field">
                                                <div className="control">
                                                    <label className="checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTraining.includes(
                                                                training.id,
                                                            )}
                                                            onChange={() =>
                                                                handleTrainingChange(
                                                                    training.id,
                                                                )
                                                            }
                                                        />
                                                        <span className="ml-2">
                                                            {training.name}
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedTraining.length === 0 && (
                                    <p className="has-text-grey-light has-text-centered mt-4">
                                        No additional training selected
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <footer className="modal-card-foot">
                        <button
                            type="submit"
                            className={`button is-primary ${isSubmitting ? "is-loading" : ""}`}
                            disabled={isSubmitting}
                        >
                            {mode === "add"
                                ? "Add Staff Member"
                                : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            className="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
