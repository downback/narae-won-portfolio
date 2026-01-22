import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/server"

const bucketName = "site-assets"

const buildStoragePath = (file: File) => {
  const extension = file.name.split(".").pop() || ""
  const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, "")
  const suffix = safeExtension ? `.${safeExtension}` : ".pdf"
  return `works/${Date.now()}-${crypto.randomUUID()}${suffix}`
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
      return NextResponse.json({ error: "Missing PDF file." }, { status: 400 })
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF uploads are allowed." },
        { status: 400 }
      )
    }

    const storagePath = buildStoragePath(file)
    const { data: siteContent } = await supabase
      .from("site_content")
      .select("works_pdf_asset_id")
      .eq("singleton_id", true)
      .maybeSingle()

    const previousAssetId = siteContent?.works_pdf_asset_id
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
        contentType: file.type || "application/pdf",
        upsert: false,
      })

    if (uploadError) {
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
        asset_kind: "works_pdf",
        mime_type: file.type || "application/pdf",
        byte_size: file.size,
        created_by: user.id,
      })
      .select("id")
      .single()

    if (assetError) {
      await supabase.storage.from(bucketName).remove([storagePath])
      return NextResponse.json(
        { error: "Unable to save asset metadata." },
        { status: 500 }
      )
    }

    const updatedAt = new Date().toISOString()
    const { data: updatedContent, error: worksUpdateError } = await supabase
      .from("site_content")
      .update({
        works_pdf_asset_id: assetRow.id,
        updated_by: user.id,
        updated_at: updatedAt,
      })
      .eq("singleton_id", true)
      .select("works_pdf_asset_id")
      .maybeSingle()

    if (worksUpdateError) {
      await supabase.storage.from(bucketName).remove([storagePath])
      await supabase.from("assets").delete().eq("id", assetRow.id)
      return NextResponse.json(
        { error: "Unable to update works metadata." },
        { status: 500 }
      )
    }

    if (!updatedContent) {
      const { data: heroAsset } = await supabase
        .from("assets")
        .select("id")
        .eq("asset_kind", "hero_media")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!heroAsset?.id) {
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(storagePath)
        const versionedUrl = data.publicUrl
          ? `${data.publicUrl}?v=${encodeURIComponent(updatedAt)}`
          : undefined

        return NextResponse.json({
          publicUrl: versionedUrl,
          updatedAt,
          warning:
            "Site content singleton is missing. Works PDF uploaded, but metadata was not updated yet.",
        })
      }

      const { error: insertError } = await supabase.from("site_content").insert({
        singleton_id: true,
        intro_text: "",
        statement_text: "",
        hero_asset_id: heroAsset.id,
        works_pdf_asset_id: assetRow.id,
        updated_by: user.id,
        updated_at: updatedAt,
      })

      if (insertError) {
        await supabase.storage.from(bucketName).remove([storagePath])
        await supabase.from("assets").delete().eq("id", assetRow.id)
        return NextResponse.json(
          { error: "Unable to create site content." },
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

    return NextResponse.json({ publicUrl: versionedUrl, updatedAt })
  } catch (error) {
    console.error("Works PDF upload failed", { error })
    return NextResponse.json(
      { error: "Server error while uploading PDF." },
      { status: 500 }
    )
  }
}
