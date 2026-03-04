"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePreviewUrlRegistry } from "@/components/admin/shared/hooks/usePreviewUrlRegistry"
import type { WorkFormValues } from "@/components/admin/works/WorkUploadModal"
import { siteAssetsBucketName } from "@/lib/constants"
import { supabaseBrowser } from "@/lib/client"

export type WorkPreviewItem = {
  id: string
  imageUrl: string
  title: string
  caption: string
  year: number | null
  yearCategory: string
  displayOrder: number
  createdAt: string
}

const getSortKey = (label: string) => Number(label.split("-")[0]) || 0

export const useWorksPanelData = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [previewItems, setPreviewItems] = useState<WorkPreviewItem[]>([])
  const [editingItem, setEditingItem] = useState<WorkPreviewItem | null>(null)
  const [manualYears, setManualYears] = useState<string[]>([])
  const [selectedYearCategory, setSelectedYearCategory] = useState<string>("")
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false)
  const { registerPreviewUrl, revokeRegisteredPreviewUrls } =
    usePreviewUrlRegistry()

  const supabase = useMemo(() => supabaseBrowser(), [])
  const bucketName = siteAssetsBucketName

  const loadPreviewItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("artworks")
      .select(
        "id, storage_path, title, caption, year, year_category, display_order, created_at",
      )
      .eq("category", "works")
      .order("display_order", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to load work previews", { error })
      return false
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
          title: item.title ?? "",
          caption: item.caption ?? "",
          year: item.year ?? null,
          yearCategory: item.year_category ?? "",
          displayOrder: item.display_order ?? 0,
          createdAt: item.created_at ?? new Date().toISOString(),
        }
      })
      .filter((item): item is WorkPreviewItem => Boolean(item))

    setPreviewItems(nextItems)
    return true
  }, [bucketName, supabase])

  useEffect(() => {
    void loadPreviewItems()
  }, [loadPreviewItems])

  const handleSave = useCallback(
    async (values: WorkFormValues) => {
      const isEditMode = Boolean(editingItem)
      if (!values.imageFile && !isEditMode) {
        setErrorMessage("Select an image to upload.")
        return
      }
      if (!values.title.trim()) {
        setErrorMessage("Title is required.")
        return
      }
      if (!values.caption.trim()) {
        setErrorMessage("Caption is required.")
        return
      }
      if (!selectedYearCategory) {
        setErrorMessage("Year category is required.")
        return
      }

      setIsUploading(true)
      setErrorMessage("")
      let shouldRevokePendingUrls = true

      try {
        const previewUrl = values.imageFile
          ? URL.createObjectURL(values.imageFile)
          : ""
        const formData = new FormData()
        if (values.imageFile) {
          formData.append("file", values.imageFile)
        }
        formData.append("year_category", selectedYearCategory)
        formData.append("title", values.title)
        formData.append("caption", values.caption)

        const response = await fetch(
          isEditMode
            ? `/api/admin/works/${editingItem?.id}`
            : "/api/admin/works",
          {
            method: isEditMode ? "PATCH" : "POST",
            body: formData,
          },
        )

        if (!response.ok) {
          let nextErrorMessage = "Unable to save the work."

          if (response.status === 413) {
            nextErrorMessage =
              "File size is too large. Please reduce the image size and try again."
          } else if (response.status === 415) {
            nextErrorMessage =
              "Unsupported file format. Please use PNG or JPG images."
          } else if (response.status === 401) {
            nextErrorMessage = "Your session has expired. Please sign in again."
          } else if (response.status === 500) {
            nextErrorMessage = "Server error. Please try again later."
          } else if (response.status === 504) {
            nextErrorMessage =
              "Upload timeout. The file may be too large or your connection is slow."
          }

          try {
            const payload = (await response.json()) as { error?: string }
            if (payload.error) {
              nextErrorMessage = payload.error
            }
          } catch {
            // If JSON parsing fails, use the default error message
          }

          throw new Error(nextErrorMessage)
        }

        if (previewUrl) {
          registerPreviewUrl(previewUrl)
        }
        if (!isEditMode && previewUrl) {
          setPreviewItems((prev) => [
            {
              id: crypto.randomUUID(),
              imageUrl: previewUrl,
              title: values.title,
              caption: values.caption,
              year: null,
              yearCategory: selectedYearCategory,
              displayOrder: 0,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ])
        }
        const didReloadPreviewItems = await loadPreviewItems()
        shouldRevokePendingUrls = didReloadPreviewItems
        setIsUploadOpen(false)
        setEditingItem(null)
        setSelectedYearCategory("")
      } catch (error) {
        console.error("Failed to save work entry", { error })
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
          setErrorMessage("Unable to save the work entry. Please try again.")
        }
      } finally {
        if (shouldRevokePendingUrls) {
          revokeRegisteredPreviewUrls()
        }
        setIsUploading(false)
      }
    },
    [
      editingItem,
      loadPreviewItems,
      registerPreviewUrl,
      revokeRegisteredPreviewUrls,
      selectedYearCategory,
    ],
  )

  const modalInitialValues = useMemo(() => {
    if (editingItem) {
      return {
        imageUrl: editingItem.imageUrl,
        year: editingItem.yearCategory,
        title: editingItem.title,
        caption: editingItem.caption,
      }
    }
    if (selectedYearCategory) {
      return { year: selectedYearCategory }
    }
    return undefined
  }, [editingItem, selectedYearCategory])

  const yearOptions = useMemo(() => {
    const fromItems = previewItems
      .map((item) => item.yearCategory)
      .filter(Boolean)
    const merged = Array.from(new Set([...fromItems, ...manualYears]))
    return merged.sort((a, b) => getSortKey(b) - getSortKey(a))
  }, [manualYears, previewItems])

  const groupedByYear = useMemo(() => {
    const grouped = new Map<string, WorkPreviewItem[]>()
    yearOptions.forEach((cat) => grouped.set(cat, []))
    previewItems.forEach((item) => {
      const cat = item.yearCategory || "Unknown"
      if (!grouped.has(cat)) grouped.set(cat, [])
      grouped.get(cat)?.push(item)
    })
    grouped.forEach((items, cat) => {
      items.sort(
        (a, b) =>
          b.displayOrder - a.displayOrder ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      grouped.set(cat, items)
    })
    return grouped
  }, [previewItems, yearOptions])

  const handleAdd = useCallback((yearCategory: string) => {
    setErrorMessage("")
    setEditingItem(null)
    setSelectedYearCategory(yearCategory)
    setIsUploadOpen(true)
  }, [])

  const handleEdit = useCallback((item: WorkPreviewItem) => {
    setEditingItem(item)
    setSelectedYearCategory(item.yearCategory)
    setErrorMessage("")
    setIsUploadOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (item: WorkPreviewItem) => {
      try {
        const response = await fetch(`/api/admin/works/${item.id}`, {
          method: "DELETE",
        })
        const payload = (await response.json()) as { error?: string }
        if (!response.ok) {
          throw new Error(payload.error || "Unable to delete work.")
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await loadPreviewItems()
      } catch (error) {
        console.error("Failed to delete work", { error })
        setErrorMessage("Unable to delete the work entry. Please try again.")
      }
    },
    [loadPreviewItems],
  )

  const handleReorder = useCallback(
    async (yearLabel: string, orderedItems: WorkPreviewItem[]) => {
      const nextOrderMap = new Map(
        orderedItems.map((item, index) => [
          item.id,
          orderedItems.length - index,
        ]),
      )
      setPreviewItems((prev) =>
        prev.map((item) =>
          nextOrderMap.has(item.id)
            ? { ...item, displayOrder: nextOrderMap.get(item.id) ?? 0 }
            : item,
        ),
      )

      try {
        const response = await fetch("/api/admin/works/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            yearLabel,
            orderedWorkIds: orderedItems.map((item) => item.id),
          }),
        })
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string }
          throw new Error(payload.error || "Unable to reorder works.")
        }
      } catch (error) {
        console.error("Failed to persist works order", { error })
        setErrorMessage("Unable to save the work order. Please try again.")
        await loadPreviewItems()
      }
    },
    [loadPreviewItems],
  )

  const handleYearConfirm = useCallback((nextYear: string) => {
    setErrorMessage("")
    setManualYears((prev) =>
      prev.includes(nextYear) ? prev : [...prev, nextYear],
    )
  }, [])

  return {
    isUploadOpen,
    setIsUploadOpen,
    isUploading,
    errorMessage,
    yearOptions,
    groupedByYear,
    selectedYearCategory,
    editingItem,
    modalInitialValues,
    isYearDialogOpen,
    setIsYearDialogOpen,
    handleSave,
    handleAdd,
    handleEdit,
    handleDelete,
    handleReorder,
    handleYearConfirm,
  }
}
