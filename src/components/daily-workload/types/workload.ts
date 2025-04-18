// Types for the daily workload management system
import type { Timestamp } from "firebase/firestore"

export type User = {
  id: string
  authUid?: string | null
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  orgId: string
  departmentId: string
  role: string
  jobTitle: string
  specialty: string
  active: boolean
  lastLogin: Timestamp | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  createdById: string
  updatedById: string
}

export type HospLoc = {
  id: string
  name: string
  type: string
  hospId: string
  orgId: string
  description: string | null
  address: string | null
  contactEmail: string | null
  contactPhone: string | null
  active: boolean
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  createdById: string
  updatedById: string
}

export type ShiftPreset = {
  id: string
  name: string
  startTime: string
  endTime: string
  description: string
  colorClasses?: {
    bg: string
    border: string
    text: string
  }
}

export type Assignment = {
  id: string
  locationId: string | null
  customLocation?: string
  shiftType: string | null
  customStartTime?: string
  customEndTime?: string
  notes?: string
}

export type StoredAssignment = Assignment & {
  userId: string
  teamId: string
  weekId: string
  dayIndex: number
}

export type HistoryEntry = {
  id: string
  date: string
  userName: string
  note: string
}

export type ReviewItem = {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed"
  date?: string
}

export type UrgentQuery = {
  id: string
  query: string
  status: "open" | "in-progress" | "resolved"
  timeSubmitted: string
  date?: string
}

export type LocationNote = {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
}

export type LocationData = {
  locationId: string
  history: HistoryEntry[]
  reviewItems: ReviewItem[]
  urgentQueries: UrgentQuery[]
  notes: LocationNote[]
}

export type WeekStatus = {
  weekId: string
  teamId: string
  orgId: string
  status: "draft" | "published"
  lastModified: Timestamp | null
  lastModifiedById: string | null
}

export type ClipboardItem = {
  assignment: Assignment & { userId?: string }
}

export type ContextMenuPosition = {
  x: number
  y: number
  locationId: string
  assignmentId?: string
}
