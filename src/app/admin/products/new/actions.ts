"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/dal";
import { STUDIO_CATEGORIES, type ProductDraft } from "@/components/admin/products/studio/types";

const priceField = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v !== "" && Number.isFinite(Number(v)) && Number(v) > 0, {
      message: `${label} must be a number greater than 0.`,
    })
    .transform(Number);

const optionalPriceField = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || (Number.isFinite(Number(v)) && Number(v) > 0), {
      message: `${label} must be a number greater than 0.`,
    })
    .transform((v) => (v === "" ? null : Number(v)));

const ProductDraftSchema = z.object({
  title: z.string().trim().min(1, "Product name is required."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  shortDescription: z.string().trim(),
  price: priceField("Price"),
  compareAtPrice: optionalPriceField("Compare price"),
  cost: optionalPriceField("Cost"),
  featured: z.boolean(),
  category: z.enum(STUDIO_CATEGORIES, { message: "Choose a valid category." }),
  status: z.enum(["Active", "Draft", "Archived"]),
  tags: z.array(z.string()),
  problem: z.string().trim(),
  solution: z.string().trim(),
  benefits: z.array(z.object({ id: z.string(), text: z.string().trim() })),
  metaTitle: z.string().trim().max(60, "Meta title must be 60 characters or fewer."),
  metaDescription: z.string().trim().max(160, "Meta description must be 160 characters or fewer."),
  keywords: z.array(z.string()),
});

export interface CreateProductState {
  ok: boolean;
  errors?: Partial<Record<keyof ProductDraft, string>>;
  message?: string;
}

// Maps the Studio's 3-state UI vocabulary onto the DB's is_active +
// published_at model (there's no distinct "archived" column — Archived
// means "was live, now pulled", so published_at stays set).
function statusToColumns(status: ProductDraft["status"]) {
  if (status === "Active") return { is_active: true, published_at: new Date().toISOString() };
  if (status === "Archived") return { is_active: false, published_at: new Date().toISOString() };
  return { is_active: false, published_at: null };
}

export async function createProduct(
  _prevState: CreateProductState,
  draft: ProductDraft
): Promise<CreateProductState> {
  const parsed = ProductDraftSchema.safeParse(draft);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errors: Partial<Record<keyof ProductDraft, string>> = {};
    for (const [key, messages] of Object.entries(fieldErrors)) {
      if (messages?.[0]) errors[key as keyof ProductDraft] = messages[0];
    }
    return { ok: false, errors, message: "Fix the highlighted fields and try again." };
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

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}
