// src/app/admin/components/departments/DepartmentModal.tsx
import { useEffect, useState } from "react";
import { Department, useDepartments } from "@/context/DepartmentContext";

type DepartmentModalProps = {
    isOpen: boolean;
    mode: "add" | "edit";
    department: Department | null;
    onClose: () => void;
    onSave: (department: Department) => void;
    parentDepartment?: Department | null;
};

export default function DepartmentModal({
    isOpen,
    mode,
    department,
    onClose,
    onSave,
    parentDepartment = null,
}: DepartmentModalProps) {
    const { hospitals, departmentTypes, departments } = useDepartments();

    // Default empty department
    const emptyDepartment: Department = {
        id: "",
        name: "",
        code: "",
        description: "",
        type: "pharmacy",
        color: "#3273dc",
        hospital: { id: "", name: "" },
        parent: parentDepartment,
        requiresLunchCover: false,
        pharmacistCount: 0,
        technicianCount: 0,
        active: true,
    };

    const [formData, setFormData] = useState<Department>(emptyDepartment);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Additional state for showing special fields based on department type
    const [showSpecialFields, setShowSpecialFields] = useState(false);

    useEffect(() => {
        if (mode === "edit" && department) {
            setFormData({
                ...department,
            });
            // Set special fields visibility based on department type
            setShowSpecialFields(
                department.type === "inpatient" ||
                    department.type === "outpatient" ||
                    department.type === "pharmacy",
            );
        } else {
            // Reset form for add mode
            const initialDepartment = {
                ...emptyDepartment,
                parent: parentDepartment,
                hospital:
                    hospitals.length > 0
                        ? { id: hospitals[0].id, name: hospitals[0].name }
                        : { id: "", name: "" },
                // If we're adding to a parent, use the parent's hospital
                ...(parentDepartment &&
                    parentDepartment.hospital && {
                        hospital: parentDepartment.hospital,
                    }),
            };

            setFormData(initialDepartment);
            // Set default special fields visibility
            setShowSpecialFields(false);
        }
        setFormError("");
        setIsSubmitting(false);
    }, [mode, department, hospitals, isOpen, parentDepartment]);

    // Get root departments (for parent dropdown)
    const rootDepartments = departments.filter((dept) => !dept.parent);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value, type } = e.target;

        if (name === "hospitalId") {
            const selectedHospital = hospitals.find((h) => h.id === value);
            if (selectedHospital) {
                setFormData({
                    ...formData,
                    hospital: {
                        id: selectedHospital.id,
                        name: selectedHospital.name,
                    },
                });
            }
        } else if (name === "parentId") {
            if (value === "") {
                // No parent selected
                setFormData({
                    ...formData,
                    parent: null,
                });
            } else {
                const selectedParent = departments.find((d) => d.id === value);
                if (selectedParent) {
                    setFormData({
                        ...formData,
                        parent: {
                            id: selectedParent.id,
                            name: selectedParent.name,
                        },
                        // Also update hospital to match parent's hospital
                        hospital: selectedParent.hospital,
                    });
                }
            }
        } else if (name === "type") {
            // Update special fields visibility when type changes
            setShowSpecialFields(
                value === "inpatient" ||
                    value === "outpatient" ||
                    value === "pharmacy",
            );

            setFormData({
                ...formData,
                [name]: value,
            });
        } else {
            setFormData({
                ...formData,
                [name]:
                    type === "checkbox"
                        ? (e.target as HTMLInputElement).checked
                        : type === "number"
                          ? parseInt(value)
                          : value,
            });
        }
    };

    const validateForm = () => {
        // Validate required fields
        if (!formData.name.trim()) {
            setFormError("Department name is required");
            return false;
        }

        if (!formData.code.trim()) {
            setFormError("Department code is required");
            return false;
        }

        if (!formData.type) {
            setFormError("Department type is required");
            return false;
        }

        if (!formData.hospital?.id) {
            setFormError("Hospital is required");
            return false;
        }

        // Check for special fields if department is inpatient/outpatient
        if (formData.type === "inpatient" || formData.type === "outpatient") {
            if (
                formData.pharmacistCount === undefined ||
                formData.pharmacistCount < 0
            ) {
                setFormError("Pharmacist count must be 0 or higher");
                return false;
            }

            if (
                formData.technicianCount === undefined ||
                formData.technicianCount < 0
            ) {
                setFormError("Technician count must be 0 or higher");
                return false;
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

        // Save the department
        try {
            onSave(formData);
        } catch (error) {
            console.error("Error saving department:", error);
            setFormError("An error occurred while saving. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? "is-active" : ""}`}>
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">
                        {mode === "add"
                            ? "Add New Department"
                            : "Edit Department"}
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
                                    type="button"
                                    className="delete"
                                    onClick={() => setFormError("")}
                                ></button>
                                {formError}
                            </div>
                        )}

                        <div className="columns">
                            <div className="column is-8">
                                <div className="field">
                                    <label className="label">
                                        Department Name
                                    </label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter department name"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="column is-4">
                                <div className="field">
                                    <label className="label">Code</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            placeholder="Department code"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Description</label>
                            <div className="control">
                                <textarea
                                    className="textarea"
                                    name="description"
                                    value={formData.description || ""}
                                    onChange={handleInputChange}
                                    placeholder="Department description"
                                    rows={2}
                                ></textarea>
                            </div>
                        </div>

                        <div className="columns">
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">Hospital</label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                name="hospitalId"
                                                value={
                                                    formData.hospital?.id || ""
                                                }
                                                onChange={handleInputChange}
                                                required
                                                disabled={!!formData.parent} // Disable if parent is selected
                                            >
                                                <option value="">
                                                    Select hospital
                                                </option>
                                                {hospitals.map((hospital) => (
                                                    <option
                                                        key={hospital.id}
                                                        value={hospital.id}
                                                    >
                                                        {hospital.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {formData.parent && (
                                            <p className="help">
                                                Hospital is determined by parent
                                                department
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">
                                        Department Type
                                    </label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">
                                                    Select type
                                                </option>
                                                {departmentTypes.map((type) => (
                                                    <option
                                                        key={type.id}
                                                        value={type.id}
                                                    >
                                                        {type.name}
                                                    </option>
                                                ))}
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
                                        Parent Department
                                    </label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                name="parentId"
                                                value={
                                                    formData.parent?.id || ""
                                                }
                                                onChange={handleInputChange}
                                                // Disable if this is an edit and we have children
                                                disabled={
                                                    mode === "edit" &&
                                                    department?.children &&
                                                    department.children.length >
                                                        0
                                                }
                                            >
                                                <option value="">
                                                    No Parent (Top-Level)
                                                </option>
                                                {rootDepartments
                                                    .filter(
                                                        (d) =>
                                                            d.id !==
                                                            formData.id,
                                                    ) // Prevent selecting self as parent
                                                    .map((dept) => (
                                                        <option
                                                            key={dept.id}
                                                            value={dept.id}
                                                        >
                                                            {dept.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        {mode === "edit" &&
                                            department?.children &&
                                            department.children.length > 0 && (
                                                <p className="help">
                                                    Cannot change parent when
                                                    department has
                                                    subdepartments
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </div>

                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">Color</label>
                                    <div className="control has-icons-left">
                                        <input
                                            className="input"
                                            type="color"
                                            name="color"
                                            value={formData.color || "#3273dc"}
                                            onChange={handleInputChange}
                                        />
                                        <span className="icon is-small is-left">
                                            <i className="fas fa-palette"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Special fields for inpatient/outpatient pharmacy */}
                        {showSpecialFields && (
                            <div className="box mt-4">
                                <h4 className="title is-5 mb-3">
                                    Special Settings
                                </h4>

                                <div className="field">
                                    <div className="control">
                                        <label className="checkbox">
                                            <input
                                                type="checkbox"
                                                name="requiresLunchCover"
                                                checked={
                                                    formData.requiresLunchCover ||
                                                    false
                                                }
                                                onChange={handleInputChange}
                                            />
                                            &nbsp;Requires Lunch Cover
                                        </label>
                                    </div>
                                </div>

                                <div className="columns">
                                    <div className="column is-6">
                                        <div className="field">
                                            <label className="label">
                                                Pharmacist Count
                                            </label>
                                            <div className="control">
                                                <input
                                                    className="input"
                                                    type="number"
                                                    name="pharmacistCount"
                                                    value={
                                                        formData.pharmacistCount ||
                                                        0
                                                    }
                                                    onChange={handleInputChange}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="column is-6">
                                        <div className="field">
                                            <label className="label">
                                                Technician Count
                                            </label>
                                            <div className="control">
                                                <input
                                                    className="input"
                                                    type="number"
                                                    name="technicianCount"
                                                    value={
                                                        formData.technicianCount ||
                                                        0
                                                    }
                                                    onChange={handleInputChange}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="field mt-4">
                            <div className="control">
                                <label className="checkbox">
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
                    </section>

                    <footer className="modal-card-foot">
                        <button
                            type="submit"
                            className={`button is-primary ${isSubmitting ? "is-loading" : ""}`}
                            disabled={isSubmitting}
                        >
                            {mode === "add" ? "Add Department" : "Save Changes"}
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
