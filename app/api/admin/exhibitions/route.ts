"use server"

import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

const bucketName = "site-assets"
const allowedCategories = ["solo-exhibitions", "group-exhibitions"] as const

const mapSupabaseError = (message: string) => {
  const normalizedMessage = message.toLowerCase()
  if (normalizedMessage.includes("does not exist")) {
    return "Required tables are missing. Check exhibitions."
  }
  if (normalizedMessage.includes("permission") || normalizedMessage.includes("rls")) {
    return "Permission denied. Check RLS policies for exhibitions."
  }
  return "Unable to save exhibition entry."
}

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

const buildStoragePath = (category: string, slug: string, file: File) => {
  const extension = file.name.split(".").pop() || ""
  const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, "")
  const suffix = safeExtension ? `.${safeExtension}` : ""
  return `${category}/${slug}/${Date.now()}-${crypto.randomUUID()}${suffix}`
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
    const exhibitionTitle = formData.get("exhibition_title")?.toString().trim()
    const caption = formData.get("caption")?.toString().trim()
    const description = formData.get("description")?.toString().trim()
    const additionalFiles = formData
      .getAll("additional_images")
      .filter((value): value is File => value instanceof File)

    const isAllowedCategory = (
      value: string,
    ): value is (typeof allowedCategories)[number] =>
      allowedCategories.includes(value as (typeof allowedCategories)[number])

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing image file." },
        { status: 400 },
      )
    }

    if (!category || !isAllowedCategory(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 })
    }

    if (file.type && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed." },
        { status: 400 },
      )
    }

    const hasInvalidAdditional = additionalFiles.some(
      (additional) => additional.type && !additional.type.startsWith("image/"),
    )
    if (hasInvalidAdditional) {
      return NextResponse.json(
        { error: "Only image uploads are allowed." },
        { status: 400 },
      )
    }

    if (!exhibitionTitle) {
      return NextResponse.json(
        { error: "Exhibition title is required." },
        { status: 400 },
      )
    }

    if (!caption) {
      return NextResponse.json(
        { error: "Caption is required." },
        { status: 400 },
      )
    }

    const slug = toSlug(exhibitionTitle)
    if (!slug) {
      return NextResponse.json(
        { error: "Exhibition title is required." },
        { status: 400 },
      )
    }

    const exhibitionType = category === "solo-exhibitions" ? "solo" : "group"

    const { data: existingExhibition, error: existingError } = await supabase
      .from("exhibitions")
      .select("id, display_order")
      .eq("slug", slug)
      .maybeSingle()

    if (existingError) {
      return NextResponse.json(
        { error: mapSupabaseError(existingError.message) },
        { status: 500 },
      )
    }

    let exhibitionId = existingExhibition?.id ?? null
    if (!exhibitionId) {
      const { data: latestExhibition, error: latestError } = await supabase
        .from("exhibitions")
        .select("display_order")
        .eq("type", exhibitionType)
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestError) {
        return NextResponse.json(
          { error: mapSupabaseError(latestError.message) },
          { status: 500 },
        )
      }

      const nextDisplayOrder = (latestExhibition?.display_order ?? -1) + 1
      const { data: insertedExhibition, error: insertError } = await supabase
        .from("exhibitions")
        .insert({
          type: exhibitionType,
          title: exhibitionTitle,
          slug,
          description: description || null,
          display_order: nextDisplayOrder,
        })
        .select("id")
        .single()

      if (insertError || !insertedExhibition) {
        return NextResponse.json(
          { error: mapSupabaseError(insertError?.message || "") },
          { status: 500 },
        )
      }
      exhibitionId = insertedExhibition.id
    } else {
      const { error: updateError } = await supabase
        .from("exhibitions")
        .update({
          type: exhibitionType,
          title: exhibitionTitle,
          description: description || null,
        })
        .eq("id", exhibitionId)

      if (updateError) {
        return NextResponse.json(
          { error: mapSupabaseError(updateError.message) },
          { status: 500 },
        )
      }
    }

    const { data: latestImage, error: latestImageError } = await supabase
      .from("exhibition_images")
      .select("display_order")
      .eq("exhibition_id", exhibitionId)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestImageError) {
      return NextResponse.json(
        { error: mapSupabaseError(latestImageError.message) },
        { status: 500 },
      )
    }

    const baseDisplayOrder = (latestImage?.display_order ?? -1) + 1

    const { error: primaryResetError } = await supabase
      .from("exhibition_images")
      .update({ is_primary: false })
      .eq("exhibition_id", exhibitionId)

    if (primaryResetError) {
      return NextResponse.json(
        { error: mapSupabaseError(primaryResetError.message) },
        { status: 500 },
      )
    }

    const storagePath = buildStoragePath(category, slug, file)
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })

    if (uploadError) {
      console.error("Exhibition main upload failed", {
        message: uploadError.message,
      })
      return NextResponse.json(
        { error: uploadError.message || "Upload failed. Please try again." },
        { status: 500 },
      )
    }

    const { data: imageRow, error: imageError } = await supabase
      .from("exhibition_images")
      .insert({
        exhibition_id: exhibitionId,
        storage_path: storagePath,
        caption,
        display_order: baseDisplayOrder,
        is_primary: true,
      })
      .select("id, created_at")
      .single()

    if (imageError || !imageRow) {
      await supabase.storage.from(bucketName).remove([storagePath])
      return NextResponse.json(
        { error: mapSupabaseError(imageError?.message || "") },
        { status: 500 },
      )
    }

    if (additionalFiles.length > 0) {
      const inserts: {
        exhibition_id: string
        storage_path: string
        caption: string
        display_order: number
        is_primary: boolean
      }[] = []

      for (let index = 0; index < additionalFiles.length; index += 1) {
        const additional = additionalFiles[index]
        const additionalPath = buildStoragePath(category, slug, additional)
        const { error: additionalUploadError } = await supabase.storage
          .from(bucketName)
          .upload(additionalPath, additional, {
            contentType: additional.type || "application/octet-stream",
            upsert: false,
          })
        if (additionalUploadError) {
          console.error("Exhibition additional upload failed", {
            message: additionalUploadError.message,
          })
          return NextResponse.json(
            {
              error:
                additionalUploadError.message ||
                "Upload failed. Please try again.",
            },
            { status: 500 },
          )
        }
        inserts.push({
          exhibition_id: exhibitionId,
          storage_path: additionalPath,
          caption,
          display_order: baseDisplayOrder + index + 1,
          is_primary: false,
        })
      }

      const { error: additionalInsertError } = await supabase
        .from("exhibition_images")
        .insert(inserts)

      if (additionalInsertError) {
        console.error("Exhibition additional insert failed", {
          message: additionalInsertError.message,
        })
        return NextResponse.json(
          { error: mapSupabaseError(additionalInsertError.message) },
          { status: 500 },
        )
      }
    }

    const { error: activityError } = await supabase.from("activity_log").insert({
      admin_id: user.id,
      action_type: "add",
      entity_type: "exhibition",
      entity_id: imageRow.id,
      metadata: { category },
    })

    if (activityError) {
      console.warn("Activity log insert failed", {
        message: activityError.message,
        details: activityError.details,
        hint: activityError.hint,
      })
    }

    return NextResponse.json({ ok: true, createdAt: imageRow.created_at })
  } catch (error) {
    console.error("Exhibition upload failed", { error })
    return NextResponse.json(
      { error: "Server error while uploading exhibition." },
      { status: 500 },
    )
  }
}
