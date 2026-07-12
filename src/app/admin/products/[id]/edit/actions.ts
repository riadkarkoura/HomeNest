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

export async function updateProduct(
  id: string,
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

  const { error: productError } = await supabase
    .from("products")
    .update({
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
    .eq("id", id);

  if (productError) {
    if (productError.code === "23505") {
      return {
        ok: false,
        errors: { slug: "That URL slug is already taken — try another." },
        message: "Fix the highlighted fields and try again.",
      };
    }
    console.error("[updateProduct] products update failed", productError);
    return { ok: false, message: "Something went wrong saving this product. Nothing was changed." };
  }

  const hasSeoContent = Boolean(data.metaTitle || data.metaDescription || data.keywords.length > 0);

  if (hasSeoContent) {
    const { error: seoError } = await supabase
      .from("seo_metadata")
      .upsert(
        {
          entity_type: "product",
          entity_id: id,
          title: data.metaTitle || null,
          description: data.metaDescription || null,
          keywords: data.keywords,
        },
        { onConflict: "entity_type,entity_id" }
      );

    if (seoError) {
      // Unlike Create, there's no cheap rollback here — the product row
      // already existed before this edit, so "undo" would mean restoring
      // its exact previous values, not deleting a row that didn't exist a
      // moment ago. Report the true partial state instead of pretending
      // to revert it.
      console.error("[updateProduct] seo_metadata upsert failed", id, seoError);
      return {
        ok: false,
        message: "Product details were saved, but SEO information failed to save — please try again.",
      };
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}
