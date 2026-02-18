import { NextResponse } from "next/server"
import {
  createBadRequestResponse,
  createServerErrorResponse,
  insertActivityLog,
  mapSupabaseErrorMessage,
  parseJsonBody,
  requireAdminUser,
} from "@/lib/server/adminRoute"
import { supabaseServer } from "@/lib/server"

export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer()
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
    }

    const { data: payload, errorResponse: parseErrorResponse } = await parseJsonBody<{
      title?: string
      year?: number
      body?: string
    }>(request)
    if (!payload || parseErrorResponse) {
      return parseErrorResponse
    }

    const title = payload.title?.toString().trim()
    const body = payload.body?.toString().trim()
    const year = payload.year

    if (!title || !body) {
      return createBadRequestResponse("Title and body are required.")
    }

    if (typeof year !== "number" || Number.isNaN(year)) {
      return createBadRequestResponse("Year must be a number.")
    }

    if (year < 1900 || year > 2100) {
      return createBadRequestResponse("Year must be between 1900 and 2100.")
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

    await insertActivityLog(supabase, {
      adminId: user.id,
      actionType: "add",
      entityType: "text",
      entityId: text.id,
      metadata: null,
      logContext: "Text create",
    })
    return NextResponse.json({ ok: true, id: text.id, createdAt: text.created_at })
  } catch (error) {
    console.error("Text create failed", { error })
    return createServerErrorResponse("Server error while saving text.")
  }
}
