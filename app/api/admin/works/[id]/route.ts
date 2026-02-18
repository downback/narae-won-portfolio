import { NextResponse } from "next/server"
import { siteAssetsBucketName } from "@/lib/constants"
import { buildStoragePathWithPrefix } from "@/lib/storage"
import {
  requireAdminUser,
} from "@/lib/server/adminRoute"
import { supabaseServer } from "@/lib/server"
import { validateImageUploadFile } from "@/lib/uploadValidation"
import { isUuid } from "@/lib/validation"

const bucketName = siteAssetsBucketName
const minimumYear = 1900
const maximumYear = 2100

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

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

    if (!yearRaw) {
      return NextResponse.json({ error: "Year is required." }, { status: 400 })
    }

    const year = Number(yearRaw)
    if (Number.isNaN(year)) {
      return NextResponse.json({ error: "Year must be a number." }, { status: 400 })
    }
    if (year < minimumYear || year > maximumYear) {
      return NextResponse.json(
        { error: `Year must be between ${minimumYear} and ${maximumYear}.` },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 })
    }

    if (!caption) {
      return NextResponse.json({ error: "Caption is required." }, { status: 400 })
    }

    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle()

    if (artworkError || !artwork?.storage_path) {
      return NextResponse.json(
        { error: "Work not found." },
        { status: 404 }
      )
    }

    let nextStoragePath = artwork.storage_path
    if (file instanceof File) {
      const fileValidationError = validateImageUploadFile(file)
      if (fileValidationError) {
        return NextResponse.json({ error: fileValidationError }, { status: 400 })
      }
      nextStoragePath = buildStoragePathWithPrefix({
        prefix: "works",
        file,
      })
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(nextStoragePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        })

      if (uploadError) {
        return NextResponse.json(
          { error: "Upload failed. Please try again." },
          { status: 500 }
        )
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("artworks")
      .update({
        storage_path: nextStoragePath,
        year,
        title,
        caption,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, created_at, storage_path")
      .single()

    if (updateError || !updated) {
      if (nextStoragePath !== artwork.storage_path) {
        await supabase.storage.from(bucketName).remove([nextStoragePath])
      }
      return NextResponse.json(
        { error: updateError?.message || "Unable to update work." },
        { status: 500 }
      )
    }

    if (nextStoragePath !== artwork.storage_path) {
      await supabase.storage.from(bucketName).remove([artwork.storage_path])
    }

    const { error: activityError } = await supabase
      .from("activity_log")
      .insert({
        admin_id: user.id,
        action_type: "update",
        entity_type: "artwork",
        entity_id: updated.id,
        metadata: { category: "works" },
      })

    if (activityError) {
      console.warn("Activity log insert failed", {
        message: activityError.message,
        details: activityError.details,
        hint: activityError.hint,
      })
    }

    return NextResponse.json({ ok: true, createdAt: updated.created_at })
  } catch (error) {
    console.error("Work update failed", { error })
    return NextResponse.json(
      { error: "Server error while updating work." },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

    const supabase = await supabaseServer()
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
    }

    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle()

    if (artworkError || !artwork?.storage_path) {
      return NextResponse.json(
        { error: "Work not found." },
        { status: 404 }
      )
    }

    const { error: deleteError } = await supabase
      .from("artworks")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message || "Unable to delete work." },
        { status: 500 }
      )
    }

    await supabase.storage.from(bucketName).remove([artwork.storage_path])

    const { error: activityError } = await supabase
      .from("activity_log")
      .insert({
        admin_id: user.id,
        action_type: "delete",
        entity_type: "artwork",
        entity_id: id,
        metadata: { category: "works" },
      })

    if (activityError) {
      console.warn("Activity log insert failed", {
        message: activityError.message,
        details: activityError.details,
        hint: activityError.hint,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Work delete failed", { error })
    return NextResponse.json(
      { error: "Server error while deleting work." },
      { status: 500 }
    )
  }
}
