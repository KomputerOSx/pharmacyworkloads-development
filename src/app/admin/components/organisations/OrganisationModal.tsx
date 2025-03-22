// src/app/admin/components/organisations/OrganisationModal.tsx
import { useEffect, useState } from "react";
import { Organisation } from "@/context/OrganisationContext";
import { getOrganisationTypes } from "@/services/organisationService";

type OrganisationModalProps = {
    isOpen: boolean;
    mode: "add" | "edit";
    organisation: Organisation | null;
    onClose: () => void;
    onSave: (org: Organisation) => void;
};

export default function OrganisationModal({
    isOpen,
    mode,
    organisation,
    onClose,
    onSave,
}: OrganisationModalProps) {
    const [formData, setFormData] = useState<Organisation>({
        id: "",
        name: "",
        type: "NHS Trust",
        contactEmail: "",
        contactPhone: "",
        active: true,
        hospitalCount: 0,
    });
    const [formError, setFormError] = useState("");
    const [organisationTypes, setOrganisationTypes] = useState<
        { id: string; name: string }[]
    >([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Load organisation types
        setOrganisationTypes(getOrganisationTypes());

        if (mode === "edit" && organisation) {
            setFormData({
                ...organisation,
            });
        } else {
            // Reset form for add mode
            setFormData({
                id: "",
                name: "",
                type: "NHS Trust",
                contactEmail: "",
                contactPhone: "",
                active: true,
                hospitalCount: 0,
            });
        }
        setFormError("");
        setIsSubmitting(false);
    }, [mode, organisation, isOpen]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;

        setFormData({
            ...formData,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        });
    };

    const validateForm = (): boolean => {
        // Name validation
        if (!formData.name.trim()) {
            setFormError("Organisation name is required");
            return false;
        }

        // Email validation
        if (!formData.contactEmail.trim()) {
            setFormError("Contact email is required");
            return false;
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contactEmail.trim())) {
            setFormError("Please enter a valid email address");
            return false;
        }

        // Type validation
        if (!formData.type) {
            setFormError("Organisation type is required");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Save the organisation
            await onSave(formData);
        } catch (error) {
            console.error("Error saving organisation:", error);
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
                            ? "Add New Organisation"
                            : "Edit Organisation"}
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

                        <div className="field">
                            <label className="label">Organisation Name</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter organisation name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Type</label>
                            <div className="control">
                                <div className="select is-fullwidth">
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select type</option>
                                        {organisationTypes.map((type) => (
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
                            <label className="label">Contact Email</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="email"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                    placeholder="Enter contact email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Contact Phone</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleInputChange}
                                    placeholder="Enter contact phone"
                                />
                            </div>
                        </div>

                        <div className="field">
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
                            {mode === "add"
                                ? "Add Organisation"
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
