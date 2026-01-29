"use client"

import { useEffect, useState } from "react"
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

  /**
   * SAFARI-SAFE SCROLL LOCK
   * - Lock both html & body
   * - Prevent background scroll
   */
  useEffect(() => {
    if (!isMobileNavOpen) return

    const html = document.documentElement
    const body = document.body

    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow

    html.style.overflow = "hidden"
    body.style.overflow = "hidden"

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [isMobileNavOpen])

  const closeMobileNav = () => setIsMobileNavOpen(false)

  return (
    <div className="w-full md:hidden flex flex-col justify-between">
      {/* Header */}
      <header className="flex items-start pl-6 pt-8 pb-6">
        <Link
          className="text-base font-medium"
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
          className={cn("fixed right-3 top-5 z-50", isHomeRoute && "invisible")}
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </Button>
      </header>

      {/* Mobile Nav Overlay */}
      {isNavVisible && (
        <aside
          className={cn(
            "fixed inset-0 z-50 md:hidden",
            "h-dvh w-full bg-white",
            "flex flex-col",
            "overflow-hidden", // IMPORTANT: overlay does NOT scroll
          )}
        >
          {/* Overlay Header */}
          <div className="flex items-start justify-between pl-6 pt-8 pb-6 shrink-0">
            <div className="text-base font-medium">NARAE WON</div>
            <Button
              variant="default"
              size="icon"
              aria-label="Close menu"
              onClick={closeMobileNav}
              className={cn(
                "fixed right-3 top-5 z-50",
                isHomeRoute && "invisible",
              )}
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          </div>

          {/* Scrollable Nav Content (ONLY SCROLL AREA) */}
          <div
            className={cn(
              "flex-1",
              "overflow-y-auto",
              "overscroll-contain", // prevents scroll chaining
              "px-8 pb-6",
            )}
          >
            <SidebarNavContent
              worksYears={worksYears}
              soloExhibitions={soloExhibitions}
              groupExhibitions={groupExhibitions}
              navLinks={navLinks}
              pathname={pathname}
              onNavigate={closeMobileNav}
            />
          </div>
        </aside>
      )}
    </div>
  )
}
