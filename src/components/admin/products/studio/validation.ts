import { z } from "zod";
import { STUDIO_CATEGORIES, type ProductDraft } from "./types";

// Shared between createProduct and updateProduct so both actions validate
// (and map status) identically — extracted here rather than duplicated so
// "preserve validation" means the same validation, not two copies that can
// drift apart.

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

export const ProductDraftSchema = z.object({
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

export interface ProductFormState {
  ok: boolean;
  errors?: Partial<Record<keyof ProductDraft, string>>;
  message?: string;
}

export function zodErrorsToFieldErrors(
  error: z.ZodError<z.infer<typeof ProductDraftSchema>>
): Partial<Record<keyof ProductDraft, string>> {
  const fieldErrors = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const errors: Partial<Record<keyof ProductDraft, string>> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) errors[key as keyof ProductDraft] = messages[0];
  }
  return errors;
}

// Maps the Studio's 3-state UI vocabulary onto the DB's is_active +
// published_at model (there's no distinct "archived" column — Archived
// means "was live, now pulled", so published_at stays set).
export function statusToColumns(status: ProductDraft["status"]) {
  if (status === "Active") return { is_active: true, published_at: new Date().toISOString() };
  if (status === "Archived") return { is_active: false, published_at: new Date().toISOString() };
  return { is_active: false, published_at: null };
}
