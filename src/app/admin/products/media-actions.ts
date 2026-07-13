"use server";

import { getAdminUser } from "@/lib/auth/dal";

// Upload only registers the file in Storage + the media table — it does
// NOT touch product_images. A product may not have an id yet (Create is
// still an in-progress draft), so linking to a specific product happens
// later, when the Studio actually saves (see
// src/components/admin/products/studio/images.ts, called from
// new/actions.ts and [id]/edit/actions.ts). This keeps "upload a file" and
// "attach it to this product" as separate steps, matching how the rest of
// the draft already works (nothing is persisted until Save/Publish).

const MAX_BYTES = 10 * 1024 * 1024; // matches the `products` bucket's file_size_limit (migration 007)
const ALLOWED_MIME_TYPES = ["image/webp", "image/jpeg", "image/png", "image/avif"];

export interface UploadProductImageResult {
  ok: boolean;
  message?: string;
  image?: { id: string; url: string };
}

export async function uploadProductImage(formData: FormData): Promise<UploadProductImageResult> {
  const session = await getAdminUser();
  if (!session) {
    return { ok: false, message: "Your session has expired. Sign in again." };
  }
  const { supabase, user } = session;

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "No file provided." };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { ok: false, message: "Unsupported file type. Use PNG, JPG, WebP, or AVIF." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "File is too large — the limit is 10MB." };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const storagePath = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[uploadProductImage] storage upload failed", uploadError);
    return { ok: false, message: "Upload failed. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("products").getPublicUrl(storagePath);

  const { data: media, error: mediaError } = await supabase
    .from("media")
    .insert({
      uploaded_by: user.id,
      storage_bucket: "products",
      storage_path: storagePath,
      cdn_url: publicUrl,
      filename: storagePath,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select("id, cdn_url")
    .single();

  if (mediaError || !media) {
    console.error("[uploadProductImage] media insert failed, removing orphaned storage object", mediaError);
    await supabase.storage.from("products").remove([storagePath]);
    return { ok: false, message: "Upload failed. Please try again." };
  }

  return { ok: true, image: { id: media.id, url: media.cdn_url } };
}
