"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCreateDepTeam } from "@/hooks/admin/useDepTeams";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    // FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import * as z from "zod";

// --- Updated Form Schema (with description) ---
const formSchema = z.object({
    name: z.string().min(1, "Team name is required"),
    description: z.string().optional(), // Added description back
    active: z.boolean().default(true),
});
type FormValues = z.infer<typeof formSchema>;

// --- Component Props ---
interface AddDepTeamFormProps {
    onSuccess?: () => void; // Callback on successful creation
    onCancel?: () => void; // Optional cancel handler
}

export function AddDepTeamForm({ onSuccess, onCancel }: AddDepTeamFormProps) {
    const params = useParams();
    const orgId = params.orgId as string;
    const depId = params.depId as string;

    // --- Mutations ---
    const { mutate: createTeam, isPending: isCreating } = useCreateDepTeam();

    // --- Form Initialization (with description default) ---
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "", // Added description default back
            active: true,
        },
    });

    // --- Event Handlers (with description data) ---
    const onSubmit = (values: FormValues) => {
        createTeam(
            {
                teamData: {
                    name: values.name,
                    description: values.description || null, // Pass description or null
                    active: values.active,
                },
                orgId: orgId,
                depId: depId,
                // userId: "system", // Replace with actual user ID
            },
            {
                onSuccess: (newTeam) => {
                    toast.success(
                        `Team "${newTeam.name}" created successfully!`,
                    );
                    form.reset();
                    if (onSuccess) onSuccess();
                },
                onError: (error) => {
                    toast.error(`Failed to create team: ${error.message}`);
                },
            },
        );
    };

    return (
        <Form {...form}>
            {/* Added pt-2 for spacing below DialogHeader */}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 pt-2"
            >
                {/* Name Field */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Team Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Alpha Squad, Night Shift Core"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description Field - Added Back */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Brief description of the team's purpose or members"
                                    {...field}
                                    // Ensure value is controlled properly, handle null/undefined
                                    value={field.value ?? ""}
                                    rows={3} // Adjust rows as needed
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Active Field */}
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="team-active-status"
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="team-active-status">
                                    Set as Active
                                </FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                        {isCreating && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Team
                    </Button>
                </div>
            </form>
        </Form>
    );
}
