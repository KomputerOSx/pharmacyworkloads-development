"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { User } from "./types/workload"
import { getFullName } from "./utils/workload-utils"

interface UserSelectorProps {
  allUsers: User[]
  selectedUserId: string | null
  customUser?: string
  onUserSelect: (userId: string | null, customUser?: string) => void
  onAddCustomUser: (name: string) => void
  popoverOpen: boolean
  onPopoverOpenChange: (open: boolean) => void
}

export function UserSelector({
  allUsers,
  selectedUserId,
  customUser,
  onUserSelect,
  onAddCustomUser,
  popoverOpen,
  onPopoverOpenChange,
}: UserSelectorProps) {
  const [newCustomUser, setNewCustomUser] = useState("")

  const getUserName = () => {
    if (customUser) return customUser
    if (!selectedUserId) return ""
    const user = allUsers.find((u) => u.id === selectedUserId)
    return user ? getFullName(user) : ""
  }

  const handleAddCustomUser = () => {
    if (newCustomUser.trim()) {
      onAddCustomUser(newCustomUser)
      onUserSelect(null, newCustomUser)
      setNewCustomUser("")
      onPopoverOpenChange(false)
    }
  }

  return (
    <Popover open={popoverOpen} onOpenChange={onPopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between text-left font-normal h-8 mb-1">
          {getUserName() || "Select user"}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>
              <div className="px-2 py-1.5 text-sm">
                No user found
                <div className="mt-2">
                  <Input
                    placeholder="Add custom user"
                    value={newCustomUser}
                    onChange={(e) => setNewCustomUser(e.target.value)}
                    className="h-8"
                  />
                  <Button className="w-full mt-1 h-8" size="sm" onClick={handleAddCustomUser}>
                    Add
                  </Button>
                </div>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Users">
              {allUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.firstName} ${user.lastName}`}
                  onSelect={() => {
                    onUserSelect(user.id)
                    onPopoverOpenChange(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUserId === user.id && !customUser ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div>
                    <div>{getFullName(user)}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.role} - {user.jobTitle}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Custom">
              <div className="px-2 py-1.5 text-sm">
                <Input
                  placeholder="Add custom user"
                  value={newCustomUser}
                  onChange={(e) => setNewCustomUser(e.target.value)}
                  className="h-8"
                />
                <Button className="w-full mt-1 h-8" size="sm" onClick={handleAddCustomUser}>
                  Add
                </Button>
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
