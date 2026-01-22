"use client"

import { useState } from "react"
import WorkUploadModal from "@/components/admin/WorkUploadModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AdminWorksPdfPanelProps = {
  lastUpdatedLabel?: string | null
}

export default function AdminWorksPdfPanel({
  lastUpdatedLabel,
}: AdminWorksPdfPanelProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentUpdatedLabel, setCurrentUpdatedLabel] = useState(
    lastUpdatedLabel ?? null
  )

  const handleConfirm = async () => {
    if (!selectedFile) {
      setErrorMessage("Select a PDF to upload.")
      return
    }

    setIsUploading(true)
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/admin/works-pdf", {
        method: "POST",
        body: formData,
      })

      const payload = (await response.json()) as {
        error?: string
        updatedAt?: string
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update works PDF.")
      }

      setSelectedFile(null)
      const nextLabel = payload.updatedAt
        ? new Date(payload.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })

      setCurrentUpdatedLabel(nextLabel)
      setIsUploadOpen(false)
    } catch (error) {
      console.error("Failed to update works PDF", { error })
      setErrorMessage("Unable to update the PDF. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Current Portfolio PDF</CardTitle>
        <Button
          type="button"
          variant="highlight"
          onClick={() => {
            setErrorMessage("")
            setIsUploadOpen(true)
          }}
        >
          <span className="hidden md:inline">Change PDF</span>
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
        title="Update portfolio PDF"
        description="Upload a new portfolio PDF file."
        onFileSelect={setSelectedFile}
        onConfirm={handleConfirm}
        confirmLabel="Save PDF"
        isConfirmDisabled={!selectedFile || isUploading}
        isSubmitting={isUploading}
        errorMessage={errorMessage}
      />
    </Card>
  )
}
