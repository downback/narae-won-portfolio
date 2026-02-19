"use server"

import { NextResponse } from "next/server"
import { exhibitionCategories, type ExhibitionCategory, siteAssetsBucketName } from "@/lib/constants"
import {
  requireAdminUser,
} from "@/lib/server/adminRoute"
import { executeExhibitionCreateFlow } from "@/lib/server/exhibitionCreate"
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

    const createResult = await executeExhibitionCreateFlow({
      supabase,
      bucketName,
      category,
      slug,
      exhibitionTitle,
      caption,
      description,
      mainFile: file,
      additionalFiles,
    })

    if (!createResult.ok) {
      return NextResponse.json(
        { error: createResult.error },
        { status: createResult.status },
      )
    }

    const { error: activityError } = await supabase.from("activity_log").insert({
      admin_id: user.id,
      action_type: "add",
      entity_type: "exhibition",
      entity_id: createResult.imageId,
      metadata: { category },
    })

    if (activityError) {
      console.warn("Activity log insert failed", {
        message: activityError.message,
        details: activityError.details,
        hint: activityError.hint,
      })
    }

    return NextResponse.json({ ok: true, createdAt: createResult.createdAt })
  } catch (error) {
    console.error("Exhibition upload failed", { error })
    return NextResponse.json(
      { error: "Server error while uploading exhibition." },
      { status: 500 },
    )
  }
}
