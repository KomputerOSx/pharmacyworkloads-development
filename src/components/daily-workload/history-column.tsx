"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import type { HistoryEntry } from "./types/workload"

interface HistoryColumnProps {
  locationId: string
  dateId: string
  history: HistoryEntry[]
  onAddHistory: (locationId: string, entry: Omit<HistoryEntry, "id">) => void
}

export function HistoryColumn({ locationId, dateId, history, onAddHistory }: HistoryColumnProps) {
  // Filter history entries for the current date
  const dayHistory = history.filter((entry) => entry.date === dateId)
  const [count, setCount] = useState<number>(dayHistory.length || 0)

  // Update count when date or history changes
  useEffect(() => {
    const filteredHistory = history.filter((entry) => entry.date === dateId)
    setCount(filteredHistory.length)
  }, [dateId, history])

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = Number.parseInt(e.target.value, 10) || 0
    setCount(newCount)

    // If the count increased, add dummy history entries
    if (newCount > dayHistory.length) {
      const entriesToAdd = newCount - dayHistory.length
      for (let i = 0; i < entriesToAdd; i++) {
        onAddHistory(locationId, {
          date: dateId,
          userName: "Staff",
          note: "History entry",
        })
      }
    }
    // Note: We don't handle decreasing the count as that would require
    // deciding which entries to remove, which is complex without user input
  }

  return (
    <Input
      id={`history-${locationId}-${dateId}`}
      type="number"
      min="0"
      value={count}
      onChange={handleCountChange}
      className="h-8"
    />
  )
}
