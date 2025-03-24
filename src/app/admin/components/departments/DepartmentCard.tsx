import React from "react";
import Link from "next/link";
import { Department } from "@/context/DepartmentContext";

interface DepartmentCardProps {
    department: Department;
    onEdit: () => void;
    onDelete: () => void;
    onViewDetails: string; // URL to navigate to for details
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
    department,
    onEdit,
    onDelete,
    onViewDetails,
}) => {
    // Set a default color if none is provided
    const cardColor = department.color || "#4a4a4a";

    return (
        <div className="card h-100">
            <div className="card-header" style={{ backgroundColor: cardColor }}>
                <p className="card-header-title has-text-white">
                    {department.name}
                </p>
                <div className="card-header-icon">
                    <span
                        className={`tag ${department.active ? "is-success" : "is-danger"}`}
                    >
                        {department.active ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>
            <div className="card-content">
                <div className="content">
                    <p>
                        <strong>Code:</strong> {department.code}
                    </p>
                    {department.description && (
                        <p>
                            <strong>Description:</strong>{" "}
                            {department.description}
                        </p>
                    )}
                    <p>
                        <strong>Type:</strong> {department.type}
                    </p>

                    {/* Unique properties section if available */}
                    {department.uniqueProperties && (
                        <div className="mt-3">
                            <hr />
                            <h6 className="is-size-6 has-text-weight-bold">
                                Special Properties:
                            </h6>
                            <ul>
                                {department.uniqueProperties
                                    .requiresLunchCover !== undefined && (
                                    <li>
                                        <strong>Requires Lunch Cover:</strong>{" "}
                                        {department.uniqueProperties
                                            .requiresLunchCover
                                            ? "Yes"
                                            : "No"}
                                    </li>
                                )}
                                {department.uniqueProperties.pharmacistCount !==
                                    undefined && (
                                    <li>
                                        <strong>Pharmacist Count:</strong>{" "}
                                        {
                                            department.uniqueProperties
                                                .pharmacistCount
                                        }
                                    </li>
                                )}
                                {department.uniqueProperties.technicianCount !==
                                    undefined && (
                                    <li>
                                        <strong>Technician Count:</strong>{" "}
                                        {
                                            department.uniqueProperties
                                                .technicianCount
                                        }
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <footer className="card-footer">
                <Link href={onViewDetails} className="card-footer-item">
                    View Details
                </Link>
                <a onClick={onEdit} className="card-footer-item">
                    Edit
                </a>
                <a
                    onClick={onDelete}
                    className="card-footer-item has-text-danger"
                >
                    Delete
                </a>
            </footer>
        </div>
    );
};

export default DepartmentCard;
