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
  exhibitionId: string
  imageUrl: string
  exhibitionTitle: string
  caption: string
  category: ExhibitionCategory
  description: string
  exhibitionOrder: number
  imageOrder: number
  createdAt: string
}

const bucketName = "site-assets"

export default function AdminExhibitionsPanel() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [previewItems, setPreviewItems] = useState<ExhibitionPreviewItem[]>([])
  const [editingItem, setEditingItem] = useState<ExhibitionPreviewItem | null>(
    null,
  )
  const [editingAdditionalImages, setEditingAdditionalImages] = useState<
    { id: string; url: string }[]
  >([])
  const [resetSignal, setResetSignal] = useState(0)
  const [selectedCategory, setSelectedCategory] =
    useState<ExhibitionCategory>("solo-exhibitions")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dragCategory, setDragCategory] = useState<ExhibitionCategory | null>(
    null,
  )
  const previewUrlsRef = useRef<string[]>([])
  const supabase = useMemo(() => supabaseBrowser(), [])

  useEffect(() => {
    const previewUrls = previewUrlsRef.current
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const loadPreviewItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("exhibition_images")
      .select(
        "id, storage_path, caption, display_order, created_at, is_primary, exhibitions ( id, title, type, slug, display_order, description )",
      )

    if (error) {
      console.error("Failed to load exhibition previews", { error })
      return
    }

    const nextItems = (data ?? [])
      .filter((item) => item.is_primary)
      .map((item) => {
        if (!item.storage_path) return null
        const exhibition = Array.isArray(item.exhibitions)
          ? item.exhibitions[0]
          : item.exhibitions
        if (!exhibition) return null
        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(item.storage_path)
        if (!publicData?.publicUrl) return null
        return {
          id: item.id,
          exhibitionId: exhibition.id,
          imageUrl: publicData.publicUrl,
          caption: item.caption ?? "",
          category:
            exhibition.type === "solo"
              ? "solo-exhibitions"
              : "group-exhibitions",
          description: exhibition.description ?? "",
          exhibitionTitle: exhibition.title ?? "",
          exhibitionOrder: exhibition.display_order ?? 0,
          imageOrder: item.display_order ?? 0,
          createdAt: item.created_at ?? new Date().toISOString(),
        }
      })
      .filter((item): item is ExhibitionPreviewItem => Boolean(item))
      .sort(
        (a, b) =>
          a.exhibitionOrder - b.exhibitionOrder || a.imageOrder - b.imageOrder,
      )

    setPreviewItems(nextItems)
  }, [supabase])

  useEffect(() => {
    void loadPreviewItems()
  }, [loadPreviewItems])

  const soloItems = useMemo(
    () => previewItems.filter((item) => item.category === "solo-exhibitions"),
    [previewItems],
  )
  const groupItems = useMemo(
    () => previewItems.filter((item) => item.category === "group-exhibitions"),
    [previewItems],
  )

  const modalInitialValues = useMemo(() => {
    if (editingItem) {
      return {
        mainImageUrl: editingItem.imageUrl,
        category: editingItem.category,
        exhibitionTitle: editingItem.exhibitionTitle,
        caption: editingItem.caption,
        description: editingItem.description,
        additionalImages: editingAdditionalImages,
      }
    }
    return {
      category: selectedCategory,
      additionalImages: [],
    }
  }, [editingItem, editingAdditionalImages, selectedCategory])

  const handleSave = async (values: ExhibitionFormValues) => {
    const isEditMode = Boolean(editingItem)
    if (!values.mainImageFile && !isEditMode) {
      setErrorMessage("Select a main image to upload.")
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
      if (
        isEditMode &&
        values.removedAdditionalImageIds &&
        values.removedAdditionalImageIds.length > 0
      ) {
        const deleteResults = await Promise.all(
          values.removedAdditionalImageIds.map((id) =>
            fetch(`/api/admin/exhibitions/${id}`, { method: "DELETE" }),
          ),
        )
        const failedDelete = deleteResults.find((response) => !response.ok)
        if (failedDelete) {
          const payload = (await failedDelete.json()) as { error?: string }
          throw new Error(payload.error || "Unable to delete image.")
        }
      }

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
      formData.append("exhibition_title", values.exhibitionTitle)
      formData.append("caption", values.caption)
      formData.append("description", values.description)
      values.additionalImages.forEach((file) => {
        formData.append("additional_images", file)
      })

      const response = await fetch(
        isEditMode
          ? `/api/admin/exhibitions/${editingItem?.id}`
          : "/api/admin/exhibitions",
        {
          method: isEditMode ? "PATCH" : "POST",
          body: formData,
        },
      )

      if (!response.ok) {
        let errorMessage = "Unable to save the exhibition."

        if (response.status === 413) {
          errorMessage =
            "File size is too large. Please reduce the image size and try again."
        } else if (response.status === 415) {
          errorMessage =
            "Unsupported file format. Please use PNG or JPG images."
        } else if (response.status === 401) {
          errorMessage = "Your session has expired. Please sign in again."
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later."
        } else if (response.status === 504) {
          errorMessage =
            "Upload timeout. The file may be too large or your connection is slow."
        }

        try {
          const payload = (await response.json()) as { error?: string }
          if (payload.error) {
            errorMessage = payload.error
          }
        } catch {
          // If JSON parsing fails, use the default error message
        }

        throw new Error(errorMessage)
      }

      if (!isEditMode && previewUrl) {
        setPreviewItems((prev) => [
          {
            id: crypto.randomUUID(),
            exhibitionId: editingItem?.exhibitionId ?? crypto.randomUUID(),
            imageUrl: previewUrl,
            caption: values.caption,
            category: values.category,
            description: values.description,
            exhibitionTitle: values.exhibitionTitle,
            exhibitionOrder: 0,
            imageOrder: 0,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
      }

      await loadPreviewItems()
      setIsUploadOpen(false)
      setEditingItem(null)
      setEditingAdditionalImages([])
      setResetSignal((prev) => prev + 1)
    } catch (error) {
      console.error("Failed to save exhibition entry", { error })
      if (error instanceof Error) {
        if (error.message.includes("fetch failed")) {
          setErrorMessage(
            "Network error. Please check your connection and try again.",
          )
        } else if (error.message.includes("timeout")) {
          setErrorMessage(
            "Request timeout. Please check your connection or try with a smaller file.",
          )
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage("Unable to save the exhibition. Please try again.")
      }
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

  const handleEdit = async (item: ExhibitionPreviewItem) => {
    setEditingItem(item)
    setSelectedCategory(item.category)
    setErrorMessage("")

    const { data, error } = await supabase
      .from("exhibition_images")
      .select("id, storage_path, is_primary, display_order")
      .eq("exhibition_id", item.exhibitionId)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Failed to load exhibition images", { error })
      setEditingAdditionalImages([])
      setIsUploadOpen(true)
      return
    }

    const additionalImages = (data ?? [])
      .filter((image) => !image.is_primary && image.storage_path)
      .map((image) => {
        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(image.storage_path)
        return {
          id: image.id,
          url: publicData?.publicUrl ?? "",
        }
      })
      .filter((image) => image.url.length > 0)

    setEditingAdditionalImages(additionalImages)
    setIsUploadOpen(true)
  }

  const moveItem = (
    category: ExhibitionCategory,
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) return
    const solo = previewItems.filter(
      (item) => item.category === "solo-exhibitions",
    )
    const group = previewItems.filter(
      (item) => item.category === "group-exhibitions",
    )
    const target = category === "solo-exhibitions" ? solo : group
    const nextTarget = [...target]
    const [moved] = nextTarget.splice(fromIndex, 1)
    nextTarget.splice(toIndex, 0, moved)
    const nextTargetWithOrder = nextTarget.map((item, index) => ({
      ...item,
      exhibitionOrder: index,
    }))
    const nextItems =
      category === "solo-exhibitions"
        ? [...nextTargetWithOrder, ...group]
        : [...solo, ...nextTargetWithOrder]
    setPreviewItems(nextItems)
    void persistReorder(category, nextTargetWithOrder)
  }

  const persistReorder = async (
    category: ExhibitionCategory,
    orderedItems: ExhibitionPreviewItem[],
  ) => {
    try {
      const response = await fetch("/api/admin/exhibitions/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          orderedExhibitionIds: orderedItems.map((item) => item.exhibitionId),
        }),
      })
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error || "Unable to reorder exhibitions.")
      }
    } catch (error) {
      console.error("Failed to persist exhibition order", { error })
      setErrorMessage("Unable to save the exhibition order. Please try again.")
      void loadPreviewItems()
    }
  }

  const renderCategorySection = (
    title: string,
    category: ExhibitionCategory,
    items: ExhibitionPreviewItem[],
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
            setEditingAdditionalImages([])
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
                    title={item.exhibitionTitle}
                    caption={item.caption}
                    onEdit={() => {
                      void handleEdit(item)
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
        groupItems,
      )}
      <ExhibitionUploadModal
        key={`exhibition-modal-${resetSignal}`}
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        title={
          editingItem
            ? `Edit ${editingItem.category === "solo-exhibitions" ? "solo" : "group"} exhibition`
            : `Add ${selectedCategory === "solo-exhibitions" ? "solo" : "group"} exhibition`
        }
        description={`${editingItem?.category === "solo-exhibitions" ? "개인" : "그룹"}전 이미지 및 세부정보를 업로드 및 수정 할 수 있습니다`}
        onSave={handleSave}
        initialValues={modalInitialValues}
        isEditMode={Boolean(editingItem)}
        confirmLabel={editingItem ? "Save updates" : "Save exhibition"}
        isConfirmDisabled={isUploading}
        isSubmitting={isUploading}
        errorMessage={errorMessage}
      />
    </div>
  )
}
