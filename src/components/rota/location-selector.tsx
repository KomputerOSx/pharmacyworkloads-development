"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { HospLoc } from "@/types/subDepTypes";
import { useHospLocs } from "@/hooks/useHospLoc";
import { useParams } from "next/navigation";

interface LocationSelectorProps {
    allLocations: HospLoc[];
    selectedLocationId: string | null;
    customLocation?: string;
    onLocationSelect: (
        locationId: string | null,
        customLocation?: string,
    ) => void;
    onAddCustomLocation: (name: string) => void;
    popoverOpen: boolean;
    onPopoverOpenChange: (open: boolean) => void;
}

export function LocationSelector({
    allLocations,
    selectedLocationId,
    customLocation,
    onLocationSelect,
    onAddCustomLocation,
    popoverOpen,
    onPopoverOpenChange,
}: LocationSelectorProps) {
    const [newCustomLocation, setNewCustomLocation] = useState("");

    const params = useParams();
    const orgId = params.orgId as string;

    const { data: hospitalLocations } = useHospLocs(orgId);

    const getLocationName = () => {
        if (customLocation) return customLocation;
        if (!selectedLocationId) return "";
        const location = allLocations.find((l) => l.id === selectedLocationId);
        const locationBackup = hospitalLocations?.find(
            (l) => l.id === selectedLocationId,
        );
        return location ? location.name : locationBackup?.name;
    };

    const handleAddClick = () => {
        const trimmedName = newCustomLocation.trim();
        if (trimmedName) {
            onAddCustomLocation(trimmedName);
            setNewCustomLocation("");
            onPopoverOpenChange(false);
        }
    };

    return (
        <Popover open={popoverOpen} onOpenChange={onPopoverOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between text-left font-normal h-8 flex items-center"
                >
                    <span className="block-truncate overflow-hidden text-ellipsis whitespace-nowrap pr-0">
                        {getLocationName() || "Select location"}
                    </span>
                    <ChevronDown className=" h-4 w-2 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search location..." />
                    <CommandList>
                        <CommandEmpty>
                            <div className="px-2 py-1.5 text-sm">
                                No location found
                                <div className="mt-2">
                                    <Input
                                        placeholder="Add custom location"
                                        value={newCustomLocation}
                                        onChange={(e) =>
                                            setNewCustomLocation(e.target.value)
                                        }
                                        className="h-8"
                                    />
                                    <Button
                                        className="w-full mt-1 h-8"
                                        size="sm"
                                        onClick={() => {
                                            handleAddClick();
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </CommandEmpty>
                        <CommandGroup heading="Locations">
                            <CommandItem
                                key="clear-location"
                                value=""
                                onSelect={() => {
                                    onLocationSelect(null, undefined); // Clear both ID and custom name
                                    onPopoverOpenChange(false);
                                }}
                            >
                                <span className="italic text-muted-foreground">
                                    {" "}
                                    (Clear Location){" "}
                                </span>
                            </CommandItem>
                            {allLocations.map((location) => (
                                <CommandItem
                                    key={location.id}
                                    value={location.name}
                                    onSelect={() => {
                                        onLocationSelect(location.id);
                                        onPopoverOpenChange(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedLocationId ===
                                                location.id && !customLocation
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                    {location.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandGroup heading="Custom">
                            <div className="px-2 py-1.5 text-sm">
                                <Input
                                    placeholder="Add custom location"
                                    value={newCustomLocation}
                                    onChange={(e) =>
                                        setNewCustomLocation(e.target.value)
                                    }
                                    className="h-8"
                                />
                                <Button
                                    className="w-full mt-1 h-8"
                                    size="sm"
                                    onClick={() => {
                                        if (newCustomLocation.trim()) {
                                            onAddCustomLocation(
                                                newCustomLocation,
                                            );
                                            onLocationSelect(
                                                null,
                                                newCustomLocation,
                                            );
                                            setNewCustomLocation("");
                                            onPopoverOpenChange(false);
                                        }
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
