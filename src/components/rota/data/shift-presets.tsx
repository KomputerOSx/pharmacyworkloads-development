import type { ShiftPreset } from "../../../types/rota"

// Shift presets
export const shiftPresets: ShiftPreset[] = [
  { id: "normal", name: "NORMAL", startTime: "08:30", endTime: "17:00", description: "8:30am - 5pm" },
  { id: "am", name: "AM", startTime: "08:30", endTime: "12:00", description: "8:30am - 12pm" },
  { id: "pm", name: "PM", startTime: "12:00", endTime: "17:00", description: "12pm - 5pm" },
  { id: "late", name: "LATE", startTime: "12:00", endTime: "20:00", description: "12pm - 8pm" },
  { id: "longday", name: "LONG DAY", startTime: "08:30", endTime: "20:00", description: "8:30am - 8pm" },
  { id: "custom", name: "CUSTOM", startTime: "", endTime: "", description: "Custom hours" },
]
