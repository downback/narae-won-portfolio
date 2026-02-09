"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

type PageConfig = {
  title: string
  description: string
  viewLink: string
}

const pageConfigs: Record<string, PageConfig> = {
  "/admin": {
    title: "Dashboard",
    description: "Welcome to the admin panel",
    viewLink: "/",
  },
  "/admin/works": {
    title: "Works",
    description: "Add, edit, or remove works from your works page",
    viewLink: "/works",
  },
  "/admin/exhibitions": {
    title: "Exhibitions",
    description: "Manage solo and group exhibitions",
    viewLink: "/",
  },
  "/admin/cv": {
    title: "CV",
    description: "Add, edit, or remove your CV detail",
    viewLink: "/cv",
  },
  "/admin/text": {
    title: "Text",
    description: "Create and edit text entries for the public texts page",
    viewLink: "/texts",
  },
}

export default function AdminPageHeader() {
  const pathname = usePathname()
  const config = pageConfigs[pathname] || pageConfigs["/admin"]

  return (
    <div className="flex items-end justify-between gap-4 pb-6 border-b border-border h-20">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{config.title}</h1>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>
      <Link href={config.viewLink} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View Site
        </Button>
      </Link>
    </div>
  )
}
