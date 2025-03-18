// // src/app/admin/components/wards/WardCard.tsx
// import { Ward } from "@/context/WardContext";
// import styles from "../../styles/WardManagement.module.css";
//
// type WardCardProps = {
//     ward: Ward;
//     onEdit: () => void;
//     onDelete: () => void;
// };
//
// export default function WardCard({ ward, onEdit, onDelete }: WardCardProps) {
//     // Default department color if none provided
//     const departmentColor = ward.department?.color || "#3273dc";
//
//     // Function to determine a contrasting text color (black or white) based on background
//     const getContrastColor = (hexColor: string) => {
//         // Remove the # if present
//         const color =
//             hexColor.charAt(0) === "#" ? hexColor.substring(1) : hexColor;
//
//         // Convert to RGB
//         const r = parseInt(color.substr(0, 2), 16);
//         const g = parseInt(color.substr(2, 2), 16);
//         const b = parseInt(color.substr(4, 2), 16);
//
//         // Calculate luminance
//         const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
//
//         // Return black for bright colors, white for dark colors
//         return luminance > 0.5 ? "black" : "white";
//     };
//
//     // Special styles for card header based on department color
//     const headerStyle = {
//         backgroundColor: departmentColor,
//         color: getContrastColor(departmentColor),
//         padding: "0.75rem",
//         borderTopLeftRadius: "0.25rem",
//         borderTopRightRadius: "0.25rem",
//     };
//
//     return (
//         <div className={`card ${styles.wardCard}`}>
//             <div
//                 style={headerStyle}
//                 className="is-flex is-justify-content-space-between is-align-items-center"
//             >
//                 <div className="is-flex is-align-items-center">
//                     <span className="icon mr-2">
//                         <i className="fas fa-bed"></i>
//                     </span>
//                     <span className="has-text-weight-bold">{ward.name}</span>
//                 </div>
//                 <span className="tag is-light">{ward.code}</span>
//             </div>
//
//             <div className="card-content">
//                 <div className="content">
//                     <p className="is-size-7 mb-2">
//                         <strong>Department:</strong>{" "}
//                         {ward.department?.name || "N/A"}
//                     </p>
//
//                     <p className="is-size-7 mb-2">
//                         <strong>Hospital:</strong>{" "}
//                         {ward.hospital?.name || "N/A"}
//                     </p>
//
//                     <div className="field is-grouped mt-3">
//                         <div className="control">
//                             <div className="tags has-addons">
//                                 <span className="tag">Beds</span>
//                                 <span className="tag is-info">
//                                     {ward.bedCount}
//                                 </span>
//                             </div>
//                         </div>
//
//                         <div className="control">
//                             <div className="tags has-addons">
//                                 <span className="tag">Status</span>
//                                 <span
//                                     className={`tag ${ward.active ? "is-success" : "is-danger"}`}
//                                 >
//                                     {ward.active ? "Active" : "Inactive"}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//             <footer className="card-footer">
//                 <a className="card-footer-item has-text-info" onClick={onEdit}>
//                     <i className="fas fa-edit mr-1"></i> Edit
//                 </a>
//
//                 <a
//                     className="card-footer-item has-text-danger"
//                     onClick={onDelete}
//                 >
//                     <i className="fas fa-trash mr-1"></i> Delete
//                 </a>
//             </footer>
//         </div>
//     );
// }

// src/app/admin/components/wards/WardCard.tsx (Updated version)
import {Ward} from "@/context/WardContext";
import styles from "../../styles/WardManagement.module.css";

type WardCardProps = {
    ward: Ward;
    onEdit: () => void;
    onDelete: () => void;
    onManageDepartments: () => void; // New prop for managing departments
};

export default function WardCard({
    ward,
    onEdit,
    onDelete,
    onManageDepartments,
}: WardCardProps) {
    // Default department color if none provided
    const departmentColor = ward.department?.color || "#3273dc";

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
        backgroundColor: departmentColor,
        color: getContrastColor(departmentColor),
        padding: "0.75rem",
        borderTopLeftRadius: "0.25rem",
        borderTopRightRadius: "0.25rem",
    };

    return (
        <div className={`card ${styles.wardCard}`}>
            <div
                style={headerStyle}
                className="is-flex is-justify-content-space-between is-align-items-center"
            >
                <div className="is-flex is-align-items-center">
                    <span className="icon mr-2">
                        <i className="fas fa-bed"></i>
                    </span>
                    <span className="has-text-weight-bold">{ward.name}</span>
                </div>
                <span className="tag is-light">{ward.code}</span>
            </div>

            <div className="card-content">
                <div className="content">
                    <p className="is-size-7 mb-2">
                        <strong>Primary Department:</strong>{" "}
                        {ward.department?.name || "None"}
                    </p>

                    <p className="is-size-7 mb-2">
                        <strong>Hospital:</strong>{" "}
                        {ward.hospital?.name || "N/A"}
                    </p>

                    {/* Display additional departments if available */}
                    {ward.departments && ward.departments.length > 0 && (
                        <div className="mt-2">
                            <p className="is-size-7 mb-1">
                                <strong>All Departments:</strong>
                            </p>
                            <div className="tags are-small">
                                {ward.departments.map((dept, index) => (
                                    <span
                                        key={index}
                                        className="tag"
                                        style={{
                                            backgroundColor:
                                                dept.department.color ||
                                                "#3273dc",
                                            color: getContrastColor(
                                                dept.department.color ||
                                                    "#3273dc",
                                            ),
                                        }}
                                    >
                                        {dept.department.name}
                                        {dept.isPrimary && (
                                            <span className="ml-1">
                                                <i
                                                    className="fas fa-star"
                                                    style={{
                                                        fontSize: "0.7em",
                                                    }}
                                                ></i>
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="field is-grouped mt-3">
                        <div className="control">
                            <div className="tags has-addons">
                                <span className="tag">Beds</span>
                                <span className="tag is-info">
                                    {ward.bedCount}
                                </span>
                            </div>
                        </div>

                        <div className="control">
                            <div className="tags has-addons">
                                <span className="tag">Status</span>
                                <span
                                    className={`tag ${ward.active ? "is-success" : "is-danger"}`}
                                >
                                    {ward.active ? "Active" : "Inactive"}
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

                <a
                    className="card-footer-item has-text-primary"
                    onClick={onManageDepartments}
                >
                    <i className="fas fa-sitemap mr-1"></i> Departments
                </a>

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
