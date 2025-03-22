"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarItem = {
    title: string;
    icon: string;
    path: string;
    children?: SidebarItem[];
};

type SidebarProps = {
    expanded: boolean;
    onToggle: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggle }) => {
    const pathname = usePathname();
    const [expandedGroups, setExpandedGroups] = useState<
        Record<string, boolean>
    >({
        Dashboard: true,
        Settings: false,
    });

    // Navigation items structure
    const navItems: SidebarItem[] = [
        {
            title: "Dashboard",
            icon: "fa-tachometer-alt",
            path: "#",
            children: [
                {
                    title: "Hospitals",
                    icon: "fa-hospital",
                    path: "#/hospitals",
                },
                {
                    title: "Departments",
                    icon: "fa-sitemap",
                    path: "#/departments",
                },
                { title: "Wards", icon: "fa-bed", path: "#/wards" },
                { title: "Staff", icon: "fa-users", path: "#/staff" },
            ],
        },
        {
            title: "Settings",
            icon: "fa-cog",
            path: "#/settings",
        },
        {
            title: "Audit Logs",
            icon: "fa-history",
            path: "#/audit-logs",
        },
        {
            title: "Reports",
            icon: "fa-chart-bar",
            path: "#/reports",
        },
    ];

    const toggleGroup = (title: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const isActive = (path: string) => {
        if (path === "#") return pathname === "/dashboard";
        return pathname.includes(path.replace("#", ""));
    };

    return (
        <div
            className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
            style={{
                width: expanded ? "250px" : "70px",
                transition: "width 0.3s ease",
            }}
        >
            {/* Sidebar Header */}
            <div className="sidebar-header">
                <div className="logo-container">
                    {expanded ? (
                        <span className="logo-text">Pharmacy Workloads</span>
                    ) : (
                        <span className="logo-icon">
                            <i className="fas fa-prescription-bottle-alt"></i>
                        </span>
                    )}
                </div>
                <button className="toggle-button" onClick={onToggle}>
                    <i
                        className={`fas ${expanded ? "fa-chevron-left" : "fa-chevron-right"}`}
                    ></i>
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {navItems.map((item) => (
                        <li key={item.title} className="nav-item">
                            {item.children ? (
                                <>
                                    <div
                                        className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                                        onClick={() => toggleGroup(item.title)}
                                    >
                                        <span className="icon">
                                            <i
                                                className={`fas ${item.icon}`}
                                            ></i>
                                        </span>
                                        {expanded && (
                                            <>
                                                <span className="title">
                                                    {item.title}
                                                </span>
                                                <span className="dropdown-icon">
                                                    <i
                                                        className={`fas ${expandedGroups[item.title] ? "fa-chevron-down" : "fa-chevron-right"}`}
                                                    ></i>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {expanded && expandedGroups[item.title] && (
                                        <ul className="sub-nav">
                                            {item.children.map((child) => (
                                                <li
                                                    key={child.title}
                                                    className="sub-nav-item"
                                                >
                                                    <Link
                                                        href={child.path}
                                                        className={`sub-nav-link ${isActive(child.path) ? "active" : ""}`}
                                                    >
                                                        <span className="icon">
                                                            <i
                                                                className={`fas ${child.icon}`}
                                                            ></i>
                                                        </span>
                                                        <span className="title">
                                                            {child.title}
                                                        </span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={item.path}
                                    className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                                >
                                    <span className="icon">
                                        <i className={`fas ${item.icon}`}></i>
                                    </span>
                                    {expanded && (
                                        <span className="title">
                                            {item.title}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
