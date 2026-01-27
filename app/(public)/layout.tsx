import type { ReactNode } from "react"
import SidebarNavDesktop from "@/components/public/shared/SidebarNavDesktop"
import SidebarNavMobile from "@/components/public/shared/SidebarNavMobile"

const worksYears = ["2026", "2025", "2024"]
const soloExhibitions = [
  { title: "solo exhibition title1", slug: "solo-exhibition-title1" },
  { title: "solo exhibition title2", slug: "solo-exhibition-title2" },
  { title: "solo exhibition title3", slug: "solo-exhibition-title3" },
]
const groupExhibitions = [
  { title: "group exhibition title1", slug: "group-exhibition-title1" },
  { title: "group exhibition title2", slug: "group-exhibition-title2" },
  {
    title: "group exhibition title3 group-exhibition-title3",
    slug: "group-exhibition-title3",
  },
]
const navLinks = [
  { href: "/works", label: "works" },
  { href: "/texts", label: "text" },
  { href: "/cv", label: "cv" },
]

export default function PublicLayout({ children }: { children: ReactNode }) {
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
        <div className="px-6 mb-24 sm:px-0 md:py-0 md:mt-28 md:pr-8">
          {children}
        </div>
      </main>
    </div>
  )
}
