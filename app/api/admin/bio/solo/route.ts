import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

type BioPayload = {
  title?: string
  location?: string
  year?: number
}

const logActivity = async (
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  userId: string,
  action: "add" | "update" | "delete"
) => {
  const { error } = await supabase.from("activity_log").insert({
    area: "Biography",
    action,
    context: "solo",
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
    const title = body.title?.trim()
    const location = body.location?.trim()
    const year = body.year

    if (!title || !location || !year) {
      return NextResponse.json(
        { error: "Title, location, and year are required." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("bio_solo_shows")
      .insert({
        title,
        location,
        year,
        updated_by: user.id,
      })
      .select("id, title, location, year")
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Unable to create solo show entry." },
        { status: 500 }
      )
    }

    await logActivity(supabase, user.id, "add")
    return NextResponse.json(data)
  } catch (error) {
    console.error("Solo show create failed", { error })
    return NextResponse.json(
      { error: "Server error while creating solo show." },
      { status: 500 }
    )
  }
}
