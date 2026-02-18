import { NextResponse } from "next/server"
import {
  requireAdminUser,
} from "@/lib/server/adminRoute"
import { supabaseServer } from "@/lib/server"
import { isUuid } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer()
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
    }

    const body = (await request.json()) as {
      yearLabel?: string
      orderedWorkIds?: string[]
    }

    const orderedIds = body.orderedWorkIds ?? []
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "Missing work order." },
        { status: 400 },
      )
    }

    if (orderedIds.some((id) => !isUuid(id))) {
      return NextResponse.json({ error: "Invalid work id." }, { status: 400 })
    }

    const total = orderedIds.length
    const updates = orderedIds.map((id, index) =>
      supabase
        .from("artworks")
        .update({ display_order: total - index })
        .eq("id", id)
        .eq("category", "works"),
    )

    const results = await Promise.all(updates)
    const firstError = results.find((result) => result.error)?.error
    if (firstError) {
      return NextResponse.json(
        { error: firstError.message || "Unable to reorder works." },
        { status: 500 },
      )
    }

    const { error: activityError } = await supabase.from("activity_log").insert({
      admin_id: user.id,
      action_type: "update",
      entity_type: "artwork",
      entity_id: orderedIds[0],
      metadata: { category: "works", yearLabel: body.yearLabel ?? null },
    })

    if (activityError) {
      console.warn("Activity log insert failed", {
        message: activityError.message,
        details: activityError.details,
        hint: activityError.hint,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to reorder works", { error })
    return NextResponse.json(
      { error: "Server error while reordering works." },
      { status: 500 },
    )
  }
}
