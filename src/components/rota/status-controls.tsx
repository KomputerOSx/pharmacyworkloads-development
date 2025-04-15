// "use client";
//
// import { Check, FileText, AlertTriangle, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { formatFirestoreTimestamp } from "@/lib/firestoreUtil";
// import { Timestamp } from "firebase/firestore";
// import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
//
// interface StatusControlsProps {
//     currentStatus: "draft" | "published" | null;
//     lastModified: Timestamp | null | undefined;
//     isLoadingStatus: boolean;
//     isSettingStatus: boolean;
//     onSetStatus: (newStatus: "draft" | "published") => void;
//     onSaveDraft: () => void;
//     hasChanges: boolean;
//     onSaveChanges: () => void;
//     hasUnassignedUser?: boolean;
//     isSavingAssignments: boolean;
// }
//
// export function StatusControls({
//     currentStatus,
//     lastModified,
//     isLoadingStatus,
//     isSettingStatus,
//     isSavingAssignments,
//     onSetStatus,
//     hasChanges,
//     onSaveChanges,
//     onSaveDraft,
//     hasUnassignedUser = false,
// }: StatusControlsProps) {
//     const displayStatus = isLoadingStatus ? null : (currentStatus ?? "draft");
//     const disabled = isLoadingStatus || isSettingStatus || isSavingAssignments;
//
//     if (isLoadingStatus) {
//         return <Skeleton className="h-9 w-48" />;
//     }
//
//     return (
//         <div className="flex items-center gap-2">
//             {displayStatus === "published" ? (
//                 <div className="flex items-center gap-2 flex-wrap">
//                     <div className="text-sm font-medium text-green-600 flex items-center gap-1 whitespace-nowrap">
//                         <Check className="h-4 w-4" /> Published
//                         {lastModified && (
//                             <span className="text-xs text-muted-foreground ml-1">
//                                 ({formatFirestoreTimestamp(lastModified)})
//                             </span>
//                         )}
//                     </div>
//                     {hasChanges && (
//                         <Button
//                             variant="green"
//                             size="sm"
//                             onClick={onSaveChanges}
//                             disabled={disabled}
//                         >
//                             {isSettingStatus && (
//                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             )}
//                             Save Changes
//                         </Button>
//                     )}
//                     <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => onSetStatus("draft")}
//                         disabled={disabled}
//                     >
//                         {isSettingStatus && (
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         )}
//                         Revert to Draft
//                     </Button>
//                 </div>
//             ) : (
//                 <>
//                     <div className="flex items-center gap-2">
//                         <Badge
//                             variant="outline"
//                             className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 whitespace-nowrap"
//                         >
//                             <FileText className="h-3 w-3" />{" "}
//                             <strong>Draft</strong>
//                             {lastModified && (
//                                 <span className="text-xs ml-1">
//                                     (Saved:{" "}
//                                     {formatFirestoreTimestamp(lastModified)})
//                                 </span>
//                             )}
//                         </Badge>
//                     </div>
//                     <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={onSaveDraft}
//                         disabled={disabled || !hasChanges}
//                     >
//                         {(isSettingStatus || isSavingAssignments) && (
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         )}
//                         Save Draft
//                     </Button>
//                     <Button
//                         onClick={() => onSetStatus("published")}
//                         disabled={disabled}
//                         size="sm"
//                         className="flex items-center gap-1"
//                     >
//                         {isSettingStatus && (
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         )}
//                         {hasUnassignedUser && (
//                             <AlertTriangle className="h-4 w-4 text-orange-400 mr-1" />
//                         )}
//                         Publish
//                     </Button>
//                 </>
//             )}
//         </div>
//     );
// }

"use client";

