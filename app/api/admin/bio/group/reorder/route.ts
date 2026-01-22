import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

type ReorderItem = {
  id: string
  sort_order: number
}

export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const body = (await request.json()) as { items?: ReorderItem[] }
    const items = body.items ?? []

    if (items.length === 0) {
      return NextResponse.json({ error: "No items provided." }, { status: 400 })
    }

    const updates = items.map((item) =>
      supabase
        .from("bio_group_shows")
        .update({ sort_order: item.sort_order, updated_by: user.id })
        .eq("id", item.id)
    )

    const results = await Promise.all(updates)
    const hasError = results.some((result) => result.error)

    if (hasError) {
      return NextResponse.json(
        { error: "Unable to update group show order." },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Group show reorder failed", { error })
    return NextResponse.json(
      { error: "Server error while saving order." },
      { status: 500 }
    )
  }
}
