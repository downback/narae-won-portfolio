import type { ReactNode } from "react"
import SidebarNavDesktop from "@/components/SidebarNavDesktop"
import SidebarNavMobile from "@/components/SidebarNavMobile"

const worksYears = ["2026", "2025", "2024"]
const soloExhibitions = [
  { title: "solo exhibition title1", slug: "solo-exhibition-title1" },
  { title: "solo exhibition title2", slug: "solo-exhibition-title2" },
  { title: "solo exhibition title3", slug: "solo-exhibition-title3" },
]
const groupExhibitions = [
  { title: "group exhibition title1", slug: "group-exhibition-title1" },
  { title: "group exhibition title2", slug: "group-exhibition-title2" },
  { title: "group exhibition title3", slug: "group-exhibition-title3" },
]
const navLinks = [
  { href: "/works", label: "works" },
  { href: "/cv", label: "cv" },
  { href: "/texts", label: "text" },
]

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
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
      <main className="w-full md:w-auto flex-1">
        <div className="px-4 md:pr-8 sm:px-0 py-6 md:py-0 ">
          {children}
        </div>
      </main>
    </div>
  )
}
