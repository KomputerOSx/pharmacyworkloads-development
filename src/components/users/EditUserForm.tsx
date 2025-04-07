// src/components/users/EditUserForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useUpdateUser } from "@/hooks/useUsers"; // Adjust path
import { Department } from "@/types/depTypes"; // Adjust path
import { User } from "@/types/userTypes"; // Adjust path
import {
    editUserSchema,
    EditUserFormData,
} from "@/lib/validators/userValidators"; // Adjust path
import { USER_ROLES } from "@/config/roles";
import { Checkbox } from "@/components/ui/checkbox"; // Adjust path

interface EditUserFormProps {
    orgId: string;
    userToEdit: User; // Pass the full user object
    departments: Department[];
    onSuccessfulSubmitAction: () => void; // Callback to close dialog/modal
}

export function EditUserForm({
    orgId,
    userToEdit,
    departments,
    onSuccessfulSubmitAction,
}: EditUserFormProps) {
    const updateUserMutation = useUpdateUser();

    const form = useForm<EditUserFormData>({
        resolver: zodResolver(editUserSchema),
        // Pre-populate form with existing user data
        defaultValues: {
            firstName: userToEdit.firstName ?? "",
            lastName: userToEdit.lastName ?? "",
            email: userToEdit.email ?? "",
            phoneNumber: userToEdit.phoneNumber ?? "",
            departmentId: userToEdit.departmentId ?? "",
            role: (userToEdit.role as EditUserFormData["role"]) ?? undefined, // Ensure role matches enum type
            jobTitle: userToEdit.jobTitle ?? "",
            specialty: userToEdit.specialty ?? "",
            active: userToEdit.active ?? true,
        },
    });

    // Optional: Reset form if the userToEdit prop changes (e.g., opening dialog for a different user)
    useEffect(() => {
        form.reset({
            firstName: userToEdit.firstName ?? "",
            lastName: userToEdit.lastName ?? "",
            email: userToEdit.email ?? "",
            phoneNumber: userToEdit.phoneNumber ?? "",
            departmentId: userToEdit.departmentId ?? "",
            role: (userToEdit.role as EditUserFormData["role"]) ?? undefined,
            jobTitle: userToEdit.jobTitle ?? "",
            specialty: userToEdit.specialty ?? "",
            active: userToEdit.active ?? true,
        });
    }, [userToEdit, form]);

    async function onSubmit(values: EditUserFormData) {
        console.log("Submitting updated user data:", values);

        // Prevent submission if data hasn't changed? (Optional, requires comparison logic)
        // const hasChanged = Object.keys(values).some(key => values[key] !== form.formState.defaultValues[key]);
        // if (!hasChanged) {
        //     toast.info("No changes detected.");
        //     onSuccessfulSubmitAction(); // Close dialog even if no changes
        //     return;
        // }

        updateUserMutation.mutate(
            {
                id: userToEdit.id, // Pass the user ID
                orgId: orgId, // Pass orgId for cache invalidation
                data: values, // Pass validated form data for update
                // updaterUserId: 'currentLoggedInUserId', // Optional: Pass if tracking updater
            },
            {
                onSuccess: (updatedUser) => {
                    console.log("User updated successfully:", updatedUser);
                    toast.success("User updated successfully!"); // Handled by hook, but good for clarity
                    // form.reset(); // Resetting might not be desired if dialog stays open briefly
                    onSuccessfulSubmitAction(); // Call the callback (e.g., close dialog)
                },
                onError: (error) => {
                    console.error("Failed to update user:", error);
                    // Example: Check for specific duplicate error from service
                    if (error.message.includes("DUPLICATE_USER_EMAIL")) {
                        form.setError("email", {
                            type: "manual",
                            message:
                                "This email address is already in use by another user in this organization.",
                        });
                    } else {
                        // General error toast is shown by the hook
                    }
                },
            },
        );
    }

    return (
        <Form {...form}>
            {/* Pass userToEdit.id or a unique key if needed, though form should handle state */}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                key={userToEdit.id}
            >
                {/* --- Fields are largely the same as AddUserForm --- */}

                {/* First Name */}
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Last Name */}
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="john.doe@example.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Phone Number (Optional) */}
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    type="tel"
                                    placeholder="(555) 123-4567"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Department */}
                <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value} // Controlled component
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {departments.map((dep) => (
                                        <SelectItem key={dep.id} value={dep.id}>
                                            {dep.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Role */}
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value} // Controlled component
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {USER_ROLES.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Job Title (Optional) */}
                <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job Title (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Software Engineer, Nurse"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Specialty (Optional) */}
                <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Specialty (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Pediatrics, Frontend Dev"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Any relevant specialty or focus area.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Active Status */}
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Active Status</FormLabel>
                                <FormDescription>
                                    Inactive users cannot log in.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    aria-readonly={updateUserMutation.isPending} // Indicate read-only during update
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* --- Submit Button --- */}
                <Button
                    type="submit"
                    disabled={
                        updateUserMutation.isPending || !form.formState.isDirty
                    } // Disable if pending or no changes made
                    className="w-full sm:w-auto"
                >
                    {updateUserMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {updateUserMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                </Button>
                {/* Optional: Add a Cancel button */}
                {/* <Button type="button" variant="outline" onClick={onSuccessfulSubmitAction} disabled={updateUserMutation.isPending}>Cancel</Button> */}
            </form>
        </Form>
    );
}
