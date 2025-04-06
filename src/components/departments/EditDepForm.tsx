// src/components/departments/EditDepForm.tsx
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Shadcn UI Imports
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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Project Imports
import { useUpdateDep } from "@/hooks/useDeps"; // *** IMPORTANT: Assuming useUpdateDep hook exists ***
import { Department } from "@/types/depTypes";

// Zod Schema for Department Edit
const editDepFormSchema = z.object({
    name: z.string().min(2, {
        message: "Department name must be at least 2 characters.",
    }),
    active: z.boolean(),
});

// Component Props Interface
interface EditDepFormProps {
    orgId: string;
    departmentToEdit: Department; // Pass the full department object
    onSuccessfulSubmitAction: () => void; // Callback on success
}

// The Form Component
export function EditDepForm({
    orgId,
    departmentToEdit,
    onSuccessfulSubmitAction,
}: EditDepFormProps) {
    // Initialize the form with existing department data
    const form = useForm<z.infer<typeof editDepFormSchema>>({
        resolver: zodResolver(editDepFormSchema),
        defaultValues: {
            name: departmentToEdit.name || "",
            active: departmentToEdit.active ?? true, // Default to true if undefined/null
        },
    });

    // Use the UPDATE mutation hook for Departments
    const updateDepMutation = useUpdateDep(); // *** Use the correct hook ***

    // Submission Handler
    async function onEditSubmit(values: z.infer<typeof editDepFormSchema>) {
        console.log("Form values submitted for department update:", values);

        // Prepare the data for the mutation
        // Adjust based on what your useUpdateDep hook expects
        const depUpdateData: Partial<Department> = {
            name:
                values.name?.charAt(0).toUpperCase() +
                values.name?.slice(1).toLowerCase(),
            active: values.active,
            // Include other fields if your hook/backend expects them for update
        };

        updateDepMutation.mutate(
            {
                id: departmentToEdit.id, // The ID of the department to update
                data: depUpdateData,
                orgId: orgId, // Organization context
            },
            {
                onSuccess: (data) => {
                    console.log("Department updated:", data);
                    onSuccessfulSubmitAction(); // Close dialog / Signal success
                },
                onError: (error) => {
                    console.error("Failed to update department:", error);
                    // Error likely handled globally by the hook or display below
                },
            },
        );
    }

    return (
        <Form {...form}>
            {/* Display top-level form error from mutation */}
            {updateDepMutation.isError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Update Failed</AlertTitle>
                    <AlertDescription>
                        {updateDepMutation.error?.message ||
                            "An unexpected error occurred."}
                    </AlertDescription>
                </Alert>
            )}

            <form
                onSubmit={form.handleSubmit(onEditSubmit)}
                className="space-y-6" // Increased spacing a bit
            >
                {/* Department Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Cardiology, Emergency Room"
                                    {...field}
                                    disabled={updateDepMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Active Checkbox */}
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={updateDepMutation.isPending}
                                    id="edit-dep-active-checkbox" // Unique ID
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="edit-dep-active-checkbox">
                                    Active Department
                                </FormLabel>
                                <FormDescription>
                                    Is this department currently active?
                                </FormDescription>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={updateDepMutation.isPending}
                    className="w-full sm:w-auto" // Responsive width
                >
                    {updateDepMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </Form>
    );
}
