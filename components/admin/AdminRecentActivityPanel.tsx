import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseServer } from "@/lib/server"
import { cn } from "@/lib/utils"

type ActivityItem = {
  action: "add" | "update" | "delete"
  area: "Main Page" | "Works" | "Biography"
  context?: "solo" | "group"
  date: string
  sortTime: number
}

type RecentActivityResult = {
  activities: ActivityItem[]
  hasError: boolean
}

const actionLabels: Record<ActivityItem["action"], string> = {
  add: "add",
  update: "update",
  delete: "delete",
}

const actionBadgeClasses: Record<ActivityItem["action"], string> = {
  add: "bg-emerald-100 text-emerald-700",
  update: "bg-orange-100 text-orange-700",
  delete: "bg-red-100 text-red-700",
}

const activityDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
})

const formatActivityDate = (timestamp: string) =>
  activityDateFormatter.format(new Date(timestamp))

const buildActivityItem = (
  action: ActivityItem["action"],
  area: ActivityItem["area"],
  timestamp: string,
  context?: ActivityItem["context"]
): ActivityItem => ({
  action,
  area,
  context,
  date: formatActivityDate(timestamp),
  sortTime: new Date(timestamp).getTime(),
})

const isMissingTableError = (error: { code?: string } | null) =>
  error?.code === "PGRST205"

const fetchRecentActivities = async (): Promise<RecentActivityResult> => {
  try {
    const supabase = await supabaseServer()

    const { data: activityLog, error: activityLogError } = await supabase
      .from("activity_log")
      .select("action, area, context, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    const [
      siteContentResult,
      soloShowsResult,
      groupShowsResult,
      assetsResult,
    ] = await Promise.all([
      supabase.from("site_content").select("updated_at").limit(1),
      isMissingTableError(activityLogError)
        ? supabase
            .from("bio_solo_shows")
            .select("updated_at")
            .order("updated_at", { ascending: false })
            .limit(2)
        : Promise.resolve({ data: null, error: null }),
      isMissingTableError(activityLogError)
        ? supabase
            .from("bio_group_shows")
            .select("updated_at")
            .order("updated_at", { ascending: false })
            .limit(2)
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("assets")
        .select("created_at, asset_kind")
        .order("created_at", { ascending: false })
        .limit(2),
    ])

    if (
      (activityLogError && !isMissingTableError(activityLogError)) ||
      siteContentResult.error ||
      soloShowsResult.error ||
      groupShowsResult.error ||
      assetsResult.error
    ) {
      throw (
        activityLogError ||
        siteContentResult.error ||
        soloShowsResult.error ||
        groupShowsResult.error ||
        assetsResult.error
      )
    }

    const activities: ActivityItem[] = []

    if (siteContentResult.data?.[0]?.updated_at) {
      activities.push(
        buildActivityItem(
          "update",
          "Main Page",
          siteContentResult.data[0].updated_at
        )
      )
    }

    activityLog?.forEach((item) => {
      if (!item.created_at) return
      if (item.area !== "Biography") return
      activities.push(
        buildActivityItem(item.action, item.area, item.created_at, item.context)
      )
    })

    if (isMissingTableError(activityLogError)) {
      soloShowsResult.data?.forEach((item) => {
        if (item.updated_at) {
          activities.push(
            buildActivityItem("update", "Biography", item.updated_at)
          )
        }
      })

      groupShowsResult.data?.forEach((item) => {
        if (item.updated_at) {
          activities.push(
            buildActivityItem("update", "Biography", item.updated_at)
          )
        }
      })
    }

    assetsResult.data?.forEach((item) => {
      if (!item.created_at) return
      const area = item.asset_kind === "works_pdf" ? "Works" : "Main Page"
      activities.push(buildActivityItem("add", area, item.created_at))
    })

    const sortedActivities = activities
      .sort((a, b) => b.sortTime - a.sortTime)
      .slice(0, 7)

    return { activities: sortedActivities, hasError: false }
  } catch (error) {
    console.error("Failed to load recent activity", { error })
    return { activities: [], hasError: true }
  }
}

export default async function AdminRecentActivityPanel() {
  const { activities, hasError } = await fetchRecentActivities()
  const formatAreaLabel = (activity: ActivityItem) => {
    if (activity.area === "Biography" && activity.context) {
      return `${activity.context} show info`
    }
    return activity.area
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {hasError ? (
          <p className="text-sm text-muted-foreground">
            Unable to load activity right now.
          </p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity, index) => (
              <li
                key={`${activity.action}-${activity.area}-${activity.date}-${index}`}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs uppercase tracking-wide",
                      actionBadgeClasses[activity.action]
                    )}
                  >
                    {actionLabels[activity.action]}
                  </span>
                  <span className="font-medium">
                    {formatAreaLabel(activity)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.date}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
