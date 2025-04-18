"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { ShiftPreset } from "./types/workload"
import { getShiftPreset } from "./utils/workload-utils"

interface ShiftSelectorProps {
  shiftPresets: ShiftPreset[]
  selectedShiftType: string | null
  onShiftSelect: (shiftType: string, isCustom: boolean) => void
  popoverOpen: boolean
  onPopoverOpenChange: (open: boolean) => void
}

export function ShiftSelector({
  shiftPresets,
  selectedShiftType,
  onShiftSelect,
  popoverOpen,
  onPopoverOpenChange,
}: ShiftSelectorProps) {
  return (
    <Popover open={popoverOpen} onOpenChange={onPopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between text-left font-normal h-8">
          {selectedShiftType ? getShiftPreset(selectedShiftType)?.name || "Select shift" : "Select shift"}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup heading="Shift Types">
              {shiftPresets.map((preset) => (
                <CommandItem
                  key={preset.id}
                  value={preset.name}
                  onSelect={() => {
                    onShiftSelect(preset.id, preset.id === "custom")
                    onPopoverOpenChange(false)
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedShiftType === preset.id ? "opacity-100" : "opacity-0")}
                  />
                  <div>
                    <div>{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {preset.id !== "custom" ? preset.description : "Set custom hours"}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
