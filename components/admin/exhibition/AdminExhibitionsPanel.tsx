"use client"

import { useEffect, useRef, useState } from "react"
import ExhibitionUploadModal, {
  type ExhibitionFormValues,
} from "@/components/admin/exhibition/ExhibitionUploadModal"
import ImageCaptionPreview from "@/components/admin/shared/ImageCaptionPreview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AdminExhibitionsPanelProps = {
  lastUpdatedLabel?: string | null
}

type ExhibitionPreviewItem = {
  id: string
  imageUrl: string
  caption: string
  category: "solo-exhibitions" | "group-exhibitions"
  year: string
  description: string
}

export default function AdminExhibitionsPanel({
  lastUpdatedLabel,
}: AdminExhibitionsPanelProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentUpdatedLabel, setCurrentUpdatedLabel] = useState(
    lastUpdatedLabel ?? null
  )
  const [previewItems, setPreviewItems] = useState<ExhibitionPreviewItem[]>([])
  const [editingItem, setEditingItem] = useState<ExhibitionPreviewItem | null>(
    null
  )
  const previewUrlsRef = useRef<string[]>([])

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const handleSave = async (values: ExhibitionFormValues) => {
    const isEditMode = Boolean(editingItem)
    if (!values.mainImageFile && !isEditMode) {
      setErrorMessage("Select a main image to upload.")
      return
    }
    if (!values.year.trim()) {
      setErrorMessage("Year is required.")
      return
    }
    if (!values.caption.trim()) {
      setErrorMessage("Caption is required.")
      return
    }

    setIsUploading(true)
    setErrorMessage("")

    try {
      const previewUrl = values.mainImageFile
        ? URL.createObjectURL(values.mainImageFile)
        : ""
      const nextLabel = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })

      if (previewUrl) {
        previewUrlsRef.current.push(previewUrl)
      }
      setPreviewItems((prev) => {
        if (!isEditMode || !editingItem) {
          return [
            {
              id: crypto.randomUUID(),
              imageUrl: previewUrl,
              caption: values.caption,
              category: values.category,
              year: values.year,
              description: values.description,
            },
            ...prev,
          ]
        }
        return prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                imageUrl: previewUrl || item.imageUrl,
                caption: values.caption,
                category: values.category,
                year: values.year,
                description: values.description,
              }
            : item
        )
      })
      setCurrentUpdatedLabel(nextLabel)
      setIsUploadOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Failed to save exhibition entry", { error })
      setErrorMessage("Unable to save the exhibition. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Exhibitions</CardTitle>
        <Button
          type="button"
          variant="highlight"
          onClick={() => {
            setErrorMessage("")
            setEditingItem(null)
            setIsUploadOpen(true)
          }}
        >
          <span className="hidden md:inline">Add exhibition</span>
          <span className="md:hidden">Add</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          Last updated: {currentUpdatedLabel ? currentUpdatedLabel : "Not set"}
        </p>
        {previewItems.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No exhibition previews yet.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {previewItems.map((item) => (
              <ImageCaptionPreview
                key={item.id}
                imageUrl={item.imageUrl}
                caption={item.caption}
                onEdit={() => {
                  setEditingItem(item)
                  setErrorMessage("")
                  setIsUploadOpen(true)
                }}
                onDelete={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 1000))
                  setPreviewItems((prev) =>
                    prev.filter((entry) => entry.id !== item.id)
                  )
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
      <ExhibitionUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        title={editingItem ? "Edit exhibition" : "Add exhibition"}
        description="Upload exhibition images and provide the metadata."
        onSave={handleSave}
        initialValues={
          editingItem
            ? {
                mainImageUrl: editingItem.imageUrl,
                category: editingItem.category,
                year: editingItem.year,
                caption: editingItem.caption,
                description: editingItem.description,
              }
            : undefined
        }
        isEditMode={Boolean(editingItem)}
        confirmLabel={editingItem ? "Update exhibition" : "Save exhibition"}
        isConfirmDisabled={isUploading}
        isSubmitting={isUploading}
        errorMessage={errorMessage}
      />
    </Card>
  )
}
