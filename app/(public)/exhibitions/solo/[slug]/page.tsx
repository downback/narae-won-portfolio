type SoloExhibitionPageProps = {
  params: { slug: string }
}

export default function SoloExhibitionPage({
  params,
}: SoloExhibitionPageProps) {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-lg font-medium">Solo Exhibition</h1>
      <p className="text-sm text-muted-foreground">
        Exhibition: {params.slug}
      </p>
    </div>
  )
}
