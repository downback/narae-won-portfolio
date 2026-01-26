import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

type BioPayload = {
  description?: string
  year?: number
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
  action: "add" | "update" | "delete"
) => {
  const { error } = await supabase.from("activity_log").insert({
    area: "Biography",
    action,
    context: "group",
    created_by: userId,
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
      console.error("Invalid group show id", { id })
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const supabase = await supabaseServer()
    console.log("Group show update request", { id })
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
      console.error("Group show update invalid JSON", { error })
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }
    const description = body.description?.trim()
    const year = body.year

    if (!year) {
      return NextResponse.json(
        { error: "Year is required." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("bio_group_exhibitions")
      .update({ description: description || null, year })
      .eq("id", id)
      .select("description, year")
      .single()

    if (error || !data) {
      console.error("Group show update error", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      })
      return NextResponse.json(
        { error: error?.message || "Unable to update group show entry." },
        { status: 500 }
      )
    }

    await logActivity(supabase, user.id, "update")
    return NextResponse.json(data)
  } catch (error) {
    console.error("Group show update failed", { error })
    return NextResponse.json(
      { error: "Server error while updating group show." },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      console.error("Invalid group show id", { id })
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const supabase = await supabaseServer()
    console.log("Group show delete request", { id })
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { error } = await supabase
      .from("bio_group_exhibitions")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Group show delete error", {
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { error: error.message || "Unable to delete group show entry." },
        { status: 500 }
      )
    }

    await logActivity(supabase, user.id, "delete")
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Group show delete failed", { error })
    return NextResponse.json(
      { error: "Server error while deleting group show." },
      { status: 500 }
    )
  }
}
