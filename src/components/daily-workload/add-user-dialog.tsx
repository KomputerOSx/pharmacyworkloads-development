"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { User } from "./types/workload"
import { getFullName } from "./utils/workload-utils"

interface AddUserDialogProps {
  availableUsers: User[]
  onAddUser: (userId: string) => void
}

export function AddUserDialog({ availableUsers, onAddUser }: AddUserDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter available users based on search query
  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-72">
            <div className="space-y-1">
              {filteredAvailableUsers.length > 0 ? (
                filteredAvailableUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    onClick={() => {
                      onAddUser(user.id)
                      setSearchQuery("")
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span>{getFullName(user)}</span>
                      <div className="text-xs text-muted-foreground">
                        <span>
                          {user.role} - {user.jobTitle}
                        </span>
                        {user.specialty && <span> ({user.specialty})</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {searchQuery ? "No matching users found" : "All users have been added"}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
