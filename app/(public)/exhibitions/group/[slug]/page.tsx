import DetailSubHeader from "@/components/public/shared/DetailSubHeader"

type GroupExhibitionPageProps = {
  params: Promise<{ slug: string }>
}

const formatSlug = (slug: string) => slug.replace(/-/g, " ")

export default async function GroupExhibitionPage({
  params,
}: GroupExhibitionPageProps) {
  const { slug } = await params
  return (
    <div className="space-y-4">
      <DetailSubHeader
        segments={[{ label: "group exhibition", value: formatSlug(slug) }]}
      />
      <h1 className="text-lg font-medium">Group Exhibition</h1>
      <p className="text-sm text-muted-foreground">
        Exhibition: {formatSlug(slug)}
      </p>
    </div>
  )
}
