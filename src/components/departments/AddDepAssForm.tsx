import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

// shadcn components
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

// Import your hooks
import {
    useCreateDepHospLocAssignment,
    useDepHospLocAssignments,
} from "@/hooks/useDepAss";
import { useHospLocs } from "@/hooks/useHospLoc";
import { useParams } from "next/navigation";
import { useHosps } from "@/hooks/useHosps";

import { cn } from "@/lib/utils";

// Define the form schema
const formSchema = z.object({
    locationId: z.string({
        required_error: "Please select a location",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddDepAssFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function AddDepAssForm({ onSuccess, onCancel }: AddDepAssFormProps) {
    const params = useParams();
    const orgId = params.orgId as string;
    const depId = params.depId as string;

    const [openLocationPopover, setOpenLocationPopover] = useState(false);

    const { data: hosps } = useHosps(orgId);
    const { data: locations, isLoading: isLoadingLocations } =
        useHospLocs(orgId);

    const { data: assignedLocations, refetch: refetchAssignments } =
        useDepHospLocAssignments(depId);

    // Make sure remainingLocations is properly memoized
    const remainingLocations = useMemo(() => {
        if (!locations || !assignedLocations) {
            console.log("Data not ready, returning empty array.");
            return []; // Return empty array if data isn't loaded
        }

        const assignedLocationIds = new Set(
            assignedLocations.map((assLoc) => assLoc.locationId),
        );

        return locations.filter((location) => {
            const isAssigned = assignedLocationIds.has(location.id);
            return !isAssigned;
        });
    }, [locations, assignedLocations]); // Dependencies are correct

    // Create department assignment mutation
    const { mutate: createAssignment, isPending: isCreating } =
        useCreateDepHospLocAssignment();

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            locationId: "",
        },
    });

    // Handle form submission
    const onSubmit = (values: FormValues) => {
        createAssignment(
            {
                departmentId: depId,
                locationId: values.locationId,
                userId: "system", // Replace with actual user ID if available
            },
            {
                onSuccess: async () => {
                    form.reset();
                    await refetchAssignments(); // Wait for refetch to complete
                    if (onSuccess) onSuccess();
                },
                onError: (error) => {
                    toast.error(
                        `Failed to create assignment: ${error.message}`,
                    );
                },
            },
        );
    };

    // Helper to get department name by ID
    // const getDepartmentName = (id: string) => {
    //     const dept = departments?.find((d) => d.id === id);
    //     return dept?.name || id;
    // };

    const getHospitalName = (locationId: string) => {
        const location = locations?.find((l) => l.id === locationId);
        const hospital = hosps?.find((h) => h.id === location?.hospId);
        return hospital?.name || locationId;
    };

    // Helper to get location name by ID
    const getLocationName = (id: string) => {
        const loc = locations?.find((l) => l.id === id);
        return loc?.name || id;
    };

    return (
        <Card className="w-full max-w-md ">
            <CardHeader>
                <CardTitle>Create Department-Location Assignment</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Location Selection */}
                        <FormField
                            control={form.control}
                            name="locationId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col ">
                                    <FormLabel>Hospital Location</FormLabel>
                                    <Popover
                                        open={openLocationPopover}
                                        onOpenChange={setOpenLocationPopover}
                                    >
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={
                                                        openLocationPopover
                                                    }
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value &&
                                                            "text-muted-foreground",
                                                    )}
                                                    disabled={
                                                        isLoadingLocations
                                                    }
                                                >
                                                    {isLoadingLocations ? (
                                                        <div className="flex items-center">
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            <span>
                                                                Loading
                                                                locations...
                                                            </span>
                                                        </div>
                                                    ) : field.value ? (
                                                        getLocationName(
                                                            field.value,
                                                        )
                                                    ) : (
                                                        "Select hospital location"
                                                    )}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[300px] p-0 md:w-[400px]">
                                            <Command>
                                                <CommandInput placeholder="Search locations..." />
                                                <CommandEmpty>
                                                    No location found.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {remainingLocations?.map(
                                                        (location) => (
                                                            <CommandItem
                                                                key={
                                                                    location.id
                                                                }
                                                                // value={
                                                                //     location.name
                                                                // }
                                                                value={`${location.name} ::: ${location.id}`}
                                                                onSelect={() => {
                                                                    form.setValue(
                                                                        "locationId",
                                                                        location.id,
                                                                        {
                                                                            shouldValidate:
                                                                                true,
                                                                        },
                                                                    );
                                                                    setOpenLocationPopover(
                                                                        false,
                                                                    );
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        field.value ===
                                                                            location.id
                                                                            ? "opacity-100"
                                                                            : "opacity-0",
                                                                    )}
                                                                />
                                                                {location.name}
                                                                <span className="ml-auto text-xs text-muted-foreground">
                                                                    (
                                                                    {getHospitalName(
                                                                        location.id,
                                                                    )}
                                                                    )
                                                                </span>
                                                            </CommandItem>
                                                        ),
                                                    )}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <CardFooter className="flex justify-between px-0 pb-0">
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
                                Create Assignment
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
