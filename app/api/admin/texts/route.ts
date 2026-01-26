import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

const mapSupabaseError = (message: string) => {
  const normalizedMessage = message.toLowerCase()
  if (normalizedMessage.includes("does not exist")) {
    return "Required tables are missing. Check texts."
  }
  if (normalizedMessage.includes("permission") || normalizedMessage.includes("rls")) {
    return "Permission denied. Check RLS policies for texts."
  }
  return "Unable to save text entry."
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
        { error: mapSupabaseError(insertError?.message || "") },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, id: text.id, createdAt: text.created_at })
  } catch (error) {
    console.error("Text create failed", { error })
    return NextResponse.json(
      { error: "Server error while saving text." },
      { status: 500 }
    )
  }
}
