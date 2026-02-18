import { NextResponse } from "next/server"
import { mapSupabaseErrorMessage, requireAdminUser } from "@/lib/server/adminRoute"
import { supabaseServer } from "@/lib/server"

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

export async function POST(request: Request) {
  try {
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

    const { data: text, error: insertError } = await supabase
      .from("texts")
      .insert({
        title,
        year,
        body,
      })
      .select("id, created_at")
      .single()

    if (insertError || !text) {
      return NextResponse.json(
        {
          error: mapSupabaseErrorMessage({
            message: insertError?.message || "",
            tableHint: "texts",
            fallbackMessage: "Unable to save text entry.",
          }),
        },
        { status: 500 }
      )
    }

    await logTextActivity(supabase, user.id, "add", text.id)
    return NextResponse.json({ ok: true, id: text.id, createdAt: text.created_at })
  } catch (error) {
    console.error("Text create failed", { error })
    return NextResponse.json(
      { error: "Server error while saving text." },
      { status: 500 }
    )
  }
}
