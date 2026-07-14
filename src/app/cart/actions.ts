"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getUser } from "@/lib/auth/dal";
import { getOrCreateActiveCart, getActiveCartItems } from "@/lib/supabase/queries/cart";
import type { CartItem } from "@/types";

export interface LocalCartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

// Shared by syncAddItem and mergeGuestCart -- both need "add this many to
// whatever's already there, or create the row if it isn't". A single
// UPDATE ... SET quantity = quantity + $delta is atomic per-row even
// without a transaction; the only race is two concurrent first-inserts for
// the same product, handled by falling back to an update on conflict. Same
// "no transaction until it's actually needed" posture as ADR-015/016/021.
async function incrementCartItem(
  supabase: SupabaseClient,
  cartId: string,
  productId: string,
  variantId: string | null,
  quantityDelta: number,
  source: string
) {
  let existing = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId);
  existing = variantId ? existing.eq("variant_id", variantId) : existing.is("variant_id", null);

  const { data: existingRow } = await existing.maybeSingle();

  if (existingRow) {
    await supabase
      .from("cart_items")
      .update({ quantity: existingRow.quantity + quantityDelta })
      .eq("id", existingRow.id);
    return;
  }

  const { error } = await supabase.from("cart_items").insert({
    cart_id: cartId,
    product_id: productId,
    variant_id: variantId,
    quantity: quantityDelta,
    source,
  });

  if (error) {
    // Lost the race to a concurrent insert -- fall back to an update.
    let retry = supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId);
    retry = variantId ? retry.eq("variant_id", variantId) : retry.is("variant_id", null);
    const { data: retryRow } = await retry.maybeSingle();
    if (retryRow) {
      await supabase
        .from("cart_items")
        .update({ quantity: retryRow.quantity + quantityDelta })
        .eq("id", retryRow.id);
    }
  }
}

export async function syncAddItem(
  productId: string,
  variantId: string | null,
  quantity: number,
  source: string = "web"
): Promise<{ ok: boolean }> {
  const session = await getUser();
  if (!session) return { ok: false };

  const cartId = await getOrCreateActiveCart(session.user.id);
  await incrementCartItem(session.supabase, cartId, productId, variantId, quantity, source);
  return { ok: true };
}

export async function syncUpdateQuantity(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<{ ok: boolean }> {
  const session = await getUser();
  if (!session) return { ok: false };

  const cartId = await getOrCreateActiveCart(session.user.id);

  let query = session.supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId)
    .eq("product_id", productId);
  query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);

  if (quantity <= 0) {
    await query;
    return { ok: true };
  }

  let existing = session.supabase
    .from("cart_items")
    .select("id")
    .eq("cart_id", cartId)
    .eq("product_id", productId);
  existing = variantId ? existing.eq("variant_id", variantId) : existing.is("variant_id", null);
  const { data: existingRow } = await existing.maybeSingle();

  if (existingRow) {
    await session.supabase.from("cart_items").update({ quantity }).eq("id", existingRow.id);
  } else {
    await session.supabase
      .from("cart_items")
      .insert({ cart_id: cartId, product_id: productId, variant_id: variantId, quantity, source: "web" });
  }

  return { ok: true };
}

export async function syncRemoveItem(
  productId: string,
  variantId: string | null
): Promise<{ ok: boolean }> {
  const session = await getUser();
  if (!session) return { ok: false };

  const cartId = await getOrCreateActiveCart(session.user.id);

  let query = session.supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId)
    .eq("product_id", productId);
  query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
  await query;

  return { ok: true };
}

export async function syncClearCart(): Promise<{ ok: boolean }> {
  const session = await getUser();
  if (!session) return { ok: false };

  const cartId = await getOrCreateActiveCart(session.user.id);
  await session.supabase.from("cart_items").delete().eq("cart_id", cartId);

  return { ok: true };
}

// Called once, right after a guest with a local cart signs in -- folds the
// local items into the user's server cart (summing quantities for anything
// already there) and returns the merged result for the client to hydrate
// its local state from.
export async function mergeGuestCart(localItems: LocalCartItem[]): Promise<CartItem[]> {
  const session = await getUser();
  if (!session) return [];

  const cartId = await getOrCreateActiveCart(session.user.id);

  for (const item of localItems) {
    if (item.quantity > 0) {
      await incrementCartItem(session.supabase, cartId, item.productId, item.variantId, item.quantity, "web");
    }
  }

  return getActiveCartItems(session.user.id);
}

// Plain read -- used on repeat page loads for an already-merged session, so
// the client hydrates from the server without re-merging local quantities.
export async function fetchServerCart(): Promise<CartItem[]> {
  const session = await getUser();
  if (!session) return [];

  return getActiveCartItems(session.user.id);
}
