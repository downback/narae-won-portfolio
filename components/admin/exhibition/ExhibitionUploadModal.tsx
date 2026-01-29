"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
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
  exhibitionTitle: string
  caption: string
  description: string
  additionalImages: File[]
  removedAdditionalImageIds?: string[]
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
    exhibitionTitle?: string
    caption?: string
    description?: string
    additionalImages?: { id: string; url: string }[]
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
  const [exhibitionTitle, setExhibitionTitle] = useState("")
  const [caption, setCaption] = useState("")
  const [details, setDetails] = useState("")
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<
    { id: string; url: string }[]
  >([])
  const [removedAdditionalImageIds, setRemovedAdditionalImageIds] = useState<
    string[]
  >([])
  const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState<string[]>(
    [],
  )

  const handleRemoveAdditionalImage = (indexToRemove: number) => {
    setAdditionalImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    )
    setAdditionalPreviewUrls((prev) => {
      const next = prev.filter((_, index) => index !== indexToRemove)
      const url = prev[indexToRemove]
      if (url) {
        URL.revokeObjectURL(url)
      }
      return next
    })
  }

  const handleRemoveExistingAdditionalImage = (id: string) => {
    setExistingAdditionalImages((prev) => prev.filter((item) => item.id !== id))
    setRemovedAdditionalImageIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    )
  }

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
      additionalPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [mainImagePreviewUrl, additionalPreviewUrls])

  useEffect(() => {
    if (!open) return
    const resetTimeout = setTimeout(() => {
      setSelectedMainImageName("")
      setMainImageFile(null)
      setMainImagePreviewUrl("")
      setCategory(initialValues?.category ?? "solo-exhibitions")
      setExhibitionTitle(initialValues?.exhibitionTitle ?? "")
      setCaption(initialValues?.caption ?? "")
      setDetails(initialValues?.description ?? "")
      setInitialMainImageUrl(initialValues?.mainImageUrl ?? "")
      setExistingAdditionalImages(initialValues?.additionalImages ?? [])
      setRemovedAdditionalImageIds([])
      setAdditionalImages([])
      setAdditionalPreviewUrls([])
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
      setExhibitionTitle("")
      setCaption("")
      setDetails("")
      setAdditionalImages([])
      setExistingAdditionalImages([])
      setRemovedAdditionalImageIds([])
      setAdditionalPreviewUrls([])
    }

    onOpenChange(nextOpen)
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4/5 md:max-w-lg rounded-md max-h-[70vh] md:max-h-[85vh] overflow-y-auto">
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
            <Label htmlFor="exhibition-title">Exhibition title *</Label>
            <Input
              id="exhibition-title"
              value={exhibitionTitle}
              onChange={(event) => setExhibitionTitle(event.target.value)}
              placeholder="Exhibition title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exhibition-caption">Caption *</Label>
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
                if (files.length === 0) return
                const existingKeys = new Set(
                  additionalImages.map(
                    (file) => `${file.name}-${file.size}-${file.lastModified}`,
                  ),
                )
                const newFiles = files.filter((file) => {
                  const key = `${file.name}-${file.size}-${file.lastModified}`
                  if (existingKeys.has(key)) return false
                  existingKeys.add(key)
                  return true
                })
                if (newFiles.length === 0) {
                  event.target.value = ""
                  return
                }
                const newPreviews = newFiles.map((file) =>
                  URL.createObjectURL(file),
                )
                setAdditionalImages((prev) => [...prev, ...newFiles])
                setAdditionalPreviewUrls((prev) => [...prev, ...newPreviews])
                event.target.value = ""
              }}
            />
            {existingAdditionalImages.length > 0 ||
            additionalPreviewUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {existingAdditionalImages.map((item, index) => (
                  <div
                    key={`${item.url}-existing-${index}`}
                    className="relative h-12 w-12 rounded-md border border-border"
                  >
                    <Image
                      src={item.url}
                      alt={`Additional image ${index + 1}`}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingAdditionalImage(item.id)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-white text-[10px] leading-none shadow text-red-400"
                      aria-label={`Remove additional image ${index + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {additionalPreviewUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative h-12 w-12 rounded-md border border-border"
                  >
                    <Image
                      src={url}
                      alt={`Additional preview ${index + 1}`}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalImage(index)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-white text-[10px] leading-none shadow text-red-400"
                      aria-label={`Remove additional image ${index + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
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
                exhibitionTitle,
                caption,
                description: details,
                additionalImages,
                removedAdditionalImageIds,
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
