type GroupExhibitionPageProps = {
  params: { slug: string }
}

export default function GroupExhibitionPage({
  params,
}: GroupExhibitionPageProps) {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-lg font-medium">Group Exhibition</h1>
      <p className="text-sm text-muted-foreground">
        Exhibition: {params.slug}
      </p>
    </div>
  )
}
