// src/app/admin/components/hospitals/HospitalCard.tsx
import { Hospital } from "@/context/HospitalContext";
import styles from "../../styles/HospitalManagement.module.css";

type HospitalCardProps = {
    hospital: Hospital;
    onEdit: () => void;
    onDelete: () => void;
};

export default function HospitalCard({
    hospital,
    onEdit,
    onDelete,
}: HospitalCardProps) {
    return (
        <div className={`card ${styles.hoverCard}`}>
            <div className="card-content">
                <div className="media">
                    <div className="media-left">
                        <figure className="image is-48x48">
                            <i className="fas fa-hospital fa-3x has-text-info"></i>
                        </figure>
                    </div>
                    <div className="media-content">
                        <p className="title is-4 mb-5">{hospital.name}</p>
                        <p className="subtitle is-6">
                            {hospital.organization?.name ||
                                "Unknown Organization"}
                        </p>
                    </div>
                </div>
                <div className="content">
                    <p>
                        <i className="fas fa-map-marker-alt"></i>{" "}
                        {hospital.address}, {hospital.city}, {hospital.postcode}
                        <br />
                        <i className="fas fa-phone"></i>{" "}
                        {hospital.contactNumber}
                        <br />
                        <i className="fas fa-bed"></i> {hospital.beds} beds
                    </p>
                    <div className="tags">
                        <span className="tag is-success">
                            {hospital.departments || 0} Departments
                        </span>
                        <span className="tag is-primary">
                            {hospital.wards || 0} Wards
                        </span>
                        <span
                            className={`tag ${hospital.active ? "is-info" : "is-danger"}`}
                        >
                            {hospital.active ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>
            <footer className="card-footer">
                <a className="card-footer-item has-text-info" onClick={onEdit}>
                    <i className="fas fa-edit mr-1"></i> Edit
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
