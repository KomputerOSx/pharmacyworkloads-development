"use client"

import { useState } from "react"
import { StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

interface AssignmentNotesProps {
  notes?: string
  onSaveNotes: (notes: string) => void
}

export function AssignmentNotes({ notes, onSaveNotes }: AssignmentNotesProps) {
  const [currentNotes, setCurrentNotes] = useState(notes || "")
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = () => {
    onSaveNotes(currentNotes)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 rounded-full ${notes ? "text-amber-500" : "text-muted-foreground"}`}
        >
          <StickyNote className="h-4 w-4" />
          <span className="sr-only">Notes</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-2">
          <h4 className="font-medium">Assignment Notes</h4>
          <Textarea
            placeholder="Add notes for this assignment..."
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Notes
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
