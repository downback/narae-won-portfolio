import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

const bucketName = "site-assets"
const allowedCategories = ["solo-exhibitions", "group-exhibitions"] as const

type RouteContext = {
  params: Promise<{ id: string }>
}

const isUuid = (value: string) =>
  /^[0-9a-fA-F-]{36}$/.test(value) && !value.includes("undefined")

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

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 })
    }

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

    if (!category || !isAllowedCategory(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 })
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

    const hasInvalidAdditional = additionalFiles.some(
      (additional) => additional.type && !additional.type.startsWith("image/"),
    )
    if (hasInvalidAdditional) {
      return NextResponse.json(
        { error: "Only image uploads are allowed." },
        { status: 400 },
      )
    }

    const { data: imageRow, error: imageError } = await supabase
      .from("exhibition_images")
      .select("storage_path, exhibition_id")
      .eq("id", id)
      .maybeSingle()

    if (imageError || !imageRow?.storage_path || !imageRow.exhibition_id) {
      return NextResponse.json(
        { error: "Exhibition not found." },
        { status: 404 },
      )
    }

    const { data: exhibition, error: exhibitionError } = await supabase
      .from("exhibitions")
      .select("id")
      .eq("id", imageRow.exhibition_id)
      .maybeSingle()

    if (exhibitionError || !exhibition?.id) {
      return NextResponse.json(
        { error: "Exhibition not found." },
        { status: 404 },
      )
    }

    const exhibitionType = category === "solo-exhibitions" ? "solo" : "group"
    const slug = toSlug(exhibitionTitle)
    if (!slug) {
      return NextResponse.json(
        { error: "Exhibition title is required." },
        { status: 400 },
      )
    }

    const { error: exhibitionUpdateError } = await supabase
      .from("exhibitions")
      .update({
        type: exhibitionType,
        title: exhibitionTitle,
        slug,
        description: description || null,
      })
      .eq("id", exhibition.id)

    if (exhibitionUpdateError) {
      return NextResponse.json(
        { error: exhibitionUpdateError.message },
        { status: 500 },
      )
    }

    let nextStoragePath = imageRow.storage_path
    if (file instanceof File) {
      if (file.type && !file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image uploads are allowed." },
          { status: 400 },
        )
      }
      nextStoragePath = buildStoragePath(category, slug, file)
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(nextStoragePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        })

      if (uploadError) {
        return NextResponse.json(
          { error: "Upload failed. Please try again." },
          { status: 500 },
        )
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("exhibition_images")
      .update({
        storage_path: nextStoragePath,
        caption,
      })
      .eq("id", id)
      .select("id, created_at, storage_path")
      .single()

    if (updateError || !updated) {
      if (nextStoragePath !== imageRow.storage_path) {
        await supabase.storage.from(bucketName).remove([nextStoragePath])
      }
      return NextResponse.json(
        { error: updateError?.message || "Unable to update exhibition." },
        { status: 500 },
      )
    }

    if (nextStoragePath !== imageRow.storage_path) {
      await supabase.storage.from(bucketName).remove([imageRow.storage_path])
    }

    if (additionalFiles.length > 0) {
      const { data: latestImage, error: latestImageError } = await supabase
        .from("exhibition_images")
        .select("display_order")
        .eq("exhibition_id", imageRow.exhibition_id)
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestImageError) {
        return NextResponse.json(
          { error: latestImageError.message },
          { status: 500 },
        )
      }

      const baseDisplayOrder = (latestImage?.display_order ?? -1) + 1
      const uploadedPaths: string[] = []
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
          for (const path of uploadedPaths) {
            await supabase.storage.from(bucketName).remove([path])
          }
          return NextResponse.json(
            {
              error:
                additionalUploadError.message ||
                "Upload failed. Please try again.",
            },
            { status: 500 },
          )
        }
        uploadedPaths.push(additionalPath)
        inserts.push({
          exhibition_id: imageRow.exhibition_id,
          storage_path: additionalPath,
          caption,
          display_order: baseDisplayOrder + index,
          is_primary: false,
        })
      }

      const { error: additionalInsertError } = await supabase
        .from("exhibition_images")
        .insert(inserts)

      if (additionalInsertError) {
        for (const path of uploadedPaths) {
          await supabase.storage.from(bucketName).remove([path])
        }
        return NextResponse.json(
          { error: additionalInsertError.message },
          { status: 500 },
        )
      }
    }

    const { error: activityError } = await supabase
      .from("activity_log")
      .insert({
        admin_id: user.id,
        action_type: "update",
        entity_type: "exhibition",
        entity_id: updated.id,
        metadata: { category },
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
    console.error("Exhibition update failed", { error })
    return NextResponse.json(
      { error: "Server error while updating exhibition." },
      { status: 500 },
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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { data: imageRow, error: imageError } = await supabase
      .from("exhibition_images")
      .select("storage_path, exhibition_id")
      .eq("id", id)
      .maybeSingle()

    if (imageError || !imageRow?.storage_path || !imageRow.exhibition_id) {
      return NextResponse.json(
        { error: "Exhibition not found." },
        { status: 404 },
      )
    }

    const { data: exhibitionRow, error: exhibitionError } = await supabase
      .from("exhibitions")
      .select("type")
      .eq("id", imageRow.exhibition_id)
      .maybeSingle()

    if (exhibitionError) {
      console.error("Failed to load exhibition for delete", {
        message: exhibitionError.message,
      })
    }

    const { error: deleteError } = await supabase
      .from("exhibition_images")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message || "Unable to delete exhibition." },
        { status: 500 },
      )
    }

    await supabase.storage.from(bucketName).remove([imageRow.storage_path])

    const { count: remainingCount, error: remainingError } = await supabase
      .from("exhibition_images")
      .select("id", { count: "exact", head: true })
      .eq("exhibition_id", imageRow.exhibition_id)

    if (remainingError) {
      console.error("Failed to count remaining exhibition images", {
        message: remainingError.message,
      })
    }

    if (!remainingError && (remainingCount ?? 0) === 0) {
      const { error: exhibitionDeleteError } = await supabase
        .from("exhibitions")
        .delete()
        .eq("id", imageRow.exhibition_id)

      if (exhibitionDeleteError) {
        console.error("Failed to delete empty exhibition", {
          message: exhibitionDeleteError.message,
        })
      }
    }

    const { error: activityError } = await supabase
      .from("activity_log")
      .insert({
        admin_id: user.id,
        action_type: "delete",
        entity_type: "exhibition",
        entity_id: id,
        metadata: {
          category:
            exhibitionRow?.type === "solo"
              ? "solo-exhibitions"
              : exhibitionRow?.type === "group"
                ? "group-exhibitions"
                : "exhibitions",
        },
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
    console.error("Exhibition delete failed", { error })
    return NextResponse.json(
      { error: "Server error while deleting exhibition." },
      { status: 500 },
    )
  }
}
