"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Organisation } from "@/context/OrganisationContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getOrganisation } from "@/services/organisationService";
import Link from "next/link";
import styles from "../styles/Dashboard.module.css";
import { useHospitals } from "@/context/HospitalContext";

export default function OrganisationPage() {
    const params = useParams();
    const orgId = params.orgId as string;

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const hospitals = useHospitals().hospitals;

    useEffect(() => {
        const fetchOrganisation = async () => {
            if (!orgId) return;

            try {
                setLoading(true);
                const data = await getOrganisation(orgId);
                setOrganisation(data);
            } catch (err) {
                console.error("Error fetching organisation:", err);
                setError("Failed to load organisation details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrganisation().then((r) => r);
    }, [orgId]);

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="notification is-danger">
                <p>{error}</p>
            </div>
        );
    }

    if (!organisation) {
        return (
            <div className="notification is-warning">
                <p>Organisation not found</p>
            </div>
        );
    }

    return (
        <div>
            <div className="section">
                <h1 className="title is-3 mb-5">Dashboard</h1>
                <h2 className="subtitle is-5">
                    Welcome to your organisation dashboard
                </h2>

                <div className="box">
                    <h3 className="title is-4">Quick Stats</h3>
                    <div className="columns is-multiline">
                        <div className="column is-3">
                            <div
                                className={`card has-background-primary has-text-white ${styles.card} ${styles.primaryCard}`}
                            >
                                <div className="card-content">
                                    <div className="level">
                                        <div className="level-item has-text-centered">
                                            <div>
                                                <p className="heading">
                                                    Hospitals
                                                </p>
                                                <p className="title has-text-white">
                                                    {hospitals.length}
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
                            <div
                                className={`card has-background-link has-text-white ${styles.card} ${styles.linkCard}`}
                            >
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
                            <div
                                className={`card has-background-success has-text-white ${styles.card} ${styles.successCard}`}
                            >
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
                            <div
                                className={`card has-background-warning has-text-white ${styles.card} ${styles.warningCard}`}
                            >
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
                                <div className={styles.activityItem}>
                                    <div
                                        className={`${styles.activityIcon} has-background-info`}
                                    >
                                        <i className="fas fa-user-plus"></i>
                                    </div>
                                    <div className={styles.activityContent}>
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

                                <div className={styles.activityItem}>
                                    <div
                                        className={`${styles.activityIcon} has-background-success`}
                                    >
                                        <i className="fas fa-clipboard-check"></i>
                                    </div>
                                    <div className={styles.activityContent}>
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

                                <div className={styles.activityItem}>
                                    <div
                                        className={`${styles.activityIcon} has-background-warning`}
                                    >
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div className={styles.activityContent}>
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
                            <div className={`buttons ${styles.quickLinks}`}>
                                <Link
                                    href={`/admin/${orgId}/staff`}
                                    className="button is-fullwidth is-light"
                                >
                                    <span className="icon">
                                        <i className="fas fa-user-md"></i>
                                    </span>
                                    <span>Manage Staff</span>
                                </Link>

                                <Link
                                    href={`/admin/${orgId}/hospitals`}
                                    className="button is-fullwidth is-light"
                                >
                                    <span className="icon">
                                        <i className="fas fa-hospital"></i>
                                    </span>
                                    <span>Manage Hospitals</span>
                                </Link>

                                <Link
                                    href={`/admin/${orgId}/reports`}
                                    className="button is-fullwidth is-light"
                                >
                                    <span className="icon">
                                        <i className="fas fa-chart-bar"></i>
                                    </span>
                                    <span>View Reports</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
