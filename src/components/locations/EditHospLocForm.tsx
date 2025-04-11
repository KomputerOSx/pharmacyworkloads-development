// src/components/locations/EditHospLocForm.tsx
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Your project imports
// *** IMPORTANT: Create and import the update hook ***
import { useUpdateHospLoc } from "@/hooks/useHospLoc"; // Assuming you have this hook
import { useHosps } from "@/hooks/useHosps";

import { getHospLocTypes, HospLoc } from "@/types/subDepTypes";

// --- Zod Schema Definition (Can often be the same as Add form) ---
// If validation rules differ for edit, create a separate schema
const editFormSchema = z.object({
    name: z.string().min(2, {
        message: "Location name must be at least 2 characters.",
    }),
    // hospId might be non-editable in some scenarios, but keep validation for now
    hospId: z.string().min(1, { message: "Parent hospital must be selected." }),
    type: z.string().min(1, { message: "Please select a location type." }),
    description: z
        .string()
        .max(500, "Description cannot exceed 500 characters.")
        .optional()
        .or(z.literal("")),
    address: z
        .string()
        .min(2, "Address must be at least 2 characters.")
        .optional()
        .or(z.literal("")),
    contactEmail: z
        .string()
        .email("Invalid email format.")
        .optional()
        .or(z.literal("")),
    contactPhone: z
        .string()
        .min(5, "Phone number seems too short.")
        .optional()
        .or(z.literal("")),
    active: z.boolean(), // No default needed here, comes from existing data
});

// --- Component Props Interface ---
interface EditHospLocFormProps {
    orgId: string;
    locationToEdit: HospLoc; // Pass the full location object
    onSuccessfulSubmitAction: () => void;
}

