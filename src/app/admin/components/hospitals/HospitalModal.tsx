import { useEffect, useState } from "react";
import { Hospital, Organization } from "../HospitalManagement";

type HospitalModalProps = {
    isOpen: boolean;
    mode: "add" | "edit";
    hospital: Hospital | null;
    organizations: Organization[];
    onClose: () => void;
    onSave: (hospital: Hospital) => void;
};

export default function HospitalModal({
    isOpen,
    mode,
    hospital,
    organizations,
    onClose,
    onSave,
}: HospitalModalProps) {
    const emptyHospital: Hospital = {
        id: "",
        name: "",
        organization: { id: "", name: "" },
        address: "",
        city: "",
        postcode: "",
        contactNumber: "",
        contactEmail: "",
        beds: 0,
        active: true,
        departments: 0,
        wards: 0,
        staff: 0,
    };

    const [formData, setFormData] = useState<Hospital>(emptyHospital);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (mode === "edit" && hospital) {
            setFormData({
                ...hospital,
            });
        } else {
            // Reset form for add mode
            setFormData({
                ...emptyHospital,
                organization:
                    organizations.length > 0
                        ? {
                              id: organizations[0].id,
                              name: organizations[0].name,
                          }
                        : { id: "", name: "" },
            });
        }
        setFormError("");
    }, [mode, hospital, organizations, isOpen]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!formData.name || !formData.organization.id) {
            setFormError("Hospital name and organization are required");
            return;
        }

        // Save the hospital
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? "is-active" : ""}`}>
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">
                        {mode === "add" ? "Add New Hospital" : "Edit Hospital"}
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
                            <label className="label">Hospital Name</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter hospital name"
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Organization</label>
                            <div className="control">
                                <div className="select is-fullwidth">
                                    <select
                                        name="organizationId"
                                        value={formData.organization.id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">
                                            Select an organization
                                        </option>
                                        {organizations.map((org) => (
                                            <option key={org.id} value={org.id}>
                                                {org.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="columns">
                            <div className="column">
                                <div className="field">
                                    <label className="label">Address</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Street address"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="field">
                                    <label className="label">City</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="columns">
                            <div className="column">
                                <div className="field">
                                    <label className="label">Postcode</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            name="postcode"
                                            value={formData.postcode}
                                            onChange={handleInputChange}
                                            placeholder="Postcode"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="field">
                                    <label className="label">Beds</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="number"
                                            name="beds"
                                            value={formData.beds}
                                            onChange={handleInputChange}
                                            placeholder="Number of beds"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Contact Number</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    placeholder="Contact phone number"
                                />
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
                                    placeholder="Contact email address"
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
                            {mode === "add" ? "Add Hospital" : "Save Changes"}
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
