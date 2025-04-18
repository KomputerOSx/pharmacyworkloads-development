"use client"
import { addDays, format, subDays } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DaySelectorProps {
  date: Date
  onDateChange: (date: Date) => void
}

export function DaySelector({ date, onDateChange }: DaySelectorProps) {
  const dateText = format(date, "EEEE, MMMM d, yyyy")

  const navigatePreviousDay = () => {
    onDateChange(subDays(date, 1))
  }

  const navigateNextDay = () => {
    onDateChange(addDays(date, 1))
  }

  const navigateToToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={navigatePreviousDay}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal truncate">
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="hidden xs:inline">{dateText}</span>
            <span className="xs:hidden">{format(date, "MMM d")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="p-3 border-b">
            <h3 className="font-medium text-center">{format(date, "MMMM yyyy")}</h3>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && onDateChange(newDate)}
            initialFocus
            modifiers={{
              today: new Date(),
            }}
            modifiersStyles={{
              today: {
                fontWeight: "bold",
              },
            }}
            classNames={{
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "font-bold",
            }}
          />
          <div className="p-3 border-t">
            <Button variant="outline" size="sm" className="w-full" onClick={navigateToToday}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Today
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={navigateNextDay}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
