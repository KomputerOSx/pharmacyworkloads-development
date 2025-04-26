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

// Your project imports

import { useCreateDep, useDeps } from "@/hooks/admin/useDeps";
import { Department } from "@/types/depTypes"; // Assuming description is in HospLoc

// --- Zod Schema Definition ---
const formSchema = z.object({
    name: z.string().min(2, {
        message: "Location name must be at least 2 characters.",
    }),
    active: z.boolean().default(true),
});

// --- Component Props Interface ---
interface AddDepFormProps {
    orgId: string;
    onOpenChange: (open: boolean) => void;
}

// --- The Form Component ---
export function AddDepFrom({ orgId, onOpenChange }: AddDepFormProps) {
    const { isLoading: isLoadingDeps } = useDeps(orgId);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            active: true,
        },
    });

    const createHospLocMutation = useCreateDep();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Form values submitted:", values);

        const departmentData: Partial<Department> = {
            name:
                values.name?.charAt(0).toUpperCase() +
                values.name?.slice(1).toLowerCase(),
            active: values.active,
        };

        createHospLocMutation.mutate(
            {
                departmentData,
                orgId: orgId,
            },
            {
                onSuccess: (data) => {
                    console.log("Department created:", data);
                    form.reset();
                    onOpenChange(false);
                },
                onError: (error) => {
                    console.error("Failed to create Department:", error);
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
                            <FormLabel>Department Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Department Name ... "
                                    {...field}
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
                    disabled={createHospLocMutation.isPending || isLoadingDeps}
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
