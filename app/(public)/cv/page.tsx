import BioSection from "@/components/BioSection"
import { supabaseServer } from "@/lib/server"

const formatBioItems = (
  rows: { title: string; location: string; year: number }[]
) =>
  rows.map((row) => ({
    year: String(row.year),
    description: `${row.title}, ${row.location}`,
  }))

const education = [
  {
    year: "2023",
    description: "MFA, Sculpture, Yale School of Art",
  },
  {
    year: "2020",
    description: "BFA, Fine Arts, Rhode Island School of Design",
  },
  {
    year: "2018",
    description: "Residency, Skowhegan School of Painting & Sculpture",
  },
]

export default async function Bio() {
  const supabase = await supabaseServer()
  const [{ data: soloRows }, { data: groupRows }] = await Promise.all([
    supabase
      .from("bio_solo_shows")
      .select("title, location, year")
      .order("sort_order", { ascending: true })
      .order("year", { ascending: false }),
    supabase
      .from("bio_group_shows")
      .select("title, location, year")
      .order("sort_order", { ascending: true })
      .order("year", { ascending: false }),
  ])

  const soloShows = formatBioItems(soloRows ?? [])
  const selectedGroupShows = formatBioItems(groupRows ?? [])

  return (
    <div className="space-y-10 font-light pt-6 md:pt-30">
      <BioSection title="solo shows" items={soloShows} />
      <BioSection title="selected group shows" items={selectedGroupShows} />
      <BioSection title="education" items={education} />
    </div>
  )
}
