import React from "react";
import { StoredAssignment } from "@/types/rotaTypes";
import { HospLoc } from "@/types/subDepTypes";
import { Card, CardContent } from "@/components/ui/card"; // Use Card for structure
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MapPin, Clock, StickyNote } from "lucide-react";
import { formatShiftTime } from "./utils/rota-utils"; // Reuse formatter
import { shiftPresets, defaultShiftColor } from "@/types/rotaTypes";
import { cn } from "@/lib/utils"; // Assuming shiftPresets is accessible

interface ViewOnlyAssignmentCardProps {
    assignment: StoredAssignment;
    locationsMap: Map<string, HospLoc>; // Pass map for efficient lookup
}

export function ViewOnlyAssignmentCard({
    assignment,
    locationsMap,
}: ViewOnlyAssignmentCardProps) {
    const locationName = assignment.locationId
        ? (locationsMap.get(assignment.locationId)?.name ??
          `Loc ID: ${assignment.locationId}`) // Lookup name
        : (assignment.customLocation ?? "Unspecified Location"); // Use custom or default

    const displayTime = formatShiftTime(assignment); // Use formatter

    const preset = assignment.shiftType
        ? shiftPresets.find((p) => p.id === assignment.shiftType)
        : null;

    const colors = preset ? preset.colorClasses : defaultShiftColor;

    return (
        <Card
            className={cn(
                "p-2 text-xs shadow-sm border-l-4",
                colors?.bg,
                colors?.border,
                colors?.text,
            )}
        >
            <CardContent className="p-0 space-y-1">
                {/* Location */}
                <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium truncate" title={locationName}>
                        {locationName}
                    </span>
                </div>
                {/* Time */}
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{displayTime}</span>
                </div>
                {/* Notes */}
                {assignment.notes && (
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 cursor-default">
                                    <StickyNote className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                    <span className="text-muted-foreground italic truncate">
                                        Note
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                align="start"
                                className="max-w-[250px] whitespace-normal"
                            >
                                <p>{assignment.notes}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </CardContent>
        </Card>
    );
}
