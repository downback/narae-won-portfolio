import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

type BioPayload = {
  description?: string
  year?: number | null
}

const logActivity = async (
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  userId: string,
  action: "add" | "update" | "delete"
) => {
  const { error } = await supabase.from("activity_log").insert({
    area: "Biography",
    action,
    context: "collections",
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
    const year = body.year ?? null

    const { data, error } = await supabase
      .from("bio_collections")
      .insert({
        description: description || null,
        year,
        display_order: 0,
      })
      .select("id, year, description")
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Unable to create collection entry." },
        { status: 500 }
      )
    }

    await logActivity(supabase, user.id, "add")
    return NextResponse.json(data)
  } catch (error) {
    console.error("Collection create failed", { error })
    return NextResponse.json(
      { error: "Server error while creating collection entry." },
      { status: 500 }
    )
  }
}
