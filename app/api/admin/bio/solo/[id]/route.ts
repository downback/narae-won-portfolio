import { NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/server/adminRoute"
import { supabaseServer } from "@/lib/server"
import { isUuid } from "@/lib/validation"

type BioPayload = {
  description?: string
  description_kr?: string
}

type RouteContext = {
  params: Promise<{ id: string }>
}

const logActivity = async (
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  userId: string,
  action: "add" | "update" | "delete",
  entityId: string
) => {
  const { error } = await supabase.from("activity_log").insert({
    admin_id: userId,
    action_type: action,
    entity_type: "cv_detail",
    entity_id: entityId,
    metadata: { section: "solo exhibition" },
  })

  if (error) {
    console.warn("Activity log insert failed", {
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      console.error("Invalid solo show id", { id })
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const supabase = await supabaseServer()
    console.log("Solo show update request", { id })
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
    }

    let body: BioPayload
    try {
      body = (await request.json()) as BioPayload
    } catch (error) {
      console.error("Solo show update invalid JSON", { error })
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }
    const description = body.description?.trim()
    const descriptionKr = body.description_kr?.trim()

    if (!description || !descriptionKr) {
      return NextResponse.json(
        { error: "Description and Korean description are required." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("bio_solo_exhibitions")
      .update({ description, description_kr: descriptionKr })
      .eq("id", id)
      .select("description, description_kr")
      .single()

    if (error || !data) {
      console.error("Solo show update error", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      })
      return NextResponse.json(
        { error: error?.message || "Unable to update solo show entry." },
        { status: 500 }
      )
    }

    await logActivity(supabase, user.id, "update", id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Solo show update failed", { error })
    return NextResponse.json(
      { error: "Server error while updating solo show." },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      console.error("Invalid solo show id", { id })
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const supabase = await supabaseServer()
    console.log("Solo show delete request", { id })
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
    }

    const { error } = await supabase
      .from("bio_solo_exhibitions")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Solo show delete error", {
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { error: error.message || "Unable to delete solo show entry." },
        { status: 500 }
      )
    }

    await logActivity(supabase, user.id, "delete", id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Solo show delete failed", { error })
    return NextResponse.json(
      { error: "Server error while deleting solo show." },
      { status: 500 }
    )
  }
}
