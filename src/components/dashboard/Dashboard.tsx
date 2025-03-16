"use client";

import React, { useState } from 'react';

const Dashboard: React.FC = () => {
    const [shiftFilter, setShiftFilter] = useState('all');

    return (
        <div>
            <h2 className="title is-2">Workload Dashboard</h2>

            {/* Shift Filter */}
            <div className="field mb-5">
                <label className="label">Filter by shift:</label>
                <div className="control">
                    <div className="select">
                        <select
                            value={shiftFilter}
                            onChange={(e) => setShiftFilter(e.target.value)}
                        >
                            <option value="all">All Shifts</option>
                            <option value="AM">AM Only</option>
                            <option value="PM">PM Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="columns is-multiline mb-5">
                <div className="column is-2-widescreen is-4-desktop is-6-tablet">
                    <div className="box has-text-centered">
                        <p className="heading">Medication Histories</p>
                        <p className="title">0</p>
                    </div>
                </div>
                <div className="column is-2-widescreen is-4-desktop is-6-tablet">
                    <div className="box has-text-centered">
                        <p className="heading">Medications To Review</p>
                        <p className="title">0</p>
                    </div>
                </div>
                <div className="column is-2-widescreen is-4-desktop is-6-tablet">
                    <div className="box has-text-centered">
                        <p className="heading">Total Workload</p>
                        <p className="title">0</p>
                    </div>
                </div>
                <div className="column is-2-widescreen is-4-desktop is-6-tablet">
                    <div className="box has-text-centered">
                        <p className="heading">Wards Assigned</p>
                        <p className="title">0</p>
                    </div>
                </div>
                <div className="column is-2-widescreen is-4-desktop is-6-tablet">
                    <div className="box has-text-centered">
                        <p className="heading">AM Shifts</p>
                        <p className="title">0</p>
                    </div>
                </div>
                <div className="column is-2-widescreen is-4-desktop is-6-tablet">
                    <div className="box has-text-centered">
                        <p className="heading">PM Shifts</p>
                        <p className="title">0</p>
                    </div>
                </div>
            </div>

            {/* First Row of Charts */}
            <div className="columns mb-5">
                <div className="column is-6">
                    <div className="box">
                        <h3 className="title is-4">Directorate Workload Distribution</h3>
                        <div id="directorateChart" style={{ height: '200px', position: 'relative' }}>
                            {/* Placeholder for pie chart */}
                            <p className="has-text-centered has-text-grey">Pie chart will be displayed here</p>
                        </div>
                    </div>
                </div>
                <div className="column is-6">
                    <div className="box">
                        <h3 className="title is-4">Ward Workload Comparison</h3>
                        <div id="wardChart" style={{ height: '200px', position: 'relative' }}>
                            {/* Placeholder for bar chart */}
                            <p className="has-text-centered has-text-grey">Bar chart will be displayed here</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row of Charts */}
            <div className="columns">
                <div className="column is-6">
                    <div className="box">
                        <h3 className="title is-4">AM vs PM Workload</h3>
                        <div style={{ height: '200px', position: 'relative', display: 'flex' }}>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <h4 className="title is-5">AM Workload</h4>
                                <div id="amWorkloadChart" style={{ height: '150px' }}>
                                    {/* Placeholder for AM chart */}
                                    <p className="has-text-centered has-text-grey">AM chart will be displayed here</p>
                                </div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <h4 className="title is-5">PM Workload</h4>
                                <div id="pmWorkloadChart" style={{ height: '150px' }}>
                                    {/* Placeholder for PM chart */}
                                    <p className="has-text-centered has-text-grey">PM chart will be displayed here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="column is-6">
                    <div className="box">
                        <h3 className="title is-4">Pharmacist Allocation</h3>
                        <div id="pharmacistChart" style={{ height: '200px', position: 'relative' }}>
                            {/* Placeholder for pharmacist chart */}
                            <p className="has-text-centered has-text-grey">Pharmacist allocation chart will be displayed here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;