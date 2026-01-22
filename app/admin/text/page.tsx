"use client"

import { useState } from "react"
import TextUploadModal, {
  type TextFormValues,
} from "@/components/admin/TextUploadModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TextEntry = TextFormValues & {
  id: string
  createdAt: string
}

const buildPreviewText = (entry: TextEntry) => {
  if (entry.body.trim().length <= 140) return entry.body
  return `${entry.body.slice(0, 140)}...`
}

export default function AdminTextPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [textEntries, setTextEntries] = useState<TextEntry[]>([])
  const [errorMessage, setErrorMessage] = useState("")

  const handleSave = (values: TextFormValues) => {
    const hasRequiredValues = values.title.trim() && values.body.trim()

    if (!hasRequiredValues) {
      setErrorMessage("Title and body are required.")
      return
    }

    setTextEntries((prev) => [
      {
        ...values,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setErrorMessage("")
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Texts</CardTitle>
          <Button
            type="button"
            variant="highlight"
            onClick={() => {
              setErrorMessage("")
              setIsModalOpen(true)
            }}
          >
            Add text
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {textEntries.length === 0 ? (
            <p>No text entries yet.</p>
          ) : (
            <div className="grid gap-4">
              {textEntries.map((entry) => (
                <div key={entry.id} className="rounded-md border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {entry.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.year ? entry.year : "Year not set"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {buildPreviewText(entry)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TextUploadModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        errorMessage={errorMessage}
      />
    </div>
  )
}