import {
    Check,
    FileText,
    AlertTriangle,
    Loader2,
    Save,
    Undo2,
    Send,
} from "lucide-react"; // Added icons
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFirestoreTimestamp } from "@/lib/firestoreUtil";
import { Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components

interface StatusControlsProps {
    currentStatus: "draft" | "published" | null;
    lastModified: Timestamp | null | undefined;
    isLoadingStatus: boolean;
    isSettingStatus: boolean;
    onSetStatus: (newStatus: "draft" | "published") => void;
    onSaveDraft: () => void;
    hasChanges: boolean;
    onSaveChanges: () => void;
    hasUnassignedUser?: boolean;
    isSavingAssignments: boolean;
}

export function StatusControls({
    currentStatus,
    lastModified,
    isLoadingStatus,
    isSettingStatus,
    isSavingAssignments,
    onSetStatus,
    hasChanges,
    onSaveChanges,
    onSaveDraft,
    hasUnassignedUser = false,
}: StatusControlsProps) {
    const displayStatus = isLoadingStatus ? null : (currentStatus ?? "draft");
    const disabled = isLoadingStatus || isSettingStatus || isSavingAssignments;
    const showLoading = isSettingStatus || isSavingAssignments;

    if (isLoadingStatus) {
        return <Skeleton className="h-9 w-48" />; // Keep skeleton for loading state
    }

    return (
        <TooltipProvider>
            {/* Wrap everything in TooltipProvider */}
            <div className="flex items-center gap-3 sm:gap-3 flex-wrap">
                {" "}
                {/* Reduced gap on small screens */}
                {displayStatus === "published" ? (
                    <>
                        <div className="text-sm font-medium text-green-600 flex items-center gap-1 whitespace-nowrap px-1 sm:px-0">
                            {" "}
                            {/* Added padding for spacing */}
                            <Check className="h-4 w-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Published</span>
                            {lastModified && (
                                <span className="text-xs text-muted-foreground ml-1 hidden md:inline">
                                    {" "}
                                    {/* Hide timestamp on small */}(
                                    {formatFirestoreTimestamp(lastModified)})
                                </span>
                            )}
                        </div>
                        {hasChanges && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="green"
                                        size="sm" // Keep sm size for consistency
                                        onClick={onSaveChanges}
                                        disabled={disabled}
                                        className="px-2 sm:px-3" // Adjust padding
                                    >
                                        {showLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 sm:mr-1" /> // Icon only on small screens
                                        )}
                                        <span className="hidden sm:inline">
                                            Save Changes
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="sm:hidden">
                                    Save Changes
                                </TooltipContent>
                            </Tooltip>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onSetStatus("draft")}
                                    disabled={disabled}
                                    className="px-2 sm:px-3"
                                >
                                    {showLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Undo2 className="h-4 w-4 sm:mr-1" />
                                    )}
                                    <span className="hidden sm:inline">
                                        Revert to Draft
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="sm:hidden">
                                Revert to Draft
                            </TooltipContent>
                        </Tooltip>
                    </>
                ) : (
                    // Draft Status
                    <>
                        <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 whitespace-nowrap h-8 sm:h-auto" // Fixed height on small
                        >
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <strong className="hidden sm:inline">Draft</strong>
                            {lastModified && (
                                <span className="text-xs ml-1 hidden md:inline">
                                    (Saved:{" "}
                                    {formatFirestoreTimestamp(lastModified)})
                                </span>
                            )}
                        </Badge>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onSaveDraft}
                                    disabled={disabled || !hasChanges}
                                    className="px-2 sm:px-3"
                                >
                                    {showLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 sm:mr-1" />
                                    )}
                                    <span className="hidden sm:inline">
                                        Save Draft
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="sm:hidden">
                                Save Draft
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => onSetStatus("published")}
                                    disabled={disabled}
                                    size="sm"
                                    className="flex items-center gap-1 px-2 sm:px-3" // Adjust padding
                                >
                                    {showLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            {hasUnassignedUser && (
                                                <AlertTriangle className="h-4 w-4 text-orange-400" />
                                            )}
                                            <Send
                                                className={`h-4 w-4 ${hasUnassignedUser ? "sm:ml-1" : "sm:mr-1"}`}
                                            />{" "}
                                            {/* Icon first or after warning */}
                                        </>
                                    )}
                                    <span className="hidden sm:inline">
                                        Publish
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="sm:hidden">
                                Publish
                            </TooltipContent>
                        </Tooltip>
                    </>
                )}
            </div>
        </TooltipProvider>
    );
}
