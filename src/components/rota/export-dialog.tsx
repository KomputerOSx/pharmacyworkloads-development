"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { FileDown } from "lucide-react"

export type ExportFormat = "csv" | "excel" | "pdf"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: ExportFormat, includeNotes: boolean, includeEmptyCells: boolean) => void
  isExporting: boolean
}

export function ExportDialog({ open, onOpenChange, onExport, isExporting }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("excel")
  const [includeNotes, setIncludeNotes] = useState(true)
  const [includeEmptyCells, setIncludeEmptyCells] = useState(false)

  const handleExport = () => {
    onExport(format, includeNotes, includeEmptyCells)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Rota</DialogTitle>
          <DialogDescription>Choose your preferred export format and options.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <RadioGroup
              id="export-format"
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="font-normal">
                  Excel (.xlsx) - Includes styling and formatting
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal">
                  CSV (.csv) - Simple text format, compatible with most applications
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="font-normal">
                  PDF (.pdf) - Print-ready document
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-notes"
                  checked={includeNotes}
                  onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
                />
                <Label htmlFor="include-notes" className="font-normal">
                  Include assignment notes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-empty"
                  checked={includeEmptyCells}
                  onCheckedChange={(checked) => setIncludeEmptyCells(checked as boolean)}
                />
                <Label htmlFor="include-empty" className="font-normal">
                  Include empty cells
                </Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="flex items-center gap-1">
            <FileDown className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
