import WorksPanel from "@/components/admin/works/WorksPanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminWorks() {
  return (
    <div className="space-y-6">
      <WorksPanel />

      <Card className="border-0 bg-muted shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>Upload a single image per work (jpg, png, or webp).</li>
            <li>Provide the year and caption for every work.</li>
            <li>Optional description can include medium or size.</li>
            <li>Keep images optimized for fast loading.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
