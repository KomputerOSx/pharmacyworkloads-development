"use client";

import DirectorateView from "@/components/directorates/DirectorateView";
import {
    cotePharmacists,
    coteWards,
    emrgPharmacists,
    emrgWards,
    medsPharmacists,
    medsWards,
    surgPharmacists,
    surgWards,
} from "@/context/sampleData1";
import CombinedView from "@/components/combinedView/CombinedView";
import React, { useState } from "react";
import { useEditMode } from "@/context/EditModeContext";

function RenderTabContent() {
    const [activeTab, setActiveTab] = useState("combined");
    const { isAnyDirectorateInEditMode } = useEditMode();

    // Handle tab switching with edit mode check
    const handleTabClick = (tab: string) => {
        // Don't do anything if trying to click the already active tab
        if (tab === activeTab) return;

        // Check if any directorate is in edit mode
        if (isAnyDirectorateInEditMode() && activeTab !== tab) {
            // If in edit mode, only allow clicking the current tab
            // No alert - the UI visually indicates tabs are disabled
            return;
        } else {
            // If no edit in progress, switch tab normally
            setActiveTab(tab);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "cote":
                return (
                    <DirectorateView
                        directorateName={"COTE"}
                        wards={coteWards}
                        pharmacists={cotePharmacists}
                    />
                );
            case "meds":
                return (
                    <DirectorateView
                        directorateName={"MEDS"}
                        wards={medsWards}
                        pharmacists={medsPharmacists}
                    />
                );
            case "surg":
                return (
                    <DirectorateView
                        directorateName={"SURG"}
                        wards={surgWards}
                        pharmacists={surgPharmacists}
                    />
                );
            case "emrg":
                return (
                    <DirectorateView
                        directorateName={"EMRG"}
                        wards={emrgWards}
                        pharmacists={emrgPharmacists}
                    />
                );
            case "combined":
            default:
                return <CombinedView />;
        }
    };

    return (
        <>
            <div className="tabs">
                <ul>
                    <li
                        className={`${activeTab === "cote" ? "is-active" : ""} ${isAnyDirectorateInEditMode() && activeTab !== "cote" ? "disabled-tab" : ""}`}
                    >
                        <a
                            onClick={() => handleTabClick("cote")}
                            style={{
                                cursor:
                                    isAnyDirectorateInEditMode() &&
                                    activeTab !== "cote"
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    isAnyDirectorateInEditMode() &&
                                    activeTab !== "cote"
                                        ? 0.5
                                        : 1,
                            }}
                        >
                            COTE
                        </a>
                    </li>
                    <li
                        className={`${activeTab === "meds" ? "is-active" : ""} ${isAnyDirectorateInEditMode() && activeTab !== "meds" ? "disabled-tab" : ""}`}
                    >
                        <a
                            onClick={() => handleTabClick("meds")}
                            style={{
                                cursor:
                                    isAnyDirectorateInEditMode() &&
                                    activeTab !== "meds"
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    isAnyDirectorateInEditMode() &&
                                    activeTab !== "meds"
                                        ? 0.5
                                        : 1,
                            }}
                        >
                            MEDS
                        </a>
                    </li>
                    <li
                        className={`${activeTab === "surg" ? "is-active" : ""} ${isAnyDirectorateInEditMode() && activeTab !== "surg" ? "disabled-tab" : ""}`}
                    >
                        <a
                            onClick={() => handleTabClick("surg")}
                            style={{
                                cursor:
                                    isAnyDirectorateInEditMode() &&
                                    activeTab !== "surg"
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    isAnyDirectorateInEditMode() &&
                                    activeTab !== "surg"
                                        ? 0.5
                                        : 1,
                            }}
                        >
                            SURG
                        </a>
                    </li>
                    <li
                        className={`${activeTab === "emrg" ? "is-active" : ""} ${isAnyDirectorateInEditMode() && activeTab !== "emrg" ? "disabled-tab" : ""}`}
                    >
                        <a
                            onClick={() => handleTabClick("emrg")}
                            style={{
                                cursor:
                                    isAnyDirectorateInEditMode() &&
                                    activeTab !== "emrg"
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    isAnyDirectorateInEditMode() &&
                                    activeTab !== "emrg"
                                        ? 0.5
                                        : 1,
                            }}
                        >
                            EMRG
                        </a>
                    </li>
                    <li
                        className={`${activeTab === "combined" ? "is-active" : ""} ${isAnyDirectorateInEditMode() && activeTab !== "combined" ? "disabled-tab" : ""}`}
                    >
                        <a
                            onClick={() => handleTabClick("combined")}
                            style={{
                                cursor:
                                    isAnyDirectorateInEditMode() &&
                                    activeTab !== "combined"
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    isAnyDirectorateInEditMode() &&
                                    activeTab !== "combined"
                                        ? 0.5
                                        : 1,
                            }}
                        >
                            Combined View
                        </a>
                    </li>
                </ul>
            </div>

            <div className="tab-content">{renderTabContent()}</div>
        </>
    );
}

export default RenderTabContent;
