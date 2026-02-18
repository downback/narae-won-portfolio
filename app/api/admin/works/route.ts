import { NextResponse } from "next/server"
import { siteAssetsBucketName } from "@/lib/constants"
import { buildStoragePathWithPrefix } from "@/lib/storage"
import {
  mapSupabaseErrorMessage,
  requireAdminUser,
} from "@/lib/server/adminRoute"
import { supabaseServer } from "@/lib/server"
import { validateImageUploadFile } from "@/lib/uploadValidation"

const bucketName = siteAssetsBucketName

export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer()
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const yearRaw = formData.get("year")?.toString().trim()
    const title = formData.get("title")?.toString().trim()
    const caption = formData.get("caption")?.toString().trim()

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing image file." },
        { status: 400 },
      )
    }

    const fileValidationError = validateImageUploadFile(file)
    if (fileValidationError) {
      return NextResponse.json({ error: fileValidationError }, { status: 400 })
    }

    if (!yearRaw) {
      return NextResponse.json({ error: "Year is required." }, { status: 400 })
    }

    const year = Number(yearRaw)
    if (Number.isNaN(year)) {
      return NextResponse.json(
        { error: "Year must be a number." },
        { status: 400 },
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 },
      )
    }

    if (!caption) {
      return NextResponse.json(
        { error: "Caption is required." },
        { status: 400 },
      )
    }

    const storagePath = buildStoragePathWithPrefix({
      prefix: "works",
      file,
    })
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: "Upload failed. Please try again." },
        { status: 500 },
      )
    }

    const { data: latestArtwork, error: latestError } = await supabase
      .from("artworks")
      .select("display_order")
      .eq("category", "works")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestError) {
      await supabase.storage.from(bucketName).remove([storagePath])
      return NextResponse.json(
        {
          error: mapSupabaseErrorMessage({
            message: latestError.message,
            tableHint: "artworks",
            fallbackMessage: "Unable to save work entry.",
          }),
        },
        { status: 500 },
      )
    }

    const nextDisplayOrder = (latestArtwork?.display_order ?? -1) + 1
    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .insert({
        storage_path: storagePath,
        category: "works",
        year,
        title,
        caption,
        display_order: nextDisplayOrder,
      })
      .select("id, created_at")
      .single()

    if (artworkError || !artwork) {
      await supabase.storage.from(bucketName).remove([storagePath])
      return NextResponse.json(
        {
          error: mapSupabaseErrorMessage({
            message: artworkError?.message || "",
            tableHint: "artworks",
            fallbackMessage: "Unable to save work entry.",
          }),
        },
        { status: 500 },
      )
    }

    const { error: activityError } = await supabase
      .from("activity_log")
      .insert({
        admin_id: user.id,
        action_type: "add",
        entity_type: "artwork",
        entity_id: artwork.id,
        metadata: { category: "works" },
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
    console.error("Work upload failed", { error })
    return NextResponse.json(
      { error: "Server error while uploading work." },
      { status: 500 },
    )
  }
}
