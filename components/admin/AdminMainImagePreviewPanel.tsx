"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import HeroUploadModal from "@/components/admin/HeroUploadModal"

type AdminMainImagePreviewPanelProps = {
  heroImageUrl?: string | null
  heroAnimationEnabled?: boolean | null
}

export default function AdminMainImagePreviewPanel({
  heroImageUrl,
  heroAnimationEnabled,
}: AdminMainImagePreviewPanelProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(heroImageUrl ?? "")
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(
    heroAnimationEnabled ?? true
  )

  const handleConfirm = async () => {
    if (!selectedImageFile) {
      setErrorMessage("Select an image to upload.")
      return
    }

    setIsUploading(true)
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("file", selectedImageFile)
      formData.append("animationEnabled", String(isAnimationEnabled))

      const response = await fetch("/api/admin/hero-image", {
        method: "POST",
        body: formData,
      })

      const payload = (await response.json()) as {
        publicUrl?: string
        error?: string
      }

      if (!response.ok) {
        setErrorMessage(payload.error || "Unable to update hero image.")
        return
      }

      if (payload.publicUrl) {
        setCurrentImageUrl(payload.publicUrl)
      }

      setSelectedImageFile(null)
      setIsUploadOpen(false)
    } catch (error) {
      console.error("Failed to update hero image", { error })
      setErrorMessage("Unable to update the hero image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Current Image on the Main Page</CardTitle>
        <Button
          type="button"
          variant="highlight"
          onClick={() => {
            setErrorMessage("")
            setIsUploadOpen(true)
          }}
        >
          <span className="hidden md:inline">Change image</span>
          <span className="md:hidden">Change</span>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3 max-w-5xl">
        <div className="space-y-3 md:col-span-2">
          <p className="text-sm font-medium text-muted-foreground">
            Desktop (5:3)
          </p>
          <div className="relative aspect-5/3 w-full overflow-hidden rounded-md border border-dashed border-border bg-muted/30">
            {currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt="Hero image preview for desktop"
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No hero image yet
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Mobile (9:16)
          </p>
          <div className="relative aspect-9/16 w-full overflow-hidden rounded-md border border-dashed border-border bg-muted/30 md:h-fit">
            {currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt="Hero image preview for mobile"
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No hero image yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <HeroUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        title="Update hero image"
        description="Upload a new hero image or update the supporting text."
        onImageSelect={setSelectedImageFile}
        animationEnabled={isAnimationEnabled}
        onAnimationToggle={setIsAnimationEnabled}
        onConfirm={handleConfirm}
        confirmLabel="Save image"
        isConfirmDisabled={!selectedImageFile || isUploading}
        isSubmitting={isUploading}
        errorMessage={errorMessage}
      />
    </Card>
  )
}
