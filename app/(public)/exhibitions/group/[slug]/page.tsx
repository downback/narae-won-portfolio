import ExhibitionList from "@/components/public/ExhibitionList"
import DetailSubHeader from "@/components/public/shared/DetailSubHeader"
import { supabaseServer } from "@/lib/server"

type GroupExhibitionPageProps = {
  params: Promise<{ slug: string }>
}

const formatSlug = (slug: string) => slug.replace(/-/g, " ")
const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

const bucketName = "site-assets"

export default async function GroupExhibitionPage({
  params,
}: GroupExhibitionPageProps) {
  const { slug } = await params
  const supabase = await supabaseServer()
  const { data: rows, error } = await supabase
    .from("artworks")
    .select("id, storage_path, title, caption, description, display_order")
    .eq("category", "group-exhibitions")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Failed to load group exhibition", { slug, error })
  }

  const images =
    rows
      ?.filter((row) => (row.title ? toSlug(row.title) === slug : false))
      .map((row) => {
        if (!row.storage_path) return null
        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(row.storage_path)
        if (!publicData?.publicUrl) return null
        return {
          id: row.id,
          src: publicData.publicUrl,
          alt: row.title ?? row.caption ?? "Exhibition image",
          title: row.title ?? "",
          description: row.description ?? "",
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? []

  const mainImage = images[0]
  const detailImages = images.slice(1)
  const fallbackTitle = formatSlug(slug)
  const exhibitionTitle = mainImage?.title || fallbackTitle
  const exhibitionDescription =
    images.find((item) => item.description.length > 0)?.description ?? ""

  const items = mainImage
    ? [
        {
          id: `group-${slug}`,
          title: exhibitionTitle,
          description: exhibitionDescription,
          mainImageSrc: mainImage.src,
          mainImageAlt: mainImage.alt,
          detailImages: detailImages.map((image) => ({
            id: image.id,
            src: image.src,
            alt: image.alt,
          })),
        },
      ]
    : []
  return (
    <div className="space-y-4">
      <DetailSubHeader
        segments={[{ label: "group exhibition", value: formatSlug(slug) }]}
      />
      <ExhibitionList items={items} />
    </div>
  )
}
