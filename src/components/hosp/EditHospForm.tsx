// "use client";
//
// import React, { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage /* ... other form components */,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useUpdateHosp } from "@/hooks/useHosps"; // Import the update hook
// import { Hosp } from "@/types/hospTypes";
//
// // Same schema as AddHospForm likely
// const formSchema = z.object({
//     name: z.string().min(2),
//     address: z.string().min(2),
//     city: z.string().min(2),
//     postCode: z.string().min(2),
//     contactEmail: z.string().email().min(2),
//     contactPhone: z.string().min(2),
//     active: z.boolean().default(true),
// });
//
// type FormData = z.infer<typeof formSchema>;
//
// interface EditHospFormProps {
//     hospData: Hosp; // Receive the initial hospital data
//     orgId: string;
//     onClose: () => void; // Function to close the parent dialog
// }
//
// export function EditHospForm({ hospData, orgId, onClose }: EditHospFormProps) {
//     const form = useForm<FormData>({
//         resolver: zodResolver(formSchema),
//         // Default values set via useEffect below
//     });
//
//     const updateMutation = useUpdateHosp();
//
//     // Pre-fill the form when hospData changes (or initially)
//     useEffect(() => {
//         if (hospData) {
//             // Map Hosp fields to form fields if names differ, otherwise direct mapping works
//             form.reset({
//                 name: hospData.name,
//                 address: hospData.address,
//                 city: hospData.city,
//                 postCode: hospData.postCode,
//                 contactEmail: hospData.contactEmail,
//                 contactPhone: hospData.contactPhone,
//                 active: hospData.active,
//             });
//         }
//     }, [hospData, form]);
//
//     const onSubmit = (values: FormData) => {
//         console.log("onSubmit function entered. hospData:", hospData); // Check hospData here
//         if (!hospData?.id) {
//             console.error("onSubmit stopped: hospData.id is missing!");
//             return;
//         }
//         console.log("Calling updateMutation.mutate with:", {
//             id: hospData.id,
//             orgId: orgId,
//             data: values,
//         }); // Log *before* calling mutate
//         updateMutation.mutate(
//             {
//                 id: hospData.id,
//                 orgId: orgId,
//                 data: values,
//             },
//             {
//                 onSuccess: () => {
//                     console.log("Mutation succeeded"); // Log success
//                     onClose();
//                 },
//                 onError: (error) => {
//                     console.error("Mutation failed:", error); // Log error
//                 },
//             },
//         );
//         console.log("onSubmit function finished."); // Log after calling mutate
//     };
//
//     return (
//         <Form {...form}>
//             {updateMutation.isError && (
//                 <p className="text-red-500 text-sm mb-4">
//                     Error:{" "}
//                     {updateMutation.error?.message ||
//                         "Failed to update hospital."}
//                 </p>
//             )}
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                 {/* --- Form Fields (similar to AddHospForm) --- */}
//                 <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Name</FormLabel>
//                             <FormControl>
//                                 <Input
//                                     {...field}
//                                     disabled={updateMutation.isPending}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//                 {/* ... other fields ... */}
//                 <FormField
//                     control={form.control}
//                     name="active"
//                     render={({ field }) => (
//                         <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
//                             <div className="space-y-0.5">
//                                 <FormLabel>Active</FormLabel>
//                             </div>
//                             <FormControl>
//                                 <Checkbox
//                                     checked={field.value}
//                                     onCheckedChange={field.onChange}
//                                     disabled={updateMutation.isPending}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//
//                 <div className="flex justify-end gap-2">
//                     {" "}
//                     {/* Align buttons */}
//                     <Button
//                         type="button"
//                         variant="ghost"
//                         onClick={onClose}
//                         disabled={updateMutation.isPending}
//                     >
//                         Cancel
//                     </Button>
//                     <Button type="submit" disabled={updateMutation.isPending}>
//                         {updateMutation.isPending
//                             ? "Saving..."
//                             : "Save Changes"}
//                     </Button>
//                 </div>
//             </form>
//         </Form>
//     );
// }

