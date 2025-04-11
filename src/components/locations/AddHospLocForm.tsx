// src/components/locations/AddHospLocForm.tsx
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
import { Textarea } from "@/components/ui/textarea"; // <-- Import Textarea
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Your project imports
import { useCreateHospLoc } from "@/hooks/useHospLoc";
import { useHosps } from "@/hooks/useHosps";

import { getHospLocTypes, HospLoc } from "@/types/subDepTypes"; // Assuming description is in HospLoc

// --- Zod Schema Definition ---
const formSchema = z.object({
    name: z.string().min(2, {
        message: "Location name must be at least 2 characters.",
    }),
    hospId: z.string().min(1, { message: "Please select a parent hospital." }),
    type: z.string().min(1, { message: "Please select a location type." }),
    // *** Add description field ***
    description: z
        .string()
        .max(500, "Description cannot exceed 500 characters.") // Optional: Add max length
        .optional()
        .or(z.literal("")), // Allow empty string
    // **************************
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
    active: z.boolean().default(true),
});

// --- Component Props Interface ---
interface AddHospLocFormProps {
    orgId: string;
    onSuccessfulSubmitAction: () => void;
}

// --- The Form Component ---
export function AddHospLocForm({
    orgId,
    onSuccessfulSubmitAction,
}: AddHospLocFormProps) {
    const locationTypes = getHospLocTypes();

    const {
        data: hospitals,
        isLoading: isLoadingHosps,
        isError: isErrorHosps,
        error: hospsError,
    } = useHosps(orgId);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            hospId: "",
            type: "",
            description: "", // <-- Add default value
            address: "",
            contactEmail: "",
            contactPhone: "",
            active: true,
        },
    });

    const createHospLocMutation = useCreateHospLoc();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Form values submitted:", values);

        const hospLocData: Partial<HospLoc> = {
            name: values.name,
            type: values.type,
            description: values.description || null, // <-- Add description, send null if empty
            address: values.address || null,
            contactEmail: values.contactEmail || null,
            contactPhone: values.contactPhone || null,
            active: values.active,
        };

        createHospLocMutation.mutate(
            {
                hospLocData,
                orgId: orgId,
                hospId: values.hospId,
            },
            {
                onSuccess: (data) => {
                    console.log("Hospital Location created:", data);
                    form.reset();
                    onSuccessfulSubmitAction();
                },
                onError: (error) => {
                    console.error("Failed to create hospital location:", error);
                },
            },
        );
    }

    return (
        <Form {...form}>
            {createHospLocMutation.isError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Creation Failed</AlertTitle>
                    <AlertDescription>
                        {createHospLocMutation.error?.message ||
                            "An unexpected error occurred."}
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Location Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Ward 10B, Main Pharmacy"
                                    {...field}
                                    disabled={createHospLocMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Parent Hospital Selection */}
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
                                    defaultValue={field.value}
                                    disabled={
                                        createHospLocMutation.isPending ||
                                        isLoadingHosps ||
                                        !hospitals?.length
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select parent hospital" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {hospitals?.length === 0 && (
                                            <SelectItem value="" disabled>
                                                No hospitals found for this org
                                            </SelectItem>
                                        )}
                                        {hospitals?.map((hosp) => (
                                            <SelectItem
                                                key={hosp.id}
                                                value={hosp.id}
                                            >
                                                {hosp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                defaultValue={field.value}
                                disabled={createHospLocMutation.isPending}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
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

                {/* *** Description Field (Using Textarea) *** */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Description"
                                    className="resize-y" // Allow vertical resize
                                    {...field}
                                    disabled={createHospLocMutation.isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Additional details about this location.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* ******************************************* */}

                {/* Address (Optional) */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Full address..."
                                    {...field}
                                    disabled={createHospLocMutation.isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Specific address within the hospital, if
                                different.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Contact Email (Optional) */}
                <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Email (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="mail@mail.com"
                                    {...field}
                                    type="email"
                                    disabled={createHospLocMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Contact Phone (Optional) */}
                <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Phone (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="0191 000 0000"
                                    {...field}
                                    type="tel"
                                    disabled={createHospLocMutation.isPending}
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
                                    disabled={createHospLocMutation.isPending}
                                    id="add-active-checkbox" // Unique ID
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="add-active-checkbox">
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

                <Button
                    type="submit"
                    disabled={createHospLocMutation.isPending || isLoadingHosps}
                    className="w-full sm:w-auto" // Responsive width
                >
                    {createHospLocMutation.isPending
                        ? "Creating..."
                        : "Create Location"}
                </Button>
            </form>
        </Form>
    );
}
