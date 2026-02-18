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
      errorResponse: NextResponse.json({ error: "Unauthorized." }, { status: 403 }),
    }
  }

  return { user, errorResponse: null as NextResponse | null }
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
