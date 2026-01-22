"use client"

import { useMemo } from "react"
import Image from "next/image"
import useSWR from "swr"
import { supabaseBrowser } from "@/lib/client"
import Loading from "@/components/Loading"

type WorksItem = {
  id: string
  caption: string | null
  imageUrl: string | null
}

export default function Works() {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const bucketName = "site-assets"

  // Fetcher function for SWR
  const fetcher = async () => {
    const { data: worksItems, error: worksItemsError } = await supabase
      .from("works_items")
      .select("id, caption, image_path, created_at")
      .order("created_at", { ascending: false })

    if (worksItemsError) {
      return []
    }

    return (worksItems ?? []).map((item) => {
      const rawPath = item.image_path as string | null
      const versionTag = item.created_at
        ? `?v=${encodeURIComponent(item.created_at)}`
        : ""

      if (!rawPath) {
        return { id: item.id, caption: item.caption ?? null, imageUrl: null }
      }

      if (rawPath.startsWith("http")) {
        return {
          id: item.id,
          caption: item.caption ?? null,
          imageUrl: `${rawPath}${versionTag}`,
        }
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(rawPath)
      return {
        id: item.id,
        caption: item.caption ?? null,
        imageUrl: data?.publicUrl ? `${data.publicUrl}${versionTag}` : null,
      }
    })
  }

  // Use SWR with aggressive caching
  const { data: worksItems, isLoading } = useSWR<WorksItem[]>(
    "works-items",
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: false, // Don't refetch on reconnect
      dedupingInterval: 3600000, // Dedupe requests within 1 hour
      fallbackData: [],
    }
  )
  const resolvedWorksItems = worksItems ?? []

  return (
    <div className="space-y-6 md:space-y-4 translate-y-0 md:-translate-y-9 pt-6 md:pt-30">
      {isLoading ? (
        <Loading message="Loading works..." />
      ) : resolvedWorksItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {resolvedWorksItems.map((item) => (
            <figure key={item.id} className="space-y-2">
              <div className="relative w-full overflow-hidden rounded border border-border bg-muted/20 aspect-4/3">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.caption ?? "Work image"}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    Image unavailable
                  </div>
                )}
              </div>
              {item.caption ? (
                <figcaption className="text-sm text-muted-foreground">
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : (
        <div className="flex h-[45vh] items-center justify-center rounded border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
          No works available
        </div>
      )}
    </div>
  )
}
