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
import { Textarea } from "@/components/ui/textarea"

export type ExhibitionCategory = "solo-exhibitions" | "group-exhibitions"

export type ExhibitionFormValues = {
  mainImageFile: File | null
  category: ExhibitionCategory
  year: string
  exhibitionTitle: string
  caption: string
  description: string
  additionalImages: File[]
}

type ExhibitionUploadModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onSave?: (values: ExhibitionFormValues) => void
  initialValues?: {
    mainImageUrl?: string
    category?: ExhibitionCategory
    year?: string
    exhibitionTitle?: string
    caption?: string
    description?: string
  }
  isEditMode?: boolean
  confirmLabel?: string
  isConfirmDisabled?: boolean
  isSubmitting?: boolean
  errorMessage?: string
}

export default function ExhibitionUploadModal({
  open,
  onOpenChange,
  title = "Add exhibition",
  description = "Upload exhibition images and add metadata.",
  onSave,
  initialValues,
  isEditMode = false,
  confirmLabel = "Save exhibition",
  isConfirmDisabled = false,
  isSubmitting = false,
  errorMessage,
}: ExhibitionUploadModalProps) {
  const [selectedMainImageName, setSelectedMainImageName] = useState("")
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState("")
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [initialMainImageUrl, setInitialMainImageUrl] = useState("")
  const [category, setCategory] =
    useState<ExhibitionCategory>("solo-exhibitions")
  const [year, setYear] = useState("")
  const [exhibitionTitle, setExhibitionTitle] = useState("")
  const [caption, setCaption] = useState("")
  const [details, setDetails] = useState("")
  const [additionalImages, setAdditionalImages] = useState<File[]>([])

  const handleMainImageDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      setSelectedMainImageName(file.name)
      setMainImageFile(file)
      setMainImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    return () => {
      if (mainImagePreviewUrl) {
        URL.revokeObjectURL(mainImagePreviewUrl)
      }
    }
  }, [mainImagePreviewUrl])

  useEffect(() => {
    if (!open) return
    const resetTimeout = setTimeout(() => {
      setSelectedMainImageName("")
      setMainImageFile(null)
      setMainImagePreviewUrl("")
      setCategory(initialValues?.category ?? "solo-exhibitions")
      setYear(initialValues?.year ?? "")
      setExhibitionTitle(initialValues?.exhibitionTitle ?? "")
      setCaption(initialValues?.caption ?? "")
      setDetails(initialValues?.description ?? "")
      setInitialMainImageUrl(initialValues?.mainImageUrl ?? "")
    }, 0)
    return () => clearTimeout(resetTimeout)
  }, [open, initialValues])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedMainImageName("")
      setMainImagePreviewUrl("")
      setMainImageFile(null)
      setInitialMainImageUrl("")
      setCategory("solo-exhibitions")
      setYear("")
      setExhibitionTitle("")
      setCaption("")
      setDetails("")
      setAdditionalImages([])
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
            <Label htmlFor="upload-main-image">
              Main image upload{isEditMode ? " (optional)" : ""}
            </Label>
            <label
              htmlFor="upload-main-image"
              className="flex min-h-[120px] w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
              onDrop={handleMainImageDrop}
              onDragOver={handleDragOver}
            >
              <span>
                Drop image or click to upload
                {selectedMainImageName ? (
                  <span className="mt-2 block text-xs text-muted-foreground">
                    Selected: {selectedMainImageName}
                  </span>
                ) : null}
              </span>
            </label>
            <Input
              id="upload-main-image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  setSelectedMainImageName(file.name)
                  setMainImageFile(file)
                  setMainImagePreviewUrl(URL.createObjectURL(file))
                }
              }}
            />
            {mainImagePreviewUrl || initialMainImageUrl ? (
              <div className="overflow-hidden rounded-md border border-border">
                <Image
                  src={mainImagePreviewUrl || initialMainImageUrl}
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
            <Label htmlFor="exhibition-year">Year *</Label>
            <Input
              id="exhibition-year"
              type="number"
              inputMode="numeric"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              placeholder="2025"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exhibition-title">Exhibition title *</Label>
            <Input
              id="exhibition-title"
              value={exhibitionTitle}
              onChange={(event) => setExhibitionTitle(event.target.value)}
              placeholder="Exhibition title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exhibition-caption">Description *</Label>
            <Input
              id="exhibition-caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Caption text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exhibition-description">Exhibition text</Label>
            <Textarea
              id="exhibition-description"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Optional description"
              className="min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upload-additional-images">Additional images</Label>
            <Input
              id="upload-additional-images"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                setAdditionalImages(files)
              }}
            />
            {additionalImages.length > 0 ? (
              <div className="space-y-1 text-xs text-muted-foreground">
                {additionalImages.map((file) => (
                  <p key={`${file.name}-${file.size}`}>{file.name}</p>
                ))}
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
            onClick={() =>
              onSave?.({
                mainImageFile,
                category,
                year,
                exhibitionTitle,
                caption,
                description: details,
                additionalImages,
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
