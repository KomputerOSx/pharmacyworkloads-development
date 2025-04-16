// src/components/modules/AddModuleForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateModule } from "@/hooks/useModules";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
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

// Schema Definition (can be shared or redefined here)
const moduleFormSchema = z.object({
    name: z.string().min(2, "Module name must be at least 2 characters."),
    description: z.string().optional(),
    active: z.boolean(),
});
type ModuleFormValues = z.infer<typeof moduleFormSchema>;

interface AddModuleFormProps {
    onSuccess: () => void;
    onCancel: () => void; // Keep onCancel if needed, though DialogClose might suffice
}

export function AddModuleForm({ onSuccess, onCancel }: AddModuleFormProps) {
    const form = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleFormSchema),
        defaultValues: {
            name: "",
            description: "",
            active: true,
        },
    });

    const createMutation = useCreateModule();

    const onSubmit = (values: ModuleFormValues) => {
        createMutation.mutate(
            { moduleData: values },
            {
                onSuccess: () => {
                    form.reset();
                    onSuccess(); // Close dialog
                    // Toast handled by hook
                },
                onError: (error) => {
                    // Toast handled by hook
                    console.error(
                        `aQ1sWdE4 - Failed to submit new module:`,
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
                                    placeholder="e.g., Pharmacy Orders"
                                    disabled={createMutation.isPending}
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
                                    placeholder="Briefly describe the module's purpose"
                                    disabled={createMutation.isPending}
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
                            <FormLabel>Active on Creation</FormLabel>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={createMutation.isPending}
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
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Module
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
