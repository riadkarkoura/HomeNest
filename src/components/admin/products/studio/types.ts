import type { ProductStatus } from "../status";

export interface Benefit {
  id: string;
  text: string;
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
