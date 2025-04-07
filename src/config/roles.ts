// src/config/roles.ts

/**
 * Defines the standard user roles available in the application.
 * Using 'as const' asserts that this array and its contents are read-only
 * and allows TypeScript to infer a narrow literal type for each role.
 */
export const USER_ROLES = [
    "Admin", // Full access, can manage organization settings, users, billing etc.
    "Manager", // Can manage users/resources within their assigned departments/teams.
    "Coordinator", // Can manage users/resources within their assigned teams.
    "User", // Standard user, can perform core application functions based on permissions.
    "Viewer", // Read-only access to specific parts of the application.
    // Add other roles as needed, e.g., "BillingAdmin", "Support", etc.
] as const; // <-- The 'as const' assertion is important for type safety

/**
 * Represents the union type of all possible user roles defined in USER_ROLES.
 * This type can be used for function parameters, component props, and type definitions.
 * e.g., role: UserRole;
 */
export type UserRole = (typeof USER_ROLES)[number];

/**
 * Helper function to check if a given string is a valid UserRole.
 * @param role The string to check.
 * @returns True if the string is a valid UserRole, false otherwise.
 */
export function isValidUserRole(role: string): role is UserRole {
    return USER_ROLES.includes(role as UserRole);
}
