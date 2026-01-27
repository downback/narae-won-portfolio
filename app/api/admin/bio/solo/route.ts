import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

type BioPayload = {
  description?: string
  description_kr?: string
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

    const body = (await request.json()) as BioPayload
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
      .insert({
        description,
        description_kr: descriptionKr,
        display_order: 0,
      })
      .select("id, description, description_kr")
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Unable to create solo show entry." },
        { status: 500 }
      )
    }

    await logActivity(supabase, user.id, "add", data.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Solo show create failed", { error })
    return NextResponse.json(
      { error: "Server error while creating solo show." },
      { status: 500 }
    )
  }
}
