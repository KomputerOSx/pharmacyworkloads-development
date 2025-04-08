// src/components/users/AddUserForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

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

import { useCreateUser } from "@/hooks/useUsers";
import { Department } from "@/types/depTypes";
import {
    addUserSchema,
    AddUserFormData,
} from "@/lib/validators/userValidators";
import { USER_ROLES } from "@/config/roles";
import { Checkbox } from "@/components/ui/checkbox";

interface AddUserFormProps {
    orgId: string;
    departments: Department[]; // Pass the fetched departments
    onSuccessfulSubmitAction: () => void; // Callback to close dialog/modal
}

export function AddUserForm({
    orgId,
    departments,
    onSuccessfulSubmitAction,
}: AddUserFormProps) {
    const createUserMutation = useCreateUser();

    const form = useForm<AddUserFormData>({
        resolver: zodResolver(addUserSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            departmentId: "",
            role: undefined, // Or set a default role if appropriate
            jobTitle: "",
            specialty: "",
            active: true,
        },
    });

    async function onSubmit(values: AddUserFormData) {
        console.log("Submitting new user data:", values);

        createUserMutation.mutate(
            {
                userData: values, // Pass validated form data
                orgId: orgId,
                // creatorUserId: 'currentLoggedInUserId', // Optional: Pass if tracking creator
            },
            {
                onSuccess: (newUser) => {
                    console.log("User created successfully:", newUser);
                    form.reset(); // Reset form fields
                    onSuccessfulSubmitAction(); // Call the callback to close the dialog
                },
                onError: (error) => {
                    // Error toast is handled by the hook, but you could inspect
                    // the error type here (e.g., duplicate email) for more specific UI feedback
                    console.error("Failed to create user:", error);
                    // Example: Check for specific duplicate error from service
                    if (error.message.includes("DUPLICATE_USER_EMAIL")) {
                        form.setError("email", {
                            type: "manual",
                            message:
                                "This email address is already in use in this organization.",
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                defaultValue={field.value}
                                value={field.value} // Ensure value is controlled
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
                                defaultValue={field.value}
                                value={field.value} // Ensure value is controlled
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {USER_ROLES.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role} {/* Display role name */}
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
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="w-full sm:w-auto" // Full width on small screens
                >
                    {createUserMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {createUserMutation.isPending
                        ? "Creating..."
                        : "Create User"}
                </Button>
            </form>
        </Form>
    );
}
