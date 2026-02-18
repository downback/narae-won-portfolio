"use client"

import { useCallback, useEffect, useState } from "react"

const maxFileSizeBytes = Math.floor(1.5 * 1024 * 1024)

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const useExhibitionImagePreviews = () => {
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState("")
  const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState<string[]>(
    [],
  )

  const setMainPreviewFromFile = useCallback((file: File) => {
    setMainImagePreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl)
      }
      return URL.createObjectURL(file)
    })
  }, [])

  const appendAdditionalPreviews = useCallback((files: File[]) => {
    const nextPreviews = files.map((file) => URL.createObjectURL(file))
    setAdditionalPreviewUrls((previousUrls) => [...previousUrls, ...nextPreviews])
  }, [])

  const removeAdditionalPreviewAt = useCallback((indexToRemove: number) => {
    setAdditionalPreviewUrls((previousUrls) => {
      const nextUrls = previousUrls.filter((_, index) => index !== indexToRemove)
      const removedUrl = previousUrls[indexToRemove]
      if (removedUrl) {
        URL.revokeObjectURL(removedUrl)
      }
      return nextUrls
    })
  }, [])

  const clearPreviews = useCallback(() => {
    setMainImagePreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl)
      }
      return ""
    })
    setAdditionalPreviewUrls((previousUrls) => {
      previousUrls.forEach((url) => URL.revokeObjectURL(url))
      return []
    })
  }, [])

  useEffect(() => {
    return () => {
      clearPreviews()
    }
  }, [clearPreviews])

  return {
    maxFileSizeBytes,
    formatFileSize,
    mainImagePreviewUrl,
    additionalPreviewUrls,
    setMainPreviewFromFile,
    appendAdditionalPreviews,
    removeAdditionalPreviewAt,
    clearPreviews,
  }
}
