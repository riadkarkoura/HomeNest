import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";
import type { ProductStatus } from "@/components/admin/products/status";

// Admin-only read path — separate from src/lib/supabase/queries/products.ts
// (the public storefront module) because visibility rules differ: this one
// relies on the products_staff_select_all RLS policy (all products,
// regardless of is_active) rather than the public "active only" policy, and
// needs fields (is_active, published_at) the storefront never reads.
// Uses the browser client since it's called from ProductsView on every
// filter/page change — RLS is enforced identically to the server client,
// same session cookie, no service-role key.

const SELECT = [
  "id", "slug", "name", "description", "long_description",
  "price", "original_price", "rating", "review_count",
  "in_stock", "featured", "tags", "material", "dimensions",
  "badge", "problem_solved", "is_active", "published_at",
  "categories ( name )",
  "product_images ( cdn_url, sort_order, is_primary )",
].join(", ");

type AdminProductRow = {
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
  is_active: boolean;
  published_at: string | null;
  categories: { name: string } | null;
  product_images: Array<{ cdn_url: string; sort_order: number; is_primary: boolean }>;
};

function mapRow(row: AdminProductRow): Product {
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
    isActive: row.is_active,
    publishedAt: row.published_at,
  };
}

export interface AdminProductsParams {
  page: number; // 0-based
  pageSize: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  featuredOnly?: boolean;
}

export interface AdminProductsResult {
  products: Product[];
  totalCount: number;
}

export async function getAdminProducts(params: AdminProductsParams): Promise<AdminProductsResult> {
  const { page, pageSize, search, categoryId, status, featuredOnly } = params;
  try {
    const supabase = createClient();

    let query = supabase.from("products").select(SELECT, { count: "exact" }).is("deleted_at", null);

    if (search) query = query.ilike("name", `%${search}%`);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (featuredOnly) query = query.eq("featured", true);
    if (status === "Active") query = query.eq("is_active", true).not("published_at", "is", null);
    else if (status === "Draft") query = query.eq("is_active", false).is("published_at", null);
    else if (status === "Archived") query = query.eq("is_active", false).not("published_at", "is", null);

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      products: ((data ?? []) as unknown as AdminProductRow[]).map(mapRow),
      totalCount: count ?? 0,
    };
  } catch (err) {
    console.error("[getAdminProducts]", err);
    return { products: [], totalCount: 0 };
  }
}

export interface AdminCategory {
  id: string;
  name: string;
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("categories").select("id, name").order("name");
    if (error) throw error;
    return (data ?? []) as AdminCategory[];
  } catch (err) {
    console.error("[getAdminCategories]", err);
    return [];
  }
}
