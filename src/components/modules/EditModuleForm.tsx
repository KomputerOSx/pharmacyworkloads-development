// // src/components/modules/EditModuleForm.tsx
// "use client";
//
// import React, { useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { useUpdateModule } from "@/hooks/admin/useModules";
// import { Module } from "@/types/moduleTypes";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { DialogFooter } from "@/components/ui/dialog";
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Loader2 } from "lucide-react";
// import { toast } from "sonner";
//
// // Schema Definition (can be shared or redefined here)
// const moduleFormSchema = z.object({
//     name: z.string().min(2, "Module name must be at least 2 characters."),
//     description: z.string().optional(),
//     active: z.boolean(),
// });
// type ModuleFormValues = z.infer<typeof moduleFormSchema>;
//
// interface EditModuleFormProps {
//     moduleToEdit: Module;
//     onSuccess: () => void;
//     onCancel: () => void;
// }
//
// export function EditModuleForm({
//     moduleToEdit,
//     onSuccess,
//     onCancel,
// }: EditModuleFormProps) {
//     const form = useForm<ModuleFormValues>({
//         resolver: zodResolver(moduleFormSchema),
//         defaultValues: {
//             // Initialize with default or module data
//             name: moduleToEdit.name || "",
//             description: moduleToEdit.description ?? "",
//             active: moduleToEdit.active ?? false,
//         },
//     });
//
//     const updateMutation = useUpdateModule();
//
//     // Populate form when the moduleToEdit prop changes (e.g., opening the dialog)
//     useEffect(() => {
//         form.reset({
//             name: moduleToEdit.name,
//             description: moduleToEdit.description ?? "",
//             active: moduleToEdit.active,
//         });
//     }, [moduleToEdit, form]);
//
//     const onSubmit = (values: ModuleFormValues) => {
//         // Check if anything actually changed (optional, but prevents unnecessary updates)
//         const hasChanged =
//             values.name !== moduleToEdit.name ||
//             (values.description ?? "") !== (moduleToEdit.description ?? "") ||
//             values.active !== moduleToEdit.active;
//
//         if (!hasChanged) {
//             toast.info("No changes detected.");
//             onSuccess(); // Close dialog even if no changes
//             return;
//         }
//
//         updateMutation.mutate(
//             { id: moduleToEdit.id, data: values },
//             {
//                 onSuccess: () => {
//                     onSuccess(); // Close dialog
//                     // Toast handled by hook
//                 },
//                 onError: (error) => {
//                     // Toast handled by hook
//                     console.error(
//                         `eR1tYuI8 - Failed to submit module update:`,
//                         error,
//                     );
//                     // Optionally: form.setError("root", { message: error.message });
//                 },
//             },
//         );
//     };
//
//     return (
//         <Form {...form}>
//             <form
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="space-y-4 py-2 pb-4"
//             >
//                 <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Module Name</FormLabel>
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
//                 <FormField
//                     control={form.control}
//                     name="description"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Description (Optional)</FormLabel>
//                             <FormControl>
//                                 <Textarea
//                                     {...field}
//                                     value={field.value ?? ""}
//                                     disabled={updateMutation.isPending}
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
//                         <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
//                             <FormLabel>Active Status</FormLabel>
//                             <FormControl>
//                                 <Checkbox
//                                     checked={field.value}
//                                     onCheckedChange={field.onChange}
//                                     disabled={updateMutation.isPending}
//                                 />
//                             </FormControl>
//                         </FormItem>
//                     )}
//                 />
//                 {/* Optional: Display root form errors */}
//                 {form.formState.errors.root && (
//                     <p className="text-sm font-medium text-destructive">
//                         {form.formState.errors.root.message}
//                     </p>
//                 )}
//                 <DialogFooter className="mt-4">
//                     <Button
//                         type="button"
//                         variant="outline"
//                         onClick={onCancel}
//                         disabled={updateMutation.isPending}
//                     >
//                         Cancel
//                     </Button>
//                     <Button type="submit" disabled={updateMutation.isPending}>
//                         {updateMutation.isPending && (
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         )}
//                         Save Changes
//                     </Button>
//                 </DialogFooter>
//             </form>
//         </Form>
//     );
// }

