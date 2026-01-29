"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  UserCircle,
  FileText,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib/client"
import { useToast } from "@/components/ui/use-toast"

const adminNavLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/works", label: "Works", icon: FolderOpen },
  { href: "/admin/exhibitions", label: "Exhibitions", icon: Calendar },
  { href: "/admin/cv", label: "CV", icon: UserCircle },
  { href: "/admin/text", label: "Text", icon: FileText },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])
  const { toast } = useToast()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const closeMobileNav = () => setIsMobileNavOpen(false)

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({ title: "Signed out", description: "You have been signed out." })
      router.push("/admin")
    } catch (error) {
      console.error("Sign out failed:", error)
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out.",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:flex h-svh min-h-svh md:w-64 md:flex-col md:border-r md:border-border">
        <div className="px-6 py-6 border-b border-border">
          <h1 className="text-xl font-semibold">admin</h1>
        </div>
        <nav className="flex-1 flex flex-col px-4 py-4">
          <div className="space-y-1">
            {adminNavLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-light rounded-md transition-colors",
                    pathname === link.href
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-secondary/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>
          <div className="mt-auto pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start px-3 text-sm font-light"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex md:hidden items-center justify-start md:justify-between border-b border-border bg-white px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={() => setIsMobileNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">admin</h1>
      </header>

      {/* Mobile Overlay and Sidebar */}
      {isMobileNavOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-border md:hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h1 className="text-lg font-semibold">admin</h1>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={closeMobileNav}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 flex flex-col px-4 py-4">
              <div className="space-y-1">
                {adminNavLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileNav}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-light rounded-md transition-colors",
                        pathname === link.href
                          ? "bg-secondary text-secondary-foreground"
                          : "hover:bg-secondary/50",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  )
                })}
              </div>
              <div className="mt-auto pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 text-sm font-light"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </Button>
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
