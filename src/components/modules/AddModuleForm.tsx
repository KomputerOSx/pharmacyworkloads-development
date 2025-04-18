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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Schema Definition (Ensure it matches your latest version)
const moduleFormSchema = z.object({
    name: z.string().min(2, "Internal name must be >= 2 chars."),
    displayName: z.string().min(2, "Display name must be >= 2 chars."),
    urlPath: z
        .string()
        .min(2, "URL Path must be >= 2 chars.")
        .regex(
            /^[a-z0-9-]+$/,
            "URL Path: only lowercase letters, numbers, hyphens.",
        ),
    description: z.string().optional(),
    icon: z.string().optional(),
    accessLevel: z.enum(["admin", "manager", "all"]),
    active: z.boolean(),
});
type ModuleFormValues = z.infer<typeof moduleFormSchema>;

interface AddModuleFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AddModuleForm({ onSuccess, onCancel }: AddModuleFormProps) {
    const form = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleFormSchema),
        // *** PROVIDE DEFAULTS FOR *ALL* FIELDS ***
        defaultValues: {
            name: "",
            displayName: "", // Added default
            urlPath: "", // Added default
            description: "", // Use "" for optional text fields
            icon: "", // Added default (use "" or null consistently)
            accessLevel: "all", // Added default enum value
            active: true,
        },
    });

    const createMutation = useCreateModule();

    const onSubmit = (values: ModuleFormValues) => {
        // Prepare data, ensuring optional fields are null if empty
        const moduleData = {
            ...values,
            description: values.description?.trim() || null,
            icon: values.icon?.trim() || null,
        };

        createMutation.mutate(
            { moduleData: moduleData }, // Pass prepared data
            {
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
                onError: (error) => {
                    console.error(
                        `aQ1sWdE4 - Failed to submit new module:`,
                        error,
                    );
                },
            },
        );
    };

    return (
        <Form {...form}>
            {/* Pass mutation pending state to disable form elements */}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-2 pb-4"
            >
                {/* Internal Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Internal Name/Key *</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g., weeklyRota (camelCase, unique)"
                                    disabled={createMutation.isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Unique identifier for the module (cannot be
                                changed after creation).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Display Name */}
                <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Name *</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g., Weekly Rota Management"
                                    disabled={createMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* URL Path */}
                <FormField
                    control={form.control}
                    name="urlPath"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Path *</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g., weekly-rota (no spaces/caps)"
                                    disabled={createMutation.isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Used in the URL. Lowercase letters, numbers,
                                hyphens only.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                {/* Use controlled value consistently */}
                                <Textarea
                                    {...field}
                                    value={field.value ?? ""}
                                    placeholder="Briefly describe the module's purpose"
                                    disabled={createMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Icon */}
                <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Icon Name (Optional)</FormLabel>
                            <FormControl>
                                {/* Use controlled value consistently */}
                                <Input
                                    {...field}
                                    value={field.value ?? ""}
                                    placeholder="e.g., CalendarDays (from lucide-react)"
                                    disabled={createMutation.isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Specify an icon identifier (e.g., from
                                lucide-react).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Access Level */}
                <FormField
                    control={form.control}
                    name="accessLevel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Access Level *</FormLabel>
                            {/* Ensure the Select component handles the value correctly */}
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={createMutation.isPending}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select who can access" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Users
                                    </SelectItem>
                                    <SelectItem value="manager">
                                        Managers & Admins
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        Admins Only
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Determines base access (can be refined by
                                roles).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Active Checkbox */}
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Active on Creation</FormLabel>
                            <FormControl>
                                <Checkbox
                                    checked={field.value} // Use checked for Checkbox
                                    onCheckedChange={field.onChange}
                                    disabled={createMutation.isPending}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* ... Footer ... */}
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
