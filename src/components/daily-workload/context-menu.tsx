"use client"

import { useEffect, useRef } from "react"
import { Copy, Clipboard, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ContextMenuPosition } from "./types/workload"

interface ContextMenuProps {
  position: ContextMenuPosition | null
  onClose: () => void
  onDelete: () => void
  onCopy: () => void
  onPaste: () => void
  canPaste: boolean
}

export function ContextMenu({ position, onClose, onDelete, onCopy, onPaste, canPaste }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  if (!position) return null

  return (
    <div
      ref={menuRef}
      className="absolute z-50 min-w-[160px] overflow-hidden rounded-md border bg-popover p-1 shadow-md animate-in fade-in-80"
      style={{ top: position.y, left: position.x }}
    >
      <div className="flex flex-col space-y-1">
        <Button
          variant="ghost"
          className="flex w-full justify-start items-center px-2 py-1.5 text-sm"
          onClick={onDelete}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
        <Button variant="ghost" className="flex w-full justify-start items-center px-2 py-1.5 text-sm" onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
        <Button
          variant="ghost"
          className="flex w-full justify-start items-center px-2 py-1.5 text-sm"
          onClick={onPaste}
          disabled={!canPaste}
        >
          <Clipboard className="mr-2 h-4 w-4" />
          Paste
        </Button>
      </div>
    </div>
  )
}
