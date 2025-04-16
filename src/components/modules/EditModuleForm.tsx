// src/components/modules/EditModuleForm.tsx
"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUpdateModule } from "@/hooks/useModules";
import { Module } from "@/types/moduleTypes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Schema Definition (can be shared or redefined here)
const moduleFormSchema = z.object({
    name: z.string().min(2, "Module name must be at least 2 characters."),
    description: z.string().optional(),
    active: z.boolean(),
});
type ModuleFormValues = z.infer<typeof moduleFormSchema>;

interface EditModuleFormProps {
    moduleToEdit: Module;
    onSuccess: () => void;
    onCancel: () => void;
}

export function EditModuleForm({
    moduleToEdit,
    onSuccess,
    onCancel,
}: EditModuleFormProps) {
    const form = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleFormSchema),
        defaultValues: {
            // Initialize with default or module data
            name: moduleToEdit.name || "",
            description: moduleToEdit.description ?? "",
            active: moduleToEdit.active ?? false,
        },
    });

    const updateMutation = useUpdateModule();

    // Populate form when the moduleToEdit prop changes (e.g., opening the dialog)
    useEffect(() => {
        form.reset({
            name: moduleToEdit.name,
            description: moduleToEdit.description ?? "",
            active: moduleToEdit.active,
        });
    }, [moduleToEdit, form]);

    const onSubmit = (values: ModuleFormValues) => {
        // Check if anything actually changed (optional, but prevents unnecessary updates)
        const hasChanged =
            values.name !== moduleToEdit.name ||
            (values.description ?? "") !== (moduleToEdit.description ?? "") ||
            values.active !== moduleToEdit.active;

        if (!hasChanged) {
            toast.info("No changes detected.");
            onSuccess(); // Close dialog even if no changes
            return;
        }

        updateMutation.mutate(
            { id: moduleToEdit.id, data: values },
            {
                onSuccess: () => {
                    onSuccess(); // Close dialog
                    // Toast handled by hook
                },
                onError: (error) => {
                    // Toast handled by hook
                    console.error(
                        `eR1tYuI8 - Failed to submit module update:`,
                        error,
                    );
                    // Optionally: form.setError("root", { message: error.message });
                },
            },
        );
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-2 pb-4"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Module Name</FormLabel>
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
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={updateMutation.isPending}
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Active Status</FormLabel>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={updateMutation.isPending}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* Optional: Display root form errors */}
                {form.formState.errors.root && (
                    <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.root.message}
                    </p>
                )}
                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={updateMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
