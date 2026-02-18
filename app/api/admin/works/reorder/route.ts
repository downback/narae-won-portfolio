import { NextResponse } from "next/server"
import {
  createBadRequestResponse,
  createServerErrorResponse,
  insertActivityLog,
  parseJsonBody,
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

    const { data: body, errorResponse: parseErrorResponse } = await parseJsonBody<{
      yearLabel?: string
      orderedWorkIds?: string[]
    }>(request)
    if (!body || parseErrorResponse) {
      return parseErrorResponse
    }

    const orderedIds = body.orderedWorkIds ?? []
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return createBadRequestResponse("Missing work order.")
    }

    if (orderedIds.some((id) => !isUuid(id))) {
      return createBadRequestResponse("Invalid work id.")
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

    await insertActivityLog(supabase, {
      adminId: user.id,
      actionType: "update",
      entityType: "artwork",
      entityId: orderedIds[0],
      metadata: { category: "works", yearLabel: body.yearLabel ?? null },
      logContext: "Works reorder",
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to reorder works", { error })
    return createServerErrorResponse("Server error while reordering works.")
  }
}
