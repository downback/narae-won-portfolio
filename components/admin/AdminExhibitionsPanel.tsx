"use client"

import { useState } from "react"
import ExhibitionUploadModal, {
  type ExhibitionFormValues,
} from "@/components/admin/ExhibitionUploadModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AdminExhibitionsPanelProps = {
  lastUpdatedLabel?: string | null
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

  const handleSave = async (values: ExhibitionFormValues) => {
    if (!values.mainImageFile) {
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
      const nextLabel = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })

      setCurrentUpdatedLabel(nextLabel)
      setIsUploadOpen(false)
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
      </CardContent>
      <ExhibitionUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        title="Add exhibition"
        description="Upload exhibition images and provide the metadata."
        onSave={handleSave}
        confirmLabel="Save exhibition"
        isConfirmDisabled={isUploading}
        isSubmitting={isUploading}
        errorMessage={errorMessage}
      />
    </Card>
  )
}
