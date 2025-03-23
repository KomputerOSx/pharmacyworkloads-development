import React from "react";
import { HospitalFilter as FilterType } from "@/context/HospitalContext";

type FilterProps = {
    filter: FilterType;
    setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
};

export default function HospitalFilter({ filter, setFilter }: FilterProps) {
    const handleFilterChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value,
        });
    };

    return (
        <aside className="menu box">
            <p className="menu-label">Filters</p>

            <div className="field">
                <label className="label is-small">Status</label>
                <div className="control">
                    <div className="select is-small is-fullwidth">
                        <select
                            name="status"
                            value={filter.status}
                            onChange={handleFilterChange}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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
                        placeholder="Search by name, city, or postcode"
                        name="search"
                        value={filter.search}
                        onChange={handleFilterChange}
                    />
                    <span className="icon is-small is-left">
                        <i className="fas fa-search"></i>
                    </span>
                </div>
            </div>

            <div className="field mt-4">
                <button
                    className="button is-small is-outlined is-fullwidth"
                    onClick={() => setFilter({ status: "all", search: "" })}
                >
                    Clear Filters
                </button>
            </div>
        </aside>
    );
}
