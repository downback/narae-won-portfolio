import { NextResponse } from "next/server"
import { exhibitionCategories, type ExhibitionCategory } from "@/lib/constants"
import {
  requireAdminUser,
} from "@/lib/server/adminRoute"
import { supabaseServer } from "@/lib/server"
import { isUuid } from "@/lib/validation"

type AllowedCategory = ExhibitionCategory

export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer()
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
    }

    const body = (await request.json()) as {
      category?: string
      orderedExhibitionIds?: string[]
    }

    const category = body.category?.trim()
    const isAllowedCategory = (value: string): value is AllowedCategory =>
      exhibitionCategories.includes(value as AllowedCategory)
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
