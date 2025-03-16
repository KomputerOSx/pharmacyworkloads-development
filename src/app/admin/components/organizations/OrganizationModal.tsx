import { useEffect, useState } from "react";
import { Organization } from "../OrganizationManagement";

type OrganizationModalProps = {
    isOpen: boolean;
    mode: "add" | "edit";
    organization: Organization | null;
    onClose: () => void;
    onSave: (org: Organization) => void;
};

export default function OrganizationModal({
    isOpen,
    mode,
    organization,
    onClose,
    onSave,
}: OrganizationModalProps) {
    const [formData, setFormData] = useState<Organization>({
        id: "",
        name: "",
        type: "NHS Trust",
        contactEmail: "",
        contactPhone: "",
        active: true,
        hospitalCount: 0,
    });
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (mode === "edit" && organization) {
            setFormData({
                ...organization,
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
    }, [mode, organization, isOpen]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!formData.name || !formData.contactEmail) {
            setFormError("Name and contact email are required");
            return;
        }

        // Save the organization
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? "is-active" : ""}`}>
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">
                        {mode === "add"
                            ? "Add New Organization"
                            : "Edit Organization"}
                    </p>
                    <button
                        className="delete"
                        aria-label="close"
                        onClick={onClose}
                    ></button>
                </header>

                <form onSubmit={handleSubmit}>
                    <section className="modal-card-body">
                        {formError && (
                            <div className="notification is-danger">
                                <button
                                    className="delete"
                                    onClick={() => setFormError("")}
                                ></button>
                                {formError}
                            </div>
                        )}

                        <div className="field">
                            <label className="label">Organization Name</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter organization name"
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
                                    >
                                        <option value="NHS Trust">
                                            NHS Trust
                                        </option>
                                        <option value="NHS Foundation Trust">
                                            NHS Foundation Trust
                                        </option>
                                        <option value="Private Healthcare">
                                            Private Healthcare
                                        </option>
                                        <option value="Community Healthcare">
                                            Community Healthcare
                                        </option>
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
                        <button type="submit" className="button is-primary">
                            {mode === "add"
                                ? "Add Organization"
                                : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            className="button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
