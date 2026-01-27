import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabaseServer } from "@/lib/server"

type PreviewCard = {
  title: "Works" | "Biography"
  updatedAt: string
  previewTitle: string
  previewText: string
  adminLink: string
}

const formatUpdatedAt = (value?: string | null) => {
  if (!value) return "Not updated"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

const getLatestTimestamp = (timestamps: (string | null | undefined)[]) => {
  const numericTimes = timestamps
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((value) => !Number.isNaN(value))

  if (numericTimes.length === 0) return null
  return new Date(Math.max(...numericTimes)).toISOString()
}

export default async function AdminQuickPreviewPanel() {
  const supabase = await supabaseServer()

  const [worksAssetResult, soloResult, groupResult] = await Promise.all([
    supabase
      .from("assets")
      .select("created_at")
      .eq("asset_kind", "works_pdf")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("bio_solo_exhibitions")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("bio_group_exhibitions")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const biographyUpdatedAt = getLatestTimestamp([
    soloResult.data?.updated_at,
    groupResult.data?.updated_at,
  ])

  const previewCards: PreviewCard[] = [
    {
      title: "Works",
      updatedAt: formatUpdatedAt(worksAssetResult.data?.created_at),
      previewTitle: "",
      previewText: "",
      adminLink: "/admin/works",
    },
    {
      title: "Biography",
      updatedAt: formatUpdatedAt(biographyUpdatedAt),
      previewTitle: "Latest update",
      previewText: "Recent solo or group show update.",
      adminLink: "/admin/biography",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview & Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-3">
        {previewCards.map((card) => (
          <Card key={card.title} className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{card.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Last updated {card.updatedAt}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {card.title !== "Works" ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium">{card.previewTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {card.previewText}
                  </p>
                </div>
              ) : null}
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" size="sm">
                <Link href={card.adminLink}>Manage</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
