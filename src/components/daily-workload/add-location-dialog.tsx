"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import type { HospLoc } from "./types/workload"

interface AddLocationDialogProps {
  availableLocations: HospLoc[]
  onAddLocation: (locationId: string) => void
  onAddCustomLocation: (name: string, capacity?: number) => void
}

export function AddLocationDialog({ availableLocations, onAddLocation, onAddCustomLocation }: AddLocationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [customName, setCustomName] = useState("")
  const [customCapacity, setCustomCapacity] = useState<number | undefined>(undefined)

  // Filter available locations based on search query
  const filteredAvailableLocations = availableLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAddCustomLocation = () => {
    if (customName.trim()) {
      onAddCustomLocation(customName, customCapacity)
      setCustomName("")
      setCustomCapacity(undefined)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Location
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Location</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-72">
            <div className="space-y-1">
              {filteredAvailableLocations.length > 0 ? (
                filteredAvailableLocations.map((location) => (
                  <Button
                    key={location.id}
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    onClick={() => {
                      onAddLocation(location.id)
                      setSearchQuery("")
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span>{location.name}</span>
                      <span className="text-xs text-muted-foreground">{location.type}</span>
                      {location.description && (
                        <span className="text-xs text-muted-foreground">{location.description}</span>
                      )}
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {searchQuery ? "No matching locations found" : "All locations have been added"}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium mb-2">Add Custom Location</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="custom-name">Location Name</Label>
                <Input
                  id="custom-name"
                  placeholder="Enter location name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="custom-capacity">Capacity (optional)</Label>
                <Input
                  id="custom-capacity"
                  type="number"
                  placeholder="Enter capacity"
                  value={customCapacity === undefined ? "" : customCapacity}
                  onChange={(e) => {
                    const value = e.target.value ? Number.parseInt(e.target.value, 10) : undefined
                    setCustomCapacity(value)
                  }}
                  min={1}
                />
              </div>
              <Button className="w-full" onClick={handleAddCustomLocation} disabled={!customName.trim()}>
                Add Custom Location
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
