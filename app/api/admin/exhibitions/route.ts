"use server"

import { NextResponse } from "next/server"
import { exhibitionCategories, type ExhibitionCategory, siteAssetsBucketName } from "@/lib/constants"
import { buildStoragePathWithPrefix } from "@/lib/storage"
import {
  mapSupabaseErrorMessage,
  requireAdminUser,
} from "@/lib/server/adminRoute"
import {
  removeStoragePathsSafely,
  uploadStorageFile,
  uploadStorageFilesWithRollback,
} from "@/lib/server/storageTransaction"
import { supabaseServer } from "@/lib/server"
import { validateImageUploadFile } from "@/lib/uploadValidation"

const bucketName = siteAssetsBucketName

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer()
    const { user, errorResponse } = await requireAdminUser(supabase)
    if (!user || errorResponse) {
      return errorResponse
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

    const isAllowedCategory = (value: string): value is ExhibitionCategory =>
      exhibitionCategories.includes(value as ExhibitionCategory)

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing image file." },
        { status: 400 },
      )
    }

    if (!category || !isAllowedCategory(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 })
    }

    const mainImageValidationError = validateImageUploadFile(file)
    if (mainImageValidationError) {
      return NextResponse.json({ error: mainImageValidationError }, { status: 400 })
    }

    const invalidAdditionalImage = additionalFiles.find(
      (additional) => validateImageUploadFile(additional) !== null,
    )
    if (invalidAdditionalImage) {
      const additionalValidationError = validateImageUploadFile(invalidAdditionalImage)
      return NextResponse.json(
        { error: additionalValidationError || "Only image uploads are allowed." },
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
        {
          error: mapSupabaseErrorMessage({
            message: existingError.message,
            tableHint: "exhibitions",
            fallbackMessage: "Unable to save exhibition entry.",
          }),
        },
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
          {
            error: mapSupabaseErrorMessage({
              message: latestError.message,
              tableHint: "exhibitions",
              fallbackMessage: "Unable to save exhibition entry.",
            }),
          },
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
          {
            error: mapSupabaseErrorMessage({
              message: insertError?.message || "",
              tableHint: "exhibitions",
              fallbackMessage: "Unable to save exhibition entry.",
            }),
          },
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
          {
            error: mapSupabaseErrorMessage({
              message: updateError.message,
              tableHint: "exhibitions",
              fallbackMessage: "Unable to save exhibition entry.",
            }),
          },
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
        {
          error: mapSupabaseErrorMessage({
            message: latestImageError.message,
            tableHint: "exhibition_images",
            fallbackMessage: "Unable to save exhibition entry.",
          }),
        },
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
        {
          error: mapSupabaseErrorMessage({
            message: primaryResetError.message,
            tableHint: "exhibition_images",
            fallbackMessage: "Unable to save exhibition entry.",
          }),
        },
        { status: 500 },
      )
    }

    const storagePath = buildStoragePathWithPrefix({
      prefix: `${category}/${slug}`,
      file,
    })
    const { error: uploadError } = await uploadStorageFile({
      supabase,
      bucketName,
      storagePath,
      file,
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
      await removeStoragePathsSafely({
        supabase,
        bucketName,
        storagePaths: [storagePath],
        logContext: "Exhibition create main image rollback",
      })
      return NextResponse.json(
        {
          error: mapSupabaseErrorMessage({
            message: imageError?.message || "",
            tableHint: "exhibition_images",
            fallbackMessage: "Unable to save exhibition entry.",
          }),
        },
        { status: 500 },
      )
    }

    if (additionalFiles.length > 0) {
      const additionalUploadItems = additionalFiles.map((additional, index) => ({
        file: additional,
        storagePath: buildStoragePathWithPrefix({
          prefix: `${category}/${slug}`,
          file: additional,
        }),
        displayOrder: baseDisplayOrder + index + 1,
      }))

      const { error: additionalUploadError } = await uploadStorageFilesWithRollback({
        supabase,
        bucketName,
        items: additionalUploadItems.map((item) => ({
          storagePath: item.storagePath,
          file: item.file,
        })),
        logContext: "Exhibition create additional images rollback",
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

      const inserts: {
        exhibition_id: string
        storage_path: string
        caption: string
        display_order: number
        is_primary: boolean
      }[] = []

      for (const additionalItem of additionalUploadItems) {
        inserts.push({
          exhibition_id: exhibitionId,
          storage_path: additionalItem.storagePath,
          caption,
          display_order: additionalItem.displayOrder,
          is_primary: false,
        })
      }

      const { error: additionalInsertError } = await supabase
        .from("exhibition_images")
        .insert(inserts)

      if (additionalInsertError) {
        await removeStoragePathsSafely({
          supabase,
          bucketName,
          storagePaths: additionalUploadItems.map((item) => item.storagePath),
          logContext: "Exhibition create additional insert rollback",
        })
        console.error("Exhibition additional insert failed", {
          message: additionalInsertError.message,
        })
        return NextResponse.json(
          {
            error: mapSupabaseErrorMessage({
              message: additionalInsertError.message,
              tableHint: "exhibition_images",
              fallbackMessage: "Unable to save exhibition entry.",
            }),
          },
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
