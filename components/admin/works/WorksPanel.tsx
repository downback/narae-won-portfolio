"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import WorkUploadModal, {
  type WorkFormValues,
} from "@/components/admin/works/WorkUploadModal"
import WorksYearSection from "@/components/admin/works/WorksYearSection"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib/client"

type WorkPreviewItem = {
  id: string
  imageUrl: string
  caption: string
  year: number | null
  description: string | null
  createdAt: string
}

export default function WorksPanel() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [previewItems, setPreviewItems] = useState<WorkPreviewItem[]>([])
  const [editingItem, setEditingItem] = useState<WorkPreviewItem | null>(null)
  const [manualYears, setManualYears] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const previewUrlsRef = useRef<string[]>([])
  const supabase = useMemo(() => supabaseBrowser(), [])
  const bucketName = "site-assets"

  useEffect(() => {
    const previewUrls = previewUrlsRef.current
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const loadPreviewItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("artworks")
      .select("id, storage_path, caption, year, description, created_at")
      .eq("category", "works")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to load work previews", { error })
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
          year: item.year ?? null,
          description: item.description ?? null,
          createdAt: item.created_at ?? new Date().toISOString(),
        }
      })
      .filter((item): item is WorkPreviewItem => Boolean(item))

    setPreviewItems(nextItems)
  }, [supabase])

  useEffect(() => {
    void loadPreviewItems()
  }, [loadPreviewItems])

  const handleSave = async (values: WorkFormValues) => {
    const isEditMode = Boolean(editingItem)
    if (!values.imageFile && !isEditMode) {
      setErrorMessage("Select an image to upload.")
      return
    }
    if (!values.caption.trim()) {
      setErrorMessage("Caption is required.")
      return
    }

    const resolvedYear =
      values.year.trim() ||
      (editingItem?.year ? String(editingItem.year) : "") ||
      selectedYear

    if (!resolvedYear) {
      setErrorMessage("Year is required.")
      return
    }

    setIsUploading(true)
    setErrorMessage("")

    try {
      const previewUrl = values.imageFile
        ? URL.createObjectURL(values.imageFile)
        : ""
      const formData = new FormData()
      if (values.imageFile) {
        formData.append("file", values.imageFile)
      }
      formData.append("year", resolvedYear)
      formData.append("caption", values.caption)
      formData.append("description", values.description)

      const response = await fetch(
        isEditMode ? `/api/admin/works/${editingItem?.id}` : "/api/admin/works",
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
        throw new Error(payload.error || "Unable to save the work.")
      }

      if (previewUrl) {
        previewUrlsRef.current.push(previewUrl)
      }
      if (!isEditMode && previewUrl) {
        setPreviewItems((prev) => [
          {
            id: crypto.randomUUID(),
            imageUrl: previewUrl,
            caption: values.caption,
            year: Number(resolvedYear),
            description: values.description,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
      }
      await loadPreviewItems()
      setIsUploadOpen(false)
      setEditingItem(null)
      setSelectedYear("")
    } catch (error) {
      console.error("Failed to save work entry", { error })
      setErrorMessage("Unable to save the work entry. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const initialValues = useMemo(() => {
    if (!editingItem) return undefined
    return {
      imageUrl: editingItem.imageUrl,
      year: editingItem.year ? String(editingItem.year) : "",
      caption: editingItem.caption,
      description: editingItem.description ?? "",
    }
  }, [editingItem])

  const yearOptions = useMemo(() => {
    const yearsFromItems = previewItems
      .map((item) => (item.year ? String(item.year) : null))
      .filter((value): value is string => Boolean(value))
    const merged = Array.from(new Set([...yearsFromItems, ...manualYears]))
    return merged.sort((a, b) => Number(b) - Number(a))
  }, [previewItems, manualYears])

  const groupedByYear = useMemo(() => {
    const grouped = new Map<string, WorkPreviewItem[]>()
    yearOptions.forEach((year) => grouped.set(year, []))
    previewItems.forEach((item) => {
      const year = item.year ? String(item.year) : "Unknown"
      if (!grouped.has(year)) grouped.set(year, [])
      grouped.get(year)?.push(item)
    })
    grouped.forEach((items, year) => {
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      grouped.set(year, items)
    })
    return grouped
  }, [previewItems, yearOptions])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Works</h2>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const nextYear = window
              .prompt("Enter a year (e.g. 2027)")
              ?.trim()
            if (!nextYear) return
            if (!/^\d{4}$/.test(nextYear)) {
              setErrorMessage("Year must be a 4-digit number.")
              return
            }
            setManualYears((prev) =>
              prev.includes(nextYear) ? prev : [...prev, nextYear]
            )
          }}
        >
          Add year
        </Button>
      </div>
      {yearOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No works yet.</p>
      ) : (
        <div className="space-y-4">
          {Array.from(groupedByYear.entries()).map(([year, items]) => (
            <WorksYearSection
              key={year}
              yearLabel={year}
              items={items}
              onAdd={() => {
                setErrorMessage("")
                setEditingItem(null)
                setSelectedYear(year)
                setIsUploadOpen(true)
              }}
              onEdit={(item) => {
                setEditingItem(item)
                setSelectedYear(item.year ? String(item.year) : "")
                setErrorMessage("")
                setIsUploadOpen(true)
              }}
              onDelete={async (item) => {
                try {
                  const response = await fetch(`/api/admin/works/${item.id}`, {
                    method: "DELETE",
                  })
                  const payload = (await response.json()) as {
                    error?: string
                  }
                  if (!response.ok) {
                    throw new Error(payload.error || "Unable to delete work.")
                  }
                  await new Promise((resolve) => setTimeout(resolve, 1000))
                  await loadPreviewItems()
                } catch (error) {
                  console.error("Failed to delete work", { error })
                  setErrorMessage(
                    "Unable to delete the work entry. Please try again."
                  )
                }
              }}
            />
          ))}
        </div>
      )}
      <WorkUploadModal
        key={editingItem?.id ?? "new"}
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        title={editingItem ? "Edit work" : "Add work"}
        description="Upload a work image and provide the metadata."
        onSave={handleSave}
        initialValues={
          editingItem
            ? initialValues
            : selectedYear
              ? { year: selectedYear }
              : undefined
        }
        isEditMode={Boolean(editingItem)}
        confirmLabel={editingItem ? "Update work" : "Save work"}
        isConfirmDisabled={isUploading}
        isSubmitting={isUploading}
        errorMessage={errorMessage}
      />
    </div>
  )
}
