import { createClient } from "@/lib/supabase/server";
import { mapRow, PRODUCT_FIELDS, type ProductRow } from "./products";
import type { CartItem } from "@/types";

// Server-side only (cookie-based client) -- every read/write here is scoped
// by RLS to auth.uid(), same posture as every other authenticated-user
// query module in this app. No service-role key.

export async function getOrCreateActiveCart(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error || !created) {
    // Race: another request already created the active cart between our
    // SELECT and INSERT above -- the partial-unique index on carts blocks
    // a second one, so re-select rather than fail.
    const { data: retry } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (retry) return retry.id;
    throw error ?? new Error("Failed to get or create active cart");
  }

  return created.id;
}

const CART_ITEM_SELECT = `quantity, products ( ${PRODUCT_FIELDS} )`;

type CartItemRow = {
  quantity: number;
  products: ProductRow | null;
};

export async function getActiveCartItems(userId: string): Promise<CartItem[]> {
  try {
    const supabase = await createClient();

    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (!cart) return [];

    const { data, error } = await supabase
      .from("cart_items")
      .select(CART_ITEM_SELECT)
      .eq("cart_id", cart.id)
      .order("added_at", { ascending: true });

    if (error) throw error;

    return ((data ?? []) as unknown as CartItemRow[])
      .filter((row) => row.products !== null)
      .map((row) => ({ product: mapRow(row.products as ProductRow), quantity: row.quantity }));
  } catch (err) {
    console.error("[getActiveCartItems]", err);
    return [];
  }
}
