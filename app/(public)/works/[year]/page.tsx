import ArtworkList from "@/components/public/ArtworkList"
import DetailSubHeader from "@/components/public/shared/DetailSubHeader"
import { supabaseServer } from "@/lib/server"

type WorksByYearPageProps = {
  params: Promise<{ year: string }>
}

const bucketName = "site-assets"
const rangePattern = /^(\d{4})-(\d{4})$/

export default async function WorksByYearPage({
  params,
}: WorksByYearPageProps) {
  const { year } = await params
  const rangeMatch = year.match(rangePattern)
  const startYear = rangeMatch ? Number(rangeMatch[1]) : Number(year)
  const endYear = rangeMatch ? Number(rangeMatch[2]) : Number(year)
  const displayYear = year === "2018-2021" ? "2018 - 2021" : year

  const supabase = await supabaseServer()
  let query = supabase
    .from("artworks")
    .select(
      "id, storage_path, title, caption, description, year, display_order",
    )
    .eq("category", "works")
    .order("display_order", { ascending: true })

  if (!Number.isNaN(startYear) && !Number.isNaN(endYear)) {
    query = query.gte("year", startYear).lte("year", endYear)
  }

  const { data: rows, error } = await query

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
    <div className="space-y-4">
      <DetailSubHeader segments={[{ label: "work", value: displayYear }]} />
      {/* <h1 className="text-lg font-medium">Works from {year}</h1>
      <p className="text-sm text-muted-foreground">
        Filtered works by year will appear here.
      </p> */}
      <ArtworkList items={items} />
    </div>
  )
}
