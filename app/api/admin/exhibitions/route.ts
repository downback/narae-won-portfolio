import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

const bucketName = "site-assets"
const allowedCategories = ["solo-exhibitions", "group-exhibitions"] as const

const mapSupabaseError = (message: string) => {
  const normalizedMessage = message.toLowerCase()
  if (normalizedMessage.includes("does not exist")) {
    return "Required tables are missing. Check artworks."
  }
  if (normalizedMessage.includes("permission") || normalizedMessage.includes("rls")) {
    return "Permission denied. Check RLS policies for artworks."
  }
  return "Unable to save exhibition entry."
}

const buildStoragePath = (category: string, file: File) => {
  const extension = file.name.split(".").pop() || ""
  const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, "")
  const suffix = safeExtension ? `.${safeExtension}` : ""
  return `${category}/${Date.now()}-${crypto.randomUUID()}${suffix}`
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

    const formData = await request.formData()
    const file = formData.get("file")
    const category = formData.get("category")?.toString().trim()
    const yearRaw = formData.get("year")?.toString().trim()
    const exhibitionTitle = formData.get("exhibition_title")?.toString().trim()
    const caption = formData.get("caption")?.toString().trim()
    const description = formData.get("description")?.toString().trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file." }, { status: 400 })
    }

    if (!category || !allowedCategories.includes(category as any)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 })
    }

    if (file.type && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed." },
        { status: 400 }
      )
    }

    if (!yearRaw) {
      return NextResponse.json({ error: "Year is required." }, { status: 400 })
    }

    const year = Number(yearRaw)
    if (Number.isNaN(year)) {
      return NextResponse.json({ error: "Year must be a number." }, { status: 400 })
    }

    if (!exhibitionTitle) {
      return NextResponse.json(
        { error: "Exhibition title is required." },
        { status: 400 }
      )
    }

    if (!caption) {
      return NextResponse.json({ error: "Caption is required." }, { status: 400 })
    }

    const storagePath = buildStoragePath(category, file)
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: "Upload failed. Please try again." },
        { status: 500 }
      )
    }

    const { data: latestArtwork, error: latestError } = await supabase
      .from("artworks")
      .select("display_order")
      .eq("category", category)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestError) {
      await supabase.storage.from(bucketName).remove([storagePath])
      return NextResponse.json(
        { error: mapSupabaseError(latestError.message) },
        { status: 500 }
      )
    }

    const nextDisplayOrder = (latestArtwork?.display_order ?? -1) + 1
    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .insert({
        storage_path: storagePath,
        category,
        year,
        exhibition_slug: exhibitionTitle,
        caption,
        description: description || null,
        display_order: nextDisplayOrder,
      })
      .select("id, created_at")
      .single()

    if (artworkError || !artwork) {
      await supabase.storage.from(bucketName).remove([storagePath])
      return NextResponse.json(
        { error: mapSupabaseError(artworkError?.message || "") },
        { status: 500 }
      )
    }

    const { error: activityError } = await supabase
      .from("activity_log")
      .insert({
        admin_id: user.id,
        action_type: "add",
        entity_type: "artwork",
        entity_id: artwork.id,
        metadata: { category },
      })

    if (activityError) {
      console.warn("Activity log insert failed", {
        message: activityError.message,
        details: activityError.details,
        hint: activityError.hint,
      })
    }

    return NextResponse.json({ ok: true, createdAt: artwork.created_at })
  } catch (error) {
    console.error("Exhibition upload failed", { error })
    return NextResponse.json(
      { error: "Server error while uploading exhibition." },
      { status: 500 }
    )
  }
}
