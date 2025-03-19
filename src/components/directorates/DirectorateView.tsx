"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditMode } from "@/context/EditModeContext";

// Define types for our data structures
interface WardData {
    amPharmacist: string;
    pmPharmacist: string;
    histories: number;
    reviews: number;
}

interface DirectorateViewProps {
    directorateName: string;
    wards: string[];
    pharmacists: string[];
}

function DirectorateView({
    directorateName,
    wards,
    pharmacists,
}: DirectorateViewProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Get the edit mode context functions
    const { setDirectorateEditMode } = useEditMode();

    // Store the actual ward data
    const [wardData, setWardData] = useState<Record<string, WardData>>(() => {
        // Initialize with empty data for each ward
        const initialData: Record<string, WardData> = {};
        if (wards && wards.length) {
            wards.forEach((ward) => {
                initialData[ward] = {
                    amPharmacist: "",
                    pmPharmacist: "",
                    histories: 0,
                    reviews: 0,
                };
            });
        }
        return initialData;
    });

    // Track which wards are in edit mode (all by default)
    const [editMode, setEditMode] = useState<Record<string, boolean>>(() => {
        const initialEditMode: Record<string, boolean> = {};
        if (wards && wards.length) {
            wards.forEach((ward) => {
                initialEditMode[ward] = false;
            });
        }
        return initialEditMode;
    });

    // Track saved wards to show in the "Today's Entries" table
    const [savedWards, setSavedWards] = useState<string[]>([]);

    // Handle form input changes
    const handleInputChange = (
        ward: string,
        field: keyof WardData,
        value: string | number,
    ) => {
        setWardData((prev) => {
            // Create the ward data object if it doesn't exist
            const currentWardData = prev[ward] || {
                amPharmacist: "",
                pmPharmacist: "",
                histories: 0,
                reviews: 0,
            };

            return {
                ...prev,
                [ward]: {
                    ...currentWardData,
                    [field]: value,
                },
            };
        });
    };

    // Toggle edit mode for a specific ward
    const toggleEditMode = (ward: string) => {
        setEditMode((prev) => ({
            ...prev,
            [ward]: !prev[ward],
        }));
    };

    // Save a single ward's data
    const saveWard = (ward: string) => {
        // Ensure ward data exists first
        if (!wardData[ward]) {
            setWardData((prev) => ({
                ...prev,
                [ward]: {
                    amPharmacist: "",
                    pmPharmacist: "",
                    histories: 0,
                    reviews: 0,
                },
            }));
        }

        // Add to saved wards if not already there
        if (!savedWards.includes(ward)) {
            setSavedWards((prev) => [...prev, ward]);
        }

        // Exit edit mode
        setEditMode((prev) => ({
            ...prev,
            [ward]: false,
        }));
    };

    // Save all wards' data
    const saveAllWards = () => {
        const wardsToSave = wards.filter(
            (ward) =>
                wardData[ward]?.amPharmacist || wardData[ward]?.pmPharmacist,
        );

        // Add all valid wards to saved list
        setSavedWards((prev) => {
            const newSaved = [...prev];
            wardsToSave.forEach((ward) => {
                if (!newSaved.includes(ward)) {
                    newSaved.push(ward);
                }
            });
            return newSaved;
        });

        // Exit edit mode for all wards
        const newEditMode: Record<string, boolean> = {};
        wards.forEach((ward) => {
            newEditMode[ward] = false;
        });
        setEditMode(newEditMode);
    };

    // Toggle edit mode for all wards
    const editAllWards = () => {
        const newEditMode: Record<string, boolean> = {};
        wards.forEach((ward) => {
            newEditMode[ward] = true;
        });
        setEditMode(newEditMode);
    };

    // Check if any ward is in edit mode
    const isAnyWardInEditMode = () => {
        return Object.values(editMode).some((mode) => mode);
    };

    // Use a ref to track previous edit mode state to avoid unnecessary context updates
    const prevEditModeState = useRef(false);

    // Update the context whenever the edit mode changes
    useEffect(
        () => {
            const currentEditMode = isAnyWardInEditMode();
            // Only update context if the edit state actually changed
            if (prevEditModeState.current !== currentEditMode) {
                setDirectorateEditMode(directorateName, currentEditMode);
                prevEditModeState.current = currentEditMode;
            }
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [editMode, directorateName, setDirectorateEditMode],
    );

    // Filter wards based on search term
    const filteredWards = wards.filter((ward) => {
        const data = wardData[ward] || {
            amPharmacist: "",
            pmPharmacist: "",
            histories: 0,
            reviews: 0,
        };
        const wardMatch = ward.toLowerCase().includes(searchTerm.toLowerCase());
        const amPharmacistMatch = data.amPharmacist
            ? data.amPharmacist.toLowerCase().includes(searchTerm.toLowerCase())
            : false;
        const pmPharmacistMatch = data.pmPharmacist
            ? data.pmPharmacist.toLowerCase().includes(searchTerm.toLowerCase())
            : false;
        return wardMatch || amPharmacistMatch || pmPharmacistMatch;
    });

    return (
        <div>
            <h2 className="title is-2">
                {directorateName} Directorate Workload
            </h2>

            {/* Search Section */}
            <div className="field has-addons mb-5">
                <div className="control is-expanded">
                    <input
                        className="input"
                        type="text"
                        placeholder="Search ward, pharmacist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="control">
                    <button className="button is-info">Search</button>
                </div>
                <div className="control">
                    <button
                        className="button is-light"
                        onClick={() => setSearchTerm("")}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Input Form */}
            <div className="mb-5">
                <p className="mb-3">Enter workload data for all wards:</p>

                <div className="table-container">
                    <table className="table is-fullwidth is-bordered">
                        <thead>
                            <tr>
                                <th>Ward</th>
                                <th>AM Pharmacist</th>
                                <th>PM Pharmacist</th>
                                <th>Medication Histories</th>
                                <th>Medications To Review</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWards.map((ward) => (
                                <tr key={ward}>
                                    <td>{ward}</td>

                                    {/* AM Pharmacist cell - changes based on edit mode */}
                                    <td>
                                        {editMode[ward] ? (
                                            <div className="select is-fullwidth">
                                                <select
                                                    value={
                                                        wardData[ward]
                                                            ?.amPharmacist || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            ward,
                                                            "amPharmacist",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select pharmacist
                                                    </option>
                                                    {pharmacists.map(
                                                        (pharmacist) => (
                                                            <option
                                                                key={`${ward}-am-${pharmacist}`}
                                                                value={
                                                                    pharmacist
                                                                }
                                                            >
                                                                {pharmacist}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        ) : (
                                            wardData[ward]?.amPharmacist || "-"
                                        )}
                                    </td>

                                    {/* PM Pharmacist cell - changes based on edit mode */}
                                    <td>
                                        {editMode[ward] ? (
                                            <div className="select is-fullwidth">
                                                <select
                                                    value={
                                                        wardData[ward]
                                                            ?.pmPharmacist || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            ward,
                                                            "pmPharmacist",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select pharmacist
                                                    </option>
                                                    {pharmacists.map(
                                                        (pharmacist) => (
                                                            <option
                                                                key={`${ward}-pm-${pharmacist}`}
                                                                value={
                                                                    pharmacist
                                                                }
                                                            >
                                                                {pharmacist}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        ) : (
                                            wardData[ward]?.pmPharmacist || "-"
                                        )}
                                    </td>

                                    {/* Medication Histories cell - changes based on edit mode */}
                                    <td>
                                        {editMode[ward] ? (
                                            <input
                                                type="number"
                                                className="input histories"
                                                min="0"
                                                value={
                                                    wardData[ward]?.histories ||
                                                    0
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        ward,
                                                        "histories",
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                            />
                                        ) : (
                                            wardData[ward]?.histories || 0
                                        )}
                                    </td>

                                    {/* Medications To Review cell - changes based on edit mode */}
                                    <td>
                                        {editMode[ward] ? (
                                            <input
                                                type="number"
                                                className="input reviews"
                                                min="0"
                                                value={
                                                    wardData[ward]?.reviews || 0
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        ward,
                                                        "reviews",
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                            />
                                        ) : (
                                            wardData[ward]?.reviews || 0
                                        )}
                                    </td>

                                    {/* Actions cell */}
                                    <td>
                                        {editMode[ward] ? (
                                            <button
                                                className="button is-success is-small"
                                                onClick={() => saveWard(ward)}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <div className="buttons are-small">
                                                <button
                                                    className="button is-info"
                                                    onClick={() =>
                                                        toggleEditMode(ward)
                                                    }
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    className={`button mt-3 ${isAnyWardInEditMode() ? "is-success" : "is-info"}`}
                    onClick={
                        isAnyWardInEditMode() ? saveAllWards : editAllWards
                    }
                >
                    {isAnyWardInEditMode()
                        ? `Save All ${directorateName} Data`
                        : `Edit All ${directorateName} Data`}
                </button>
            </div>
        </div>
    );
}

export default DirectorateView;
