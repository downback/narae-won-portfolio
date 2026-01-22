import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

const bucketName = "site-assets"

const mapSupabaseError = (message: string) => {
  const normalizedMessage = message.toLowerCase()
  if (normalizedMessage.includes("does not exist")) {
    return "Required tables are missing. Check site_content and assets."
  }
  if (normalizedMessage.includes("permission") || normalizedMessage.includes("rls")) {
    return "Permission denied. Check RLS policies for site_content/assets."
  }
  return "Unable to update hero metadata."
}

type SupabaseErrorPayload = {
  message?: string
  details?: string
  hint?: string
}

const getErrorMeta = (error: SupabaseErrorPayload) => ({
  message: error.message,
  details: error.details,
  hint: error.hint,
})

const buildErrorResponse = (error: SupabaseErrorPayload) => {
  if (process.env.NODE_ENV !== "production") {
    return {
      error: error.message || "Unexpected error.",
      details: error.details,
      hint: error.hint,
    }
  }
  return { error: "Server error while uploading image." }
}

const buildStoragePath = (file: File) => {
  const extension = file.name.split(".").pop() || ""
  const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, "")
  const suffix = safeExtension ? `.${safeExtension}` : ""
  return `hero/${Date.now()}-${crypto.randomUUID()}${suffix}`
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

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing image file." },
        { status: 400 }
      )
    }

    if (file.type && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed." },
        { status: 400 }
      )
    }

    const storagePath = buildStoragePath(file)
    const { data: siteContent, error: siteContentError } = await supabase
      .from("site_content")
      .select("hero_asset_id")
      .eq("singleton_id", true)
      .maybeSingle()

    if (siteContentError) {
      console.error("Site content fetch failed", {
        ...getErrorMeta(siteContentError),
      })
      return NextResponse.json(
        { error: mapSupabaseError(siteContentError.message) },
        { status: 500 }
      )
    }

    const previousAssetId = siteContent?.hero_asset_id
    const { data: previousAsset } = previousAssetId
      ? await supabase
          .from("assets")
          .select("path")
          .eq("id", previousAssetId)
          .maybeSingle()
      : { data: null }
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })

    if (uploadError) {
      console.error("Hero upload failed", {
        message: uploadError.message,
      })
      return NextResponse.json(
        { error: "Upload failed. Please try again." },
        { status: 500 }
      )
    }

    const { data: assetRow, error: assetError } = await supabase
      .from("assets")
      .insert({
        bucket: bucketName,
        path: storagePath,
        asset_kind: "hero_media",
        mime_type: file.type || "application/octet-stream",
        byte_size: file.size,
        created_by: user.id,
      })
      .select("id")
      .single()

    if (assetError) {
      console.error("Asset insert failed", {
        ...getErrorMeta(assetError),
      })
      await supabase.storage.from(bucketName).remove([storagePath])
      return NextResponse.json(
        { error: "Unable to save asset metadata." },
        { status: 500 }
      )
    }

    const updatedAt = new Date().toISOString()
    const animationEnabled =
      formData.get("animationEnabled")?.toString() !== "false"
    const { data: updatedContent, error: siteContentUpdateError } = await supabase
      .from("site_content")
      .update({
        hero_asset_id: assetRow.id,
        updated_by: user.id,
        hero_animation_enabled: animationEnabled,
        updated_at: updatedAt,
      })
      .eq("singleton_id", true)
      .select("hero_asset_id")
      .maybeSingle()

    if (siteContentUpdateError) {
      console.error("Hero metadata update failed", {
        ...getErrorMeta(siteContentUpdateError),
      })
      await supabase.storage.from(bucketName).remove([storagePath])
      await supabase.from("assets").delete().eq("id", assetRow.id)
      return NextResponse.json(
        { error: mapSupabaseError(siteContentUpdateError.message) },
        { status: 500 }
      )
    }

    if (!updatedContent) {
      const { data: worksAsset } = await supabase
        .from("assets")
        .select("id")
        .eq("asset_kind", "works_pdf")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!worksAsset?.id) {
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(storagePath)
        const versionedUrl = data.publicUrl
          ? `${data.publicUrl}?v=${encodeURIComponent(updatedAt)}`
          : undefined

        return NextResponse.json({
          publicUrl: versionedUrl,
          warning:
            "Site content singleton is missing. Hero uploaded, but metadata was not updated yet.",
        })
      }

      const { error: insertError } = await supabase.from("site_content").insert({
        singleton_id: true,
        intro_text: "",
        statement_text: "",
        hero_asset_id: assetRow.id,
        works_pdf_asset_id: worksAsset.id,
        updated_by: user.id,
        hero_animation_enabled: animationEnabled,
        updated_at: updatedAt,
      })

      if (insertError) {
        await supabase.storage.from(bucketName).remove([storagePath])
        await supabase.from("assets").delete().eq("id", assetRow.id)
        return NextResponse.json(
          { error: mapSupabaseError(insertError.message) },
          { status: 500 }
        )
      }
    }

    const previousPath = previousAsset?.path
    if (previousPath && previousPath !== storagePath) {
      await supabase.storage.from(bucketName).remove([previousPath])
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath)

    const versionedUrl = data.publicUrl
      ? `${data.publicUrl}?v=${encodeURIComponent(updatedAt)}`
      : undefined

    return NextResponse.json({ publicUrl: versionedUrl })
  } catch (error) {
    console.error("Hero image upload failed", { error })
    if (error && typeof error === "object") {
      return NextResponse.json(buildErrorResponse(error), { status: 500 })
    }
    return NextResponse.json(
      { error: "Server error while uploading image." },
      { status: 500 }
    )
  }
}
