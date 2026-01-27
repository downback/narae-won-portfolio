"use client"

import { useEffect, useRef, useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type WorkFormValues = {
  imageFile: File | null
  year: string
  title: string
  caption: string
}

type WorkUploadModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onSave?: (values: WorkFormValues) => void
  yearOptions?: string[]
  isYearSelectDisabled?: boolean
  initialValues?: {
    imageUrl?: string
    year?: string
    title?: string
    caption?: string
  }
  isEditMode?: boolean
  confirmLabel?: string
  isConfirmDisabled?: boolean
  isSubmitting?: boolean
  errorMessage?: string
}

export default function WorkUploadModal({
  open,
  onOpenChange,
  title = "Update Content",
  description = "Upload a work image and add metadata.",
  onSave,
  yearOptions = [],
  isYearSelectDisabled = false,
  initialValues,
  isEditMode = false,
  confirmLabel = "Confirm change",
  isConfirmDisabled = false,
  isSubmitting = false,
  errorMessage,
}: WorkUploadModalProps) {
  const [selectedImageName, setSelectedImageName] = useState("")
  const [imagePreviewUrl, setImagePreviewUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [initialImageUrl, setInitialImageUrl] = useState(
    initialValues?.imageUrl ?? "",
  )
  const [year, setYear] = useState(initialValues?.year ?? "")
  const [titleValue, setTitleValue] = useState(initialValues?.title ?? "")
  const [caption, setCaption] = useState(initialValues?.caption ?? "")
  const wasSubmittingRef = useRef(false)

  const handleImageDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      setSelectedImageName(file.name)
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  useEffect(() => {
    let resetTimeout: ReturnType<typeof setTimeout> | undefined
    if (!open) {
      wasSubmittingRef.current = false
      return
    }

    if (wasSubmittingRef.current && !isSubmitting && !errorMessage) {
      resetTimeout = setTimeout(() => {
        setSelectedImageName("")
        setImagePreviewUrl("")
        setImageFile(null)
        setInitialImageUrl("")
        setCaption("")
      }, 0)
    }

    wasSubmittingRef.current = isSubmitting
    return () => {
      if (resetTimeout) clearTimeout(resetTimeout)
    }
  }, [open, isSubmitting, errorMessage])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedImageName("")
      setImagePreviewUrl("")
      setImageFile(null)
      setInitialImageUrl("")
      setYear("")
        setTitleValue("")
      setCaption("")
    } else {
      setSelectedImageName("")
      setImageFile(null)
      setImagePreviewUrl("")
      setYear(initialValues?.year ?? "")
        setTitleValue(initialValues?.title ?? "")
      setCaption(initialValues?.caption ?? "")
      setInitialImageUrl(initialValues?.imageUrl ?? "")
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
            <Label htmlFor="upload-image">
              Image upload{isEditMode ? " (optional)" : ""}
            </Label>
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
                  setImageFile(file)
                  setImagePreviewUrl(URL.createObjectURL(file))
                }
              }}
            />
            {imagePreviewUrl || initialImageUrl ? (
              <div className="overflow-hidden rounded-md border border-border">
                <Image
                  src={imagePreviewUrl || initialImageUrl}
                  alt="Selected preview"
                  width={800}
                  height={400}
                  className="h-48 w-full object-cover"
                  unoptimized
                />
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-year">Year</Label>
            <Select
              value={year || undefined}
              onValueChange={setYear}
              disabled={isYearSelectDisabled}
            >
              <SelectTrigger id="work-year" disabled={isYearSelectDisabled}>
                <SelectValue
                  placeholder={
                    isYearSelectDisabled
                      ? year
                        ? `Selected year: ${year}`
                        : "Year category not available"
                      : "Select year"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-title">Title *</Label>
            <Input
              id="work-title"
              value={titleValue}
              onChange={(event) => setTitleValue(event.target.value)}
              placeholder="Work title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-caption">Caption *</Label>
            <Input
              id="work-caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Caption text"
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
            onClick={() => handleOpenChange(false)}
          >
            Dismiss
          </Button>
          <Button
            type="button"
            variant="highlight"
            onClick={() =>
              onSave?.({
                imageFile,
                year,
                title: titleValue,
                caption,
              })
            }
            disabled={isConfirmDisabled || isSubmitting}
          >
            {isSubmitting ? "Saving..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
