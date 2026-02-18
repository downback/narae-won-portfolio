import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

export type ServerSupabaseClient = Awaited<ReturnType<typeof supabaseServer>>

type SupabaseErrorMessageOptions = {
  message: string
  tableHint: string
  fallbackMessage: string
}

export const createUnauthorizedResponse = () =>
  NextResponse.json({ error: "Unauthorized." }, { status: 401 })

export const createForbiddenResponse = (message = "Unauthorized.") =>
  NextResponse.json({ error: message }, { status: 403 })

export const createBadRequestResponse = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 })

export const createServerErrorResponse = (message: string) =>
  NextResponse.json({ error: message }, { status: 500 })

export const getAuthenticatedUser = async (supabase: ServerSupabaseClient) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  return {
    user,
    userError,
  }
}

export const requireAdminUser = async (supabase: ServerSupabaseClient) => {
  const { user, userError } = await getAuthenticatedUser(supabase)
  if (userError || !user) {
    return { user: null, errorResponse: createUnauthorizedResponse() }
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("app_admin")
    .select("admin_user_id")
    .eq("singleton_id", true)
    .maybeSingle()

  if (adminError || !adminRow || adminRow.admin_user_id !== user.id) {
    return {
      user: null,
      errorResponse: createForbiddenResponse(),
    }
  }

  return { user, errorResponse: null as NextResponse | null }
}

export const parseJsonBody = async <T>(
  request: Request,
  invalidBodyMessage = "Invalid request body.",
) => {
  try {
    const data = (await request.json()) as T
    return { data, errorResponse: null as NextResponse | null }
  } catch (error) {
    console.error("Failed to parse JSON body", { error })
    return {
      data: null as T | null,
      errorResponse: createBadRequestResponse(invalidBodyMessage),
    }
  }
}

type InsertActivityLogInput = {
  adminId: string
  actionType: "add" | "update" | "delete"
  entityType: string
  entityId: string
  metadata?: Record<string, unknown> | null
  logContext: string
}

export const insertActivityLog = async (
  supabase: ServerSupabaseClient,
  {
    adminId,
    actionType,
    entityType,
    entityId,
    metadata = null,
    logContext,
  }: InsertActivityLogInput,
) => {
  const { error } = await supabase.from("activity_log").insert({
    admin_id: adminId,
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  })

  if (error) {
    console.warn(`${logContext} activity log insert failed`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
  }
}

export const mapSupabaseErrorMessage = ({
  message,
  tableHint,
  fallbackMessage,
}: SupabaseErrorMessageOptions) => {
  const normalizedMessage = message.toLowerCase()
  if (normalizedMessage.includes("does not exist")) {
    return `Required tables are missing. Check ${tableHint}.`
  }
  if (
    normalizedMessage.includes("permission") ||
    normalizedMessage.includes("rls")
  ) {
    return `Permission denied. Check RLS policies for ${tableHint}.`
  }
  return fallbackMessage
}
