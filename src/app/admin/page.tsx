"use client";

import { useState } from "react";
import TabNavigation from "../admin/components/TabNavigation";
import Dashboard from "../admin/components/Dashboard";
import HospitalManagement from "../admin/components/HospitalManagement";
import DepartmentManagement from "@/app/admin/components/DepartmentManagement";
import WardManagement from "@/app/admin/components/WardManagement";
import StaffManagement from "@/app/admin/components/StaffManagement";

// Tab type definition
export type TabId =
    | "dashboard"
    | "organizations"
    | "hospitals"
    | "departments"
    | "wards"
    | "staff"
    | "workloads"
    | "reports"
    | "audit";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<TabId>("dashboard");

    return (
        <>
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "dashboard" && <Dashboard />}

            {activeTab === "organizations" && <OrganisationManagement />}

            {activeTab === "hospitals" && <HospitalManagement />}

            {activeTab === "departments" && <DepartmentManagement />}

            {activeTab === "wards" && <WardManagement />}

            {activeTab === "staff" && <StaffManagement />}

            {activeTab === "workloads" && (
                <div className="notification is-info">
                    <p className="title is-4">Workload Management</p>
                    <p>
                        This section would contain the daily workload tracking
                        and assignments
                    </p>
                </div>
            )}

            {activeTab === "reports" && (
                <div className="notification is-info">
                    <p className="title is-4">Reports</p>
                    <p>
                        This section would contain various reports and analytics
                        based on the workload data
                    </p>
                </div>
            )}

            {activeTab === "audit" && (
                <div className="notification is-info">
                    <p className="title is-4">Audit Logs</p>
                    <p>
                        This section would display the audit trail of all
                        actions in the system
                    </p>
                </div>
            )}
        </>
    );
}
