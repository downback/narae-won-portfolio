export default function Loader() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-border"></div>
        <div className="absolute inset-0 rounded-full border-2 border-foreground border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}
