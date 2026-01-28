import AdminExhibitionsPanel from "@/components/admin/exhibition/AdminExhibitionsPanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default function AdminExhibitions() {
  return (
    <div className="space-y-6">
      <AdminExhibitionsPanel />

      <Card className="border-0 bg-muted shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>Pick solo or group category for each entry.</li>
            <li>Use the exhibition year for ordering.</li>
            <li>Add location and a short description when available.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
