// src/app/admin/components/wards/WardModal.tsx
import { useEffect, useState } from "react";
import { useWards, Ward } from "@/context/WardContext";

type WardModalProps = {
    isOpen: boolean;
    mode: "add" | "edit";
    ward: Ward | null;
    onClose: () => void;
    onSave: (ward: Ward) => void;
    departmentId?: string; // Optional pre-selected department
};

export default function WardModal({
    isOpen,
    mode,
    ward,
    onClose,
    onSave,
    departmentId,
}: WardModalProps) {
    const { departments, hospitals } = useWards();

    // Default empty ward
    const emptyWard: Ward = {
        id: "",
        name: "",
        code: "",
        department: { id: "", name: "" },
        hospital: { id: "", name: "" },
        bedCount: 0,
        active: true,
    };

    const [formData, setFormData] = useState<Ward>(emptyWard);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (mode === "edit" && ward) {
            setFormData({
                ...ward,
            });
        } else {
            // Reset form for add mode
            const initialWard = {
                ...emptyWard,
            };

            // If departmentId is provided, pre-select that department
            if (departmentId) {
                const selectedDept = departments.find(
                    (d) => d.id === departmentId,
                );
                if (selectedDept) {
                    initialWard.department = {
                        id: selectedDept.id,
                        name: selectedDept.name,
                    };

                    // If department has a hospital, also pre-select that
                    if (selectedDept.hospital) {
                        initialWard.hospital = selectedDept.hospital;
                    }
                }
            } else if (departments.length > 0) {
                // Otherwise, just select the first department
                const firstDept = departments[0];
                initialWard.department = {
                    id: firstDept.id,
                    name: firstDept.name,
                };

                // And its hospital if available
                if (firstDept.hospital) {
                    initialWard.hospital = firstDept.hospital;
                }
            }

            setFormData(initialWard);
        }
        setFormError("");
        setIsSubmitting(false);
    }, [mode, ward, departments, hospitals, isOpen, departmentId]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;

        if (name === "departmentId") {
            const selectedDept = departments.find((d) => d.id === value);
            if (selectedDept) {
                const updates: Partial<Ward> = {
                    department: {
                        id: selectedDept.id,
                        name: selectedDept.name,
                    },
                };

                // If department has a hospital, also update that
                if (selectedDept.hospital) {
                    updates.hospital = selectedDept.hospital;
                }

                setFormData({
                    ...formData,
                    ...updates,
                });
            }
        } else if (name === "hospitalId") {
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
            setFormError("Ward name is required");
            return false;
        }

        if (!formData.code.trim()) {
            setFormError("Ward code is required");
            return false;
        }

        if (!formData.department?.id) {
            setFormError("Department is required");
            return false;
        }

        if (!formData.hospital?.id) {
            setFormError("Hospital is required");
            return false;
        }

        if (formData.bedCount < 0) {
            setFormError("Bed count must be 0 or higher");
            return false;
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

        // Save the ward
        try {
            onSave(formData);
        } catch (error) {
            console.error("Error saving ward:", error);
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
                        {mode === "add" ? "Add New Ward" : "Edit Ward"}
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
                                    <label className="label">Ward Name</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter ward name"
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
                                            placeholder="Ward code"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="columns">
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">Department</label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select
                                                name="departmentId"
                                                value={
                                                    formData.department?.id ||
                                                    ""
                                                }
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">
                                                    Select department
                                                </option>
                                                {departments.map((dept) => (
                                                    <option
                                                        key={dept.id}
                                                        value={dept.id}
                                                    >
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Bed Count</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    name="bedCount"
                                    value={formData.bedCount}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                        </div>

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
                            {mode === "add" ? "Add Ward" : "Save Changes"}
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
