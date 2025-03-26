import React, { useEffect, useState } from "react";
import { Department, useDepartments } from "@/context/DepartmentContext";
import { Hospital } from "@/context/HospitalContext";

interface DepartmentModalProps {
    isOpen: boolean;
    mode: "add" | "edit";
    department: Department | null;
    organisationName?: string;
    availableHospitals: Hospital[];
    selectedHospitalId: string;
    onHospitalChange: (hospitalId: string) => void;
    onClose: () => void;
    onSave: (department: Department) => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
    isOpen,
    mode,
    department,
    availableHospitals,
    selectedHospitalId,
    onHospitalChange,
    onClose,
    onSave,
}) => {
    const { departmentTypes } = useDepartments();

    // Initialize form state
    const [formData, setFormData] = useState<Department>({
        id: "",
        name: "",
        code: "",
        description: "",
        type: "",
        color: "#1a73e8", // Default blue color
        active: true,
        uniqueProperties: {
            requiresLunchCover: false,
            pharmacistCount: 0,
            technicianCount: 0,
        },
    });

    // Reset form when modal opens with a department or for adding
    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && department) {
                // For editing, use the provided department
                setFormData({
                    ...department,
                    // Ensure uniqueProperties exists
                    uniqueProperties: department.uniqueProperties || {
                        requiresLunchCover: false,
                        pharmacistCount: 0,
                        technicianCount: 0,
                    },
                });
            } else {
                // For adding, reset to defaults
                setFormData({
                    id: "",
                    name: "",
                    code: "",
                    description: "",
                    type:
                        departmentTypes.length > 0 ? departmentTypes[0].id : "",
                    color: "#1a73e8",
                    active: true,
                    uniqueProperties: {
                        requiresLunchCover: false,
                        pharmacistCount: 0,
                        technicianCount: 0,
                    },
                });
            }
        }
    }, [isOpen, mode, department, departmentTypes]);

    // Handle form input changes
    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle checkbox changes
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData({ ...formData, [name]: checked });
    };

    // Handle unique properties changes
    const handleUniquePropertyChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;
        const newValue =
            type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : type === "number"
                  ? parseInt(value, 10)
                  : value;

        setFormData({
            ...formData,
            uniqueProperties: {
                ...formData.uniqueProperties,
                [name]: newValue,
            },
        });
    };

    // Handle hospital selection change
    // const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     onHospitalChange(e.target.value);
    // };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    // Find the current hospital name if available
    // const getCurrentHospitalName = () => {
    //     if (!selectedHospitalId) return "None";
    //
    //     const hospital = availableHospitals.find(
    //         (h) => h.id === selectedHospitalId,
    //     );
    //     return hospital ? hospital.name : "Unknown Hospital";
    // };

    if (!isOpen) return null;

    return (
        <div className="modal is-active">
            <div className="modal-background" onClick={onClose}></div>
            <div
                className="modal-card"
                style={{ maxWidth: "800px", width: "100%" }}
            >
                <header className="modal-card-head">
                    <p className="modal-card-title">
                        {mode === "add"
                            ? "Add New Department"
                            : `Edit Department: ${department?.name}`}
                    </p>
                    <button
                        className="delete"
                        aria-label="close"
                        onClick={onClose}
                    ></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <section className="modal-card-body">
                        <div className="columns">
                            <div className="column is-6">
                                {/* Basic Information */}
                                <h4 className="title is-5">
                                    Basic Information
                                </h4>

                                <div className="field">
                                    <label className="label">
                                        Department Name*
                                    </label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="name"
                                            placeholder="Department Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="label">Code*</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="code"
                                            placeholder="Department Code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <p className="help">
                                        A unique code for this department
                                    </p>
                                </div>

                                {/* Hospital selection */}
                                <div className="field">
                                    <label className="label">Hospital *</label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                value={selectedHospitalId} // This should match what we're setting in handleEditDepartment
                                                onChange={(e) =>
                                                    onHospitalChange(
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            >
                                                <option value="" disabled>
                                                    Select Hospital
                                                </option>
                                                {availableHospitals.map(
                                                    (hospital) => (
                                                        <option
                                                            key={hospital.id}
                                                            value={String(
                                                                hospital.id,
                                                            )}
                                                        >
                                                            {hospital.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="label">Description</label>
                                    <div className="control">
                                        <textarea
                                            className="textarea"
                                            name="description"
                                            placeholder="Department Description"
                                            value={formData.description || ""}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="label">Type*</label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">
                                                    Select Type
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

                                <div className="field">
                                    <label className="label">Color</label>
                                    <div className="control">
                                        <input
                                            type="color"
                                            name="color"
                                            value={formData.color || "#1a73e8"}
                                            onChange={handleInputChange}
                                            className="input"
                                            style={{ height: "40px" }}
                                        />
                                    </div>
                                    <p className="help">
                                        Choose a color for this department
                                    </p>
                                </div>

                                <div className="field">
                                    <label className="checkbox">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            checked={formData.active}
                                            onChange={handleCheckboxChange}
                                        />{" "}
                                        Active
                                    </label>
                                </div>
                            </div>

                            <div className="column is-6">
                                {/* Special Properties */}
                                <h4 className="title is-5">
                                    Special Properties
                                </h4>

                                <div className="field">
                                    <label className="checkbox">
                                        <input
                                            type="checkbox"
                                            name="requiresLunchCover"
                                            checked={
                                                formData.uniqueProperties
                                                    ?.requiresLunchCover ||
                                                false
                                            }
                                            onChange={
                                                handleUniquePropertyChange
                                            }
                                        />{" "}
                                        Requires Lunch Cover
                                    </label>
                                </div>

                                <div className="field">
                                    <label className="label">
                                        Pharmacist Count
                                    </label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="number"
                                            name="pharmacistCount"
                                            min="0"
                                            placeholder="Number of Pharmacists"
                                            value={
                                                formData.uniqueProperties
                                                    ?.pharmacistCount || 0
                                            }
                                            onChange={
                                                handleUniquePropertyChange
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="label">
                                        Technician Count
                                    </label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="number"
                                            name="technicianCount"
                                            min="0"
                                            placeholder="Number of Technicians"
                                            value={
                                                formData.uniqueProperties
                                                    ?.technicianCount || 0
                                            }
                                            onChange={
                                                handleUniquePropertyChange
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <footer className="modal-card-foot">
                        <button className="button is-primary" type="submit">
                            {mode === "add" ? "Add Department" : "Save Changes"}
                        </button>
                        <button
                            className="button"
                            type="button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default DepartmentModal;
