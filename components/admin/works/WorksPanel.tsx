"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import WorkUploadModal, {
  type WorkFormValues,
} from "@/components/admin/works/WorkUploadModal"
import WorksYearSection from "@/components/admin/works/WorksYearSection"
import YearInputDialog from "@/components/admin/shared/YearInputDialog"
import { supabaseBrowser } from "@/lib/client"
import { Plus } from "lucide-react"

type WorkPreviewItem = {
  id: string
  imageUrl: string
  title: string
  caption: string
  year: number | null
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
  const [selectedYearCategory, setSelectedYearCategory] = useState<string>("")
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false)
  const previewUrlsRef = useRef<string[]>([])
  const supabase = useMemo(() => supabaseBrowser(), [])
  const bucketName = "site-assets"
  const rangeLabel = "2018-2021"
  const rangeStart = 2018
  const rangeEnd = 2021

  useEffect(() => {
    const previewUrls = previewUrlsRef.current
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const loadPreviewItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("artworks")
      .select("id, storage_path, title, caption, year, created_at")
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
          title: item.title ?? "",
          caption: item.caption ?? "",
          year: item.year ?? null,
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
    if (!values.title.trim()) {
      setErrorMessage("Title is required.")
      return
    }
    if (!values.caption.trim()) {
      setErrorMessage("Caption is required.")
      return
    }

    const isYearSelectEnabled = selectedYearCategory === rangeLabel
    let resolvedYear = ""

    if (isYearSelectEnabled) {
      resolvedYear = values.year.trim()
    } else {
      resolvedYear =
        values.year.trim() ||
        (editingItem?.year ? String(editingItem.year) : "") ||
        selectedYear
    }

    if (!resolvedYear) {
      setErrorMessage("Select year is required.")
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
      formData.append("title", values.title)
      formData.append("caption", values.caption)

      const response = await fetch(
        isEditMode ? `/api/admin/works/${editingItem?.id}` : "/api/admin/works",
        {
          method: isEditMode ? "PATCH" : "POST",
          body: formData,
        },
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
            title: values.title,
            caption: values.caption,
            year: Number(resolvedYear),
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
      title: editingItem.title,
      caption: editingItem.caption,
    }
  }, [editingItem])

  const yearOptions = useMemo(() => {
    const yearsFromItems = previewItems
      .map((item) => (item.year ? String(item.year) : null))
      .filter((value): value is string => Boolean(value))
    const filteredYears = yearsFromItems.filter((year) => {
      const numeric = Number(year)
      return Number.isNaN(numeric) || numeric < rangeStart || numeric > rangeEnd
    })
    const filteredManualYears = manualYears.filter((year) => {
      const numeric = Number(year)
      return Number.isNaN(numeric) || numeric < rangeStart || numeric > rangeEnd
    })
    const merged = Array.from(
      new Set([rangeLabel, ...filteredYears, ...filteredManualYears]),
    )
    const sortValue = (label: string) => {
      if (label === rangeLabel) return rangeEnd
      const numeric = Number(label)
      return Number.isNaN(numeric) ? Number.NEGATIVE_INFINITY : numeric
    }
    return merged.sort((a, b) => sortValue(b) - sortValue(a))
  }, [previewItems, manualYears, rangeLabel, rangeEnd, rangeStart])

  const groupedByYear = useMemo(() => {
    const grouped = new Map<string, WorkPreviewItem[]>()
    yearOptions.forEach((year) => grouped.set(year, []))
    previewItems.forEach((item) => {
      const numericYear = item.year ?? null
      if (numericYear && numericYear >= rangeStart && numericYear <= rangeEnd) {
        grouped.get(rangeLabel)?.push(item)
        return
      }
      const year = numericYear ? String(numericYear) : "Unknown"
      if (!grouped.has(year)) grouped.set(year, [])
      grouped.get(year)?.push(item)
    })
    grouped.forEach((items, year) => {
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      grouped.set(year, items)
    })
    return grouped
  }, [previewItems, yearOptions])

  return (
    <div className="space-y-4">
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
                setSelectedYear(year === rangeLabel ? String(rangeEnd) : year)
                setSelectedYearCategory(year)
                setIsUploadOpen(true)
              }}
              onEdit={(item) => {
                setEditingItem(item)
                const nextYear = item.year ? String(item.year) : ""
                const nextCategory =
                  item.year && item.year >= rangeStart && item.year <= rangeEnd
                    ? rangeLabel
                    : nextYear
                setSelectedYear(nextYear)
                setSelectedYearCategory(nextCategory)
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
                    "Unable to delete the work entry. Please try again.",
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
        description="작업 이미지와 캡션 텍스트를 업로드 및 수정할 수 있습니다"
        yearOptions={["2018", "2019", "2020", "2021"]}
        isYearSelectDisabled={selectedYearCategory !== rangeLabel}
        selectedYearCategory={selectedYearCategory}
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
      <YearInputDialog
        open={isYearDialogOpen}
        onOpenChange={setIsYearDialogOpen}
        onConfirm={(nextYear) => {
          setErrorMessage("")
          setManualYears((prev) =>
            prev.includes(nextYear) ? prev : [...prev, nextYear],
          )
        }}
        trigger={
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            aria-label="Add a new year category "
          >
            <Plus className="h-4 w-4" />
            <span>Add a new year category</span>
          </button>
        }
      />
    </div>
  )
}
