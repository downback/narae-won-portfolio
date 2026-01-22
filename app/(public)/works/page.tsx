"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { supabaseBrowser } from "@/lib/client"
import Loading from "@/components/Loading"

export default function Works() {
  const supabase = useMemo(() => supabaseBrowser(), [])

  // Fetcher function for SWR
  const fetcher = async () => {
    const { data: siteContent, error: siteContentError } = await supabase
      .from("site_content")
      .select("works_pdf_asset_id, updated_at")
      .eq("singleton_id", true)
      .maybeSingle()

    if (siteContentError) {
      return null
    }

    if (siteContent?.works_pdf_asset_id) {
      const { data: asset, error: assetError } = await supabase
        .from("assets")
        .select("path")
        .eq("id", siteContent.works_pdf_asset_id)
        .maybeSingle()

      if (assetError || !asset?.path) {
        return null
      }

      const { data } = supabase.storage
        .from("site-assets")
        .getPublicUrl(asset.path)

      const versionTag = siteContent.updated_at
        ? `?v=${encodeURIComponent(siteContent.updated_at)}`
        : ""

      return data?.publicUrl ? `${data.publicUrl}${versionTag}` : null
    }

    const { data: fallbackAsset, error: fallbackError } = await supabase
      .from("assets")
      .select("path, created_at")
      .eq("asset_kind", "works_pdf")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fallbackError || !fallbackAsset?.path) {
      return null
    }

    const { data } = supabase.storage
      .from("site-assets")
      .getPublicUrl(fallbackAsset.path)

    const versionTag = fallbackAsset.created_at
      ? `?v=${encodeURIComponent(fallbackAsset.created_at)}`
      : ""

    return data?.publicUrl ? `${data.publicUrl}${versionTag}` : null
  }

  // Use SWR with aggressive caching
  const { data: pdfUrl, isLoading } = useSWR<string | null>(
    "portfolio-pdf",
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: false, // Don't refetch on reconnect
      dedupingInterval: 3600000, // Dedupe requests within 1 hour
      fallbackData: null,
    }
  )

  return (
    <div className="space-y-6 md:space-y-4 translate-y-0 md:-translate-y-9 pt-6 md:pt-30">
      <div className="space-y-2">
        <div className="flex flex-row justify-center md:justify-end">
          {pdfUrl ? (
            <a
              className="text-sm font-normal text-primary underline underline-offset-4"
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open portfolio PDF in new tab
            </a>
          ) : (
            <span className="text-sm font-normal text-muted-foreground">
              Portfolio PDF not available yet
            </span>
          )}
        </div>
        <p className="text-sm leading-none text-center text-muted-foreground block md:hidden">
          The portfolio is displayed in a PDF viewer, <br /> which can be opened
          in a new tab.
        </p>
      </div>

      {isLoading ? (
        <Loading message="Loading portfolio..." />
      ) : pdfUrl ? (
        <div className="h-[75vh] md:h-[80vh] overflow-hidden rounded border border-black">
          <iframe
            title="Portfolio PDF"
            src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
            className="h-full w-full"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex h-[45vh] items-center justify-center rounded border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
          No portfolio PDF available
        </div>
      )}
    </div>
  )
}
