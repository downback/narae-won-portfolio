import Image from "next/image"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabaseServer } from "@/lib/server"

type PreviewCard = {
  title: "Main Page" | "Works" | "Biography"
  updatedAt: string
  previewTitle: string
  previewText: string
  adminLink: string
}

const bucketName = "site-assets"

const formatUpdatedAt = (value?: string | null) => {
  if (!value) return "Not updated"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

const getLatestTimestamp = (timestamps: (string | null | undefined)[]) => {
  const numericTimes = timestamps
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((value) => !Number.isNaN(value))

  if (numericTimes.length === 0) return null
  return new Date(Math.max(...numericTimes)).toISOString()
}

const fetchHeroPreviewUrl = async (supabase: Awaited<ReturnType<typeof supabaseServer>>) => {
  const { data: siteContent } = await supabase
    .from("site_content")
    .select("hero_asset_id, updated_at")
    .eq("singleton_id", true)
    .maybeSingle()

  if (siteContent?.hero_asset_id) {
    const { data: asset } = await supabase
      .from("assets")
      .select("path")
      .eq("id", siteContent.hero_asset_id)
      .maybeSingle()

    if (asset?.path) {
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(asset.path)
      const versionTag = siteContent.updated_at
        ? `?v=${encodeURIComponent(siteContent.updated_at)}`
        : ""
      return data.publicUrl ? `${data.publicUrl}${versionTag}` : null
    }
  }

  const { data: fallbackAsset } = await supabase
    .from("assets")
    .select("path, created_at")
    .eq("asset_kind", "hero_media")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!fallbackAsset?.path) return null

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fallbackAsset.path)
  const versionTag = fallbackAsset.created_at
    ? `?v=${encodeURIComponent(fallbackAsset.created_at)}`
    : ""
  return data.publicUrl ? `${data.publicUrl}${versionTag}` : null
}

export default async function AdminQuickPreviewPanel() {
  const supabase = await supabaseServer()

  const [
    siteContentResult,
    worksAssetResult,
    soloResult,
    groupResult,
    heroPreviewUrl,
  ] = await Promise.all([
    supabase
      .from("site_content")
      .select("updated_at")
      .eq("singleton_id", true)
      .maybeSingle(),
    supabase
      .from("assets")
      .select("created_at")
      .eq("asset_kind", "works_pdf")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("bio_solo_shows")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("bio_group_shows")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    fetchHeroPreviewUrl(supabase),
  ])

  const biographyUpdatedAt = getLatestTimestamp([
    soloResult.data?.updated_at,
    groupResult.data?.updated_at,
  ])

  const previewCards: PreviewCard[] = [
    {
      title: "Main Page",
      updatedAt: formatUpdatedAt(siteContentResult.data?.updated_at),
      previewTitle: "Latest hero image",
      previewText: "Hero image updated with floating sculpture visual.",
      adminLink: "/admin/main-page",
    },
    {
      title: "Works",
      updatedAt: formatUpdatedAt(worksAssetResult.data?.created_at),
      previewTitle: "",
      previewText: "",
      adminLink: "/admin/works",
    },
    {
      title: "Biography",
      updatedAt: formatUpdatedAt(biographyUpdatedAt),
      previewTitle: "Latest update",
      previewText: "Recent solo or group show update.",
      adminLink: "/admin/biography",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview & Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-3">
        {previewCards.map((card) => (
          <Card key={card.title} className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{card.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Last updated {card.updatedAt}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {card.title === "Main Page" ? (
                <div className="relative h-28 w-full overflow-hidden rounded-md border border-dashed border-border bg-muted/30">
                  {heroPreviewUrl ? (
                    <Image
                      src={heroPreviewUrl}
                      alt="Hero preview"
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 33vw, 100vw"
                      unoptimized
                    />
                  ) : null}
                </div>
              ) : null}
              {card.title !== "Works" ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">{card.previewTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {card.previewText}
                </p>
              </div>
              ) : null}
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" size="sm">
                <Link href={card.adminLink}>Manage</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
