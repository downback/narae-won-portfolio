"use client"

import ImageCaptionPreview from "@/components/admin/shared/ImageCaptionPreview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type WorkPreviewItem = {
  id: string
  imageUrl: string
  caption: string
  year: number | null
  createdAt: string
}

type WorksYearSectionProps = {
  yearLabel: string
  items: WorkPreviewItem[]
  onAdd: () => void
  onEdit: (item: WorkPreviewItem) => void
  onDelete: (item: WorkPreviewItem) => void
}

export default function WorksYearSection({
  yearLabel,
  items,
  onAdd,
  onEdit,
  onDelete,
}: WorksYearSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{yearLabel}</CardTitle>
        <Button type="button" variant="highlight" onClick={onAdd}>
          <span className="hidden md:inline">Add</span>
          <span className="md:hidden">Add</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No work previews yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <ImageCaptionPreview
                key={item.id}
                imageUrl={item.imageUrl}
                caption={item.caption}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
