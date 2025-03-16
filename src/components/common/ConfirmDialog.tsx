// src/components/common/ConfirmDialog.tsx
import React from "react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    confirmButtonClass?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
    confirmButtonClass = "is-danger",
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal is-active">
            <div className="modal-background" onClick={onCancel}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">{title}</p>
                    <button
                        className="delete"
                        aria-label="close"
                        onClick={onCancel}
                        disabled={isLoading}
                    ></button>
                </header>
                <section className="modal-card-body">
                    <p>{message}</p>
                </section>
                <footer className="modal-card-foot">
                    <button
                        className={`button ${confirmButtonClass} ${isLoading ? "is-loading" : ""}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {confirmText}
                    </button>
                    <button
                        className="button"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ConfirmDialog;
