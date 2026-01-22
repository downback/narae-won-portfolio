"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
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

type HeroUploadModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onImageSelect?: (file: File | null) => void
  onConfirm?: () => void
  confirmLabel?: string
  isConfirmDisabled?: boolean
  isSubmitting?: boolean
  errorMessage?: string
}

export default function HeroUploadModal({
  open,
  onOpenChange,
  title = "Update Content",
  description = "Upload an image or update text content.",
  onImageSelect,
  onConfirm,
  confirmLabel = "Confirm change",
  isConfirmDisabled = false,
  isSubmitting = false,
  errorMessage,
}: HeroUploadModalProps) {
  const [selectedImageName, setSelectedImageName] = useState("")
  const [imagePreviewUrl, setImagePreviewUrl] = useState("")

  const handleImageDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      setSelectedImageName(file.name)
      setImagePreviewUrl(URL.createObjectURL(file))
      onImageSelect?.(file)
    }
  }

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedImageName("")
      setImagePreviewUrl("")
      onImageSelect?.(null)
    }

    onOpenChange(nextOpen)
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
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
            <Label htmlFor="upload-image">Image upload</Label>
            <label
              htmlFor="upload-image"
              className="flex min-h-[120px] w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
              onDrop={handleImageDrop}
              onDragOver={handleDragOver}
            >
              <span>
                Drop image or click to upload
                {selectedImageName ? (
                  <span className="mt-2 block text-xs text-muted-foreground">
                    Selected: {selectedImageName}
                  </span>
                ) : null}
              </span>
            </label>
            <Input
              id="upload-image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  setSelectedImageName(file.name)
                  setImagePreviewUrl(URL.createObjectURL(file))
                  onImageSelect?.(file)
                }
              }}
            />
            {imagePreviewUrl ? (
              <div className="overflow-hidden rounded-md border border-border">
                <Image
                  src={imagePreviewUrl}
                  alt="Selected preview"
                  width={800}
                  height={400}
                  className="h-48 w-full object-cover"
                  unoptimized
                />
              </div>
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
