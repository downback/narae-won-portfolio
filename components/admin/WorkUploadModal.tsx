"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type WorkUploadModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onFileSelect?: (file: File | null) => void
  onConfirm?: () => void
  confirmLabel?: string
  isConfirmDisabled?: boolean
  isSubmitting?: boolean
  errorMessage?: string
}

export default function WorkUploadModal({
  open,
  onOpenChange,
  title = "Update Content",
  description = "Upload a file.",
  onFileSelect,
  onConfirm,
  confirmLabel = "Confirm change",
  isConfirmDisabled = false,
  isSubmitting = false,
  errorMessage,
}: WorkUploadModalProps) {
  const [selectedFileName, setSelectedFileName] = useState("")

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedFileName("")
      onFileSelect?.(null)
    }

    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upload-file">File upload</Label>
            <Input
              id="upload-file"
              type="file"
              accept=".pdf"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                setSelectedFileName(file?.name ?? "")
                onFileSelect?.(file)
              }}
            />
            {selectedFileName ? (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedFileName}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {errorMessage ? (
            <p className="text-sm text-rose-600">{errorMessage}</p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            Dismiss
          </Button>
          <Button
            type="button"
            variant="highlight"
            onClick={onConfirm}
            disabled={isConfirmDisabled || isSubmitting}
          >
            {isSubmitting ? "Saving..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
