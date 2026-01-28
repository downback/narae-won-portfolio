import type { ReactNode } from "react"
import SidebarNavDesktop from "@/components/public/shared/SidebarNavDesktop"
import SidebarNavMobile from "@/components/public/shared/SidebarNavMobile"
import { supabaseServer } from "@/lib/server"

const navLinks = [
  { href: "/works", label: "works" },
  { href: "/texts", label: "text" },
  { href: "/cv", label: "cv" },
]

const normalizeTitle = (value?: string | null) => (value ?? "").trim()
const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

export default async function PublicLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await supabaseServer()
  const [
    { data: worksRows, error: worksError },
    { data: soloRows, error: soloError },
    { data: groupRows, error: groupError },
  ] = await Promise.all([
    supabase
      .from("artworks")
      .select("year")
      .eq("category", "works")
      .not("year", "is", null)
      .order("year", { ascending: false }),
    supabase
      .from("artworks")
      .select("title")
      .eq("category", "solo-exhibitions")
      .not("title", "is", null)
      .order("title", { ascending: true }),
    supabase
      .from("artworks")
      .select("title")
      .eq("category", "group-exhibitions")
      .not("title", "is", null)
      .order("title", { ascending: true }),
  ])

  if (worksError || soloError || groupError) {
    console.error("Failed to load sidebar navigation data", {
      worksError,
      soloError,
      groupError,
    })
  }

  const worksYears = Array.from(
    new Set(
      (worksRows ?? [])
        .map((row) => (row.year ? String(row.year) : ""))
        .filter((year) => year.length > 0),
    ),
  )

  const buildExhibitions = (rows: { title?: string | null }[]) => {
    const seen = new Set<string>()
    return rows
      .map((row) => normalizeTitle(row.title))
      .filter((title) => title.length > 0)
      .filter((title) => {
        if (seen.has(title)) return false
        seen.add(title)
        return true
      })
      .map((title) => ({
        slug: toSlug(title),
        title,
      }))
  }

  const soloExhibitions = buildExhibitions(soloRows ?? [])
  const groupExhibitions = buildExhibitions(groupRows ?? [])
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex w-full flex-col md:sticky md:top-0 md:h-screen md:w-xs xl:w-sm md:shrink-0 md:overflow-y-auto">
        <SidebarNavDesktop
          worksYears={worksYears}
          soloExhibitions={soloExhibitions}
          groupExhibitions={groupExhibitions}
          navLinks={navLinks}
        />
        <SidebarNavMobile
          worksYears={worksYears}
          soloExhibitions={soloExhibitions}
          groupExhibitions={groupExhibitions}
          navLinks={navLinks}
        />
      </div>
      <main className="flex-auto md:w-auto">
        <div className="px-6 mb-32 sm:px-0 md:py-0 md:mt-28 md:pr-8">
          {children}
        </div>
      </main>
    </div>
  )
}
