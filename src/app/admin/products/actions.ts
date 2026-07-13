"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/dal";
import { statusToColumns } from "@/components/admin/products/studio/validation";

// Server Actions for the Products list row menu (ProductActionsMenu).
// Distinct from new/actions.ts and [id]/edit/actions.ts, which mutate a
// single in-progress Studio draft — these operate directly on an existing
// row from the table, with no form state to preserve, so each one is a
// small standalone action rather than sharing the (prevState, draft) shape
// createProduct/updateProduct use for useActionState.
//
// All actions reuse the RLS policies already granted to staff/admin:
// products_staff_update (migration 006) covers delete (soft), archive, and
// restore; products_staff_insert (migration 005) covers duplicate. No new
// migration needed — see ADR-018.

export interface ProductActionResult {
  ok: boolean;
  message?: string;
}

// Soft delete only. DATABASE.md §1 ("Soft deletes where data has value")
// specifically calls out products — a hard DELETE would break any
// order_items.product_id history. The narrow products_staff_delete policy
// from migration 005 stays scoped to Create's compensating rollback; this
// reuses products_staff_update instead, since RLS has no column-level
// restriction and setting deleted_at is just another UPDATE.
export async function deleteProduct(id: string): Promise<ProductActionResult> {
  const session = await getAdminUser();
  if (!session) {
    return { ok: false, message: "Your session has expired. Sign in again." };
  }

  // .select() on the update lets us tell "0 rows matched" (RLS silently
  // filtered the row, or the id doesn't exist — Postgres/PostgREST does
  // NOT treat this as an error) apart from a real failure. Without it,
  // a silently-blocked update looks identical to success.
  const { data, error } = await session.supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[deleteProduct]", id, error);
    return { ok: false, message: "Something went wrong deleting this product." };
  }
  if (!data || data.length === 0) {
    console.error("[deleteProduct] update matched 0 rows", id);
    return { ok: false, message: "This product could not be deleted — no matching row was updated." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

// Reuses statusToColumns("Archived") so the row menu's Archive action
// stamps is_active/published_at identically to picking "Archived" in the
// Studio's Organization section — one status→columns mapping, not two.
export async function archiveProduct(id: string): Promise<ProductActionResult> {
  const session = await getAdminUser();
  if (!session) {
    return { ok: false, message: "Your session has expired. Sign in again." };
  }

  const { data, error } = await session.supabase
    .from("products")
    .update(statusToColumns("Archived"))
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[archiveProduct]", id, error);
    return { ok: false, message: "Something went wrong archiving this product." };
  }
  if (!data || data.length === 0) {
    console.error("[archiveProduct] update matched 0 rows", id);
    return { ok: false, message: "This product could not be archived — no matching row was updated." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

// Symmetric with archiveProduct — an admin who can archive a product in
// one click should be able to undo it in one click too, without going
// through the full Edit Studio form for a single status flip. Editing the
// product and switching its status dropdown back to Active does the same
// thing; this is just the one-click shortcut for it.
export async function restoreProduct(id: string): Promise<ProductActionResult> {
  const session = await getAdminUser();
  if (!session) {
    return { ok: false, message: "Your session has expired. Sign in again." };
  }

  const { data, error } = await session.supabase
    .from("products")
    .update(statusToColumns("Active"))
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[restoreProduct]", id, error);
    return { ok: false, message: "Something went wrong restoring this product." };
  }
  if (!data || data.length === 0) {
    console.error("[restoreProduct] update matched 0 rows", id);
    return { ok: false, message: "This product could not be restored — no matching row was updated." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

export interface DuplicateProductResult extends ProductActionResult {
  id?: string;
}

const SOURCE_COLUMNS =
  "slug, name, description, price, original_price, cost_price, category_id, tags, benefits, problem_intro, solution_body";

interface SourceProductRow {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  cost_price: number | null;
  category_id: string | null;
  tags: string[];
  benefits: unknown;
  problem_intro: string | null;
  solution_body: string | null;
}

// Copies only the fields the Add Product Studio itself writes (the same
// set createProduct inserts) — never columns the Studio UI can't show or
// edit, so a duplicated product looks exactly like one an admin created by
// hand with the same values. Always lands as a Draft: a duplicate going
// live unreviewed would be a surprising default.
export async function duplicateProduct(id: string): Promise<DuplicateProductResult> {
  const session = await getAdminUser();
  if (!session) {
    return { ok: false, message: "Your session has expired. Sign in again." };
  }
  const { supabase } = session;

  const { data: source, error: fetchError } = await supabase
    .from("products")
    .select(SOURCE_COLUMNS)
    .eq("id", id)
    .single();

  if (fetchError || !source) {
    console.error("[duplicateProduct] fetch failed", id, fetchError);
    return { ok: false, message: "Could not find that product to duplicate." };
  }

  const row = source as unknown as SourceProductRow;

  // Mirrors the field set createProduct inserts. statusToColumns() is
  // spread inline (not via an intermediate variable/helper) so its return
  // type — a union across the three status branches — resolves the same
  // way it does in createProduct/updateProduct instead of collapsing into
  // an unassignable union once captured in a named value.
  const basePayload = {
    name: `${row.name} (Copy)`,
    description: row.description,
    price: row.price,
    original_price: row.original_price,
    cost_price: row.cost_price,
    category_id: row.category_id,
    featured: false,
    tags: row.tags,
    benefits: row.benefits,
    problem_intro: row.problem_intro,
    solution_body: row.solution_body,
  };

  let { data: created, error: insertError } = await supabase
    .from("products")
    .insert({ ...basePayload, slug: `${row.slug}-copy`, ...statusToColumns("Draft") })
    .select("id")
    .single();

  if (insertError?.code === "23505") {
    // "-copy" is already taken (this row has been duplicated before) —
    // one retry with a uniqueness suffix is enough; a real collision on
    // top of that would mean two duplicates in the same millisecond.
    ({ data: created, error: insertError } = await supabase
      .from("products")
      .insert({ ...basePayload, slug: `${row.slug}-copy-${Date.now().toString(36)}`, ...statusToColumns("Draft") })
      .select("id")
      .single());
  }

  if (insertError || !created) {
    console.error("[duplicateProduct] insert failed", id, insertError);
    return { ok: false, message: "Something went wrong duplicating this product." };
  }

  revalidatePath("/admin/products");
  return { ok: true, id: created.id };
}
