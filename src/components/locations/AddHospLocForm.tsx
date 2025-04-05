// "use client";
//
// import * as React from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
//
// import { Button } from "@/components/ui/button";
// import {
//     Form,
//     FormControl,
//     FormDescription,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
//
// import { useCreateHosp } from "@/hooks/useHosps";
//
// const formSchema = z.object({
//     name: z.string().min(2, {
//         message: "Hospital name must be at least 2 characters.",
//     }),
//     address: z.string().min(2, { message: "Address Required" }),
//     city: z.string().min(2, { message: "City Required" }),
//     postCode: z.string().min(2, { message: "Post Code Required" }),
//     contactEmail: z
//         .string()
//         .email({
//             message: "Invalid email format",
//         })
//         .min(2, { message: "Contact Email Required" }),
//     contactPhone: z.string().min(2, { message: "Contact Phone Required" }),
//     active: z.boolean().default(true),
// });
//
// interface AddHospFormProps {
//     onOpenChange: (open: boolean) => void;
//     orgId: string;
// }
//
// export function AddHospForm({ onOpenChange, orgId }: AddHospFormProps) {
//     // Initialize the form
//     const form = useForm<z.infer<typeof formSchema>>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             name: "",
//             address: "",
//             city: "",
//             postCode: "",
//             contactEmail: "",
//             contactPhone: "",
//             active: true,
//         },
//     });
//
//     const createHospMutation = useCreateHosp();
//
//     async function onSubmit(values: z.infer<typeof formSchema>) {
//         createHospMutation.mutate(
//             {
//                 hospitalData: values,
//                 orgId: orgId,
//                 // Optionally add userId here if needed: userId: '...'
//             },
//             {
//                 onSuccess: (data) => {
//                     console.log("Hospital created:", data);
//                     onOpenChange(false);
//                     form.reset();
//                 },
//                 onError: (error) => {
//                     console.error("Failed to create hospital:", error);
//                 },
//             },
//         );
//     }
//
//     return (
//         <Form {...form}>
//             {createHospMutation.isError && (
//                 <p className="text-red-500 text-sm mb-4">
//                     Error:{" "}
//                     {createHospMutation.error?.message ||
//                         "Failed to create hospital."}
//                 </p>
//             )}
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                 {" "}
//                 {/* --- Form Fields (remain largely the same) --- */}
//                 <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Name</FormLabel>
//                             <FormControl>
//                                 <Input
//                                     placeholder="Hospital Name"
//                                     {...field}
//                                     disabled={createHospMutation.isPending}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//                 <FormField
//                     control={form.control}
//                     name="address"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Hospital Address</FormLabel>
//                             <FormControl>
//                                 <Input
//                                     placeholder="Address"
//                                     {...field}
//                                     disabled={createHospMutation.isPending}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//                 {/* ... other fields ...*/}
//                 <FormField
//                     control={form.control}
//                     name="city"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>City</FormLabel>
//                             <FormControl>
//                                 <Input
//                                     placeholder="City"
//                                     {...field}
//                                     disabled={createHospMutation.isPending}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//                 <FormField
//                     control={form.control}
//                     name="postCode"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Post Code</FormLabel>
//                             <FormControl>
//                                 <Input
//                                     placeholder="AB1 2CD"
//                                     {...field}
//                                     disabled={createHospMutation.isPending}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//                 <FormField
//                     control={form.control}
//                     name="contactEmail"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Contact Email</FormLabel>
//                             <FormControl>
//                                 <Input
//                                     placeholder="contact@example.com"
//                                     {...field}
//                                     type="email"
//                                     disabled={createHospMutation.isPending}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//                 <FormField
//                     control={form.control}
//                     name="contactPhone"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Contact Phone</FormLabel>
//                             <FormControl>
//                                 <Input
//                                     placeholder="0191 000 0000"
//                                     {...field}
//                                     type="tel"
//                                     // Removed pattern as validation is handled by zod/service ideally
//                                     disabled={createHospMutation.isPending}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//                 <FormField
//                     control={form.control}
//                     name="active"
//                     render={({ field }) => (
//                         <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
//                             <div className="space-y-0.5">
//                                 <FormLabel>Active</FormLabel>
//                                 <FormDescription>
//                                     Is this hospital Active?
//                                 </FormDescription>
//                             </div>
//                             <FormControl>
//                                 <Checkbox
//                                     checked={field.value}
//                                     onCheckedChange={field.onChange}
//                                     disabled={createHospMutation.isPending}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//                 {/* Use the mutation's pending state for the button */}
//                 <Button type="submit" disabled={createHospMutation.isPending}>
//                     {createHospMutation.isPending ? "Creating..." : "Create"}
//                 </Button>
//             </form>
//         </Form>
//     );
// }

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
} from "@/components/ui/select"; // Import Select components
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { AlertCircle } from "lucide-react"; // Icon for alert
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Your project imports
import { useCreateHospLoc } from "@/hooks/useHospLoc"; // Import the correct mutation hook
import { useHosps } from "@/hooks/useHosps"; // Hook to fetch hospitals
import { getHospLocTypes } from "@/types/hosLocTypes"; // Import location types (adjust path if needed)
import { HospLoc } from "@/types/hosLocTypes"; // Import the type if needed for casting

