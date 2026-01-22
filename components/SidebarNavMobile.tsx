"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
    <>
      <header className="flex md:hidden items-center justify-between border-b border-border px-4 py-2">
        <Link
          className="text-base font-normal z-60"
          href="/"
          onClick={closeMobileNav}
        >
          narae won
        </Link>
        <Button
          variant="default"
          size="icon"
          aria-label="Open menu"
          onClick={() => setIsMobileNavOpen(true)}
          className={cn(isHomeRoute && "invisible")}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {isNavVisible && (
        <aside className="fixed left-0 top-0 z-50 h-full w-full bg-white border-b border-border md:hidden">
          <div className="flex justify-end px-4 py-2 border-b border-border">
              <Button
                variant="default"
                size="icon"
                aria-label="Close menu"
                onClick={closeMobileNav}
              className={cn(isHomeRoute && "invisible")}
              >
                <X className="h-5 w-5" />
              </Button>
          </div>
          <nav className="flex flex-col gap-4 px-8 pb-6 text-base font-light mt-8">
            
            <div className="space-y-2">
              <Link
                className={cn(
                  "inline-block transition-colors hover:text-red-500",
                  pathname === "/works" && "text-red-500"
                )}
                href="/works"
                onClick={closeMobileNav}
              >
                works
              </Link>
              <div className="flex flex-col gap-1 pl-3 text-sm">
                {worksYears.map((year) => (
                  <Link
                    key={year}
                    className={cn(
                      "inline-block transition-colors hover:text-red-500",
                      pathname === `/works/${year}` && "text-red-500"
                    )}
                    href={`/works/${year}`}
                    onClick={closeMobileNav}
                  >
                    {year}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block">exhibitions</span>
              <div className="flex flex-col gap-2 pl-3 text-sm">
                <div className="space-y-1">
                  <span className="inline-block">solo exhibitions</span>
                  <div className="flex flex-col gap-1 pl-3 text-xs">
                    {soloExhibitions.map((item) => (
                      <Link
                        key={item.slug}
                        className={cn(
                          "inline-block transition-colors hover:text-red-500",
                          pathname === `/exhibitions/solo/${item.slug}` &&
                            "text-red-500"
                        )}
                        href={`/exhibitions/solo/${item.slug}`}
                        onClick={closeMobileNav}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="inline-block">group exhibitions</span>
                  <div className="flex flex-col gap-1 pl-3 text-xs">
                    {groupExhibitions.map((item) => (
                      <Link
                        key={item.slug}
                        className={cn(
                          "inline-block transition-colors hover:text-red-500",
                          pathname === `/exhibitions/group/${item.slug}` &&
                            "text-red-500"
                        )}
                        href={`/exhibitions/group/${item.slug}`}
                        onClick={closeMobileNav}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {navLinks
              .filter((link) => link.href !== "/works")
              .map((link) => (
                <Link
                  key={link.href}
                  className={cn(
                    "inline-block transition-colors hover:text-red-500",
                    pathname === link.href && "text-red-500"
                  )}
                  href={link.href}
                  onClick={closeMobileNav}
                >
                  {link.label}
                </Link>
              ))}
          </nav>
        </aside>
      )}
    </>
  )
}
