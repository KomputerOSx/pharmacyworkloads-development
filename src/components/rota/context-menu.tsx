// "use client";
//
// import { useEffect, useRef } from "react";
// import { Copy, Clipboard, Trash, Calendar } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import type { ContextMenuPosition } from "@/types/rotaTypes";
//
// interface ContextMenuProps {
//     position: ContextMenuPosition | null;
//     onClose: () => void;
//     onDelete: () => void;
//     onCopy: () => void;
//     onPaste: () => void;
//     onCopyToWeek: () => void;
//     canPaste: boolean;
// }
//
// export function ContextMenu({
//     position,
//     onClose,
//     onDelete,
//     onCopy,
//     onPaste,
//     onCopyToWeek,
//     canPaste,
// }: ContextMenuProps) {
//     const menuRef = useRef<HTMLDivElement>(null);
//
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (
//                 menuRef.current &&
//                 !menuRef.current.contains(event.target as Node)
//             ) {
//                 onClose();
//             }
//         };
//
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [onClose]);
//
//     if (!position) return null;
//
//     return (
//         <div
//             ref={menuRef}
//             className="absolute z-50 min-w-[160px] overflow-hidden rounded-md border bg-popover p-1 shadow-md animate-in fade-in-80"
//             style={{ top: position.y, left: position.x }}
//         >
//             <div className="flex flex-col space-y-1">
//                 <Button
//                     variant="ghost"
//                     className="flex w-full justify-start items-center px-2 py-1.5 text-sm"
//                     onClick={onDelete}
//                 >
//                     <Trash className="mr-2 h-4 w-4" />
//                     Delete
//                 </Button>
//                 <Button
//                     variant="ghost"
//                     className="flex w-full justify-start items-center px-2 py-1.5 text-sm"
//                     onClick={onCopy}
//                 >
//                     <Copy className="mr-2 h-4 w-4" />
//                     Copy
//                 </Button>
//                 <Button
//                     variant="ghost"
//                     className="flex w-full justify-start items-center px-2 py-1.5 text-sm"
//                     onClick={onPaste}
//                     disabled={!canPaste}
//                 >
//                     <Clipboard className="mr-2 h-4 w-4" />
//                     Paste
//                 </Button>
//                 <Button
//                     variant="ghost"
//                     className="flex w-full justify-start items-center px-2 py-1.5 text-sm"
//                     onClick={onCopyToWeek}
//                 >
//                     <Calendar className="mr-2 h-4 w-4" />
//                     Copy to weekdays
//                 </Button>
//             </div>
//         </div>
//     );
// }

"use client";

import React, { useEffect, useRef, useState } from "react"; // Import React and useState
import ReactDOM from "react-dom"; // Import ReactDOM for portals
import { Copy, Clipboard, Trash, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContextMenuPosition } from "@/types/rotaTypes";

interface ContextMenuProps {
    position: ContextMenuPosition | null;
    onClose: () => void;
    onDelete: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onCopyToWeek: () => void;
    canPaste: boolean;
}

export function ContextMenu({
    position,
    onClose,
    onDelete,
    onCopy,
    onPaste,
    onCopyToWeek,
    canPaste,
}: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    // State to ensure portal target exists only on the client
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Set isClient to true once component mounts on the client
        setIsClient(true);

        const handleClickOutside = (event: MouseEvent) => {
            // Check position exists before checking ref
            if (
                position &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        // Add listener only if position is set (menu is open)
        if (position) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Cleanup function
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
        // Re-run effect if position changes (menu opens/closes)
    }, [position, onClose]);

    // Don't render the portal or menu if no position or not on client yet
    if (!position || !isClient) {
        return null;
    }

    // --- Define styles for fixed positioning ---
    const menuStyle: React.CSSProperties = {
        position: "fixed", // Use fixed positioning
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 1000, // Ensure high z-index
    };

    // --- Render using ReactDOM.createPortal ---
    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            // Use fixed positioning via style prop, remove absolute class
            className="z-50 min-w-[160px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80" // Added text-popover-foreground for default text color
            style={menuStyle} // Apply fixed positioning styles
        >
            <div className="flex flex-col space-y-1">
                <Button
                    variant="ghost"
                    className="flex w-full justify-start items-center px-2 py-1.5 text-sm h-auto" // Added h-auto
                    onClick={() => {
                        onDelete();
                        onClose();
                    }} // Close menu after action
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                </Button>
                <Button
                    variant="ghost"
                    className="flex w-full justify-start items-center px-2 py-1.5 text-sm h-auto"
                    onClick={() => {
                        onCopy();
                        onClose();
                    }}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                </Button>
                <Button
                    variant="ghost"
                    className="flex w-full justify-start items-center px-2 py-1.5 text-sm h-auto"
                    onClick={() => {
                        onPaste();
                        onClose();
                    }}
                    disabled={!canPaste}
                >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Paste
                </Button>
                <Button
                    variant="ghost"
                    className="flex w-full justify-start items-center px-2 py-1.5 text-sm h-auto"
                    onClick={() => {
                        onCopyToWeek();
                        onClose();
                    }}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    Copy to weekdays
                </Button>
            </div>
        </div>,
        document.body,
    );
}