// --- Zod Schema Definition ---
const formSchema = z.object({
    name: z.string().min(2, {
        message: "Location name must be at least 2 characters.",
    }),
    // hospId is crucial for the mutation and needs selection
    hospId: z.string().min(1, { message: "Please select a parent hospital." }),
    type: z.string().min(1, { message: "Please select a location type." }),
    // Make address, email, phone optional based on HospLoc type (string | null)
    // Add min length validation if they are entered
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
        .or(z.literal("")), // Basic phone check
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
    const locationTypes = getHospLocTypes(); // Get the list of types

    // Fetch the list of hospitals for the dropdown
    const {
        data: hospitals,
        isLoading: isLoadingHosps,
        isError: isErrorHosps,
        error: hospsError,
    } = useHosps(orgId);

    // Initialize the form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            hospId: "", // Default to empty, user must select
            type: "", // Default to empty, user must select
            address: "",
            contactEmail: "",
            contactPhone: "",
            active: true,
        },
    });

    // Get the mutation hook
    const createHospLocMutation = useCreateHospLoc();

    // --- Submission Handler ---
    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Form values submitted:", values);

        // Prepare the data structure expected by the mutation hook
        // Note: hospId comes directly from the form values now
        const hospLocData: Partial<HospLoc> = {
            name: values.name,
            type: values.type,
            address: values.address || null, // Send null if empty string
            contactEmail: values.contactEmail || null, // Send null if empty string
            contactPhone: values.contactPhone || null, // Send null if empty string
            active: values.active,
            // orgId, hospId are passed as separate arguments to mutate
            // createdById will likely be set on the backend via userId
        };

        createHospLocMutation.mutate(
            {
                hospLocData,
                orgId: orgId,
                hospId: values.hospId, // Pass the selected hospId
                // Optionally add userId here if your mutation/service needs it:
                // userId: 'current-user-id',
            },
            {
                onSuccess: (data) => {
                    console.log("Hospital Location created:", data);
                    form.reset(); // Reset form fields
                    onSuccessfulSubmitAction(); // Call the callback to signal success (e.g., close dialog)
                },
                onError: (error) => {
                    // Error toast is likely handled within the mutation hook itself
                    console.error("Failed to create hospital location:", error);
                    // You could potentially set a form error here if needed
                    // form.setError('root', { message: `Server error: ${error.message}` });
                },
            },
        );
    }

    // --- Render Logic ---
    return (
        <Form {...form}>
            {/* Display top-level form error from mutation */}
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
                {" "}
                {/* Reduced spacing slightly */}
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
                                            <SelectValue placeholder="Select the hospital this location belongs to" />
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
                {/* Address (Optional) */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Floor 3, Building A, 123 Health St"
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
                                    placeholder="ward10b@hospital.org"
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
                                    placeholder="Internal extension or direct line"
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
                        // Using items-start for better alignment with checkbox/label stack
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={createHospLocMutation.isPending}
                                    id="active-checkbox" // Add id for label association
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="active-checkbox">
                                    {" "}
                                    {/* Associate label */}
                                    Active Location
                                </FormLabel>
                                <FormDescription>
                                    Is this location currently active and
                                    operational?
                                </FormDescription>
                            </div>
                            <FormMessage />{" "}
                            {/* Usually not needed here but kept for consistency */}
                        </FormItem>
                    )}
                />
                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={createHospLocMutation.isPending || isLoadingHosps}
                >
                    {createHospLocMutation.isPending
                        ? "Creating Location..."
                        : "Create Location"}
                </Button>
            </form>
        </Form>
    );
}
