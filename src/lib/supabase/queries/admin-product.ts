import { createClient } from "@/lib/supabase/server";
import { getProductStatus } from "@/components/admin/products/status";
import { STUDIO_CATEGORIES, type ProductDraft } from "@/components/admin/products/studio/types";

// Server-client counterpart to admin-products.ts (which is browser-client
// only, for ProductsView's live filtering). Kept as a separate file rather
// than added to admin-products.ts so a "use client" import of that module
// never risks pulling next/headers (via the server client) into a browser
// bundle. Used once, by the Edit Product page (Server Component) to build
// the initialDraft ProductStudio needs.

type ProductRow = {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  cost_price: number | null;
  featured: boolean;
  tags: string[];
  benefits: unknown;
  problem_intro: string | null;
  solution_body: string | null;
  is_active: boolean;
  published_at: string | null;
  categories: { name: string } | null;
};

type SeoRow = {
  title: string | null;
  description: string | null;
  keywords: string[] | null;
};

type ProductImageRow = {
  media_id: string | null;
  cdn_url: string;
  sort_order: number;
};

function toPriceString(value: number | string | null): string {
  return value != null ? String(Number(value)) : "";
}

export async function getAdminProductForEdit(id: string): Promise<Partial<ProductDraft> | null> {
  try {
    const supabase = await createClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        "slug, name, description, price, original_price, cost_price, featured, tags, benefits, problem_intro, solution_body, is_active, published_at, categories ( name )"
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (productError || !product) return null;

    const row = product as unknown as ProductRow;

    const { data: seo } = await supabase
      .from("seo_metadata")
      .select("title, description, keywords")
      .eq("entity_type", "product")
      .eq("entity_id", id)
      .maybeSingle();

    const seoRow = seo as unknown as SeoRow | null;

    const { data: images } = await supabase
      .from("product_images")
      .select("media_id, cdn_url, sort_order")
      .eq("product_id", id)
      .order("sort_order", { ascending: true });

    const imageRows = (images ?? []) as unknown as ProductImageRow[];

    const category = row.categories?.name;

    return {
      title: row.name,
      slug: row.slug,
      shortDescription: row.description ?? "",
      price: toPriceString(row.price),
      compareAtPrice: toPriceString(row.original_price),
      cost: toPriceString(row.cost_price),
      featured: row.featured,
      category: category && (STUDIO_CATEGORIES as readonly string[]).includes(category) ? category : STUDIO_CATEGORIES[0],
      status: getProductStatus({ isActive: row.is_active, publishedAt: row.published_at }),
      tags: row.tags ?? [],
      problem: row.problem_intro ?? "",
      solution: row.solution_body ?? "",
      benefits: Array.isArray(row.benefits) ? (row.benefits as ProductDraft["benefits"]) : [],
      metaTitle: seoRow?.title ?? "",
      metaDescription: seoRow?.description ?? "",
      keywords: seoRow?.keywords ?? [],
      images: imageRows.map((image) => ({ id: image.media_id, url: image.cdn_url })),
    };
  } catch (err) {
    console.error("[getAdminProductForEdit]", err);
    return null;
  }
}
