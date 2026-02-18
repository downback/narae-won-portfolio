import { NextResponse } from "next/server"
import { mapSupabaseErrorMessage, requireAdminUser } from "@/lib/server/adminRoute"
import { supabaseServer } from "@/lib/server"
import { isUuid } from "@/lib/validation"

type RouteContext = {
  params: Promise<{ id: string }>
}

const logTextActivity = async (
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  userId: string,
  action: "add" | "update" | "delete",
  textId: string
) => {
  const { error } = await supabase.from("activity_log").insert({
    admin_id: userId,
    action_type: action,
    entity_type: "text",
    entity_id: textId,
    metadata: null,
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
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const supabase = await supabaseServer()
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
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
        {
          error: mapSupabaseErrorMessage({
            message: updateError?.message || "",
            tableHint: "texts",
            fallbackMessage: "Unable to update text entry.",
          }),
        },
        { status: 500 }
      )
    }

    await logTextActivity(supabase, user.id, "update", updated.id)
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
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
    }

    const { error: deleteError } = await supabase
      .from("texts")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json(
        {
          error: mapSupabaseErrorMessage({
            message: deleteError.message,
            tableHint: "texts",
            fallbackMessage: "Unable to update text entry.",
          }),
        },
        { status: 500 }
      )
    }

    await logTextActivity(supabase, user.id, "delete", id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Text delete failed", { error })
    return NextResponse.json(
      { error: "Server error while deleting text." },
      { status: 500 }
    )
  }
}
