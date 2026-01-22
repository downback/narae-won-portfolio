"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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

export default function SidebarNav() {
  const pathname = usePathname()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const closeMobileNav = () => setIsMobileNavOpen(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="px-8 py-8 text-base font-medium">
          <Link href="/">narae won</Link>
        </div>
        <nav className="flex flex-col gap-4 px-8 pb-6 text-base font-light">
          <div className="space-y-2">
            <Link
              className={cn(
                "inline-block transition-colors hover:text-red-500",
                pathname === "/works" && "text-red-500"
              )}
              href="/works"
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
              >
                {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="flex md:hidden items-center justify-between border-b border-border px-4 py-2 backdrop-blur-sm">
        <Link
          className="text-base font-normal"
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
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {/* Mobile Overlay and Nav */}
      {isMobileNavOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-1/2 bg-white border-l border-border text-right md:hidden">
            <div className="flex justify-end px-4 py-2">
              <Button
                variant="default"
                size="icon"
                aria-label="Close menu"
                onClick={closeMobileNav}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-4 items-end px-8 pb-6 text-base font-light mt-12">
              <Link
                className={cn(
                  "inline-block transition-colors hover:text-red-500",
                  pathname === "/" && "text-red-500"
                )}
                href="/"
                onClick={closeMobileNav}
              >
                home
              </Link>
              <div className="space-y-2 text-right">
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
                <div className="flex flex-col gap-1 text-sm">
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

              <div className="space-y-2 text-right">
                <span className="inline-block">exhibitions</span>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="space-y-1">
                    <span className="inline-block">solo exhibitions</span>
                    <div className="flex flex-col gap-1 text-xs">
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
                    <div className="flex flex-col gap-1 text-xs">
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
                .filter(
                  (link) =>
                    link.href !== "/works"
                )
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
        </>
      )}
    </>
  )
}
