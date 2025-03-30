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
import { Checkbox } from "@/components/ui/checkbox";

import { useHospContext } from "@/context/HospitalContext";
import { addHospital } from "@/services/hospitalService";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Hospital name must be at least 2 characters.",
    }),
    address: z.string().min(2, { message: "Address Required" }),
    city: z.string().min(2, { message: "City Required" }),
    postCode: z.string().min(2, { message: "Post Code Required" }),
    contactEmail: z
        .string()
        .email({
            message: "Invalid email format",
        })
        .min(2, { message: "Contact Email Required" }),
    contactPhone: z.string().min(2, { message: "Contact Phone Required" }),
    active: z.boolean().default(true),
});

interface AddHospCardProps {
    onOpenChange: (open: boolean) => void;
    orgId: string;
}

export function AddHospForm({ onOpenChange, orgId }: AddHospCardProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            address: "",
            city: "",
            postCode: "",
            contactEmail: "",
            contactPhone: "",
            active: true,
        },
    });

    const { hosps } = useHospContext();
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);

        try {
            if (hosps.find((hosp) => hosp.name === values.name)) {
                setError(
                    "Hospital with name " + values.name + " already exists.",
                );
                return;
            }
            await addHospital(values, orgId);
            onOpenChange(false);
            form.reset();
            toast.success("Hospital created successfully!");
        } catch (err) {
            console.error("Error creating Hospital:", err);
            setError(
                //@ts-expect-error error type
                err.message ||
                    "jT6bPtqH - Failed to create hospital. Please try again.",
            );
            toast.error(
                //@ts-expect-error error type
                err.message || "sXW48dXK - Failed to create hospital.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Hospital Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hospital Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Address" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="postCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Post Code</FormLabel>
                            <FormControl>
                                <Input placeholder="AB1 2CD" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="0191 000 0000"
                                    {...field}
                                    type="tel"
                                    pattern="[0-9]{11}"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                                <FormDescription>
                                    Is this hospital Active?
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create"}
                </Button>
            </form>
        </Form>
    );
}
