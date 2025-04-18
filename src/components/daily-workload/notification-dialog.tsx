"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { User } from "./types/workload"
import { getFullName } from "./utils/workload-utils"

interface NotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allUsers: User[]
  onSendNotifications: (userIds: string[]) => void
}

export function NotificationDialog({ open, onOpenChange, allUsers, onSendNotifications }: NotificationDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Reset selected users when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedUsers([]) // All unselected by default
    }
  }, [open])

  const handleToggleUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId])
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId))
    }
  }

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(allUsers.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSend = () => {
    onSendNotifications(selectedUsers)
    onOpenChange(false)
  }

  const allSelected = selectedUsers.length === allUsers.length && allUsers.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Notifications</DialogTitle>
          <DialogDescription>Select users to notify about their schedule.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={(checked) => handleToggleAll(checked as boolean)}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select all users
            </label>
          </div>

          <div className="text-sm font-medium mb-2">Users:</div>
          <ScrollArea className="h-[200px] border rounded-md p-2">
            <div className="space-y-2">
              {allUsers.length > 0 ? (
                allUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleToggleUser(user.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`user-${user.id}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div>{getFullName(user)}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.role} - {user.jobTitle}
                      </div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No users are currently assigned to any location
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={selectedUsers.length === 0 || allUsers.length === 0}>
            Send Notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
