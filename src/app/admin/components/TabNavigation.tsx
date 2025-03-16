import { TabId } from "../page";

interface TabNavigationProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

export default function TabNavigation({
    activeTab,
    setActiveTab,
}: TabNavigationProps) {
    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
        {
            id: "organizations",
            label: "Organizations",
            icon: "fas fa-building",
        },
        { id: "hospitals", label: "Hospitals", icon: "fas fa-hospital" },
        { id: "departments", label: "Departments", icon: "fas fa-sitemap" },
        { id: "wards", label: "Wards", icon: "fas fa-bed" },
        { id: "staff", label: "Staff", icon: "fas fa-users" },
        { id: "workloads", label: "Workloads", icon: "fas fa-clipboard-list" },
        { id: "reports", label: "Reports", icon: "fas fa-chart-bar" },
        { id: "audit", label: "Audit Logs", icon: "fas fa-history" },
    ];

    return (
        <div className="tabs is-boxed">
            <ul>
                {tabs.map((tab) => (
                    <li
                        key={tab.id}
                        className={activeTab === tab.id ? "is-active" : ""}
                        onClick={() => setActiveTab(tab.id as TabId)}
                    >
                        <a>
                            <span className="icon is-small">
                                <i className={tab.icon}></i>
                            </span>
                            <span>{tab.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
