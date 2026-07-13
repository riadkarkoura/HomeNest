import type { ProductStatus } from "../status";

export interface Benefit {
  id: string;
  text: string;
}

// One row per uploaded image, in display order — array position is the
// gallery sort order, and the first entry is always the primary/thumbnail
// image. No separate sortOrder/isPrimary fields on the draft itself, so
// there's nothing that can drift out of sync with the array's own order.
export interface ProductImage {
  // media.id for anything uploaded through the Studio. Null for the
  // original seed catalogue's product_images rows, which point directly
  // at Unsplash URLs with no backing media row (see CLAUDE_CONTEXT.md
  // Database Status) — kept editable/reorderable/removable like any other
  // image rather than silently dropped on the next save.
  id: string | null;
  url: string; // media.cdn_url (or the legacy Unsplash URL), denormalized for immediate <img> rendering
}

export interface ProductDraft {
  title: string;
  slug: string;
  shortDescription: string;
  price: string;
  compareAtPrice: string;
  cost: string;
  featured: boolean;
  category: string;
  status: ProductStatus;
  tags: string[];
  problem: string;
  solution: string;
  benefits: Benefit[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  images: ProductImage[];
}

// Matches the categories already present in src/lib/products.ts / the `Category` type,
// minus the storefront-only "All" option.
export const STUDIO_CATEGORIES = [
  "Kitchen",
  "Bathroom",
  "Storage",
  "Cleaning",
  "Bedroom",
  "Office",
  "Outdoor",
] as const;

export function createEmptyDraft(): ProductDraft {
  return {
    title: "",
    slug: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    cost: "",
    featured: false,
    category: STUDIO_CATEGORIES[0],
    status: "Draft",
    tags: [],
    problem: "",
    solution: "",
    benefits: [],
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    images: [],
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
