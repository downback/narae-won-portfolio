"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import BioSectionCard, {
  type BioItem,
  type BioSectionConfig,
} from "@/components/admin/bio/BioSectionCard"
import { supabaseBrowser } from "@/lib/client"

const formatBioItems = (
  rows: {
    id: string
    year: number | string | null
    description: string | null
  }[],
) =>
  rows.map((row) => ({
    id: row.id,
    year: row.year !== null ? String(row.year) : "",
    description: row.description ?? "",
  }))

export default function AdminBioSectionPanel() {
  const [soloItems, setSoloItems] = useState<BioItem[]>([])
  const [groupItems, setGroupItems] = useState<BioItem[]>([])
  const [residencyItems, setResidencyItems] = useState<BioItem[]>([])
  const [awardsItems, setAwardsItems] = useState<BioItem[]>([])
  const [collectionsItems, setCollectionsItems] = useState<BioItem[]>([])
  const [educationItems, setEducationItems] = useState<BioItem[]>([])
  const supabase = useMemo(() => supabaseBrowser(), [])

  const loadBioItems = useCallback(async () => {
    const [
      { data: soloRows, error: soloError },
      { data: groupRows, error: groupError },
      { data: residencyRows, error: residencyError },
      { data: awardsRows, error: awardsError },
      { data: collectionsRows, error: collectionsError },
      { data: educationRows, error: educationError },
    ] = await Promise.all([
      supabase
        .from("bio_solo_exhibitions")
        .select("id, year, description, display_order")
        .order("display_order", { ascending: true })
        .order("year", { ascending: false }),
      supabase
        .from("bio_group_exhibitions")
        .select("id, year, description, display_order")
        .order("display_order", { ascending: true })
        .order("year", { ascending: false }),
      supabase
        .from("bio_residency")
        .select("id, year, description, display_order")
        .order("display_order", { ascending: true })
        .order("year", { ascending: false }),
      supabase
        .from("bio_awards")
        .select("id, year, description, display_order")
        .order("display_order", { ascending: true })
        .order("year", { ascending: false }),
      supabase
        .from("bio_collections")
        .select("id, year, description, display_order")
        .order("display_order", { ascending: true })
        .order("year", { ascending: false }),
      supabase
        .from("bio_education")
        .select("id, year, description, display_order")
        .order("display_order", { ascending: true }),
    ])

    if (soloError) {
      console.error("Failed to load solo shows", { error: soloError })
    }
    if (groupError) {
      console.error("Failed to load group shows", { error: groupError })
    }
    if (residencyError) {
      console.error("Failed to load residency", { error: residencyError })
    }
    if (awardsError) {
      console.error("Failed to load awards", { error: awardsError })
    }
    if (collectionsError) {
      console.error("Failed to load collections", { error: collectionsError })
    }
    if (educationError) {
      console.error("Failed to load education", { error: educationError })
    }

    setSoloItems(formatBioItems(soloRows ?? []))
    setGroupItems(formatBioItems(groupRows ?? []))
    setResidencyItems(formatBioItems(residencyRows ?? []))
    setAwardsItems(formatBioItems(awardsRows ?? []))
    setCollectionsItems(formatBioItems(collectionsRows ?? []))
    setEducationItems(formatBioItems(educationRows ?? []))
  }, [supabase])

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadBioItems()
    }, 0)
    return () => clearTimeout(loadTimeout)
  }, [loadBioItems])

  const sections = useMemo<BioSectionConfig[]>(
    () => [
      {
        title: "Education",
        items: educationItems,
        kind: "education",
      },
      {
        title: "Solo Shows ",
        items: soloItems,
        kind: "solo",
      },
      {
        title: "Group Shows ",
        items: groupItems,
        kind: "group",
      },
      {
        title: "Residency ",
        items: residencyItems,
        kind: "residency",
      },
      {
        title: "Awards & Selections",
        items: awardsItems,
        kind: "awards",
      },
      {
        title: "Collection",
        items: collectionsItems,
        kind: "collections",
      },
    ],
    [
      soloItems,
      groupItems,
      residencyItems,
      awardsItems,
      collectionsItems,
      educationItems,
    ],
  )

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <BioSectionCard
          key={section.kind}
          title={section.title}
          items={section.items}
          kind={section.kind}
        />
      ))}
    </div>
  )
}
