// src/app/admin/components/staff/StaffFilter.tsx
import { useStaff } from "@/context/StaffContext";

type FilterProps = {
    filter: {
        organization: string;
        hospital: string;
        department: string;
        role: string;
        search: string;
        showInactive?: boolean;
    };
    setFilter: React.Dispatch<
        React.SetStateAction<{
            organization: string;
            hospital: string;
            department: string;
            role: string;
            search: string;
            showInactive?: boolean;
        }>
    >;
};

export default function StaffFilter({ filter, setFilter }: FilterProps) {
    const { organizations, hospitals, departments, staffRoles } = useStaff();

    const handleFilterChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            setFilter({
                ...filter,
                [name]: (e.target as HTMLInputElement).checked,
            });
        } else {
            setFilter({
                ...filter,
                [name]: value,
            });
        }
    };

    return (
        <aside className="menu">
            <p className="menu-label">Filters</p>

            <div className="field">
                <label className="label is-small">Organization</label>
                <div className="control">
                    <div className="select is-small is-fullwidth">
                        <select
                            name="organization"
                            value={filter.organization}
                            onChange={handleFilterChange}
                        >
                            <option value="all">All Organizations</option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="field">
                <label className="label is-small">Hospital</label>
                <div className="control">
                    <div className="select is-small is-fullwidth">
                        <select
                            name="hospital"
                            value={filter.hospital}
                            onChange={handleFilterChange}
                        >
                            <option value="all">All Hospitals</option>
                            {hospitals.map((hospital) => (
                                <option key={hospital.id} value={hospital.id}>
                                    {hospital.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="field">
                <label className="label is-small">Department</label>
                <div className="control">
                    <div className="select is-small is-fullwidth">
                        <select
                            name="department"
                            value={filter.department}
                            onChange={handleFilterChange}
                        >
                            <option value="all">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="field">
                <label className="label is-small">Role</label>
                <div className="control">
                    <div className="select is-small is-fullwidth">
                        <select
                            name="role"
                            value={filter.role}
                            onChange={handleFilterChange}
                        >
                            <option value="all">All Roles</option>
                            {staffRoles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="field">
                <label className="label is-small">Search</label>
                <div className="control has-icons-left">
                    <input
                        className="input is-small"
                        type="text"
                        placeholder="Search by name, email..."
                        name="search"
                        value={filter.search}
                        onChange={handleFilterChange}
                    />
                    <span className="icon is-small is-left">
                        <i className="fas fa-search"></i>
                    </span>
                </div>
            </div>

            <div className="field">
                <div className="control">
                    <label className="checkbox is-small">
                        <input
                            type="checkbox"
                            name="showInactive"
                            checked={filter.showInactive || false}
                            onChange={handleFilterChange}
                        />
                        &nbsp;Show inactive staff
                    </label>
                </div>
            </div>
        </aside>
    );
}
