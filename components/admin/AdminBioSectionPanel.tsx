"use client"

import { useState } from "react"
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react"
import BioUploadModal from "@/components/admin/BioUploadModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type BioItem = {
  id?: string
  year: string
  title: string
  location: string
}

type AdminBioSectionPanelProps = {
  title: string
  items: BioItem[]
  kind: "solo" | "group"
}

export default function AdminBioSectionPanel({
  title,
  items,
  kind,
}: AdminBioSectionPanelProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [currentItems, setCurrentItems] = useState(items)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState({
    year: "",
    title: "",
    location: "",
  })

  const normalizeId = (value?: string | null) =>
    typeof value === "string" ? value.trim() : ""

  const hasValidId = (value?: string | null) => {
    const normalized = normalizeId(value)
    return normalized.length > 0 && normalized !== "undefined" && /^[0-9a-fA-F-]{36}$/.test(normalized)
  }

  const resetForm = () => {
    setFormValues({ year: "", title: "", location: "" })
    setEditingId(null)
    setErrorMessage("")
  }

  const openCreateModal = () => {
    resetForm()
    setIsUploadOpen(true)
  }

  const openEditModal = (item: BioItem) => {
    if (!hasValidId(item.id)) {
      setErrorMessage("This entry is missing an id. Refresh the page.")
      return
    }
    setFormValues({
      year: item.year,
      title: item.title,
      location: item.location,
    })
    setEditingId(normalizeId(item.id))
    setErrorMessage("")
    setIsUploadOpen(true)
  }

  const handleCreate = async () => {
    const parsedYear = Number(formValues.year)

    if (!Number.isInteger(parsedYear)) {
      setErrorMessage("Year must be a number.")
      return
    }

    if (parsedYear < 1900 || parsedYear > 2100) {
      setErrorMessage("Year must be between 1900 and 2100.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await fetch(`/api/admin/bio/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formValues.title,
          location: formValues.location,
          year: parsedYear,
        }),
      })

      const payload = (await response.json()) as {
        id?: string
        year?: number
        title?: string
        location?: string
        error?: string
      }

      if (!response.ok) {
        setErrorMessage(payload.error || "Unable to add bio entry.")
        return
      }

      if (!payload.id) {
        setErrorMessage("Unable to save entry. Missing id from server.")
        return
      }

      const nextYear = payload.year ?? parsedYear
      const nextTitle = payload.title ?? formValues.title
      const nextLocation = payload.location ?? formValues.location

      setCurrentItems((prevItems) => [
        {
          id: payload.id,
          year: String(nextYear),
          title: nextTitle,
          location: nextLocation,
        },
        ...prevItems,
      ])
      setIsUploadOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create bio entry", { error })
      setErrorMessage("Unable to add bio entry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!hasValidId(editingId)) {
      setErrorMessage("This entry is missing an id. Refresh the page.")
      return
    }
    console.log("Editing bio entry", { id: editingId, kind })
    const parsedYear = Number(formValues.year)

    if (!Number.isInteger(parsedYear)) {
      setErrorMessage("Year must be a number.")
      return
    }

    if (parsedYear < 1900 || parsedYear > 2100) {
      setErrorMessage("Year must be between 1900 and 2100.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const safeId = encodeURIComponent(normalizeId(editingId))
      const response = await fetch(`/api/admin/bio/${kind}/${safeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formValues.title,
          location: formValues.location,
          year: parsedYear,
        }),
      })

      const payload = (await response.json()) as {
        year?: number
        title?: string
        location?: string
        error?: string
      }

      if (!response.ok) {
        setErrorMessage(payload.error || "Unable to update bio entry.")
        return
      }

      setCurrentItems((prevItems) =>
        prevItems.map((item) =>
          item.id === editingId
            ? {
                ...item,
                year: String(payload.year ?? parsedYear),
                title: payload.title ?? formValues.title,
                location: payload.location ?? formValues.location,
              }
            : item
        )
      )
      setIsUploadOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to update bio entry", { error })
      setErrorMessage("Unable to update bio entry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (item: BioItem) => {
    if (!hasValidId(item.id)) {
      setErrorMessage("This entry is missing an id. Refresh the page.")
      return
    }
    console.log("Deleting bio entry", { id: item.id, kind })
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const safeId = encodeURIComponent(normalizeId(item.id))
      const response = await fetch(`/api/admin/bio/${kind}/${safeId}`, {
        method: "DELETE",
      })

      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        setErrorMessage(payload.error || "Unable to delete bio entry.")
        return
      }

      setCurrentItems((prevItems) =>
        prevItems.filter((entry) => entry.id !== item.id)
      )
    } catch (error) {
      console.error("Failed to delete bio entry", { error })
      setErrorMessage("Unable to delete bio entry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const persistOrder = async (nextItems: BioItem[]) => {
    const payload = nextItems
      .map((item, index) => ({ id: item.id, sort_order: index }))
      .filter((item) => item.id)

    if (payload.length === 0) return

    try {
      const response = await fetch(`/api/admin/bio/${kind}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setErrorMessage(result.error || "Unable to save order.")
      }
    } catch (error) {
      console.error("Failed to save bio order", { error })
      setErrorMessage("Unable to save order. Please try again.")
    }
  }

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    setCurrentItems((prevItems) => {
      const nextItems = [...prevItems]
      const [moved] = nextItems.splice(fromIndex, 1)
      nextItems.splice(toIndex, 0, moved)
      persistOrder(nextItems)
      return nextItems
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 ">
        
        {currentItems.map((item, index) => (
          <div
            key={item.id ?? `${item.year}-${item.title}-${item.location}-${index}`}
            className={`flex flex-row gap-3 border-b border-border pb-3 md:pb-4 last:border-b-0 first:border-t first:border-border first:pt-3 md:first:pt-4 last:pb-0 md:items-center justify-between ${
              dragOverIndex === index ? "bg-muted/40" : ""
            }`}
            draggable
            onDragStart={() => setDraggedIndex(index)}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOverIndex(index)
            }}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={() => {
              if (draggedIndex !== null) {
                moveItem(draggedIndex, index)
              }
              setDraggedIndex(null)
              setDragOverIndex(null)
            }}
          >
            <div className="flex flex-row gap-4 md:gap-6 items-center">
            <div className="flex items-center text-muted-foreground">
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="space-x-2 md:space-x-3">
              <span className="text-sm font-medium">{item.year}</span>
              <span className="text-sm">
                {item.title}, {item.location}
              </span>
            </div>
            </div>
            <div className="flex gap-0 md:gap-2 items-center">
              {hasValidId(item.id) ? null : (
                <span className="text-xs text-muted-foreground">
                  Missing id
                </span>
              )}
              <Button
                type="button"
                variant="default"
                size="icon"
                aria-label="Edit"
                className="shadow-none"
                onClick={() => openEditModal(item)}
                disabled={!hasValidId(item.id)}
              >
                <Pencil className="h-3 w-3 md:h-4 md:w-4 hover:text-zinc-400" />
              </Button>
              <Button
                type="button"
                variant="default"
                size="icon"
                aria-label="Delete"
                className="shadow-none"
                onClick={() => handleDelete(item)}
                disabled={!hasValidId(item.id)}
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-500 hover:text-red-300" />
              </Button>
            </div>
          </div>
        ))}
        <p className="text-xs text-right text-muted-foreground">
          Drag rows to reorder
        </p>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          aria-label={`Add new detail in ${title.replace(" Information", "")}`}
          onClick={openCreateModal}
        >
          <Plus className="h-4 w-4" />
          <span>Add new detail in {title.replace(" Information", "")}</span>
        </button>
        
      </CardContent>
      <BioUploadModal
        open={isUploadOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            resetForm()
          }
          setIsUploadOpen(nextOpen)
        }}
        title={
          editingId
            ? `Edit ${title.replace(" Information", "")} detail`
            : `Add ${title.replace(" Information", "")} detail`
        }
        description="Add or update biography text details."
        values={formValues}
        onValuesChange={setFormValues}
        onConfirm={editingId ? handleUpdate : handleCreate}
        confirmLabel={editingId ? "Save changes" : "Add detail"}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
      />
    </Card>
  )
}
