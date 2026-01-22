"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type ExhibitionItem = {
  title: string
  slug: string
}

type NavLink = {
  href: string
  label: string
}

type SidebarNavDesktopProps = {
  worksYears: string[]
  soloExhibitions: ExhibitionItem[]
  groupExhibitions: ExhibitionItem[]
  navLinks: NavLink[]
}

export default function SidebarNavDesktop({
  worksYears,
  soloExhibitions,
  groupExhibitions,
  navLinks,
}: SidebarNavDesktopProps) {
  const pathname = usePathname()

  return (
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
  )
}
