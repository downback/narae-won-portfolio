import AdminWorksPanel from "@/components/admin/AdminWorksPanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseServer } from "@/lib/server"

const formatUpdatedAt = (value?: string | null) => {
  if (!value) return null
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

export default async function AdminWorks() {
  let lastUpdatedLabel: string | null = null
  try {
    const supabase = await supabaseServer()
    const { data: siteContent, error: siteContentError } = await supabase
      .from("site_content")
      .select("works_pdf_asset_id")
      .eq("singleton_id", true)
      .maybeSingle()

    if (!siteContentError && siteContent?.works_pdf_asset_id) {
      const { data: asset } = await supabase
        .from("assets")
        .select("created_at")
        .eq("id", siteContent.works_pdf_asset_id)
        .maybeSingle()

      lastUpdatedLabel = formatUpdatedAt(asset?.created_at)
    } else {
      const { data: fallbackAsset } = await supabase
        .from("assets")
        .select("created_at")
        .eq("asset_kind", "works_pdf")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      lastUpdatedLabel = formatUpdatedAt(fallbackAsset?.created_at)
    }
  } catch (error) {
    console.error("Failed to load works PDF metadata", { error })
  }

  return (
    <div className="space-y-6">
      <AdminWorksPanel lastUpdatedLabel={lastUpdatedLabel} />

      <Card className="border-0 bg-muted shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>Upload a single image per work (jpg, png, or webp).</li>
            <li>Provide the year and caption for every work.</li>
            <li>Optional description can include medium or size.</li>
            <li>Keep images optimized for fast loading.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
