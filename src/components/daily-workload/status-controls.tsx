"use client"

import { Check, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { WeekStatus } from "./types/workload"
import type { Timestamp } from "firebase/firestore"

interface StatusControlsProps {
  weekId: string
  teamId: string
  orgId: string
  weekStatuses: WeekStatus[]
  onStatusChange: (weekId: string, status: "draft" | "published") => void
  hasChanges: boolean
  onSaveChanges: () => void
  hasUnassignedLocations?: boolean
  currentUserId: string
}

export function StatusControls({
  weekId,
  teamId,
  orgId,
  weekStatuses,
  onStatusChange,
  hasChanges,
  onSaveChanges,
  hasUnassignedLocations = false,
  currentUserId,
}: StatusControlsProps) {
  // Get current week status
  const currentStatus = weekStatuses.find((s) => s.weekId === weekId && s.teamId === teamId && s.orgId === orgId)

  const formatTimestamp = (timestamp: Timestamp | null) => {
    if (!timestamp) return ""
    return new Date(timestamp.toMillis()).toLocaleString()
  }

  const lastModified = currentStatus?.lastModified
  const lastModifiedBy = currentStatus?.lastModifiedById
  const isPublished = currentStatus?.status === "published"

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isPublished ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-medium text-green-600 flex items-center gap-1">
            <Check className="h-4 w-4" /> Published
            {lastModified && (
              <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">
                {formatTimestamp(lastModified)}
                {lastModifiedBy && lastModifiedBy !== currentUserId && ` by ${lastModifiedBy}`}
              </span>
            )}
          </div>
          {hasChanges ? (
            <>
              <Button variant="outline" size="sm" onClick={onSaveChanges}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => onStatusChange(weekId, "draft")}>
                <span className="hidden sm:inline">Revert to </span>Draft
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onStatusChange(weekId, "draft")}>
              <span className="hidden sm:inline">Revert to </span>Draft
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
              <FileText className="h-3 w-3" /> Draft
              {lastModified && (
                <span className="text-xs ml-1 hidden sm:inline">
                  {formatTimestamp(lastModified)}
                  {lastModifiedBy && lastModifiedBy !== currentUserId && ` by ${lastModifiedBy}`}
                </span>
              )}
            </Badge>
          </div>
          <Button variant="outline" onClick={() => onStatusChange(weekId, "draft")}>
            Save Draft
          </Button>
          <Button onClick={() => onStatusChange(weekId, "published")} className="flex items-center gap-1">
            {hasUnassignedLocations && <AlertTriangle className="h-4 w-4 text-amber-500" />}
            Publish
          </Button>
        </>
      )}
    </div>
  )
}
