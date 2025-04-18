"use client"

import { useState } from "react"
import { StickyNote, Plus, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { LocationNote } from "./types/workload"

interface NotesColumnProps {
  locationId: string
  notes: LocationNote[]
  onAddNote: (locationId: string, note: Omit<LocationNote, "id">) => void
  onUpdateNote: (locationId: string, noteId: string, data: Partial<LocationNote>) => void
  onDeleteNote: (locationId: string, noteId: string) => void
}

export function NotesColumn({ locationId, notes, onAddNote, onUpdateNote, onDeleteNote }: NotesColumnProps) {
  const [newNote, setNewNote] = useState("")
  const [editingNote, setEditingNote] = useState<{ id: string; content: string } | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(locationId, {
        content: newNote,
        createdAt: new Date().toISOString(),
      })
      setNewNote("")
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateNote = () => {
    if (editingNote && editingNote.content.trim()) {
      onUpdateNote(locationId, editingNote.id, {
        content: editingNote.content,
        updatedAt: new Date().toISOString(),
      })
      setEditingNote(null)
      setIsEditDialogOpen(false)
    }
  }

  const startEditingNote = (note: LocationNote) => {
    setEditingNote({ id: note.id, content: note.content })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-2">
      {!showDetails ? (
        <Button
          variant="outline"
          className="w-full flex items-center justify-between"
          onClick={() => setShowDetails(true)}
        >
          <StickyNote className="h-4 w-4 mr-2" />
          <Badge variant="secondary" className="ml-auto">
            {notes.length}
          </Badge>
        </Button>
      ) : (
        <>
          <Button variant="outline" size="sm" className="mb-2" onClick={() => setShowDetails(false)}>
            Hide Details
          </Button>
          <ScrollArea className="h-[200px] pr-3">
            {notes.length > 0 ? (
              <div className="space-y-2">
                {notes.map((note) => (
                  <Card key={note.id} className="p-2 text-sm">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString()}
                        {note.updatedAt && <span className="ml-1">(edited)</span>}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0"
                          onClick={() => startEditingNote(note)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 text-red-500"
                          onClick={() => onDeleteNote(locationId, note.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs whitespace-pre-wrap">{note.content}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">No notes</div>
            )}
          </ScrollArea>
        </>
      )}

      {/* Add Note Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-3 w-3 mr-1" /> Add Note
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter note"
                rows={6}
              />
            </div>
            <Button onClick={handleAddNote} className="w-full" disabled={!newNote.trim()}>
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-note">Note</Label>
              <Textarea
                id="edit-note"
                value={editingNote?.content || ""}
                onChange={(e) => setEditingNote((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                placeholder="Enter note"
                rows={6}
              />
            </div>
            <Button onClick={handleUpdateNote} className="w-full" disabled={!editingNote?.content.trim()}>
              Update Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
