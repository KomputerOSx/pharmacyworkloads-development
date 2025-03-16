"use client";

import React, { useState } from "react";

const CombinedView: React.FC = () => {
    const [directorateFilter, setDirectorateFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div>
            <h2 className="title is-2">Hospital Pharmacy Workload Dashboard</h2>

            {/* Filters and Legend */}
            <div className="columns mb-5">
                <div className="column">
                    <div className="is-flex is-flex-wrap-wrap is-align-items-center">
                        {/* Directorate Filter */}
                        <div className="field mr-4 mb-2">
                            <label className="label is-flex is-align-items-center">
                                <span className="icon mr-2">
                                    <i className="fas fa-hospital"></i>
                                </span>
                                Directorate
                            </label>
                            <div className="control">
                                <div className="select">
                                    <select
                                        value={directorateFilter}
                                        onChange={(e) =>
                                            setDirectorateFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">
                                            All Directorates
                                        </option>
                                        <option value="COTE">COTE</option>
                                        <option value="MEDS">MEDS</option>
                                        <option value="SURG">SURG</option>
                                        <option value="EMRG">EMRG</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Search Filter */}
                        <div className="field mr-4 mb-2">
                            <label className="label is-flex is-align-items-center">
                                <span className="icon mr-2">
                                    <i className="fas fa-search"></i>
                                </span>
                                Search
                            </label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Search ward, pharmacist..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Directorate Legend */}
                        <div className="is-flex is-flex-wrap-wrap is-align-items-center mb-2">
                            <strong className="mr-2">Directorates:</strong>
                            <div className="is-flex is-align-items-center mr-3">
                                <span
                                    className="tag is-info mr-1"
                                    style={{ width: "12px", height: "12px" }}
                                ></span>
                                <span>COTE</span>
                            </div>
                            <div className="is-flex is-align-items-center mr-3">
                                <span
                                    className="tag is-success mr-1"
                                    style={{ width: "12px", height: "12px" }}
                                ></span>
                                <span>MEDS</span>
                            </div>
                            <div className="is-flex is-align-items-center mr-3">
                                <span
                                    className="tag is-danger mr-1"
                                    style={{ width: "12px", height: "12px" }}
                                ></span>
                                <span>SURG</span>
                            </div>
                            <div className="is-flex is-align-items-center mr-3">
                                <span
                                    className="tag is-warning mr-1"
                                    style={{ width: "12px", height: "12px" }}
                                ></span>
                                <span>EMRG</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="box mb-5">
                <div className="columns is-multiline">
                    <div className="column is-3-desktop is-6-tablet">
                        <div className="is-flex is-align-items-center">
                            <span className="icon is-large has-text-info">
                                <i className="fas fa-clipboard-list fa-2x"></i>
                            </span>
                            <div className="ml-3">
                                <p className="heading">Medication Histories</p>
                                <p className="title is-3">0</p>
                            </div>
                        </div>
                    </div>
                    <div className="column is-3-desktop is-6-tablet">
                        <div className="is-flex is-align-items-center">
                            <span className="icon is-large has-text-info">
                                <i className="fas fa-search fa-2x"></i>
                            </span>
                            <div className="ml-3">
                                <p className="heading">Medications To Review</p>
                                <p className="title is-3">0</p>
                            </div>
                        </div>
                    </div>
                    <div className="column is-3-desktop is-6-tablet">
                        <div className="is-flex is-align-items-center">
                            <span className="icon is-large has-text-info">
                                <i className="fas fa-hospital fa-2x"></i>
                            </span>
                            <div className="ml-3">
                                <p className="heading">Active Wards</p>
                                <p className="title is-3">0</p>
                            </div>
                        </div>
                    </div>
                    <div className="column is-3-desktop is-6-tablet">
                        <div className="is-flex is-align-items-center">
                            <span className="icon is-large has-text-info">
                                <i className="fas fa-user-md fa-2x"></i>
                            </span>
                            <div className="ml-3">
                                <p className="heading">Assigned Pharmacists</p>
                                <p className="title is-3">0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Directorate Overview */}
            <div className="box mb-5">
                <h3 className="title is-4 mb-4">Directorate Overview</h3>
                <div className="columns is-multiline" id="directorateSummaries">
                    {/* Placeholder for directorate summary cards */}
                    <div className="column is-6-desktop is-12-tablet">
                        <div className="notification is-info is-light">
                            <h4 className="title is-5">COTE Directorate</h4>
                            <div className="columns is-multiline">
                                <div className="column is-6">
                                    <div className="has-text-centered p-3 has-background-white-bis">
                                        <p className="heading">
                                            Medication Histories
                                        </p>
                                        <p className="title is-4">0</p>
                                    </div>
                                </div>
                                <div className="column is-6">
                                    <div className="has-text-centered p-3 has-background-white-bis">
                                        <p className="heading">
                                            Medications To Review
                                        </p>
                                        <p className="title is-4">0</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="is-size-7 has-text-weight-bold">
                                    Active Wards:
                                </p>
                                <div className="tags">
                                    <span className="tag">Ward 1</span>
                                    <span className="tag">Ward 2</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Repeat for other directorates as needed */}
                </div>
            </div>

            {/* Workload Distribution Chart */}
            <div className="box mb-5">
                <h3 className="title is-4 mb-4">Workload Distribution</h3>
                <div id="workloadDistributionChart" style={{ height: "300px" }}>
                    {/* Placeholder for chart */}
                    <p className="has-text-centered has-text-grey">
                        Chart will be displayed here
                    </p>
                </div>
            </div>

            {/* Pharmacist Workload Summary */}
            <div className="box mb-5">
                <h3 className="title is-4 mb-4">Pharmacist Workload Summary</h3>
                <div className="table-container">
                    <table className="table is-fullwidth is-striped is-hoverable">
                        <thead>
                            <tr>
                                <th>Pharmacist</th>
                                <th>Directorates</th>
                                <th>Wards</th>
                                <th>Shifts</th>
                                <th>Histories</th>
                                <th>Reviews</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Placeholder row */}
                            <tr>
                                <td>John Smith</td>
                                <td>
                                    <span className="tag is-info mr-1">
                                        COTE
                                    </span>
                                    <span className="tag is-warning">EMRG</span>
                                </td>
                                <td>Ward 1, Ward 14</td>
                                <td>AM, PM</td>
                                <td className="has-text-info has-text-weight-bold">
                                    21
                                </td>
                                <td className="has-text-danger has-text-weight-bold">
                                    44
                                </td>
                                <td className="has-text-weight-bold">65</td>
                            </tr>
                            {/* Add more placeholder rows as needed */}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Assignment List */}
            <div className="box">
                <h3 className="title is-4 mb-4">Detailed Assignment List</h3>
                <div className="table-container">
                    <table className="table is-fullwidth is-striped is-hoverable">
                        <thead>
                            <tr>
                                <th>Directorate</th>
                                <th>Ward</th>
                                <th>Pharmacist (AM)</th>
                                <th>Pharmacist (PM)</th>
                                <th>Histories</th>
                                <th>Reviews</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Placeholder row */}
                            <tr>
                                <td>
                                    <span className="tag is-info">COTE</span>
                                </td>
                                <td>Ward 1</td>
                                <td>John Smith</td>
                                <td>Emma Wilson</td>
                                <td className="has-text-info has-text-weight-bold">
                                    12
                                </td>
                                <td className="has-text-danger has-text-weight-bold">
                                    25
                                </td>
                            </tr>
                            {/* Add more placeholder rows as needed */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CombinedView;
