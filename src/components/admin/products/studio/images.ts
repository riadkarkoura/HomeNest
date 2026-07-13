import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductDraft } from "./types";

// Shared by createProduct and updateProduct (src/app/admin/products/
// new/actions.ts and [id]/edit/actions.ts): replaces a product's entire
// product_images set with the draft's current image list on every save,
// rather than diffing add/remove/reorder against what's already in the
// database. Same "keep it simple, no transaction" posture as
// ADR-015/ADR-016 — see ADR-018. Delete-then-insert also sidesteps the
// partial unique index on is_primary: the table is fully cleared before
// the fresh batch insert, so two rows can never claim is_primary=true for
// the same product at once, however the images get reordered.
//
// Only removes/replaces product_images link rows — the underlying
// Storage objects and media rows an image points to are left alone, so
// removing an image from a draft (without deleting it via the Studio
// entirely) never destroys the uploaded file.
export async function syncProductImages(
  supabase: SupabaseClient,
  productId: string,
  images: ProductDraft["images"]
): Promise<{ error: string | null }> {
  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    console.error("[syncProductImages] delete failed", productId, deleteError);
    return { error: "Product details were saved, but images failed to update — please try again." };
  }

  if (images.length === 0) return { error: null };

  const rows = images.map((image, index) => ({
    product_id: productId,
    media_id: image.id,
    cdn_url: image.url,
    sort_order: index,
    is_primary: index === 0,
  }));

  const { error: insertError } = await supabase.from("product_images").insert(rows);

  if (insertError) {
    console.error("[syncProductImages] insert failed", productId, insertError);
    return { error: "Product details were saved, but images failed to update — please try again." };
  }

  return { error: null };
}
