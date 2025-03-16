import { useState } from "react";
import OrganizationFilter from "./organizations/OrganizationFilter";
import OrganizationTable from "./organizations/OrganizationTable";
import OrganizationModal from "./organizations/OrganizationModal";

export type Organization = {
    id: string;
    name: string;
    type: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    hospitalCount: number;
    createdAt?: string;
    updatedAt?: string;
};

export default function OrganizationManagement() {
    const [organizations, setOrganizations] = useState<Organization[]>([
        {
            id: "nhs_trust_1",
            name: "Central NHS Trust",
            type: "NHS Trust",
            contactEmail: "admin@centralnhs.org",
            contactPhone: "020-1234-5678",
            active: true,
            hospitalCount: 3,
            createdAt: "2023-05-15",
            updatedAt: "2025-02-20",
        },
        {
            id: "nhs_trust_2",
            name: "Eastern NHS Foundation Trust",
            type: "NHS Foundation Trust",
            contactEmail: "info@eastern-nhs.org",
            contactPhone: "020-9876-5432",
            active: true,
            hospitalCount: 2,
            createdAt: "2023-08-22",
            updatedAt: "2024-12-05",
        },
        {
            id: "private_1",
            name: "Westside Healthcare Group",
            type: "Private Healthcare",
            contactEmail: "contact@westside-health.com",
            contactPhone: "020-5555-1234",
            active: false,
            hospitalCount: 1,
            createdAt: "2024-01-10",
            updatedAt: "2024-10-15",
        },
    ]);

    const [filter, setFilter] = useState({
        type: "all",
        status: "all",
        search: "",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrganization, setCurrentOrganization] =
        useState<Organization | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    const filteredOrganizations = organizations.filter((org) => {
        // Type filter
        if (filter.type !== "all" && org.type !== filter.type) {
            return false;
        }

        // Status filter
        if (filter.status === "active" && !org.active) {
            return false;
        }
        if (filter.status === "inactive" && org.active) {
            return false;
        }

        // Search filter
        if (
            filter.search &&
            !org.name.toLowerCase().includes(filter.search.toLowerCase()) &&
            !org.contactEmail
                .toLowerCase()
                .includes(filter.search.toLowerCase())
        ) {
            return false;
        }

        return true;
    });

    const handleAddOrganization = () => {
        setCurrentOrganization(null);
        setModalMode("add");
        setIsModalOpen(true);
    };

    const handleEditOrganization = (org: Organization) => {
        setCurrentOrganization(org);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleDeleteOrganization = (id: string) => {
        if (confirm("Are you sure you want to delete this organization?")) {
            setOrganizations(organizations.filter((org) => org.id !== id));
        }
    };

    const handleSaveOrganization = (org: Organization) => {
        if (modalMode === "add") {
            const newOrg = {
                ...org,
                id: `org_${Date.now()}`,
                hospitalCount: 0,
                createdAt: new Date().toISOString().split("T")[0],
                updatedAt: new Date().toISOString().split("T")[0],
            };
            setOrganizations([...organizations, newOrg]);
        } else {
            setOrganizations(
                organizations.map((o) =>
                    o.id === org.id
                        ? {
                              ...org,
                              updatedAt: new Date().toISOString().split("T")[0],
                          }
                        : o,
                ),
            );
        }
        setIsModalOpen(false);
    };

    return (
        <div className="columns">
            <div className="column is-3">
                <div className="box">
                    {/* Properly structured title and subtitle */}
                    <div className="block">
                        <h3 className="title is-4 mb-5">Organizations</h3>
                        <h5 className="subtitle is-6">
                            Manage healthcare organizations
                        </h5>
                    </div>

                    {/* Button in its own block */}
                    <div className="block">
                        <button
                            className="button is-primary"
                            onClick={handleAddOrganization}
                        >
                            <span className="icon">
                                <i className="fas fa-plus"></i>
                            </span>
                            <span>Add Organization</span>
                        </button>
                    </div>

                    {/* Filter in its own block */}
                    <div className="block">
                        <OrganizationFilter
                            filter={filter}
                            setFilter={setFilter}
                        />
                    </div>
                </div>
            </div>

            <div className="column is-9">
                <div className="box">
                    <OrganizationTable
                        organizations={filteredOrganizations}
                        onEdit={handleEditOrganization}
                        onDelete={handleDeleteOrganization}
                    />
                </div>
            </div>

            {/* Organization Modal */}
            <OrganizationModal
                isOpen={isModalOpen}
                mode={modalMode}
                organization={currentOrganization}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOrganization}
            />
        </div>
    );
}
