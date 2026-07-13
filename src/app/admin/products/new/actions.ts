"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/dal";
import type { ProductDraft } from "@/components/admin/products/studio/types";
import {
  ProductDraftSchema,
  statusToColumns,
  zodErrorsToFieldErrors,
  type ProductFormState,
} from "@/components/admin/products/studio/validation";
import { syncProductImages } from "@/components/admin/products/studio/images";

export async function createProduct(
  _prevState: ProductFormState,
  draft: ProductDraft
): Promise<ProductFormState> {
  const parsed = ProductDraftSchema.safeParse(draft);

  if (!parsed.success) {
    return { ok: false, errors: zodErrorsToFieldErrors(parsed.error), message: "Fix the highlighted fields and try again." };
  }

  // Never redirect from here — this action is mid-mutation on data the
  // user just typed. A redirect() would unmount the page and discard it.
  const session = await getAdminUser();
  if (!session) {
    return {
      ok: false,
      message: "Your session has expired. Sign in again, then try saving once more — your changes here are still intact.",
    };
  }
  const { supabase } = session;
  const data = parsed.data;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("name", data.category)
    .single();

  if (categoryError || !category) {
    return {
      ok: false,
      errors: { category: "That category could not be found." },
      message: "Fix the highlighted fields and try again.",
    };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      slug: data.slug,
      name: data.title,
      description: data.shortDescription || null,
      price: data.price,
      original_price: data.compareAtPrice,
      cost_price: data.cost,
      category_id: category.id,
      featured: data.featured,
      tags: data.tags,
      benefits: data.benefits,
      problem_intro: data.problem || null,
      solution_body: data.solution || null,
      ...statusToColumns(data.status),
    })
    .select("id")
    .single();

  if (productError || !product) {
    if (productError?.code === "23505") {
      return {
        ok: false,
        errors: { slug: "That URL slug is already taken — try another." },
        message: "Fix the highlighted fields and try again.",
      };
    }
    console.error("[createProduct] products insert failed", productError);
    return { ok: false, message: "Something went wrong saving this product. Nothing was published." };
  }

  const hasSeoContent = Boolean(data.metaTitle || data.metaDescription || data.keywords.length > 0);

  if (hasSeoContent) {
    const { error: seoError } = await supabase.from("seo_metadata").insert({
      entity_type: "product",
      entity_id: product.id,
      title: data.metaTitle || null,
      description: data.metaDescription || null,
      keywords: data.keywords,
    });

    if (seoError) {
      console.error("[createProduct] seo_metadata insert failed, rolling back product", product.id, seoError);
      const { error: rollbackError } = await supabase.from("products").delete().eq("id", product.id);
      if (rollbackError) {
        console.error("[createProduct] rollback delete failed — orphaned product row", product.id, rollbackError);
      }
      return { ok: false, message: "Something went wrong saving this product. Nothing was published." };
    }
  }

  // Unlike the seo_metadata step above, an images failure does not roll
  // back the product — same partial-success posture ADR-016 established
  // for Edit's seo_metadata write, rather than compounding Create's
  // rollback-on-failure behavior onto a third table.
  if (data.images.length > 0) {
    const { error: imagesError } = await syncProductImages(supabase, product.id, data.images);
    if (imagesError) {
      return { ok: false, message: imagesError };
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}
