"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../../app/admin/styles/Sidebar.module.css";

type SidebarItem = {
    title: string;
    icon: string;
    path: string;
    children?: SidebarItem[];
};

type SidebarProps = {
    expanded: boolean;
    onToggle: () => void;
    orgId: string;
};

const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggle, orgId }) => {
    const pathname = usePathname();
    const [expandedGroups, setExpandedGroups] = useState<
        Record<string, boolean>
    >({
        Resources: true,
        Settings: false,
    });

    // Navigation items structure with dashboard
    const navItems: SidebarItem[] = [
        {
            title: "Dashboard",
            icon: "fa-tachometer-alt",
            path: `/admin/${orgId}`,
        },
        {
            title: "Resources",
            icon: "fa-hospital-user",
            path: "#",
            children: [
                {
                    title: "Hospitals",
                    icon: "fa-hospital",
                    path: `/admin/${orgId}/hospitals`,
                },
                {
                    title: "Departments",
                    icon: "fa-sitemap",
                    path: `/admin/${orgId}/departments`,
                },
                {
                    title: "Wards",
                    icon: "fa-bed",
                    path: `/admin/${orgId}/wards`,
                },
                {
                    title: "Staff",
                    icon: "fa-users",
                    path: `/admin/${orgId}/staff`,
                },
            ],
        },
        {
            title: "Settings",
            icon: "fa-cog",
            path: `/admin/${orgId}/settings`,
        },
        {
            title: "Audit Logs",
            icon: "fa-history",
            path: `/admin/${orgId}/audit-logs`,
        },
        {
            title: "Reports",
            icon: "fa-chart-bar",
            path: `/admin/${orgId}/reports`,
        },
    ];

    const toggleGroup = (title: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(path);
    };

    return (
        <div
            className={`${styles.sidebar} ${expanded ? styles.expanded : styles.collapsed}`}
        >
            <div className={styles.sidebarHeader}>
                <div className={styles.logoContainer}>
                    {expanded ? (
                        <span className={styles.logoText}>
                            Pharmacy Workloads
                        </span>
                    ) : (
                        <span className={styles.logoText}></span>
                    )}
                </div>
                <button className={styles.toggleButton} onClick={onToggle}>
                    <i
                        className={`fas ${expanded ? "fa-chevron-left" : "fa-chevron-right"}`}
                    ></i>
                </button>
            </div>

            {/* Navigation Items */}
            <nav className={styles.sidebarNav}>
                <ul className={styles.navList}>
                    {navItems.map((item) => (
                        <li key={item.title} className={styles.navItem}>
                            {item.children ? (
                                <>
                                    <div
                                        className={`${styles.navLink} ${isActive(item.path) ? styles.active : ""}`}
                                        onClick={() => toggleGroup(item.title)}
                                    >
                                        <span className={styles.icon}>
                                            <i
                                                className={`fas ${item.icon}`}
                                            ></i>
                                        </span>
                                        {expanded && (
                                            <>
                                                <span className={styles.title}>
                                                    {item.title}
                                                </span>
                                                <span
                                                    className={
                                                        styles.dropdownIcon
                                                    }
                                                >
                                                    <i
                                                        className={`fas ${expandedGroups[item.title] ? "fa-chevron-down" : "fa-chevron-right"}`}
                                                    ></i>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {expanded && expandedGroups[item.title] && (
                                        <ul className={styles.subNav}>
                                            {item.children.map((child) => (
                                                <li
                                                    key={child.title}
                                                    className={
                                                        styles.subNavItem
                                                    }
                                                >
                                                    <Link
                                                        href={child.path}
                                                        className={`${styles.subNavLink} ${isActive(child.path) ? styles.active : ""}`}
                                                    >
                                                        <span
                                                            className={
                                                                styles.icon
                                                            }
                                                        >
                                                            <i
                                                                className={`fas ${child.icon}`}
                                                            ></i>
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.title
                                                            }
                                                        >
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
                                    className={`${styles.navLink} ${isActive(item.path) ? styles.active : ""}`}
                                >
                                    <span className={styles.icon}>
                                        <i className={`fas ${item.icon}`}></i>
                                    </span>
                                    {expanded && (
                                        <span className={styles.title}>
                                            {item.title}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Organization Selector */}
            <div className={styles.sidebarFooter}>
                <Link
                    href="/admin/organisations"
                    className={styles.orgSelector}
                >
                    <span className={styles.icon}>
                        <i className="fas fa-building"></i>
                    </span>
                    {expanded && (
                        <span className={styles.title}>
                            Change Organisation
                        </span>
                    )}
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
