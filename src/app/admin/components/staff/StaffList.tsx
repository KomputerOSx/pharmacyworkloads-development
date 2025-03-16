// src/app/admin/components/staff/StaffList.tsx
import { Staff } from "@/context/StaffContext";
import styles from "../../styles/StaffManagement.module.css";

type StaffListProps = {
    staff: Staff[];
    onEdit: (staff: Staff) => void;
    onDelete: (id: string, name: string) => void;
};

export default function StaffList({ staff, onEdit, onDelete }: StaffListProps) {
    // Helper to format the date in a readable format
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);
    };

    // Helper to calculate length of service
    const calculateServiceLength = (startDateString?: string) => {
        if (!startDateString) return "N/A";

        const startDate = new Date(startDateString);
        const now = new Date();

        const diffTime = Math.abs(now.getTime() - startDate.getTime());
        const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
        const diffMonths = Math.floor(
            (diffTime % (1000 * 60 * 60 * 24 * 365.25)) /
                (1000 * 60 * 60 * 24 * 30.44),
        );

        if (diffYears > 0) {
            return `${diffYears}y ${diffMonths}m`;
        } else {
            return `${diffMonths}m`;
        }
    };

    return (
        <div className="table-container">
            <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Contact</th>
                        <th>Started</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map((staffMember) => (
                        <tr
                            key={staffMember.id}
                            className={
                                !staffMember.active ? styles.inactiveRow : ""
                            }
                        >
                            <td>
                                <div className="is-flex is-align-items-center">
                                    <span className="icon mr-2">
                                        <i className="fas fa-user"></i>
                                    </span>
                                    <div>
                                        <p className="has-text-weight-medium">
                                            {staffMember.name}
                                        </p>
                                        {staffMember.nhsBand && (
                                            <p className="is-size-7 has-text-grey">
                                                {staffMember.nhsBand}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div>
                                    <p>
                                        {staffMember.primaryRole?.name ||
                                            "Unknown"}
                                    </p>
                                    {staffMember.departmentRole && (
                                        <p className="is-size-7 has-text-grey">
                                            {staffMember.departmentRole.name}
                                        </p>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div className={styles.departmentTags}>
                                    {staffMember.departments &&
                                    staffMember.departments.length > 0 ? (
                                        staffMember.departments.map(
                                            (dept, index) => (
                                                <span
                                                    key={index}
                                                    className="tag is-info is-light mr-1 mb-1"
                                                >
                                                    {dept.name}
                                                </span>
                                            ),
                                        )
                                    ) : (
                                        <span className="has-text-grey-light">
                                            No departments
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div>
                                    <p className="is-size-7">
                                        <span className="icon is-small mr-1">
                                            <i className="fas fa-envelope"></i>
                                        </span>
                                        {staffMember.email}
                                    </p>
                                    {staffMember.phone && (
                                        <p className="is-size-7">
                                            <span className="icon is-small mr-1">
                                                <i className="fas fa-phone"></i>
                                            </span>
                                            {staffMember.phone}
                                        </p>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div>
                                    <p>{formatDate(staffMember.startDate)}</p>
                                    <p className="is-size-7 has-text-grey">
                                        {calculateServiceLength(
                                            staffMember.startDate,
                                        )}
                                    </p>
                                </div>
                            </td>
                            <td>
                                <span
                                    className={`tag ${
                                        staffMember.active
                                            ? "is-success"
                                            : "is-danger"
                                    }`}
                                >
                                    {staffMember.active ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td>
                                <div className="buttons are-small">
                                    <button
                                        className="button is-info"
                                        title="Edit"
                                        onClick={() => onEdit(staffMember)}
                                    >
                                        <span className="icon is-small">
                                            <i className="fas fa-edit"></i>
                                        </span>
                                    </button>
                                    <button
                                        className="button is-danger"
                                        title="Delete"
                                        onClick={() =>
                                            onDelete(
                                                staffMember.id,
                                                staffMember.name,
                                            )
                                        }
                                    >
                                        <span className="icon is-small">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
