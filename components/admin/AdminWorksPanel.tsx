"use client"

import { useState } from "react"
import WorkUploadModal, {
  type WorkFormValues,
} from "@/components/admin/WorkUploadModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AdminWorksPanelProps = {
  lastUpdatedLabel?: string | null
}

export default function AdminWorksPanel({
  lastUpdatedLabel,
}: AdminWorksPanelProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentUpdatedLabel, setCurrentUpdatedLabel] = useState(
    lastUpdatedLabel ?? null
  )

  const handleSave = async (values: WorkFormValues) => {
    if (!values.imageFile) {
      setErrorMessage("Select an image to upload.")
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
      console.error("Failed to save work entry", { error })
      setErrorMessage("Unable to save the work entry. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Works</CardTitle>
        <Button
          type="button"
          variant="highlight"
          onClick={() => {
            setErrorMessage("")
            setIsUploadOpen(true)
          }}
        >
          <span className="hidden md:inline">Change</span>
          <span className="md:hidden">Change</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          Last updated: {currentUpdatedLabel ? currentUpdatedLabel : "Not set"}
        </p>
      </CardContent>
      <WorkUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        title="Add work"
        description="Upload a work image and provide the metadata."
        onSave={handleSave}
        confirmLabel="Save work"
        isConfirmDisabled={isUploading}
        isSubmitting={isUploading}
        errorMessage={errorMessage}
      />
    </Card>
  )
}
