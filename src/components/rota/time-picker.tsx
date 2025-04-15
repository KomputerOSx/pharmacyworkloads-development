"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)
  const [open, setOpen] = useState(false)

  // Parse the time value when it changes
  useEffect(() => {
    if (value) {
      const [hoursStr, minutesStr] = value.split(":")
      setHours(Number.parseInt(hoursStr, 10))
      setMinutes(Number.parseInt(minutesStr, 10))
    }
  }, [value])

  // Format the time for display
  const formatTime = (hours: number, minutes: number): string => {
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Update the time value
  const updateTime = (newHours: number, newMinutes: number) => {
    const formattedHours = newHours.toString().padStart(2, "0")
    const formattedMinutes = newMinutes.toString().padStart(2, "0")
    onChange(`${formattedHours}:${formattedMinutes}`)
  }

  // Handle hour selection
  const handleHourClick = (hour: number) => {
    setHours(hour)
    updateTime(hour, minutes)
  }

  // Handle minute selection
  const handleMinuteClick = (minute: number) => {
    setMinutes(minute)
    updateTime(hours, minute)
  }

  // Generate hour buttons
  const hourButtons = Array.from({ length: 24 }, (_, i) => (
    <Button
      key={i}
      variant={hours === i ? "default" : "outline"}
      className={cn("h-8 w-10", hours === i ? "bg-primary text-primary-foreground" : "")}
      onClick={() => handleHourClick(i)}
    >
      {i.toString().padStart(2, "0")}
    </Button>
  ))

  // Generate minute buttons (in 5-minute increments)
  const minuteButtons = Array.from({ length: 12 }, (_, i) => {
    const minute = i * 5
    return (
      <Button
        key={minute}
        variant={minutes === minute ? "default" : "outline"}
        className={cn("h-8 w-10", minutes === minute ? "bg-primary text-primary-foreground" : "")}
        onClick={() => handleMinuteClick(minute)}
      >
        {minute.toString().padStart(2, "0")}
      </Button>
    )
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal h-8"
          onClick={() => setOpen(true)}
        >
          {label && <span className="mr-2 text-muted-foreground">{label}</span>}
          {value ? formatTime(hours, minutes) : "Select time"}
          <Clock className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Hours (24-hour)</Label>
            <div className="grid grid-cols-6 gap-1">{hourButtons}</div>
          </div>
          <div className="space-y-2">
            <Label>Minutes</Label>
            <div className="grid grid-cols-6 gap-1">{minuteButtons}</div>
          </div>
          <div className="pt-2 text-center text-sm font-medium">Selected: {formatTime(hours, minutes)}</div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
