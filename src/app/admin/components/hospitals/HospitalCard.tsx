import React from "react";
import { Hospital } from "@/context/HospitalContext";
import styles from "../../\styles/HospitalCard.module.css";

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
                            {hospital.city}, {hospital.postcode}
                        </p>
                    </div>
                </div>
                <div className="content">
                    <p>
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {hospital.address}
                        <br />
                        <i className="fas fa-phone mr-2"></i>
                        {hospital.contactNumber || "Not provided"}
                        <br />
                        <i className="fas fa-envelope mr-2"></i>
                        {hospital.contactEmail || "Not provided"}
                        <br />
                    </p>
                    <div className="tags mt-2">
                        <span
                            className={`tag ${hospital.active ? "is-success" : "is-danger"}`}
                        >
                            {hospital.active ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>
            <footer className={`card-footer ${styles.cardFooter}`}>
                <a
                    className={`card-footer-item ${styles.cardFooterItem} has-text-info`}
                    onClick={onEdit}
                >
                    <i className="fas fa-edit mr-1"></i> Edit
                </a>
                <a
                    className={`card-footer-item ${styles.cardFooterItem} has-text-danger`}
                    onClick={onDelete}
                >
                    <i className="fas fa-trash mr-1"></i> Delete
                </a>
            </footer>
        </div>
    );
}
