import React, { useState, useEffect } from "react";
import { Hospital } from "@/context/HospitalContext";

type HospitalDeleteModalProps = {
    isOpen: boolean;
    hospital: Hospital | null;
    organisationName?: string;
    onClose: () => void;
    onDelete: (hospital: Hospital) => void;
};

export function HospitalDeleteModal({
    isOpen,
    hospital,
    organisationName,
    onClose,
    onDelete,
}: HospitalDeleteModalProps) {
    // State for the name confirmation input
    const [nameConfirmation, setNameConfirmation] = useState("");

    // State for checkbox confirmations
    const [confirmUnderstand, setConfirmUnderstand] = useState(false);
    const [confirmPermanent, setConfirmPermanent] = useState(false);

    // State for form errors and submission status
    const [error, setError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Reset the form when the modal opens/closes or hospital changes
    useEffect(() => {
        setNameConfirmation("");
        setConfirmUnderstand(false);
        setConfirmPermanent(false);
        setError("");
        setIsDeleting(false);
    }, [isOpen, hospital]);

    // Check if the delete button should be enabled
    const isDeleteEnabled =
        hospital &&
        nameConfirmation === hospital.name &&
        confirmUnderstand &&
        confirmPermanent;

    // Handle the delete operation
    const handleDelete = async () => {
        if (!hospital) return;

        // Double-check all conditions are met
        if (!isDeleteEnabled) {
            setError("Please complete all confirmation steps before deleting");
            return;
        }

        try {
            setIsDeleting(true);
            setError("");
            await onDelete(hospital);
            // onClose will be called by the parent component after deletion completes
        } catch (err) {
            console.error("Error deleting hospital:", err);
            setError(
                "An error occurred while deleting the hospital. Please try again.",
            );
            setIsDeleting(false);
        }
    };

    if (!isOpen || !hospital) return null;

    return (
        <div className="modal is-active">
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head has-background-danger-light">
                    <p className="modal-card-title">
                        <span className="icon mr-2">
                            <i className="fas fa-exclamation-triangle"></i>
                        </span>
                        Delete Hospital
                    </p>
                    <button
                        className="delete"
                        aria-label="close"
                        onClick={onClose}
                        disabled={isDeleting}
                    ></button>
                </header>

                <section className="modal-card-body">
                    {error && (
                        <div className="notification is-danger">
                            <button
                                className="delete"
                                onClick={() => setError("")}
                            ></button>
                            {error}
                        </div>
                    )}

                    <div className="message is-warning mb-5">
                        <div className="message-header">
                            <p>Warning</p>
                        </div>
                        <div className="message-body">
                            <p className="has-text-weight-bold">
                                You are about to delete:
                            </p>
                            <p className="is-size-5 has-text-danger mb-3">
                                {hospital.name}
                            </p>

                            <p className="mt-3">
                                This action is irreversible and will remove all
                                data associated with this hospital.
                            </p>

                            {organisationName && (
                                <p className="mt-2">
                                    This hospital is currently assigned to{" "}
                                    <strong>{organisationName}</strong>.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">
                            To confirm deletion, type the hospital name exactly
                            as shown:
                            <span className="has-text-danger ml-1">
                                {hospital.name}
                            </span>
                        </label>
                        <div className="control">
                            <input
                                className={`input ${nameConfirmation === hospital.name ? "is-success" : ""}`}
                                type="text"
                                value={nameConfirmation}
                                onChange={(e) =>
                                    setNameConfirmation(e.target.value)
                                }
                                placeholder="Type hospital name here"
                                disabled={isDeleting}
                            />
                        </div>
                        {nameConfirmation &&
                            nameConfirmation !== hospital.name && (
                                <p className="help is-danger">
                                    The name doesn&#39;t match exactly
                                </p>
                            )}
                    </div>

                    <div className="field mt-4">
                        <div className="control">
                            <label className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={confirmUnderstand}
                                    onChange={(e) =>
                                        setConfirmUnderstand(e.target.checked)
                                    }
                                    disabled={isDeleting}
                                />
                                <span className="ml-2">
                                    I understand that this will remove all
                                    hospital records and associations
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="field mt-2">
                        <div className="control">
                            <label className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={confirmPermanent}
                                    onChange={(e) =>
                                        setConfirmPermanent(e.target.checked)
                                    }
                                    disabled={isDeleting}
                                />
                                <span className="ml-2">
                                    I understand that this action is permanent
                                    and cannot be undone
                                </span>
                            </label>
                        </div>
                    </div>
                </section>

                <footer className="modal-card-foot">
                    <button
                        className={`button is-danger ${isDeleting ? "is-loading" : ""}`}
                        onClick={handleDelete}
                        disabled={!isDeleteEnabled || isDeleting}
                    >
                        Delete Permanently
                    </button>
                    <button
                        className="button"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
}
