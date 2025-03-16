// src/app/admin/components/wards/WardFilter.tsx
import { useWards } from "@/context/WardContext";

type FilterProps = {
    filter: {
        department: string;
        hospital: string;
        search: string;
    };
    setFilter: React.Dispatch<
        React.SetStateAction<{
            department: string;
            hospital: string;
            search: string;
        }>
    >;
};

export default function WardFilter({ filter, setFilter }: FilterProps) {
    const { departments, hospitals } = useWards();

    const handleFilterChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;

        // If changing department, check if hospital should be updated too
        if (name === "department" && value !== "all") {
            // Find selected department
            const selectedDept = departments.find((dept) => dept.id === value);

            // If department has a hospital, automatically filter to that hospital
            if (selectedDept && selectedDept.hospital) {
                setFilter({
                    ...filter,
                    [name]: value,
                    hospital: selectedDept.hospital.id,
                });
                return;
            }
        }

        // Normal case - just update the filter
        setFilter({
            ...filter,
            [name]: value,
        });
    };

    return (
        <aside className="menu">
            <p className="menu-label">Filters</p>
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
                <label className="label is-small">Search</label>
                <div className="control has-icons-left">
                    <input
                        className="input is-small"
                        type="text"
                        placeholder="Search wards"
                        name="search"
                        value={filter.search}
                        onChange={handleFilterChange}
                    />
                    <span className="icon is-small is-left">
                        <i className="fas fa-search"></i>
                    </span>
                </div>
            </div>
        </aside>
    );
}