// --- The Form Component ---
export function EditHospLocForm({
    orgId,
    locationToEdit,
    onSuccessfulSubmitAction,
}: EditHospLocFormProps) {
    const locationTypes = getHospLocTypes();

    // Fetch hospitals for the dropdown (might be disabled depending on edit logic)
    const {
        data: hospitals,
        isLoading: isLoadingHosps,
        isError: isErrorHosps,
        error: hospsError,
    } = useHosps(orgId);

    // Initialize the form with existing data
    const form = useForm<z.infer<typeof editFormSchema>>({
        resolver: zodResolver(editFormSchema),
        // *** Pre-populate with existing data ***
        defaultValues: {
            name: locationToEdit.name || "",
            hospId: locationToEdit.hospId || "",
            type: locationToEdit.type || "",
            description: locationToEdit.description || "", // Assuming description is on HospLoc type
            address: locationToEdit.address || "",
            contactEmail: locationToEdit.contactEmail || "",
            contactPhone: locationToEdit.contactPhone || "",
            active: locationToEdit.active ?? true, // Default to true if undefined/null for some reason
        },
    });

    // *** Use the UPDATE mutation hook ***
    const updateHospLocMutation = useUpdateHospLoc();

    // --- Submission Handler ---
    async function onEditSubmit(values: z.infer<typeof editFormSchema>) {
        console.log("Form values submitted for update:", values);

        // Prepare only the fields that can be updated
        const hospLocUpdateData: Partial<HospLoc> = {
            name: values.name,
            type: values.type,
            hospId: values.hospId,
            description: values.description || null,
            address: values.address || null,
            contactEmail: values.contactEmail || null,
            contactPhone: values.contactPhone || null,
            active: values.active,
        };

        updateHospLocMutation.mutate(
            {
                id: locationToEdit.id,
                hospLocData: hospLocUpdateData,
                orgId: orgId,
            },
            {
                onSuccess: (data) => {
                    console.log("Hospital Location updated:", data);
                    onSuccessfulSubmitAction(); // Close dialog / Signal success
                },
                onError: (error) => {
                    console.error("Failed to update hospital location:", error);
                    // Error toast/message likely handled globally by the hook
                    // Or set form error: form.setError('root', { message: error.message });
                },
            },
        );
    }

    // Determine if the Parent Hospital dropdown should be editable
    // Example logic: Maybe it's only editable if there's more than one hospital
    const canEditParentHospital =
        (hospitals?.length ?? 0) > 0 && !isLoadingHosps;

    return (
        <Form {...form}>
            {/* Display top-level form error from mutation */}
            {updateHospLocMutation.isError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Update Failed</AlertTitle>
                    <AlertDescription>
                        {updateHospLocMutation.error?.message ||
                            "An unexpected error occurred."}
                    </AlertDescription>
                </Alert>
            )}

            <form
                onSubmit={form.handleSubmit(onEditSubmit)}
                className="space-y-4"
            >
                {/* Location Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Department Name ... "
                                    {...field}
                                    disabled={updateHospLocMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Parent Hospital Selection (Potentially Read-only or Disabled) */}
                <FormField
                    control={form.control}
                    name="hospId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent Hospital *</FormLabel>
                            {isLoadingHosps && (
                                <Skeleton className="h-10 w-full" />
                            )}
                            {isErrorHosps && !isLoadingHosps && (
                                <p className="text-sm text-red-600">
                                    Error loading hospitals:{" "}
                                    {hospsError?.message}
                                </p>
                            )}
                            {!isLoadingHosps && !isErrorHosps && hospitals && (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value} // Use value for controlled component in edit
                                    disabled={
                                        !canEditParentHospital || // Disable if logic dictates
                                        updateHospLocMutation.isPending ||
                                        isLoadingHosps
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select the hospital this location belongs to" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {/* Ensure the current value exists as an option */}
                                        {hospitals?.map((hosp) => (
                                            <SelectItem
                                                key={hosp.id}
                                                value={hosp.id}
                                            >
                                                {hosp.name}
                                            </SelectItem>
                                        ))}
                                        {/* Handle case where locationToEdit.hospId isn't in the fetched list (rare) */}
                                        {!hospitals?.some(
                                            (h) => h.id === field.value,
                                        ) &&
                                            field.value && (
                                                <SelectItem
                                                    value={field.value}
                                                    disabled
                                                >
                                                    {locationToEdit.name}{" "}
                                                    (Current)
                                                </SelectItem>
                                            )}
                                    </SelectContent>
                                </Select>
                            )}
                            {!canEditParentHospital &&
                                !isLoadingHosps &&
                                !isErrorHosps && (
                                    <p className="text-sm text-muted-foreground pt-2">
                                        Parent hospital cannot be changed.
                                    </p>
                                )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Location Type Selection */}
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location Type *</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value} // Use value for controlled component
                                disabled={updateHospLocMutation.isPending}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {locationTypes.map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description Field */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter a brief description..."
                                    className="resize-y"
                                    {...field}
                                    disabled={updateHospLocMutation.isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Additional details about this location.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Address (Optional) */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            {" "}
                            <FormLabel>Address (Optional)</FormLabel>{" "}
                            <FormControl>
                                <Input
                                    placeholder="e.g., Floor 3, Building A, 123 Health St"
                                    {...field}
                                    disabled={updateHospLocMutation.isPending}
                                />
                            </FormControl>{" "}
                            <FormDescription>
                                Specific address within the hospital, if
                                different.
                            </FormDescription>{" "}
                            <FormMessage />{" "}
                        </FormItem>
                    )}
                />

                {/* Contact Email (Optional) */}
                <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                        <FormItem>
                            {" "}
                            <FormLabel>Contact Email (Optional)</FormLabel>{" "}
                            <FormControl>
                                <Input
                                    placeholder="ward10b@hospital.org"
                                    {...field}
                                    type="email"
                                    disabled={updateHospLocMutation.isPending}
                                />
                            </FormControl>{" "}
                            <FormMessage />{" "}
                        </FormItem>
                    )}
                />

                {/* Contact Phone (Optional) */}
                <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                        <FormItem>
                            {" "}
                            <FormLabel>Contact Phone (Optional)</FormLabel>{" "}
                            <FormControl>
                                <Input
                                    placeholder="Internal extension or direct line"
                                    {...field}
                                    type="tel"
                                    disabled={updateHospLocMutation.isPending}
                                />
                            </FormControl>{" "}
                            <FormMessage />{" "}
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
                                    disabled={updateHospLocMutation.isPending}
                                    id="edit-active-checkbox" // Unique ID
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="edit-active-checkbox">
                                    Active Location
                                </FormLabel>
                                <FormDescription>
                                    Is this location currently active?
                                </FormDescription>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={updateHospLocMutation.isPending || isLoadingHosps}
                    className="w-full sm:w-auto" // Responsive width
                >
                    {updateHospLocMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                </Button>
            </form>
        </Form>
    );
}
