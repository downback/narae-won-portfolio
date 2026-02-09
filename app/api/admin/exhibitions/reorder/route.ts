import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

const allowedCategories = ["solo-exhibitions", "group-exhibitions"] as const
type AllowedCategory = (typeof allowedCategories)[number]

const isUuid = (value: string) =>
  /^[0-9a-fA-F-]{36}$/.test(value) && !value.includes("undefined")

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

    const body = (await request.json()) as {
      category?: string
      orderedExhibitionIds?: string[]
    }

    const category = body.category?.trim()
    const isAllowedCategory = (value: string): value is AllowedCategory =>
      allowedCategories.includes(value as AllowedCategory)
    if (!category || !isAllowedCategory(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 })
    }

    const orderedIds = body.orderedExhibitionIds ?? []
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "Missing exhibition order." },
        { status: 400 },
      )
    }
    if (orderedIds.some((id) => !isUuid(id))) {
      return NextResponse.json(
        { error: "Invalid exhibition id." },
        { status: 400 },
      )
    }

    const exhibitionType = category === "solo-exhibitions" ? "solo" : "group"
    const updates = orderedIds.map((id, index) =>
      supabase
        .from("exhibitions")
        .update({ display_order: index })
        .eq("id", id)
        .eq("type", exhibitionType),
    )

    const results = await Promise.all(updates)
    const firstError = results.find((result) => result.error)?.error
    if (firstError) {
      return NextResponse.json(
        { error: firstError.message || "Unable to reorder exhibitions." },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to reorder exhibitions", { error })
    return NextResponse.json(
      { error: "Server error while reordering exhibitions." },
      { status: 500 },
    )
  }
}
