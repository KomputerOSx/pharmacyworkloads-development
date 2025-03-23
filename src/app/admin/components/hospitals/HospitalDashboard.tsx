// src/app/admin/components/hospitals/HospitalDashboard.tsx
import React from "react";
import { useHospitals } from "@/context/HospitalContext";

export default function HospitalDashboard() {
    const { hospitals, loading, organisation } = useHospitals();

    // Calculate summary statistics
    const totalHospitals = hospitals.length;
    const activeHospitals = hospitals.filter((h) => h.active).length;

    if (loading) {
        return (
            <div className="box">
                <p>Loading dashboard statistics...</p>
            </div>
        );
    }

    return (
        <div className="box mb-5">
            <h3 className="title is-4 mb-4">Hospital Statistics</h3>

            <div className="columns is-multiline">
                <div className="column is-4 is-4-desktop">
                    <div className="notification is-primary">
                        <div className="has-text-centered">
                            <p className="heading">Total Hospitals</p>
                            <p className="title">{totalHospitals}</p>
                        </div>
                    </div>
                </div>

                <div className="column is-4 is-4-desktop">
                    <div className="notification is-link">
                        <div className="has-text-centered">
                            <p className="heading">Active Hospitals</p>
                            <p className="title">{activeHospitals}</p>
                        </div>
                    </div>
                </div>

                <div className="column is-4 is-4-desktop">
                    <div className="notification is-success">
                        <div className="has-text-centered">
                            <p className="heading">Departments</p>
                            <p className="title">0</p>
                        </div>
                    </div>
                </div>
            </div>

            {totalHospitals > 0 && (
                <div className="mt-4">
                    <h4 className="title is-5 mb-3">Capacity Distribution</h4>
                    <progress
                        className="progress is-primary"
                        value={activeHospitals}
                        max={totalHospitals}
                    ></progress>
                    <p className="has-text-centered is-size-7">
                        {activeHospitals} of {totalHospitals} hospitals are
                        currently active
                    </p>
                </div>
            )}

            {totalHospitals === 0 && (
                <div className="notification is-warning mt-4">
                    <p>
                        No hospitals have been added yet for{" "}
                        {organisation?.name}.
                    </p>
                    <p>Add your first hospital to see statistics.</p>
                </div>
            )}
        </div>
    );
}
