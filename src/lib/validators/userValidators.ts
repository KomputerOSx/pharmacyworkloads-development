// src/lib/validators/userValidators.ts

import { z } from "zod";
import { ADMIN_USER_ROLES } from "@/config/roles"; // Adjust the import path as needed

/**
 * Base schema containing common user fields and validation rules.
 * Can be extended or used directly for add/edit forms.
 */
const baseUserSchema = z.object({
    firstName: z
        .string({ required_error: "First name is required." }) // Message if field is missing entirely
        .trim() // Remove leading/trailing whitespace
        .min(1, { message: "First name cannot be empty." }), // Message if empty after trim

    lastName: z
        .string({ required_error: "Last name is required." })
        .trim()
        .min(1, { message: "Last name cannot be empty." }),

    email: z
        .string({ required_error: "Email is required." })
        .trim()
        .toLowerCase() // Store emails consistently
        .email({ message: "Please enter a valid email address." }),

    phoneNumber: z
        .string()
        .trim()
        .optional() // Makes the field optional (can be undefined)
        .or(z.literal("")) // Also allows an empty string "" as valid input
        .refine((val) => !val || /^[\d\s()+-]*$/.test(val), {
            // Optional: Basic phone format check (allows digits, spaces, (), +, -)
            message: "Invalid characters in phone number.",
        }),

    departmentId: z
        .string({ required_error: "Please select a department." })
        .min(1, { message: "Please select a department." }), // Ensure a non-empty string ID is selected

    role: z.enum(ADMIN_USER_ROLES, {
        required_error: "Please select a role.", // Error if value is not provided
        invalid_type_error: "Invalid role selected.", // Error if value is not one of USER_ROLES
    }),

    jobTitle: z.string().trim().optional().or(z.literal("")), // Allow empty string

    specialty: z.string().trim().optional().or(z.literal("")), // Allow empty string

    active: z.boolean(), // Required boolean (will get default or existing value)
});

// --- Schema for Adding a User ---
export const addUserSchema = baseUserSchema.extend({
    active: z.boolean().default(true), // Default new users to active
});

// --- Schema for Editing a User ---
export const editUserSchema = baseUserSchema.extend({
    // No default for 'active' here, it uses the existing user's value
    active: z.boolean(),
    // Add specific overrides or additions for 'edit' if needed
    // For instance, if email should be read-only during edit (though usually it's editable):
    // email: z.string().email().optional().or(z.literal('')).readonly(), // Example if readonly
});

// --- Inferred TypeScript Types ---

/**
 * TypeScript type inferred from the addUserSchema.
 * Represents the expected shape of validated data for creating a new user.
 */
export type AddUserFormData = z.infer<typeof addUserSchema>;

/**
 * TypeScript type inferred from the editUserSchema.
 * Represents the expected shape of validated data for updating an existing user.
 */
export type EditUserFormData = z.infer<typeof editUserSchema>;
