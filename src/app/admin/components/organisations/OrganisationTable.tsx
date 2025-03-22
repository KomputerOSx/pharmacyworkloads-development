import { Organisation } from "@/context/OrganisationContext";

type OrganisationTableProps = {
    organisations: Organisation[];
    onEdit: (org: Organisation) => void;
    onDelete: (id: string) => void;
};

export default function OrganisationTable({
    organisations,
    onEdit,
    onDelete,
}: OrganisationTableProps) {
    return (
        <div className="table-container">
            <table className="table is-fullwidth is-hoverable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Contact</th>
                        <th>Hospitals</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {organisations.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="has-text-centered py-4">
                                No organisations found. Try adjusting your
                                filters or add a new organisation.
                            </td>
                        </tr>
                    ) : (
                        organisations.map((org) => (
                            <tr key={org.id}>
                                <td>
                                    <div className="is-flex is-align-items-center">
                                        <span className="icon mr-2">
                                            <i className="fas fa-building"></i>
                                        </span>
                                        <span>{org.name}</span>
                                    </div>
                                </td>
                                <td>{org.type}</td>
                                <td>
                                    <div>{org.contactEmail}</div>
                                    <div className="has-text-grey is-size-7">
                                        {org.contactPhone}
                                    </div>
                                </td>
                                <td>{org.hospitalCount}</td>
                                <td>
                                    <span
                                        className={`tag ${org.active ? "is-success" : "is-danger"}`}
                                    >
                                        {org.active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td>
                                    <div className="buttons are-small">
                                        <button
                                            className="button is-info"
                                            title="Edit"
                                            onClick={() => onEdit(org)}
                                        >
                                            <span className="icon is-small">
                                                <i className="fas fa-edit"></i>
                                            </span>
                                        </button>
                                        <button
                                            className="button is-danger"
                                            title="Delete"
                                            onClick={() => onDelete(org.id)}
                                        >
                                            <span className="icon is-small">
                                                <i className="fas fa-trash"></i>
                                            </span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
