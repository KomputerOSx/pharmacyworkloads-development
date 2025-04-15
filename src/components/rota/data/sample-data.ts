import type { StaffMember, Location, ShiftPreset } from "../../../types/rota"

// Sample staff data
export const allStaffMembers: StaffMember[] = [
  { id: 1, name: "John Smith", role: "Nurse" },
  { id: 2, name: "Sarah Johnson", role: "Doctor" },
  { id: 3, name: "Michael Brown", role: "Nurse" },
  { id: 4, name: "Emily Davis", role: "Nurse" },
  { id: 5, name: "David Wilson", role: "Doctor" },
  { id: 6, name: "Jessica Taylor", role: "Nurse" },
  { id: 7, name: "James Anderson", role: "Doctor" },
  { id: 8, name: "Lisa Thomas", role: "Nurse" },
  { id: 9, name: "Robert Jackson", role: "Doctor" },
  { id: 10, name: "Jennifer White", role: "Nurse" },
]

// Sample locations
export const predefinedLocations: Location[] = [
  { id: 1, name: "Ward A" },
  { id: 2, name: "Ward B" },
  { id: 3, name: "Ward C" },
  { id: 4, name: "Ward D" },
  { id: 5, name: "Ward E" },
  { id: 6, name: "ICU" },
  { id: 7, name: "ER" },
  { id: 8, name: "Outpatient" },
]

// Shift presets
export const shiftPresets: ShiftPreset[] = [
  { id: "normal", name: "NORMAL", startTime: "08:30", endTime: "17:00", description: "8:30am - 5pm" },
  { id: "am", name: "AM", startTime: "08:30", endTime: "12:00", description: "8:30am - 12pm" },
  { id: "pm", name: "PM", startTime: "12:00", endTime: "17:00", description: "12pm - 5pm" },
  { id: "late", name: "LATE", startTime: "12:00", endTime: "20:00", description: "12pm - 8pm" },
  { id: "longday", name: "LONG DAY", startTime: "08:30", endTime: "20:00", description: "8:30am - 8pm" },
  { id: "custom", name: "CUSTOM", startTime: "", endTime: "", description: "Custom hours" },
]
