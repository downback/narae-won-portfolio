"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import SidebarNavContent from "@/components/public/shared/SidebarNavContent"

type ExhibitionItem = {
  title: string
  slug: string
}

type NavLink = {
  href: string
  label: string
}

type SidebarNavMobileProps = {
  worksYears: string[]
  soloExhibitions: ExhibitionItem[]
  groupExhibitions: ExhibitionItem[]
  navLinks: NavLink[]
}

export default function SidebarNavMobile({
  worksYears,
  soloExhibitions,
  groupExhibitions,
  navLinks,
}: SidebarNavMobileProps) {
  const pathname = usePathname()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const isHomeRoute = pathname === "/"
  const isNavVisible = isHomeRoute || isMobileNavOpen

  const closeMobileNav = () => setIsMobileNavOpen(false)

  return (
    <div className="w-full md:hidden flex flex-col justify-between">
      <header className=" md:w-full md:hidden flex items-start px-8 py-8">
        <Link
          className="text-base font-medium z-60"
          href="/"
          onClick={closeMobileNav}
        >
          NARAE WON
        </Link>
        <Button
          variant="default"
          size="icon"
          aria-label="Open menu"
          onClick={() => setIsMobileNavOpen(true)}
          className={cn(isHomeRoute ? "invisible" : "fixed right-4 top-4")}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {isNavVisible && (
        <aside className="fixed left-0 top-0 z-50 h-full w-full bg-white md:hidden min-h-screen flex flex-col justify-between">
          <div className="h-12">
            <Button
              variant="default"
              size="icon"
              aria-label="Close menu"
              onClick={closeMobileNav}
              className={cn(isHomeRoute ? "invisible" : "fixed right-4 top-4")}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarNavContent
            worksYears={worksYears}
            soloExhibitions={soloExhibitions}
            groupExhibitions={groupExhibitions}
            navLinks={navLinks}
            pathname={pathname}
            onNavigate={closeMobileNav}
            className="px-8 pb-6 mt-8 flex-auto"
          />
        </aside>
      )}
    </div>
  )
}
