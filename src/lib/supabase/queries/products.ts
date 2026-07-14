import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import type { Product } from "@/types";

// Plain Supabase client — no cookies, no auth session.
// Products, categories, and product_images are publicly readable via RLS
// (policy: USING (true)), so the anon key is sufficient.
// This is intentionally NOT the cookie-based server client — using that
// would call cookies() and force every page that imports these functions
// into dynamic rendering, breaking SSG and generateStaticParams.
function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Exported so other query modules (e.g. cart.ts) that join through a
// different table can reuse the exact same product field list rather than
// hand-copying it and risking drift.
export const PRODUCT_FIELDS = [
  "id", "slug", "name", "description", "long_description",
  "price", "original_price", "rating", "review_count",
  "in_stock", "featured", "tags", "material", "dimensions",
  "badge", "problem_solved",
  "categories ( name )",
  "product_images ( cdn_url, sort_order, is_primary )",
].join(", ");

const SELECT = PRODUCT_FIELDS;

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  long_description: string | null;
  price: number;
  original_price: number | null;
  rating: number;
  review_count: number;
  in_stock: boolean;
  featured: boolean;
  tags: string[];
  material: string | null;
  dimensions: string | null;
  badge: string | null;
  problem_solved: string | null;
  categories: { name: string } | null;
  product_images: Array<{ cdn_url: string; sort_order: number; is_primary: boolean }>;
};

export function mapRow(row: ProductRow): Product {
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    })
    .map((img) => img.cdn_url);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    longDescription: row.long_description ?? "",
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    category: row.categories?.name ?? "Uncategorized",
    rating: Number(row.rating),
    reviewCount: row.review_count,
    inStock: row.in_stock,
    featured: row.featured,
    tags: row.tags ?? [],
    material: row.material ?? undefined,
    dimensions: row.dimensions ?? undefined,
    badge: (row.badge as Product["badge"]) ?? undefined,
    problemSolved: row.problem_solved ?? undefined,
    images,
  };
}

export async function getProducts(
  opts: { category?: string; sort?: string } = {}
): Promise<Product[]> {
  const { category, sort = "default" } = opts;
  try {
    let query = client()
      .from("products")
      .select(SELECT)
      .eq("is_active", true)
      .is("deleted_at", null);

    if (sort === "price-asc") query = query.order("price", { ascending: true });
    else if (sort === "price-desc") query = query.order("price", { ascending: false });
    else if (sort === "rating") query = query.order("rating", { ascending: false });
    else query = query.order("sort_order", { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    let products = (data as unknown as ProductRow[]).map(mapRow);
    if (category && category !== "All") {
      products = products.filter((p) => p.category === category);
    }
    return products;
  } catch (err) {
    console.error("[getProducts]", err);
    return [];
  }
}

// Wrapped in React.cache so generateMetadata and the page component
// share one DB round-trip per request instead of two.
export const getProductBySlug = cache(
  async (slug: string): Promise<{ product: Product; related: Product[] } | null> => {
    try {
      const { data, error } = await client()
        .from("products")
        .select(SELECT)
        .eq("slug", slug)
        .eq("is_active", true)
        .is("deleted_at", null)
        .single();

      if (error || !data) return null;

      const product = mapRow(data as unknown as ProductRow);

      const { data: others } = await client()
        .from("products")
        .select(SELECT)
        .eq("is_active", true)
        .is("deleted_at", null)
        .neq("id", product.id)
        .order("sort_order", { ascending: true })
        .limit(10);

      const related = ((others ?? []) as unknown as ProductRow[])
        .map(mapRow)
        .filter((p) => p.category === product.category)
        .slice(0, 3);

      return { product, related };
    } catch (err) {
      console.error("[getProductBySlug]", err);
      return null;
    }
  }
);

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await client()
      .from("products")
      .select(SELECT)
      .eq("is_active", true)
      .eq("featured", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return ((data ?? []) as unknown as ProductRow[]).map(mapRow);
  } catch (err) {
    console.error("[getFeaturedProducts]", err);
    return [];
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const { data, error } = await client()
      .from("products")
      .select("slug")
      .eq("is_active", true)
      .is("deleted_at", null);

    if (error) throw error;
    return (data ?? []).map((r) => (r as unknown as { slug: string }).slug);
  } catch (err) {
    console.error("[getAllProductSlugs]", err);
    return [];
  }
}