"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateHosp } from "@/hooks/useHosps"; // Import the update hook
import { Hosp } from "@/types/hospTypes";

// Schema remains the same
const formSchema = z.object({
    name: z.string().min(2),
    address: z.string().min(2),
    city: z.string().min(2),
    postCode: z.string().min(2),
    contactEmail: z.string().email().min(2),
    contactPhone: z.string().min(2),
    active: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface EditHospFormProps {
    hospData: Hosp; // Receive the initial hospital data
    orgId: string;
    onClose: () => void; // Function to close the parent dialog
}

export function EditHospForm({ hospData, orgId, onClose }: EditHospFormProps) {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        // *** FIX: Provide initial defaultValues based on hospData ***
        // This makes inputs controlled from the start.
        defaultValues: {
            name: hospData?.name || "", // Use initial data or empty string
            address: hospData?.address || "",
            city: hospData?.city || "",
            postCode: hospData?.postCode || "",
            contactEmail: hospData?.contactEmail || "",
            contactPhone: hospData?.contactPhone || "",
            active: hospData?.active ?? true, // Use initial data or default true
        },
    });

    const updateMutation = useUpdateHosp();

    // *** Optional Refinement: useEffect for Updates Only (if needed) ***
    // This useEffect can handle cases where the hospData prop *changes*
    // after the component is already mounted. If the modal always receives
    // static data on open, you might not even need this useEffect.
    // However, using reset is generally safe for updates.
    useEffect(() => {
        // Check if hospData actually changed if you want fine-grained control,
        // but resetting with the current prop data is often sufficient.
        if (hospData) {
            form.reset({
                name: hospData.name,
                address: hospData.address,
                city: hospData.city,
                postCode: hospData.postCode,
                contactEmail: hospData.contactEmail,
                contactPhone: hospData.contactPhone,
                active: hospData.active,
            });
        }
        // Add form.reset to dependency array if needed, although form instance is stable.
        // Adding specific hospData fields might be better if only some can change.
    }, [hospData, form]); // Dependency on hospData ensures reset if prop changes

    // onSubmit remains the same - the console logs will now help confirm it runs
    const onSubmit = (values: FormData) => {
        console.log("onSubmit function entered. hospData:", hospData);
        if (!hospData?.id) {
            console.error("onSubmit stopped: hospData.id is missing!");
            return;
        }
        console.log("Calling updateMutation.mutate with:", {
            id: hospData.id,
            orgId: orgId,
            data: values,
        });
        updateMutation.mutate(
            {
                id: hospData.id,
                orgId: orgId,
                data: values,
            },
            {
                onSuccess: () => {
                    console.log("Mutation succeeded");
                    onClose();
                },
                onError: (error) => {
                    console.error("Mutation failed:", error);
                },
            },
        );
        console.log("onSubmit function finished.");
    };

    // Form rendering remains the same
    return (
        <Form {...form}>
            {updateMutation.isError && (
                <p className="text-red-500 text-sm mb-4">
                    Error:{" "}
                    {updateMutation.error?.message ||
                        "Failed to update hospital."}
                </p>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* --- Name Field --- */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                {/* This input now starts controlled */}
                                <Input
                                    {...field}
                                    disabled={updateMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* --- Address Field --- */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={updateMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* --- City Field --- */}
                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={updateMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* --- Post Code Field --- */}
                <FormField
                    control={form.control}
                    name="postCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Post Code</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={updateMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* --- Email Field --- */}
                <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="email" // Ensure type is email
                                    disabled={updateMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* --- Phone Field --- */}
                <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="tel" // Ensure type is tel
                                    disabled={updateMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* --- Active Checkbox --- */}
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                            </div>
                            <FormControl>
                                <Checkbox
                                    // Use !!field.value as Checkbox expects boolean
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={updateMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={updateMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending
                            ? "Saving..."
                            : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
