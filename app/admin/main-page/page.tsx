import AdminMainImagePreviewPanel from "@/components/admin/AdminMainImagePreviewPanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseServer } from "@/lib/server"

const bucketName = "site-assets"

type HeroMediaSettings = {
  url: string | null
  animationEnabled: boolean | null
}

const fetchHeroSettings = async (): Promise<HeroMediaSettings> => {
  try {
    const supabase = await supabaseServer()
    const { data: siteContent, error: siteContentError } = await supabase
      .from("site_content")
      .select("hero_asset_id, updated_at, hero_animation_enabled")
      .eq("singleton_id", true)
      .maybeSingle()

    if (siteContentError) {
      return { url: null, animationEnabled: null }
    }

    if (siteContent?.hero_asset_id) {
      const { data: asset, error: assetError } = await supabase
        .from("assets")
        .select("path")
        .eq("id", siteContent.hero_asset_id)
        .maybeSingle()

      if (assetError || !asset?.path) {
        return {
          url: null,
          animationEnabled: siteContent.hero_animation_enabled ?? null,
        }
      }

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(asset.path)

      const versionTag = siteContent.updated_at
        ? `?v=${encodeURIComponent(siteContent.updated_at)}`
        : ""

      return {
        url: data.publicUrl ? `${data.publicUrl}${versionTag}` : null,
        animationEnabled: siteContent.hero_animation_enabled ?? null,
      }
    }

    const { data: fallbackAsset, error: fallbackError } = await supabase
      .from("assets")
      .select("path, created_at")
      .eq("asset_kind", "hero_media")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fallbackError || !fallbackAsset?.path) {
      return { url: null, animationEnabled: null }
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fallbackAsset.path)

    const versionTag = fallbackAsset.created_at
      ? `?v=${encodeURIComponent(fallbackAsset.created_at)}`
      : ""

    return {
      url: data.publicUrl ? `${data.publicUrl}${versionTag}` : null,
      animationEnabled: null,
    }
  } catch (error) {
    console.error("Failed to load hero image", { error })
    return { url: null, animationEnabled: null }
  }
}

export default async function AdminMainPage() {
  const { url: heroImageUrl, animationEnabled: heroAnimationEnabled } =
    await fetchHeroSettings()

  return (
    <div className="space-y-6">
      <AdminMainImagePreviewPanel
        heroImageUrl={heroImageUrl}
        heroAnimationEnabled={heroAnimationEnabled}
      />

      <Card className="border-0 bg-muted shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Image Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Use high-resolution images for best quality (minimum 1920px wide).
            </li>
            <li>
              The image will be displayed in a 21:9 aspect ratio on desktop.
            </li>
            <li>On mobile, the image will be cropped to fit a 16:9 ratio.</li>
            <li>Avoid placing important elements at the edges.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
