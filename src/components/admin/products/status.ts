import type { Product } from "@/types";

export type ProductStatus = "Active" | "Draft" | "Archived";

export const PRODUCT_STATUSES: ProductStatus[] = ["Active", "Draft", "Archived"];

// Derived from is_active + published_at — the exact inverse of
// statusToColumns() in src/app/admin/products/new/actions.ts, so Create
// (write) and the Products list (read) agree on the same vocabulary.
// Archived means "was live, then pulled": is_active false but
// published_at still set, distinguishing it from a Draft that was
// never published.
export function getProductStatus(product: Pick<Product, "isActive" | "publishedAt">): ProductStatus {
  if (product.isActive) return "Active";
  return product.publishedAt ? "Archived" : "Draft";
}

export const STATUS_STYLES: Record<ProductStatus, string> = {
  Active: "bg-amber-50 text-amber-700",
  Draft: "bg-stone-100 text-stone-600",
  Archived: "bg-stone-200 text-stone-500",
};
