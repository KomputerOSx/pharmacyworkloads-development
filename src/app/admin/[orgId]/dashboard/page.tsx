"use client";

import React, { useEffect, useState } from "react";
import { getOrganisation } from "@/services/organisationService";
import { Organisation } from "@/context/OrganisationContext";

export default function DashboardPage({
    params,
}: {
    params: { orgId: string };
}) {
    // @ts-expect-error Using react use to unwrap regular javascript object
    const orgId = React.use(params).orgId;
    const [organisation, setOrganisation] = useState<Organisation | null>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrg = async () => {
            try {
                const org = await getOrganisation(orgId);
                setOrganisation(org);
            } catch (error) {
                console.error("Error loading organisation:", error);
            } finally {
                setLoading(false);
            }
        };

        React.use(loadOrg());
    }, [orgId]);

    if (loading) return <div>Loading...</div>;
    if (!organisation) return <div>Organisation not found</div>;

    return (
        <div className="dashboard-container">
            <div className="section">
                <h1 className="title is-3">Dashboard</h1>
                <h2 className="subtitle is-5">
                    Welcome to your organisation dashboard
                </h2>

                <div className="box">
                    <h3 className="title is-4">Quick Stats</h3>
                    <div className="columns is-multiline">
                        <div className="column is-3">
                            <div className="card has-background-primary has-text-white">
                                <div className="card-content">
                                    <div className="level">
                                        <div className="level-item has-text-centered">
                                            <div>
                                                <p className="heading">
                                                    Hospitals
                                                </p>
                                                <p className="title has-text-white">
                                                    4
                                                </p>
                                            </div>
                                        </div>
                                        <div className="level-item">
                                            <span className="icon is-large">
                                                <i className="fas fa-hospital fa-2x"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="column is-3">
                            <div className="card has-background-link has-text-white">
                                <div className="card-content">
                                    <div className="level">
                                        <div className="level-item has-text-centered">
                                            <div>
                                                <p className="heading">
                                                    Departments
                                                </p>
                                                <p className="title has-text-white">
                                                    12
                                                </p>
                                            </div>
                                        </div>
                                        <div className="level-item">
                                            <span className="icon is-large">
                                                <i className="fas fa-sitemap fa-2x"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="column is-3">
                            <div className="card has-background-success has-text-white">
                                <div className="card-content">
                                    <div className="level">
                                        <div className="level-item has-text-centered">
                                            <div>
                                                <p className="heading">Wards</p>
                                                <p className="title has-text-white">
                                                    36
                                                </p>
                                            </div>
                                        </div>
                                        <div className="level-item">
                                            <span className="icon is-large">
                                                <i className="fas fa-bed fa-2x"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="column is-3">
                            <div className="card has-background-warning has-text-white">
                                <div className="card-content">
                                    <div className="level">
                                        <div className="level-item has-text-centered">
                                            <div>
                                                <p className="heading">Staff</p>
                                                <p className="title has-text-white">
                                                    128
                                                </p>
                                            </div>
                                        </div>
                                        <div className="level-item">
                                            <span className="icon is-large">
                                                <i className="fas fa-users fa-2x"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="columns">
                    <div className="column is-8">
                        <div className="box">
                            <h3 className="title is-4">Recent Activity</h3>
                            <div className="content">
                                <div className="activity-item">
                                    <div className="activity-icon has-background-info">
                                        <i className="fas fa-user-plus"></i>
                                    </div>
                                    <div className="activity-content">
                                        <p>
                                            <strong>
                                                New staff member added
                                            </strong>
                                        </p>
                                        <p>
                                            John Smith was added to the Pharmacy
                                            department
                                        </p>
                                        <p className="is-size-7 has-text-grey">
                                            2 hours ago
                                        </p>
                                    </div>
                                </div>

                                <div className="activity-item">
                                    <div className="activity-icon has-background-success">
                                        <i className="fas fa-clipboard-check"></i>
                                    </div>
                                    <div className="activity-content">
                                        <p>
                                            <strong>
                                                Ward workload updated
                                            </strong>
                                        </p>
                                        <p>
                                            Ward 5 workload has been updated for
                                            today
                                        </p>
                                        <p className="is-size-7 has-text-grey">
                                            5 hours ago
                                        </p>
                                    </div>
                                </div>

                                <div className="activity-item">
                                    <div className="activity-icon has-background-warning">
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div className="activity-content">
                                        <p>
                                            <strong>
                                                Staff shortage alert
                                            </strong>
                                        </p>
                                        <p>
                                            COTE department is short-staffed for
                                            afternoon shift
                                        </p>
                                        <p className="is-size-7 has-text-grey">
                                            Yesterday
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="column is-4">
                        <div className="box">
                            <h3 className="title is-4">Organisation Details</h3>
                            <div className="content">
                                <p>
                                    <strong>Name:</strong> {organisation.name}
                                </p>
                                <p>
                                    <strong>Type:</strong> {organisation.type}
                                </p>
                                <p>
                                    <strong>Contact Email:</strong>{" "}
                                    {organisation.contactEmail}
                                </p>
                                <p>
                                    <strong>Contact Phone:</strong>{" "}
                                    {organisation.contactPhone || "N/A"}
                                </p>
                                <p>
                                    <strong>Status:</strong>{" "}
                                    {organisation.active
                                        ? "Active"
                                        : "Inactive"}
                                </p>
                            </div>
                        </div>

                        <div className="box">
                            <h3 className="title is-4">Quick Links</h3>
                            <div className="buttons">
                                <a
                                    href="#/staff"
                                    className="button is-fullwidth is-light"
                                >
                                    <span className="icon">
                                        <i className="fas fa-user-md"></i>
                                    </span>
                                    <span>Manage Staff</span>
                                </a>

                                <a
                                    href="#/workloads"
                                    className="button is-fullwidth is-light"
                                >
                                    <span className="icon">
                                        <i className="fas fa-clipboard-list"></i>
                                    </span>
                                    <span>Update Workloads</span>
                                </a>

                                <a
                                    href="#/reports"
                                    className="button is-fullwidth is-light"
                                >
                                    <span className="icon">
                                        <i className="fas fa-chart-bar"></i>
                                    </span>
                                    <span>View Reports</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
