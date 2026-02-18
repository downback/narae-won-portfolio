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
import { isUuid } from "@/lib/validation"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      return createBadRequestResponse("Invalid id.")
    }

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

    await insertActivityLog(supabase, {
      adminId: user.id,
      actionType: "update",
      entityType: "text",
      entityId: updated.id,
      metadata: null,
      logContext: "Text update",
    })
    return NextResponse.json({ ok: true, id: updated.id, createdAt: updated.created_at })
  } catch (error) {
    console.error("Text update failed", { error })
    return createServerErrorResponse("Server error while updating text.")
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      return createBadRequestResponse("Invalid id.")
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

    await insertActivityLog(supabase, {
      adminId: user.id,
      actionType: "delete",
      entityType: "text",
      entityId: id,
      metadata: null,
      logContext: "Text delete",
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Text delete failed", { error })
    return createServerErrorResponse("Server error while deleting text.")
  }
}
