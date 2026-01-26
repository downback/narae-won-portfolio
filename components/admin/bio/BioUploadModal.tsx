"use client"
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

type BioFormValues = {
  year: string
  description: string
}

type BioUploadModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  values: BioFormValues
  onValuesChange: (values: BioFormValues) => void
  onConfirm?: () => void
  confirmLabel?: string
  isConfirmDisabled?: boolean
  isSubmitting?: boolean
  errorMessage?: string
}

export default function BioUploadModal({
  open,
  onOpenChange,
  title = "Update Content",
  description = "Update text content.",
  values,
  onValuesChange,
  onConfirm,
  confirmLabel = "Confirm change",
  isConfirmDisabled = false,
  isSubmitting = false,
  errorMessage,
}: BioUploadModalProps) {
  const hasRequiredValues =
    values.year.trim().length > 0 && values.description.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upload-year">Year</Label>
            <Input
              id="upload-year"
              type="text"
              placeholder="Year (e.g., 2024)"
              value={values.year}
              onChange={(event) =>
                onValuesChange({
                  ...values,
                  year: event.target.value,
                })
              }
            />
            <Label htmlFor="upload-description">Description</Label>
            <Input
              id="upload-description"
              type="text"
              placeholder="Exhibition description"
              value={values.description}
              onChange={(event) =>
                onValuesChange({
                  ...values,
                  description: event.target.value,
                })
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {errorMessage ? (
            <p className="text-sm text-rose-600">{errorMessage}</p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Dismiss
          </Button>
          <Button
            type="button"
            variant="highlight"
            onClick={onConfirm}
            disabled={!hasRequiredValues || isConfirmDisabled || isSubmitting}
          >
            {isSubmitting ? "Saving..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
