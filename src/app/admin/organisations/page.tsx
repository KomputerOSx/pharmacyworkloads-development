"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Organisation } from "@/context/OrganisationContext";
import { getOrganisation } from "@/services/organisationService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import NoticeBoard from "../components/dashboard/NoticeBoard";
import ActivityFeed from "../components/dashboard/ActivityFeed";

export default function OrganisationHomePage() {
    const router = useRouter();
    const params = useParams();
    const orgId = params.orgId as string;

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        hospitals: 0,
        departments: 0,
        wards: 0,
        staff: 0,
    });

    // Load organisation details
    useEffect(() => {
        const loadOrganisation = async () => {
            try {
                setLoading(true);
                const org = await getOrganisation(orgId);
                setOrganisation(org as Organisation);

                // You would fetch these stats from your services
                // This is just a placeholder
                setStats({
                    hospitals: 4,
                    departments: 12,
                    wards: 36,
                    staff: 128,
                });
            } catch (err) {
                console.error("Error loading organisation:", err);
                setError(
                    "Failed to load organisation details. Please try again.",
                );
            } finally {
                setLoading(false);
            }
        };

        loadOrganisation();
    }, [orgId]);

    const navigateTo = (path: string) => {
        router.push(`/${orgId}/${path}`);
    };

    if (loading) return <LoadingSpinner />;
    if (error) {
        return (
            <div className="notification is-danger">
                <button
                    className="delete"
                    onClick={() => setError(null)}
                ></button>
                {error}
            </div>
        );
    }
    if (!organisation) {
        return (
            <div className="notification is-warning">
                Organisation not found
            </div>
        );
    }

    return (
        <div>
            {/* Organisation Header */}
            <div className="box mb-5">
                <div className="columns is-vcentered">
                    <div className="column">
                        <h1 className="title is-3">{organisation.name}</h1>
                        <p className="subtitle is-5">
                            {organisation.type} • {organisation.contactEmail}
                        </p>
                    </div>
                    <div className="column is-narrow">
                        <span
                            className={`tag is-large ${organisation.active ? "is-success" : "is-danger"}`}
                        >
                            {organisation.active ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="columns">
                {/* Main content area */}
                <div className="column is-8">
                    {/* Stats Summary */}
                    <div className="box mb-5">
                        <h3 className="title is-4 mb-4">
                            Organisation Overview
                        </h3>
                        <div className="columns is-multiline">
                            <div className="column is-3">
                                <div className="notification is-primary has-text-centered">
                                    <p className="heading">Hospitals</p>
                                    <p className="title">{stats.hospitals}</p>
                                </div>
                            </div>
                            <div className="column is-3">
                                <div className="notification is-info has-text-centered">
                                    <p className="heading">Departments</p>
                                    <p className="title">{stats.departments}</p>
                                </div>
                            </div>
                            <div className="column is-3">
                                <div className="notification is-success has-text-centered">
                                    <p className="heading">Wards</p>
                                    <p className="title">{stats.wards}</p>
                                </div>
                            </div>
                            <div className="column is-3">
                                <div className="notification is-warning has-text-centered">
                                    <p className="heading">Staff</p>
                                    <p className="title">{stats.staff}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resource Cards */}
                    <div className="box">
                        <h3 className="title is-4 mb-4">Manage Resources</h3>
                        <div className="columns is-multiline">
                            <div className="column is-4">
                                <div
                                    className="card"
                                    onClick={() => navigateTo("hospitals")}
                                >
                                    <div className="card-content has-text-centered">
                                        <span className="icon is-large has-text-primary">
                                            <i className="fas fa-hospital fa-3x"></i>
                                        </span>
                                        <p className="title is-5 mt-3">
                                            Hospitals
                                        </p>
                                        <p className="subtitle is-6">
                                            Manage hospital facilities
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="column is-4">
                                <div
                                    className="card"
                                    onClick={() => navigateTo("departments")}
                                >
                                    <div className="card-content has-text-centered">
                                        <span className="icon is-large has-text-info">
                                            <i className="fas fa-sitemap fa-3x"></i>
                                        </span>
                                        <p className="title is-5 mt-3">
                                            Departments
                                        </p>
                                        <p className="subtitle is-6">
                                            Manage clinical departments
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="column is-4">
                                <div
                                    className="card"
                                    onClick={() => navigateTo("wards")}
                                >
                                    <div className="card-content has-text-centered">
                                        <span className="icon is-large has-text-success">
                                            <i className="fas fa-bed fa-3x"></i>
                                        </span>
                                        <p className="title is-5 mt-3">Wards</p>
                                        <p className="subtitle is-6">
                                            Manage hospital wards
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="column is-4">
                                <div
                                    className="card"
                                    onClick={() => navigateTo("staff")}
                                >
                                    <div className="card-content has-text-centered">
                                        <span className="icon is-large has-text-warning">
                                            <i className="fas fa-users fa-3x"></i>
                                        </span>
                                        <p className="title is-5 mt-3">Staff</p>
                                        <p className="subtitle is-6">
                                            Manage pharmacy staff
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="column is-4">
                                <div
                                    className="card"
                                    onClick={() => navigateTo("workloads")}
                                >
                                    <div className="card-content has-text-centered">
                                        <span className="icon is-large has-text-danger">
                                            <i className="fas fa-clipboard-list fa-3x"></i>
                                        </span>
                                        <p className="title is-5 mt-3">
                                            Workloads
                                        </p>
                                        <p className="subtitle is-6">
                                            Manage daily workloads
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="column is-4">
                                <div
                                    className="card"
                                    onClick={() => navigateTo("reports")}
                                >
                                    <div className="card-content has-text-centered">
                                        <span className="icon is-large has-text-link">
                                            <i className="fas fa-chart-bar fa-3x"></i>
                                        </span>
                                        <p className="title is-5 mt-3">
                                            Reports
                                        </p>
                                        <p className="subtitle is-6">
                                            View analysis & reports
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="box mt-5">
                        <h3 className="title is-4 mb-4">Recent Activity</h3>
                        <ActivityFeed />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="column is-4">
                    <div className="box">
                        <h3 className="title is-4 mb-4">
                            Organisation Details
                        </h3>
                        <div className="content">
                            <p>
                                <strong>Name:</strong> {organisation.name}
                            </p>
                            <p>
                                <strong>Type:</strong> {organisation.type}
                            </p>
                            <p>
                                <strong>Email:</strong>{" "}
                                {organisation.contactEmail}
                            </p>
                            <p>
                                <strong>Phone:</strong>{" "}
                                {organisation.contactPhone}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                {organisation.active ? "Active" : "Inactive"}
                            </p>
                        </div>
                    </div>

                    <NoticeBoard />
                </div>
            </div>
        </div>
    );
}
