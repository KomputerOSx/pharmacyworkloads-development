"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface CombinedTimePickerProps {
  startTime: string
  endTime: string
  onStartTimeChange: (value: string) => void
  onEndTimeChange: (value: string) => void
}

export function CombinedTimePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: CombinedTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"start" | "end">("start")

  // Parse the time values
  const parseTime = (timeStr: string): { hour: number; minute: number; period: "AM" | "PM" } => {
    if (!timeStr) return { hour: 9, minute: 0, period: "AM" }

    const [hoursStr, minutesStr] = timeStr.split(":")
    let hour = Number.parseInt(hoursStr, 10)
    const minute = Number.parseInt(minutesStr, 10)
    const period = hour >= 12 ? "PM" : "AM"

    // Convert to 12-hour format
    hour = hour % 12 || 12

    return { hour, minute, period }
  }

  // Format time for display
  const formatTimeForDisplay = (timeStr: string): string => {
    if (!timeStr) return "Set time"

    const { hour, minute, period } = parseTime(timeStr)
    return `${hour}:${minute.toString().padStart(2, "0")} ${period}`
  }

  // Convert 12-hour format to 24-hour format
  const to24Hour = (hour: number, period: "AM" | "PM"): number => {
    if (period === "AM") {
      return hour === 12 ? 0 : hour
    } else {
      return hour === 12 ? 12 : hour + 12
    }
  }

  // Update time value
  const updateTime = (isStart: boolean, hour: number, minute: number, period: "AM" | "PM") => {
    const hour24 = to24Hour(hour, period)
    const formattedHours = hour24.toString().padStart(2, "0")
    const formattedMinutes = minute.toString().padStart(2, "0")
    const newTime = `${formattedHours}:${formattedMinutes}`

    if (isStart) {
      onStartTimeChange(newTime)
    } else {
      onEndTimeChange(newTime)
    }
  }

  // Initial values
  const startTimeParsed = parseTime(startTime)
  const endTimeParsed = parseTime(endTime)

  const [startHour, setStartHour] = useState(startTimeParsed.hour)
  const [startMinute, setStartMinute] = useState(startTimeParsed.minute)
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">(startTimeParsed.period)

  const [endHour, setEndHour] = useState(endTimeParsed.hour)
  const [endMinute, setEndMinute] = useState(endTimeParsed.minute)
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">(endTimeParsed.period)

  // Update state when props change
  useEffect(() => {
    const parsed = parseTime(startTime)
    setStartHour(parsed.hour)
    setStartMinute(parsed.minute)
    setStartPeriod(parsed.period)
  }, [startTime])

  useEffect(() => {
    const parsed = parseTime(endTime)
    setEndHour(parsed.hour)
    setEndMinute(parsed.minute)
    setEndPeriod(parsed.period)
  }, [endTime])

  // Generate hour buttons (1-12)
  const hourButtons = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1 // 1-12
    return (
      <Button
        key={hour}
        variant="outline"
        size="sm"
        className={cn(
          "h-8 w-10",
          (activeTab === "start" && startHour === hour) || (activeTab === "end" && endHour === hour)
            ? "bg-primary text-primary-foreground"
            : "",
        )}
        onClick={() => {
          if (activeTab === "start") {
            setStartHour(hour)
            updateTime(true, hour, startMinute, startPeriod)
          } else {
            setEndHour(hour)
            updateTime(false, hour, endMinute, endPeriod)
          }
        }}
      >
        {hour}
      </Button>
    )
  })

  // Generate minute buttons (in 5-minute increments)
  const minuteButtons = Array.from({ length: 12 }, (_, i) => {
    const minute = i * 5
    return (
      <Button
        key={minute}
        variant="outline"
        size="sm"
        className={cn(
          "h-8 w-10",
          (activeTab === "start" && startMinute === minute) || (activeTab === "end" && endMinute === minute)
            ? "bg-primary text-primary-foreground"
            : "",
        )}
        onClick={() => {
          if (activeTab === "start") {
            setStartMinute(minute)
            updateTime(true, startHour, minute, startPeriod)
          } else {
            setEndMinute(minute)
            updateTime(false, endHour, minute, endPeriod)
          }
        }}
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
          <span className="truncate">
            {formatTimeForDisplay(startTime)} - {formatTimeForDisplay(endTime)}
          </span>
          <Clock className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <Tabs defaultValue="start" value={activeTab} onValueChange={(v) => setActiveTab(v as "start" | "end")}>
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="start">Start Time</TabsTrigger>
            <TabsTrigger value="end">End Time</TabsTrigger>
          </TabsList>

          <TabsContent value="start" className="space-y-3">
            <div className="space-y-2">
              <Label>Hours</Label>
              <div className="grid grid-cols-6 gap-1">{hourButtons}</div>
            </div>
            <div className="space-y-2">
              <Label>Minutes</Label>
              <div className="grid grid-cols-6 gap-1">{minuteButtons}</div>
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <div className="flex gap-2">
                <Button
                  variant={startPeriod === "AM" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setStartPeriod("AM")
                    updateTime(true, startHour, startMinute, "AM")
                  }}
                >
                  AM
                </Button>
                <Button
                  variant={startPeriod === "PM" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setStartPeriod("PM")
                    updateTime(true, startHour, startMinute, "PM")
                  }}
                >
                  PM
                </Button>
              </div>
            </div>
            <div className="text-center text-sm font-medium">
              Selected: {startHour}:{startMinute.toString().padStart(2, "0")} {startPeriod}
            </div>
          </TabsContent>

          <TabsContent value="end" className="space-y-3">
            <div className="space-y-2">
              <Label>Hours</Label>
              <div className="grid grid-cols-6 gap-1">{hourButtons}</div>
            </div>
            <div className="space-y-2">
              <Label>Minutes</Label>
              <div className="grid grid-cols-6 gap-1">{minuteButtons}</div>
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <div className="flex gap-2">
                <Button
                  variant={endPeriod === "AM" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setEndPeriod("AM")
                    updateTime(false, endHour, endMinute, "AM")
                  }}
                >
                  AM
                </Button>
                <Button
                  variant={endPeriod === "PM" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setEndPeriod("PM")
                    updateTime(false, endHour, endMinute, "PM")
                  }}
                >
                  PM
                </Button>
              </div>
            </div>
            <div className="text-center text-sm font-medium">
              Selected: {endHour}:{endMinute.toString().padStart(2, "0")} {endPeriod}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
