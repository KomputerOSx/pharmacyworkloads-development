// import React from "react";
// import { StoredAssignment } from "@/types/rotaTypes";
// import { HospLoc } from "@/types/subDepTypes";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//     Tooltip,
//     TooltipContent,
//     TooltipProvider,
//     TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { MapPin, Clock, StickyNote } from "lucide-react";
// import { formatShiftTime } from "./utils/rota-utils";
// import { shiftPresets, defaultShiftColor } from "@/types/rotaTypes";
// import { cn } from "@/lib/utils";
//
// interface ViewOnlyAssignmentCardProps {
//     assignment: StoredAssignment;
//     locationsMap: Map<string, HospLoc>;
// }
//
// export function ViewOnlyAssignmentCard({
//     assignment,
//     locationsMap,
// }: ViewOnlyAssignmentCardProps) {
//     const locationName = assignment.locationId
//         ? (locationsMap.get(assignment.locationId)?.name ??
//           `Loc ID: ${assignment.locationId}`) // Lookup name
//         : (assignment.customLocation ?? "Unspecified Location");
//
//     const displayTime = formatShiftTime(assignment);
//
//     const preset = assignment.shiftType
//         ? shiftPresets.find((p) => p.id === assignment.shiftType)
//         : null;
//
//     const colors = preset ? preset.colorClasses : defaultShiftColor;
//
//     return (
//         <Card
//             className={cn(
//                 "p-2 text-xs shadow-sm border-l-4",
//                 colors?.bg,
//                 colors?.border,
//                 colors?.text,
//             )}
//         >
//             <CardContent className="p-0 space-y-1">
//                 {/* Location */}
//                 <div className="flex items-center gap-1">
//                     <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
//                     <span className="font-medium truncate" title={locationName}>
//                         {locationName}
//                     </span>
//                 </div>
//                 {/* Time */}
//                 <div className="flex items-center gap-1">
//                     <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
//                     <span className="text-muted-foreground">{displayTime}</span>
//                 </div>
//                 {/* Notes */}
//                 {assignment.notes && (
//                     <TooltipProvider delayDuration={100}>
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <div className="flex items-center gap-1 cursor-default">
//                                     <StickyNote className="h-3 w-3 text-muted-foreground flex-shrink-0" />
//                                     <span className="text-muted-foreground italic truncate">
//                                         Note
//                                     </span>
//                                 </div>
//                             </TooltipTrigger>
//                             <TooltipContent
//                                 side="bottom"
//                                 align="start"
//                                 className="max-w-[250px] whitespace-normal"
//                             >
//                                 <p>{assignment.notes}</p>
//                             </TooltipContent>
//                         </Tooltip>
//                     </TooltipProvider>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }

import React from "react";
import { StoredAssignment } from "@/types/rotaTypes";
import { HospLoc } from "@/types/subDepTypes"; // Import color utility
import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MapPin, Clock, StickyNote } from "lucide-react";
import { formatShiftTime } from "./utils/rota-utils";
import { shiftPresets } from "@/types/rotaTypes"; // Only need shiftPresets
import { cn } from "@/lib/utils";
import { getColorObjectWithDefault } from "@/lib/helper/hospLoc/hospLocColors";

interface ViewOnlyAssignmentCardProps {
    assignment: StoredAssignment;
    locationsMap: Map<string, HospLoc>;
}

export function ViewOnlyAssignmentCard({
    assignment,
    locationsMap,
}: ViewOnlyAssignmentCardProps) {
    const location = assignment.locationId
        ? locationsMap.get(assignment.locationId)
        : null;
    const locationName =
        location?.name ??
        assignment.customLocation ??
        (assignment.locationId
            ? `Loc ID: ${assignment.locationId}`
            : "Unspecified Location");

    // Get Location Color Object (defaults to gray if not found or no color assigned)
    const locationColorObj = getColorObjectWithDefault(location?.color);

    const displayTime = formatShiftTime(assignment);

    // Get Shift Preset
    const shiftPreset = assignment.shiftType
        ? shiftPresets.find((p) => p.id === assignment.shiftType)
        : null;

    // Determine Classes
    const shiftHasColor = shiftPreset?.colorClasses;

    const borderClass = shiftHasColor
        ? `${shiftPreset.colorClasses?.border ?? ""} ${shiftPreset.colorClasses?.darkBorder ?? ""}`
        : `${locationColorObj.colorClasses.border ?? ""} ${locationColorObj.colorClasses.darkBorder ?? ""}`;

    const bgClass = `${locationColorObj.colorClasses.bg ?? ""} ${locationColorObj.colorClasses.darkBg ?? ""}`;
    const textClass = `${locationColorObj.colorClasses.text ?? ""} ${locationColorObj.colorClasses.darkText ?? ""}`;

    return (
        <Card
            className={cn(
                "p-2 text-xs shadow-sm border-l-4", // Base styles
                bgClass, // Always use location background
                textClass, // Always use location text
                borderClass, // Conditional border
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
