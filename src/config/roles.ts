// src/config/roles.ts

export const ADMIN_USER_ROLES = [
    "admin",
    "manager",
    "coordinator",
    "user",
] as const;

export const MANAGER_USER_ROLES = ["user", "coordinator", "manager"] as const;

export type UserRole = (typeof ADMIN_USER_ROLES)[number];

export function isValidUserRole(role: string): role is UserRole {
    return ADMIN_USER_ROLES.includes(role as UserRole);
}
