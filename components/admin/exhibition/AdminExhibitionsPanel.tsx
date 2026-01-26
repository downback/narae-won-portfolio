"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { GripVertical } from "lucide-react"
import ExhibitionUploadModal, {
  type ExhibitionCategory,
  type ExhibitionFormValues,
} from "@/components/admin/exhibition/ExhibitionUploadModal"
import ImageCaptionPreview from "@/components/admin/shared/ImageCaptionPreview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseBrowser } from "@/lib/client"

type ExhibitionPreviewItem = {
  id: string
  imageUrl: string
  caption: string
  category: ExhibitionCategory
  year: number | null
  description: string
  exhibitionTitle: string
  createdAt: string
}

const bucketName = "site-assets"

export default function AdminExhibitionsPanel() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [previewItems, setPreviewItems] = useState<ExhibitionPreviewItem[]>([])
  const [editingItem, setEditingItem] = useState<ExhibitionPreviewItem | null>(
    null
  )
  const [selectedCategory, setSelectedCategory] =
    useState<ExhibitionCategory>("solo-exhibitions")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dragCategory, setDragCategory] = useState<ExhibitionCategory | null>(
    null
  )
  const previewUrlsRef = useRef<string[]>([])
  const supabase = useMemo(() => supabaseBrowser(), [])

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const loadPreviewItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("artworks")
      .select(
        "id, storage_path, caption, category, year, description, exhibition_slug, created_at"
      )
      .in("category", ["solo-exhibitions", "group-exhibitions"])
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to load exhibition previews", { error })
      return
    }

    const nextItems = (data ?? [])
      .map((item) => {
        if (!item.storage_path) return null
        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(item.storage_path)
        if (!publicData?.publicUrl) return null
        return {
          id: item.id,
          imageUrl: publicData.publicUrl,
          caption: item.caption ?? "",
          category: item.category as ExhibitionCategory,
          year: item.year ?? null,
          description: item.description ?? "",
          exhibitionTitle: item.exhibition_slug ?? "",
          createdAt: item.created_at ?? new Date().toISOString(),
        }
      })
      .filter((item): item is ExhibitionPreviewItem => Boolean(item))

    setPreviewItems(nextItems)
  }, [supabase])

  useEffect(() => {
    void loadPreviewItems()
  }, [loadPreviewItems])

  const soloItems = useMemo(
    () => previewItems.filter((item) => item.category === "solo-exhibitions"),
    [previewItems]
  )
  const groupItems = useMemo(
    () => previewItems.filter((item) => item.category === "group-exhibitions"),
    [previewItems]
  )

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
    if (!values.exhibitionTitle.trim()) {
      setErrorMessage("Exhibition title is required.")
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
      if (previewUrl) {
        previewUrlsRef.current.push(previewUrl)
      }

      const formData = new FormData()
      if (values.mainImageFile) {
        formData.append("file", values.mainImageFile)
      }
      formData.append("category", values.category)
      formData.append("year", values.year)
      formData.append("exhibition_title", values.exhibitionTitle)
      formData.append("caption", values.caption)
      formData.append("description", values.description)

      const response = await fetch(
        isEditMode
          ? `/api/admin/exhibitions/${editingItem?.id}`
          : "/api/admin/exhibitions",
        {
          method: isEditMode ? "PATCH" : "POST",
          body: formData,
        }
      )

      const payload = (await response.json()) as {
        ok?: boolean
        createdAt?: string
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save the exhibition.")
      }

      if (!isEditMode && previewUrl) {
        setPreviewItems((prev) => [
          {
            id: crypto.randomUUID(),
            imageUrl: previewUrl,
            caption: values.caption,
            category: values.category,
            year: Number(values.year),
            description: values.description,
            exhibitionTitle: values.exhibitionTitle,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
      }

      await loadPreviewItems()
      setIsUploadOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Failed to save exhibition entry", { error })
      setErrorMessage("Unable to save the exhibition. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (item: ExhibitionPreviewItem) => {
    try {
      const response = await fetch(`/api/admin/exhibitions/${item.id}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete exhibition.")
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await loadPreviewItems()
    } catch (error) {
      console.error("Failed to delete exhibition", { error })
      setErrorMessage("Unable to delete the exhibition. Please try again.")
    }
  }

  const moveItem = (
    category: ExhibitionCategory,
    fromIndex: number,
    toIndex: number
  ) => {
    if (fromIndex === toIndex) return
    setPreviewItems((prevItems) => {
      const solo = prevItems.filter((item) => item.category === "solo-exhibitions")
      const group = prevItems.filter(
        (item) => item.category === "group-exhibitions"
      )
      const target = category === "solo-exhibitions" ? solo : group
      const nextTarget = [...target]
      const [moved] = nextTarget.splice(fromIndex, 1)
      nextTarget.splice(toIndex, 0, moved)
      return category === "solo-exhibitions"
        ? [...nextTarget, ...group]
        : [...solo, ...nextTarget]
    })
  }

  const renderCategorySection = (
    title: string,
    category: ExhibitionCategory,
    items: ExhibitionPreviewItem[]
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button
          type="button"
          variant="highlight"
          onClick={() => {
            setErrorMessage("")
            setEditingItem(null)
            setSelectedCategory(category)
            setIsUploadOpen(true)
          }}
        >
          <span className="hidden md:inline">Add</span>
          <span className="md:hidden">Add</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No exhibition previews yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 pb-2 ${
                  dragCategory === category && dragOverIndex === index
                    ? "bg-muted/40"
                    : ""
                }`}
                draggable
                onDragStart={() => {
                  setDraggedIndex(index)
                  setDragCategory(category)
                }}
                onDragOver={(event) => {
                  if (dragCategory && dragCategory !== category) return
                  event.preventDefault()
                  setDragOverIndex(index)
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={() => {
                  if (
                    draggedIndex !== null &&
                    (!dragCategory || dragCategory === category)
                  ) {
                    moveItem(category, draggedIndex, index)
                  }
                  setDraggedIndex(null)
                  setDragOverIndex(null)
                  setDragCategory(null)
                }}
              >
                <div className="flex items-center text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <ImageCaptionPreview
                    imageUrl={item.imageUrl}
                    caption={item.caption}
                    onEdit={() => {
                      setEditingItem(item)
                      setSelectedCategory(item.category)
                      setErrorMessage("")
                      setIsUploadOpen(true)
                    }}
                    onDelete={() => handleDelete(item)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {items.length > 0 ? (
          <p className="text-xs text-left text-muted-foreground">
            Drag rows to reorder
          </p>
        ) : null}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {renderCategorySection("Solo exhibitions", "solo-exhibitions", soloItems)}
      {renderCategorySection(
        "Group exhibitions",
        "group-exhibitions",
        groupItems
      )}
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
                year: editingItem.year ? String(editingItem.year) : "",
                exhibitionTitle: editingItem.exhibitionTitle,
                caption: editingItem.caption,
                description: editingItem.description,
              }
            : {
                category: selectedCategory,
              }
        }
        isEditMode={Boolean(editingItem)}
        confirmLabel={editingItem ? "Update exhibition" : "Save exhibition"}
        isConfirmDisabled={isUploading}
        isSubmitting={isUploading}
        errorMessage={errorMessage}
      />
    </div>
  )
}