"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUpdateModule } from "@/hooks/admin/useModules";
import { Module } from "@/types/moduleTypes";
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
import { toast } from "sonner";

const editModuleFormSchema = z.object({
    displayName: z.string().min(2, "Display name must be >= 2 chars."),
    description: z.string().optional(),
    icon: z.string().optional(),
    accessLevel: z.enum(["admin", "manager", "all"]),
    active: z.boolean(),
});
type EditModuleFormValues = z.infer<typeof editModuleFormSchema>;

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
    const form = useForm<EditModuleFormValues>({
        resolver: zodResolver(editModuleFormSchema),
        defaultValues: {
            displayName: moduleToEdit.displayName || "",
            description: moduleToEdit.description ?? "",
            icon: moduleToEdit.icon ?? "",
            accessLevel: moduleToEdit.accessLevel || "all",
            active: moduleToEdit.active ?? false,
        },
    });

    const updateMutation = useUpdateModule();

    useEffect(() => {
        form.reset({
            displayName: moduleToEdit.displayName,
            description: moduleToEdit.description ?? "",
            icon: moduleToEdit.icon ?? "",
            accessLevel: moduleToEdit.accessLevel,
            active: moduleToEdit.active,
        });
    }, [moduleToEdit, form]);

    const onSubmit = (values: EditModuleFormValues) => {
        const dataToUpdate: Partial<Module> = {
            displayName: values.displayName,
            description: values.description?.trim() || null,
            icon: values.icon?.trim() || null,
            accessLevel: values.accessLevel,
            active: values.active,
        };

        const hasChanged = Object.keys(dataToUpdate).some(
            (key) =>
                dataToUpdate[key as keyof typeof dataToUpdate] !==
                    moduleToEdit[key as keyof Module] &&
                !(
                    (dataToUpdate[key as keyof typeof dataToUpdate] === null ||
                        dataToUpdate[key as keyof typeof dataToUpdate] ===
                            "") &&
                    (moduleToEdit[key as keyof Module] === null ||
                        moduleToEdit[key as keyof Module] === "" ||
                        moduleToEdit[key as keyof Module] === undefined)
                ),
        );

        if (!hasChanged) {
            toast.info("No changes detected.");
            onSuccess();
            return;
        }

        updateMutation.mutate(
            { id: moduleToEdit.id, data: dataToUpdate },
            {
                onSuccess: () => {
                    toast.success(
                        `Module "${moduleToEdit.name}" updated successfully.`,
                    );
                    onSuccess();
                },
                onError: (error) => {
                    toast.error(`Update failed: ${error.message}`);
                    console.error(
                        `eR1tYuI8 - Failed to submit module update:`,
                        error,
                    );
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
                <FormItem>
                    <FormLabel>Internal Name/Key</FormLabel>
                    <FormControl>
                        <Input
                            value={moduleToEdit.name}
                            readOnly
                            disabled
                            className="bg-muted/50"
                        />
                    </FormControl>
                    <FormDescription>
                        Unique identifier (cannot be changed).
                    </FormDescription>
                </FormItem>

                <FormItem>
                    <FormLabel>URL Path</FormLabel>
                    <FormControl>
                        <Input
                            value={moduleToEdit.urlPath}
                            readOnly
                            disabled
                            className="bg-muted/50"
                        />
                    </FormControl>
                    <FormDescription>
                        Path used in URL (cannot be changed).
                    </FormDescription>
                </FormItem>

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
                                    placeholder="Briefly describe the module's purpose"
                                    disabled={updateMutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Icon Name (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={field.value ?? ""}
                                    placeholder="e.g., CalendarDays (from lucide-react)"
                                    disabled={updateMutation.isPending}
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

                <FormField
                    control={form.control}
                    name="accessLevel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Access Level *</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={updateMutation.isPending}
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

                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Active Status</FormLabel>
                                <FormDescription>
                                    Inactive modules are hidden from users.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={updateMutation.isPending}
                                    aria-label="Active status"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={updateMutation.isPending}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
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
