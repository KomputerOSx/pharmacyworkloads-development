"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner"; // Import the toast function

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
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox

import { useOrgs, useCreateOrg } from "@/hooks/admin/useOrgs";
import { getOrganisationTypes } from "@/types/orgTypes";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Organisation name must be at least 2 characters.",
    }),
    type: z.string().min(2, {
        message: "Organisation Type must be selected.",
    }),
    contactEmail: z
        .string()
        .email({
            message: "Invalid email format",
        })
        .min(2, { message: "Contact Email Required" }),
    contactPhone: z.string().min(2, { message: "Contact Phone Required" }),
    active: z.boolean().default(true),
});

interface AddOrgCardProps {
    onOpenChange: (open: boolean) => void;
}

export function AddOrgForm({ onOpenChange }: AddOrgCardProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "",
            contactEmail: "",
            contactPhone: "",
            active: true, // Explicitly setting default for clarity
        },
    });

    // Fetch existing orgs for validation check
    const {
        data: orgs,
        isLoading: isLoadingOrgs,
        isError: isErrorOrgs,
        error: orgsError,
    } = useOrgs();

    // Get the mutation hook
    const addMutation = useCreateOrg();

    // Define the onSubmit handler - this function runs *when* the form is submitted
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // 1. Check if already loading existing orgs
        if (isLoadingOrgs) {
            toast.info("Checking existing organisations...");
            return; // Prevent submission while checking
        }
        // 2. Check for errors fetching existing orgs
        if (isErrorOrgs) {
            toast.error(
                `Error fetching organisations for check: ${orgsError?.message}`,
            );
            return; // Prevent submission if check failed
        }

        // 3. Check if org name already exists
        if (orgs?.find((org) => org.name === values.name)) {
            toast.error(
                `Organisation with name "${values.name}" already exists.`,
            );
            form.setError("name", {
                type: "manual",
                message: `Organisation with name "${values.name}" already exists.`,
            });
            return; // Stop submission
        }

        // 4. If checks pass, call the mutation
        addMutation.mutate(
            { orgData: values }, // Pass the validated form data
            {
                onSuccess: () => {
                    // Runs *after* the mutation's internal onSuccess (which invalidates cache)
                    toast.success("Organisation created successfully!");
                    onOpenChange(false); // Close the dialog
                    form.reset(); // Reset the form fields
                },
                onError: (error) => {
                    // Runs *after* the mutation's internal onError
                    console.error(
                        "Rnv9sQJ9 - Component-level onError for addOrg:",
                        error,
                    );
                    // Show a generic error or potentially map to specific fields
                    toast.error(
                        `Failed to create organisation: ${error.message}`,
                    );
                    // Example: Set a general server error on the form
                    form.setError("root.serverError", {
                        type: "server",
                        message: `Failed to create organisation: ${error.message || "Unknown server error"}`,
                    });
                },
            },
        );
    }

    // The component *returns* the JSX for the form
    // onSubmit is passed to form.handleSubmit
    // The button's disabled state uses addMutation.isPending
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Name Field */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Organisation Name"
                                    {...field}
                                    disabled={addMutation.isPending} // Disable during submission
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Type Field */}
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={addMutation.isPending}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Organisation Type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectGroup>
                                        {getOrganisationTypes().map((type) => (
                                            <SelectItem
                                                key={type.id}
                                                value={type.name}
                                            >
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Contact Email Field */}
                <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="contact@example.com"
                                    {...field}
                                    type="email"
                                    disabled={addMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Contact Phone Field */}
                <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="01234567890" // Example placeholder
                                    {...field}
                                    type="tel"
                                    // pattern="[0-9]{11}" // Basic pattern, consider more robust validation if needed
                                    disabled={addMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Active Checkbox Field */}
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={addMutation.isPending}
                                    id="active-checkbox" // Added id for label association
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="active-checkbox">
                                    {" "}
                                    {/* Associated label */}
                                    Active
                                </FormLabel>
                                <FormDescription>
                                    Is this organisation currently active?
                                </FormDescription>
                            </div>
                            <FormMessage />{" "}
                            {/* Usually not needed for checkbox unless complex validation */}
                        </FormItem>
                    )}
                />

                {/* Display general form errors (like server errors) */}
                {form.formState.errors.root?.serverError && (
                    <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.root.serverError.message}
                    </p>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={addMutation.isPending || isLoadingOrgs}
                >
                    {addMutation.isPending
                        ? "Creating..."
                        : "Create Organisation"}
                </Button>
            </form>
        </Form>
    );
}
