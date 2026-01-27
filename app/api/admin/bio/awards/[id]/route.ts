import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

type BioPayload = {
  description?: string
  description_kr?: string
}

type RouteContext = {
  params: Promise<{ id: string }>
}

const normalizeId = (value?: string) => (value ?? "").trim()

const isUuid = (value: string) => {
  const normalized = normalizeId(value)
  return /^[0-9a-fA-F-]{36}$/.test(normalized) && !normalized.includes("undefined")
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
    metadata: { section: "awards & selections" },
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
      console.error("Invalid awards id", { id })
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const supabase = await supabaseServer()
    console.log("Awards update request", { id })
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    let body: BioPayload
    try {
      body = (await request.json()) as BioPayload
    } catch (error) {
      console.error("Awards update invalid JSON", { error })
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
      .from("bio_awards")
      .update({ description, description_kr: descriptionKr })
      .eq("id", id)
      .select("description, description_kr")
      .single()

    if (error || !data) {
      console.error("Awards update error", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      })
      return NextResponse.json(
        { error: error?.message || "Unable to update awards entry." },
        { status: 500 }
      )
    }

    await logActivity(supabase, user.id, "update", id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Awards update failed", { error })
    return NextResponse.json(
      { error: "Server error while updating awards." },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      console.error("Invalid awards id", { id })
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const supabase = await supabaseServer()
    console.log("Awards delete request", { id })
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { error } = await supabase
      .from("bio_awards")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Awards delete error", {
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { error: error.message || "Unable to delete awards entry." },
        { status: 500 }
      )
    }

    await logActivity(supabase, user.id, "delete", id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Awards delete failed", { error })
    return NextResponse.json(
      { error: "Server error while deleting awards." },
      { status: 500 }
    )
  }
}
