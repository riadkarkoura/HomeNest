import type { Product } from "@/types";

export type ProductStatus = "Active" | "Draft" | "Archived";

export const PRODUCT_STATUSES: ProductStatus[] = ["Active", "Draft", "Archived"];

// Placeholder mapping — the real `products` table has no `status` column yet.
// docs/DATABASE.md defines the future rule (`is_active` + `published_at`),
// but that isn't wired into the `Product` type until the CRUD sprint. This
// hardcoded map exists purely so the Status filter has something real to
// filter against; replace with the derived field once it lands.
const STATUS_BY_ID: Record<string, ProductStatus> = {
  "1": "Active",
  "2": "Active",
  "3": "Active",
  "4": "Draft",
  "5": "Active",
  "6": "Active",
  "7": "Draft",
  "8": "Archived",
};

export function getProductStatus(product: Product): ProductStatus {
  return STATUS_BY_ID[product.id] ?? "Active";
}

export const STATUS_STYLES: Record<ProductStatus, string> = {
  Active: "bg-amber-50 text-amber-700",
  Draft: "bg-stone-100 text-stone-600",
  Archived: "bg-stone-200 text-stone-500",
};
