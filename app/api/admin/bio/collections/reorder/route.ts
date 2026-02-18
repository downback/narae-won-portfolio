import { NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/server/adminRoute"
import { supabaseServer } from "@/lib/server"
import { isUuid } from "@/lib/validation"

type ReorderItem = {
  id: string
  display_order: number
}

export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer()
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
    }

    const body = (await request.json()) as { items?: ReorderItem[] }
    const items = body.items ?? []

    if (items.length === 0) {
      return NextResponse.json({ error: "No items provided." }, { status: 400 })
    }

    if (items.some((item) => !isUuid(item.id))) {
      return NextResponse.json({ error: "Invalid id in items." }, { status: 400 })
    }

    const updates = items.map((item) =>
      supabase
        .from("bio_collections")
        .update({ display_order: item.display_order })
        .eq("id", item.id)
    )

    const results = await Promise.all(updates)
    const hasError = results.some((result) => result.error)

    if (hasError) {
      return NextResponse.json(
        { error: "Unable to update collection order." },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Collection reorder failed", { error })
    return NextResponse.json(
      { error: "Server error while saving order." },
      { status: 500 }
    )
  }
}
