import AdminBioSectionPanel from "@/components/admin/bio/AdminBioSectionPanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminBiography() {
  return (
    <div className="space-y-6">
      <div className="">
        <AdminBioSectionPanel />
      </div>
      <Card className="border-0 bg-muted shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Biography Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Newest bio details appear at the top to keep recent updates
              visible first.
            </li>
            <li>
              All entries are displayed in time order to preserve the timeline.
            </li>
            <li>
              Keep descriptions consistent in tone and length for a clean list.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
