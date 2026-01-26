import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

const isUuid = (value: string) =>
  /^[0-9a-fA-F-]{36}$/.test(value) && !value.includes("undefined")

const mapSupabaseError = (message: string) => {
  const normalizedMessage = message.toLowerCase()
  if (normalizedMessage.includes("does not exist")) {
    return "Required tables are missing. Check texts."
  }
  if (normalizedMessage.includes("permission") || normalizedMessage.includes("rls")) {
    return "Permission denied. Check RLS policies for texts."
  }
  return "Unable to update text entry."
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const supabase = await supabaseServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const payload = (await request.json()) as {
      title?: string
      year?: number
      body?: string
    }

    const title = payload.title?.toString().trim()
    const body = payload.body?.toString().trim()
    const year = payload.year

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required." },
        { status: 400 }
      )
    }

    if (typeof year !== "number" || Number.isNaN(year)) {
      return NextResponse.json({ error: "Year must be a number." }, { status: 400 })
    }

    if (year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: "Year must be between 1900 and 2100." },
        { status: 400 }
      )
    }

    const { data: updated, error: updateError } = await supabase
      .from("texts")
      .update({
        title,
        year,
        body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, created_at")
      .single()

    if (updateError || !updated) {
      return NextResponse.json(
        { error: mapSupabaseError(updateError?.message || "") },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, id: updated.id, createdAt: updated.created_at })
  } catch (error) {
    console.error("Text update failed", { error })
    return NextResponse.json(
      { error: "Server error while updating text." },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const supabase = await supabaseServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { error: deleteError } = await supabase
      .from("texts")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json(
        { error: mapSupabaseError(deleteError.message) },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Text delete failed", { error })
    return NextResponse.json(
      { error: "Server error while deleting text." },
      { status: 500 }
    )
  }
}
