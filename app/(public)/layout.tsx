import type { ReactNode } from "react"
import SidebarNav from "@/components/SidebarNav"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarNav />
      <main className="w-full md:w-auto flex-1">
        <div className="px-4 md:pr-8 sm:px-0 py-6 md:py-0 ">
          {children}
        </div>
      </main>
    </div>
  )
}
