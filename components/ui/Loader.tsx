type LoadingProps = {
  message?: string
  height?: string
}

export default function Loading({
  message = "Loading...",
  height = "h-[75vh] md:h-[80vh]",
}: LoadingProps) {
  return (
    <div className={`flex ${height} items-center justify-center`}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
