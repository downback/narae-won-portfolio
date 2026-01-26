import AdminBioSectionPanel from "@/components/admin/bio/AdminBioSectionPanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseServer } from "@/lib/server"

const formatBioItems = (
  rows: { id: string; title: string; location: string; year: number }[]
) =>
  rows.map((row) => ({
    id: row.id,
    year: String(row.year),
    title: row.title,
    location: row.location,
  }))

export default async function AdminBiography() {
  const supabase = await supabaseServer()
  const [{ data: soloRows }, { data: groupRows }] = await Promise.all([
    supabase
      .from("bio_solo_shows")
      .select("id, title, location, year")
      .order("sort_order", { ascending: true })
      .order("year", { ascending: false }),
    supabase
      .from("bio_group_shows")
      .select("id, title, location, year")
      .order("sort_order", { ascending: true })
      .order("year", { ascending: false }),
  ])

  const soloShows = formatBioItems(soloRows ?? [])
  const selectedGroupShows = formatBioItems(groupRows ?? [])

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminBioSectionPanel
          title="Solo Shows Information"
          items={soloShows}
          kind="solo"
        />
        <AdminBioSectionPanel
          title="Selected Group Shows Information"
          items={selectedGroupShows}
          kind="group"
        />
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
