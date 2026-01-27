import ExhibitionList from "@/components/public/ExhibitionList"
import DetailSubHeader from "@/components/public/shared/DetailSubHeader"

type GroupExhibitionPageProps = {
  params: Promise<{ slug: string }>
}

const formatSlug = (slug: string) => slug.replace(/-/g, " ")

const placeholderSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239CA3AF' font-family='Arial, sans-serif' font-size='32'%3EImage placeholder%3C/text%3E%3C/svg%3E"

const placeholderItems = [
  {
    id: "group-exhibition-1",
    title: "Group exhibition title",
    description: "Group exhibition description placeholder text.",
    mainImageSrc: placeholderSrc,
    mainImageAlt: "Group exhibition main image placeholder",
    detailImages: [
      {
        id: "group-exhibition-1-detail-1",
        src: placeholderSrc,
        alt: "Group exhibition detail image placeholder",
      },
      {
        id: "group-exhibition-1-detail-2",
        src: placeholderSrc,
        alt: "Group exhibition detail image placeholder",
      },
    ],
  },
]

export default async function GroupExhibitionPage({
  params,
}: GroupExhibitionPageProps) {
  const { slug } = await params
  return (
    <div className="space-y-4">
      <DetailSubHeader
        segments={[{ label: "group exhibition", value: formatSlug(slug) }]}
      />
      {/* <h1 className="text-lg font-medium">Group Exhibition</h1>
      <p className="text-sm text-muted-foreground">
        Exhibition: {formatSlug(slug)}
      </p> */}
      <ExhibitionList items={placeholderItems} />
    </div>
  )
}
