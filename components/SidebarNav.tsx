"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/works", label: "works" },
  { href: "/biography", label: "biography" },
  { href: "/contact", label: "contact" },
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
          <Link href="/">denise maud</Link>
        </div>
        <nav className="flex flex-col gap-2 px-8 pb-6 text-base font-light">
          {navLinks.map((link) => (
            <Link key={link.href} className="inline-block" href={link.href}>
              <span
                className={cn(
                  "link-underline",
                  pathname === link.href && "link-underline-active"
                )}
              >
                {link.label}
              </span>
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
          denise maud
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
            <nav className="flex flex-col gap-2 items-end px-8 pb-6 text-base font-light mt-12">
              <Link className="inline-block" href="/" onClick={closeMobileNav}>
                <span
                  className={cn(
                    "link-underline",
                    pathname === "/" && "link-underline-active"
                  )}
                >
                  home
                </span>
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  className="inline-block"
                  href={link.href}
                  onClick={closeMobileNav}
                >
                  <span
                    className={cn(
                      "link-underline",
                      pathname === link.href && "link-underline-active"
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
