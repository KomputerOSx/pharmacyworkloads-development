// src/config/roles.ts

/**
 * Defines the standard user roles available in the application.
 * Using 'as const' asserts that this array and its contents are read-only
 * and allows TypeScript to infer a narrow literal type for each role.
 */
export const USER_ROLES = ["admin", "manager", "coordinator", "user"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isValidUserRole(role: string): role is UserRole {
    return USER_ROLES.includes(role as UserRole);
}
