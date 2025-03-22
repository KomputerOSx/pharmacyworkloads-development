import React from "react";
import { Organisation } from "@/context/OrganisationContext";

type OrganisationCardProps = {
    organisation: Organisation;
    onClick: () => void;
};

export default function OrganisationCard({
    organisation,
    onClick,
}: OrganisationCardProps) {
    // Function to generate a simple color based on the organisation name
    // This provides visual distinction between different organisations
    const getColorClass = (name: string) => {
        const colors = [
            "is-primary",
            "is-link",
            "is-info",
            "is-success",
            "is-warning",
            "is-danger",
        ];
        const hash = name
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <div className="card h-100 organisation-card" onClick={onClick}>
            <div className="card-content">
                <div className="media">
                    <div className="media-left">
                        <figure
                            className={`icon-bg ${getColorClass(organisation.name)}`}
                        >
                            <i className="fas fa-building fa-2x"></i>
                        </figure>
                    </div>
                    <div className="media-content">
                        <p className="title is-4 mb-5">{organisation.name}</p>
                        <p className="subtitle is-6">{organisation.type}</p>
                    </div>
                </div>

                <div className="content">
                    <div className="org-details">
                        <p>
                            <i className="fas fa-envelope mr-2"></i>{" "}
                            {organisation.contactEmail}
                        </p>
                        <p>
                            <i className="fas fa-phone mr-2"></i>{" "}
                            {organisation.contactPhone || "N/A"}
                        </p>
                    </div>

                    <div className="mt-4 org-stats">
                        <div className="tags">
                            <span
                                className={`tag is-rounded ${organisation.active ? "is-success" : "is-danger"}`}
                            >
                                {organisation.active ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="card-footer">
                <div className="card-footer-item">
                    <span>Click to enter portal</span>
                    <span className="icon">
                        <i className="fas fa-arrow-right"></i>
                    </span>
                </div>
            </footer>
        </div>
    );
}
