import ArtworkList from "@/components/public/ArtworkList"
import DetailSubHeader from "@/components/public/shared/DetailSubHeader"
import { siteAssetsBucketName } from "@/lib/constants"
import { supabaseServer } from "@/lib/server"

type WorksByYearPageProps = {
  params: Promise<{ year: string }>
}

const bucketName = siteAssetsBucketName

export default async function WorksByYearPage({
  params,
}: WorksByYearPageProps) {
  const { year } = await params

  const supabase = await supabaseServer()
  const { data: rows, error } = await supabase
    .from("artworks")
    .select("id, storage_path, title, caption, display_order")
    .eq("category", "works")
    .eq("year_category", year)
    .order("display_order", { ascending: false })

  if (error) {
    console.error("Failed to load works for year", { year, error })
  }

  const items =
    rows
      ?.map((row) => {
        if (!row.storage_path) return null
        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(row.storage_path)
        if (!publicData?.publicUrl) return null
        return {
          id: row.id,
          title: row.title ?? "Work title",
          caption: row.caption ?? "",
          imageSrc: publicData.publicUrl,
          imageAlt: row.title ?? row.caption ?? "Work image",
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? []

  return (
    <div className="flex flex-col min-h-[calc(100dvh-7rem)]">
      <div className="space-y-4">
        <DetailSubHeader segments={[{ label: "work", value: year }]} />
        <ArtworkList items={items} />
        <footer className="mb-12 md:mb-6 mt-60 md:mt-32">
          <div className="text-xs text-black/20 text-right">
            <p>© {new Date().getFullYear()} Narae Won. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
