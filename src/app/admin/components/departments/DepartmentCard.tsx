// src/app/admin/components/departments/DepartmentCard.tsx
import { Department } from "@/context/DepartmentContext";
import styles from "../../styles/DepartmentManagement.module.css";

type DepartmentCardProps = {
    department: Department;
    onEdit: () => void;
    onDelete: () => void;
    onViewChildren?: () => void;
};

export default function DepartmentCard({
    department,
    onEdit,
    onDelete,
    onViewChildren,
}: DepartmentCardProps) {
    // Default color if none provided
    const cardColor = department.color || "#3273dc";

    // Determine department type icon
    const getDepartmentIcon = (type: string) => {
        switch (type) {
            case "pharmacy":
                return "fas fa-prescription-bottle-alt";
            case "clinical":
                return "fas fa-stethoscope";
            case "inpatient":
                return "fas fa-procedures";
            case "outpatient":
                return "fas fa-user-md";
            case "medical":
                return "fas fa-heartbeat";
            case "porters":
                return "fas fa-dolly";
            case "catering":
                return "fas fa-utensils";
            case "admin":
                return "fas fa-clipboard";
            default:
                return "fas fa-building";
        }
    };

    // Function to determine a contrasting text color (black or white) based on background
    const getContrastColor = (hexColor: string) => {
        // Remove the # if present
        const color =
            hexColor.charAt(0) === "#" ? hexColor.substring(1) : hexColor;

        // Convert to RGB
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Return black for bright colors, white for dark colors
        return luminance > 0.5 ? "black" : "white";
    };

    // Special styles for card header based on department color
    const headerStyle = {
        backgroundColor: cardColor,
        color: getContrastColor(cardColor),
        padding: "0.75rem",
        borderTopLeftRadius: "0.25rem",
        borderTopRightRadius: "0.25rem",
    };

    return (
        <div className={`card ${styles.departmentCard}`}>
            <div
                style={headerStyle}
                className="is-flex is-justify-content-space-between is-align-items-center"
            >
                <div className="is-flex is-align-items-center">
                    <span className="icon mr-2">
                        <i className={getDepartmentIcon(department.type)}></i>
                    </span>
                    <span className="has-text-weight-bold">
                        {department.name}
                    </span>
                </div>
                <span className="tag is-light">{department.code}</span>
            </div>

            <div className="card-content">
                <div className="content">
                    {department.description && (
                        <p className="mb-3">{department.description}</p>
                    )}

                    <p className="is-size-7 mb-2">
                        <strong>Hospital:</strong>{" "}
                        {department.hospital?.name || "N/A"}
                    </p>

                    {department.parent && (
                        <p className="is-size-7 mb-2">
                            <strong>Parent:</strong> {department.parent.name}
                        </p>
                    )}

                    {(department.type === "inpatient" ||
                        department.type === "outpatient") && (
                        <div className="field is-grouped is-grouped-multiline mt-3">
                            {department.pharmacistCount !== undefined && (
                                <div className="control">
                                    <div className="tags has-addons">
                                        <span className="tag">Pharmacists</span>
                                        <span className="tag is-info">
                                            {department.pharmacistCount}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {department.technicianCount !== undefined && (
                                <div className="control">
                                    <div className="tags has-addons">
                                        <span className="tag">Technicians</span>
                                        <span className="tag is-success">
                                            {department.technicianCount}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {department.requiresLunchCover !== undefined && (
                                <div className="control">
                                    <div className="tags has-addons">
                                        <span className="tag">Lunch Cover</span>
                                        <span
                                            className={`tag ${department.requiresLunchCover ? "is-warning" : "is-light"}`}
                                        >
                                            {department.requiresLunchCover
                                                ? "Required"
                                                : "Not Needed"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="field is-grouped mt-3">
                        <div className="control">
                            <div className="tags has-addons">
                                <span className="tag">Type</span>
                                <span className="tag is-primary">
                                    {department.type.charAt(0).toUpperCase() +
                                        department.type.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="control">
                            <div className="tags has-addons">
                                <span className="tag">Status</span>
                                <span
                                    className={`tag ${department.active ? "is-success" : "is-danger"}`}
                                >
                                    {department.active ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="card-footer">
                <a className="card-footer-item has-text-info" onClick={onEdit}>
                    <i className="fas fa-edit mr-1"></i> Edit
                </a>

                {onViewChildren && (
                    <a
                        className="card-footer-item has-text-primary"
                        onClick={onViewChildren}
                    >
                        <i className="fas fa-sitemap mr-1"></i> Subdepartments
                    </a>
                )}

                <a
                    className="card-footer-item has-text-danger"
                    onClick={onDelete}
                >
                    <i className="fas fa-trash mr-1"></i> Delete
                </a>
            </footer>
        </div>
    );
}
