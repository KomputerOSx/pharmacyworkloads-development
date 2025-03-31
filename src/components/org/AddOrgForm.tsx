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

import { addOrg } from "@/services/orgService";
import { useOrgContext } from "@/context/OrgContext";
import { getOrganisationTypes } from "@/types/orgTypes";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Organisation name must be at least 2 characters.",
    }),
    type: z.string().min(2, {
        message: "Organisation Type must be selected.",
    }),
    address: z.string().min(2, { message: "Address Required" }),
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
            address: "",
            contactEmail: "",
            contactPhone: "",
            active: true,
        },
    });

    const { orgs } = useOrgContext();
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);

        try {
            if (orgs.find((org) => org.name === values.name)) {
                setError(
                    "Organisation with name " +
                        values.name +
                        " already exists.",
                );
                return;
            }
            await addOrg(values);
            onOpenChange(false);
            form.reset();
            toast.success("Organisation created successfully!");
        } catch (err) {
            console.error("Error creating organisation:", err);
            setError(
                //@ts-expect-error error type
                err.message ||
                    "ZYU6m1bF - Failed to create organisation. Please try again.",
            );
            toast.error(
                //@ts-expect-error error type
                err.message || "tV15Uh7X - Failed to create organisation.",
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
                                <Input
                                    placeholder="Organisation Name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Orgnisation Type" />
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
                                    Is this organisation Active?
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
