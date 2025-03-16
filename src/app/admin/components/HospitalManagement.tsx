import { useState } from "react";
import HospitalFilter from "./hospitals/HospitalFilter";
import HospitalCard from "./hospitals/HospitalCard";
import HospitalModal from "./hospitals/HospitalModal";

export type Organization = {
    id: string;
    name: string;
};

export type Hospital = {
    id: string;
    name: string;
    organization: Organization;
    address: string;
    city: string;
    postcode: string;
    contactNumber: string;
    contactEmail: string;
    beds: number;
    active: boolean;
    departments: number;
    wards: number;
    staff: number;
    createdAt?: string;
    updatedAt?: string;
};

export default function HospitalManagement() {
    const [organizations, setOrganizations] = useState<Organization[]>([
        { id: "nhs_trust_1", name: "Central NHS Trust" },
        { id: "nhs_trust_2", name: "Eastern NHS Foundation Trust" },
        { id: "private_1", name: "Westside Healthcare Group" },
    ]);

    const [hospitals, setHospitals] = useState<Hospital[]>([
        {
            id: "central_hospital",
            name: "Central Hospital",
            organization: { id: "nhs_trust_1", name: "Central NHS Trust" },
            address: "123 Hospital Road",
            city: "London",
            postcode: "EC1A 1BB",
            contactNumber: "020-8765-4321",
            contactEmail: "info@central-hospital.nhs.uk",
            beds: 520,
            active: true,
            departments: 12,
            wards: 48,
            staff: 230,
            createdAt: "2023-05-20",
            updatedAt: "2025-01-15",
        },
        {
            id: "royal_infirmary",
            name: "Royal Infirmary",
            organization: { id: "nhs_trust_1", name: "Central NHS Trust" },
            address: "45 Queen Street",
            city: "London",
            postcode: "W1S 4QQ",
            contactNumber: "020-3333-7777",
            contactEmail: "contact@royal-infirmary.nhs.uk",
            beds: 380,
            active: true,
            departments: 8,
            wards: 32,
            staff: 175,
            createdAt: "2023-07-10",
            updatedAt: "2024-11-30",
        },
        {
            id: "eastern_general",
            name: "Eastern General Hospital",
            organization: {
                id: "nhs_trust_2",
                name: "Eastern NHS Foundation Trust",
            },
            address: "87 Eastern Avenue",
            city: "Chelmsford",
            postcode: "CM2 9XY",
            contactNumber: "01245-123456",
            contactEmail: "info@eastern-general.nhs.uk",
            beds: 410,
            active: true,
            departments: 10,
            wards: 35,
            staff: 195,
            createdAt: "2023-09-12",
            updatedAt: "2025-02-01",
        },
        {
            id: "westside_private",
            name: "Westside Private Clinic",
            organization: {
                id: "private_1",
                name: "Westside Healthcare Group",
            },
            address: "12 Harley Street",
            city: "London",
            postcode: "W1G 9QT",
            contactNumber: "020-7777-8888",
            contactEmail: "appointments@westside-clinic.com",
            beds: 75,
            active: false,
            departments: 4,
            wards: 8,
            staff: 42,
            createdAt: "2024-03-15",
            updatedAt: "2024-09-22",
        },
    ]);

    const [filter, setFilter] = useState({
        organization: "all",
        status: "all",
        search: "",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHospital, setCurrentHospital] = useState<Hospital | null>(
        null,
    );
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    const filteredHospitals = hospitals.filter((hospital) => {
        // Organization filter
        if (
            filter.organization !== "all" &&
            hospital.organization.id !== filter.organization
        ) {
            return false;
        }

        // Status filter
        if (filter.status === "active" && !hospital.active) {
            return false;
        }
        if (filter.status === "inactive" && hospital.active) {
            return false;
        }

        // Search filter
        if (
            filter.search &&
            !hospital.name
                .toLowerCase()
                .includes(filter.search.toLowerCase()) &&
            !hospital.city
                .toLowerCase()
                .includes(filter.search.toLowerCase()) &&
            !hospital.postcode
                .toLowerCase()
                .includes(filter.search.toLowerCase())
        ) {
            return false;
        }

        return true;
    });

    const handleAddHospital = () => {
        setCurrentHospital(null);
        setModalMode("add");
        setIsModalOpen(true);
    };

    const handleEditHospital = (hospital: Hospital) => {
        setCurrentHospital(hospital);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleDeleteHospital = (id: string) => {
        if (confirm("Are you sure you want to delete this hospital?")) {
            setHospitals(hospitals.filter((hospital) => hospital.id !== id));
        }
    };

    const handleSaveHospital = (hospital: Hospital) => {
        if (modalMode === "add") {
            const newHospital = {
                ...hospital,
                id: `hospital_${Date.now()}`,
                departments: 0,
                wards: 0,
                staff: 0,
                createdAt: new Date().toISOString().split("T")[0],
                updatedAt: new Date().toISOString().split("T")[0],
            };
            setHospitals([...hospitals, newHospital]);
        } else {
            setHospitals(
                hospitals.map((h) =>
                    h.id === hospital.id
                        ? {
                              ...hospital,
                              updatedAt: new Date().toISOString().split("T")[0],
                          }
                        : h,
                ),
            );
        }
        setIsModalOpen(false);
    };

    return (
        <div className="columns">
            <div className="column is-3">
                <div className="box">
                    <h3 className="title is-4 mb-5">Hospitals</h3>
                    <p className="subtitle is-6">Manage hospital facilities</p>
                    <div className="buttons">
                        <button
                            className="button is-primary"
                            onClick={handleAddHospital}
                        >
                            <span className="icon">
                                <i className="fas fa-plus"></i>
                            </span>
                            <span>Add Hospital</span>
                        </button>
                    </div>

                    <HospitalFilter
                        filter={filter}
                        setFilter={setFilter}
                        organizations={organizations}
                    />
                </div>
            </div>

            <div className="column is-9">
                <div className="columns is-multiline">
                    {filteredHospitals.length === 0 ? (
                        <div className="column is-12">
                            <div className="notification is-info">
                                No hospitals found. Try adjusting your filters
                                or add a new hospital.
                            </div>
                        </div>
                    ) : (
                        filteredHospitals.map((hospital) => (
                            <div className="column is-4" key={hospital.id}>
                                <HospitalCard
                                    hospital={hospital}
                                    onEdit={() => handleEditHospital(hospital)}
                                    onDelete={() =>
                                        handleDeleteHospital(hospital.id)
                                    }
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Hospital Modal */}
            <HospitalModal
                isOpen={isModalOpen}
                mode={modalMode}
                hospital={currentHospital}
                organizations={organizations}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveHospital}
            />
        </div>
    );
}
