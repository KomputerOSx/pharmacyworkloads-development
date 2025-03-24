import React from "react";
import { Department } from "@/context/DepartmentContext";

interface DepartmentDeleteModalProps {
    isOpen: boolean;
    department: Department | null;
    organisationName?: string;
    onClose: () => void;
    onDelete: (department: Department) => void;
}

const DepartmentDeleteModal: React.FC<DepartmentDeleteModalProps> = ({
    isOpen,
    department,
    organisationName,
    onClose,
    onDelete,
}) => {
    if (!isOpen || !department) return null;

    const handleDelete = () => {
        onDelete(department);
    };

    return (
        <div className="modal is-active">
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head has-background-danger">
                    <p className="modal-card-title has-text-white">
                        Delete Department
                    </p>
                    <button
                        className="delete"
                        aria-label="close"
                        onClick={onClose}
                    ></button>
                </header>
                <section className="modal-card-body">
                    <p className="has-text-centered mb-5">
                        Are you sure you want to delete this department?
                    </p>

                    <div className="notification is-warning">
                        <p>
                            <strong>Warning:</strong> This action cannot be
                            undone. Deleting this department will also remove
                            all associated data.
                        </p>
                    </div>

                    <div className="box">
                        <h4 className="title is-5">{department.name}</h4>
                        <p>
                            <strong>Code:</strong> {department.code}
                        </p>
                        <p>
                            <strong>Type:</strong> {department.type}
                        </p>
                        {department.description && (
                            <p>
                                <strong>Description:</strong>{" "}
                                {department.description}
                            </p>
                        )}
                        <p>
                            <strong>Status:</strong>{" "}
                            {department.active ? "Active" : "Inactive"}
                        </p>

                        {organisationName && (
                            <p>
                                <strong>Organisation:</strong>{" "}
                                {organisationName}
                            </p>
                        )}
                    </div>
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-danger" onClick={handleDelete}>
                        Yes, Delete Department
                    </button>
                    <button className="button" onClick={onClose}>
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default DepartmentDeleteModal;
