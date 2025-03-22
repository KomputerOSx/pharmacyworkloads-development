// src/app/admin/components/hospitals/HospitalModal.tsx
import React, { useEffect, useState } from "react";
import { Hospital, useHospitals } from "@/context/HospitalContext";

type HospitalModalProps = {
    isOpen: boolean;
    mode: "add" | "edit";
    hospital: Hospital | null;
    onClose: () => void;
    onSave: (hospital: Hospital) => void;
};

export default function HospitalModal({
    isOpen,
    mode,
    hospital,
    onClose,
    onSave,
}: HospitalModalProps) {
    const { organisation } = useHospitals();

    // Define a proper empty hospital without organisation
    const emptyHospital: Omit<Hospital, "id"> = {
        name: "",
        address: "",
        city: "",
        postcode: "",
        contactNumber: "",
        contactEmail: "",
        beds: 0,
        active: true,
    };

    const [formData, setFormData] =
        useState<Omit<Hospital, "id">>(emptyHospital);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (mode === "edit" && hospital) {
            setFormData({
                ...hospital,
            });
        } else {
            // Reset form for add mode
            setFormData({
                ...emptyHospital,
            });
        }
        setFormError("");
        setIsSubmitting(false);
    }, [mode, hospital, isOpen]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;

        setFormData({
            ...formData,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : type === "number"
                      ? parseInt(value)
                      : value,
        });
    };

    const validateForm = () => {
        // Validate required fields
        if (!formData.name.trim()) {
            setFormError("Hospital name is required");
            return false;
        }

        if (!formData.address.trim()) {
            setFormError("Address is required");
            return false;
        }

        if (!formData.city.trim()) {
            setFormError("City is required");
            return false;
        }

        if (!formData.postcode.trim()) {
            setFormError("Postcode is required");
            return false;
        }

        // Validate email if provided
        if (formData.contactEmail && !validateEmail(formData.contactEmail)) {
            setFormError("Please enter a valid email address");
            return false;
        }

        return true;
    };

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Save the hospital
        try {
            // The organisation is provided by the context and handled by the addNewHospital/updateExistingHospital
            // functions, so we don't need to include it in the form data
            onSave(formData as Hospital);
        } catch (error) {
            console.error("Error saving hospital:", error);
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
                        {mode === "add" ? "Add New Hospital" : "Edit Hospital"}
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
                                    onClick={() => setFormError("")}
                                ></button>
                                {formError}
                            </div>
                        )}

                        {/* Display current organisation info */}
                        <div className="notification is-info is-light mb-4">
                            <p className="is-size-6">
                                <strong>Organisation:</strong>{" "}
                                {organisation?.name || "Unknown"}
                            </p>
                        </div>

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
                                    required
                                />
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
                                            required
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
                                            required
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
                                            required
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
                                            min="0"
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
                        <button
                            type="submit"
                            className={`button is-primary ${isSubmitting ? "is-loading" : ""}`}
                            disabled={isSubmitting}
                        >
                            {mode === "add" ? "Add Hospital" : "Save Changes"}
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
