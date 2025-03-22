type FilterProps = {
    filter: {
        type: string;
        status: string;
        search: string;
    };
    setFilter: React.Dispatch<
        React.SetStateAction<{
            type: string;
            status: string;
            search: string;
        }>
    >;
};

export default function OrganisationFilter({ filter, setFilter }: FilterProps) {
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
        <aside className="menu">
            <p className="menu-label">Filters</p>
            <div className="field">
                <label className="label is-small">Type</label>
                <div className="control">
                    <div className="select is-small is-fullwidth">
                        <select
                            name="type"
                            value={filter.type}
                            onChange={handleFilterChange}
                        >
                            <option value="all">All Types</option>
                            <option value="NHS Trust">NHS Trust</option>
                            <option value="NHS Foundation Trust">
                                NHS Foundation Trust
                            </option>
                            <option value="Private Healthcare">
                                Private Healthcare
                            </option>
                        </select>
                    </div>
                </div>
            </div>

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
                        placeholder="Search"
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
