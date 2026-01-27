"use client"

import { useState } from "react"
import Image from "next/image"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import DeleteConfirmDialog from "@/components/admin/shared/DeleteConfirmDialog"

type ImageCaptionPreviewProps = {
  imageUrl: string
  title: string
  caption: string
  onEdit?: () => void
  onDelete?: () => Promise<void> | void
}

export default function ImageCaptionPreview({
  imageUrl,
  title,
  caption,
  onEdit,
  onDelete,
}: ImageCaptionPreviewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return
    try {
      const startTime = Date.now()
      setIsDialogOpen(true)
      setIsDeleting(true)
      await onDelete()
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < 1000) {
        await new Promise((resolve) => {
          setTimeout(resolve, 1000 - elapsedTime)
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Delete failed", { error })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-muted/20">
          <Image
            src={imageUrl}
            alt={caption}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {title}, {caption}
        </p>
      </div>
      <div className="flex gap-1 md:gap-2 items-center">
        <Button
          type="button"
          variant="default"
          size="icon"
          aria-label="Edit"
          className="shadow-none"
          onClick={onEdit}
          disabled={!onEdit}
        >
          <Pencil className="h-3 w-3 md:h-4 md:w-4 text-zinc-600 hover:text-zinc-400" />
        </Button>
        <DeleteConfirmDialog
          open={isDialogOpen}
          isDeleting={isDeleting}
          onOpenChange={(nextOpen) => {
            if (isDeleting) return
            setIsDialogOpen(nextOpen)
          }}
          onConfirm={handleDelete}
          disabled={!onDelete}
          trigger={
            <Button
              type="button"
              variant="default"
              size="icon"
              aria-label="Delete"
              className="shadow-none"
              disabled={!onDelete}
            >
              <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-500 hover:text-red-300" />
            </Button>
          }
        />
      </div>
    </div>
  )
}
