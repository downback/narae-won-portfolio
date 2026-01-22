type WorksByYearPageProps = {
  params: Promise<{ year: string }>
}

export default async function WorksByYearPage({
  params,
}: WorksByYearPageProps) {
  const { year } = await params
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-lg font-medium">Works from {year}</h1>
      <p className="text-sm text-muted-foreground">
        Filtered works by year will appear here.
      </p>
    </div>
  )
}
