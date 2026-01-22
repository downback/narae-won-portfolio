type GroupExhibitionPageProps = {
  params: Promise<{ slug: string }>
}

export default async function GroupExhibitionPage({
  params,
}: GroupExhibitionPageProps) {
  const { slug } = await params
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-lg font-medium">Group Exhibition</h1>
      <p className="text-sm text-muted-foreground">
        Exhibition: {slug}
      </p>
    </div>
  )
}
