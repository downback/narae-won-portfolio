import ExhibitionList from "@/components/public/ExhibitionList"
import DetailSubHeader from "@/components/public/shared/DetailSubHeader"

type SoloExhibitionPageProps = {
  params: Promise<{ slug: string }>
}

const formatSlug = (slug: string) => slug.replace(/-/g, " ")

export default async function SoloExhibitionPage({
  params,
}: SoloExhibitionPageProps) {
  const { slug } = await params
  return (
    <div className="space-y-4">
      <DetailSubHeader
        segments={[{ label: "solo exhibition", value: formatSlug(slug) }]}
      />
      {/* <h1 className="text-lg font-medium">Solo Exhibition</h1>
      <p className="text-sm text-muted-foreground">
        Exhibition: {formatSlug(slug)}
      </p> */}
      <div className="mr-8"></div>
      <ExhibitionList items={[]} />
    </div>
  )
}
