"use client"
import { addWeeks, format, getISOWeek, subWeeks, startOfWeek } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface WeekSelectorProps {
  date: Date
  onDateChange: (date: Date) => void
}

export function WeekSelector({ date, onDateChange }: WeekSelectorProps) {
  // Calculate the start of the week (Monday)
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // 1 means Monday

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const weekNumber = getISOWeek(date)
  const dateRangeText = `Week ${weekNumber}: ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`

  const navigatePreviousWeek = () => {
    onDateChange(subWeeks(date, 1))
  }

  const navigateNextWeek = () => {
    onDateChange(addWeeks(date, 1))
  }

  const navigateToThisWeek = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={navigatePreviousWeek}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal truncate">
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="hidden xs:inline">{dateRangeText}</span>
            <span className="xs:hidden">Week {weekNumber}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="p-3 border-b">
            <h3 className="font-medium text-center">
              Week {getISOWeek(date)}, {format(date, "yyyy")}
            </h3>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && onDateChange(newDate)}
            initialFocus
            modifiers={{
              weekHighlight: {
                from: weekStart,
                to: weekEnd,
              },
            }}
            modifiersStyles={{
              weekHighlight: {
                backgroundColor: "transparent",
                borderRadius: "0",
                borderTop: "2px solid hsl(var(--primary))",
                borderBottom: "2px solid hsl(var(--primary))",
                fontWeight: "500",
                color: "hsl(var(--primary))",
              },
              today: {
                backgroundColor: "hsl(var(--primary))",
                color: "white",
                fontWeight: "bold",
              },
            }}
            classNames={{
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-primary text-primary-foreground font-bold",
            }}
          />
          <div className="p-3 border-t">
            <Button variant="outline" size="sm" className="w-full" onClick={navigateToThisWeek}>
              <CalendarDays className="mr-2 h-4 w-4" />
              This Week
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={navigateNextWeek}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
