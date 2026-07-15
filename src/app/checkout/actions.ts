"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateActiveCart } from "@/lib/supabase/queries/cart";
import { getShippingOption, DEFAULT_SHIPPING_OPTION_ID } from "@/lib/checkout/shipping-options";
import type { OrderItemSnapshot } from "@/lib/supabase/queries/orders";

// ── Inline identify (Sprint 8.0, ADR-022) ───────────────────────────────────
// Same validation/logic as src/app/login/actions.ts, deliberately not reused
// from there: those actions redirect() on success, which would navigate the
// customer away from checkout (the next=-redirect-back pattern already
// broke click interactivity once in Sprint 7.0 and isn't being reintroduced
// -- see ADR-022). These return a plain result instead so the checkout page
// can stay mounted and simply reveal the rest of the flow.

const CheckoutSignUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const CheckoutSignInSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export interface IdentifyState {
  error?: string;
  ok?: boolean;
}

export async function checkoutSignIn(
  _prevState: IdentifyState,
  formData: FormData
): Promise<IdentifyState> {
  const parsed = CheckoutSignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email or password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Invalid email or password." };

  return { ok: true };
}

export async function checkoutSignUp(
  _prevState: IdentifyState,
  formData: FormData
): Promise<IdentifyState> {
  const parsed = CheckoutSignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name } },
  });
  if (error) return { error: error.message };

  if (!data.session) {
    return { error: "Account created. Check your email to confirm, then sign in." };
  }

  return { ok: true };
}

export interface CreateOrderInput {
  shippingAddressId: string;
  billingAddressId: string | null; // null = "same as shipping"
  shippingMethodId: string;
  customerNotes?: string;
}

export type CreateOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

interface CartLineRow {
  quantity: number;
  product_id: string;
  variant_id: string | null;
  products: {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    in_stock: boolean;
    product_images: Array<{ cdn_url: string; is_primary: boolean }>;
  } | null;
  product_variants: {
    id: string;
    sku: string;
    option_name: string;
    option_value: string;
    price_delta: number;
    in_stock: boolean;
  } | null;
}

function toAddressSnapshot(row: Record<string, unknown>) {
  const { id: _id, user_id: _userId, type: _type, is_default: _isDefault, created_at: _createdAt, updated_at: _updatedAt, ...rest } = row;
  return rest;
}

// Order creation is authenticated-only (ADR-022) -- a guest can fill out
// every checkout step, but this action requires a session, matching the
// orders_own_insert / order_items_own_insert RLS policies added in
// migration 20260715000001. No trust is placed in client-submitted prices
// or totals -- everything is re-fetched live from the DB below.
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const session = await getUser();
  if (!session) {
    return { ok: false, error: "Please sign in or create an account to place your order." };
  }
  const { user, supabase } = session;

  try {
    const cartId = await getOrCreateActiveCart(user.id);

    const { data: cartLines, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `quantity, product_id, variant_id,
         products ( id, name, sku, price, in_stock, product_images ( cdn_url, is_primary ) ),
         product_variants ( id, sku, option_name, option_value, price_delta, in_stock )`
      )
      .eq("cart_id", cartId);

    if (cartError) throw cartError;

    const lines = (cartLines ?? []) as unknown as CartLineRow[];
    if (lines.length === 0) {
      return { ok: false, error: "Your cart is empty." };
    }

    const orderItems: Array<{
      product_id: string;
      variant_id: string | null;
      product_snapshot: OrderItemSnapshot;
      quantity: number;
      unit_price: number;
      subtotal: number;
      discount: number;
      total: number;
    }> = [];

    for (const line of lines) {
      const product = line.products;
      if (!product) {
        return { ok: false, error: "A product in your cart is no longer available." };
      }

      const variant = line.variant_id ? line.product_variants : null;
      if (line.variant_id && !variant) {
        return { ok: false, error: "A selected product option is no longer available." };
      }

      const inStock = variant ? variant.in_stock : product.in_stock;
      if (!inStock) {
        return { ok: false, error: `"${product.name}" is out of stock.` };
      }

      const sku = variant?.sku ?? product.sku;
      if (!sku) {
        return { ok: false, error: `"${product.name}" is missing a SKU and cannot be ordered.` };
      }

      const unitPrice = Number(product.price) + (variant ? Number(variant.price_delta) : 0);
      const subtotal = unitPrice * line.quantity;
      const primaryImage =
        product.product_images.find((img) => img.is_primary)?.cdn_url ??
        product.product_images[0]?.cdn_url ??
        null;

      orderItems.push({
        product_id: product.id,
        variant_id: variant?.id ?? null,
        product_snapshot: {
          name: product.name,
          sku,
          image: primaryImage,
          variant: variant ? { optionName: variant.option_name, optionValue: variant.option_value } : null,
        },
        quantity: line.quantity,
        unit_price: unitPrice,
        subtotal,
        discount: 0,
        total: subtotal,
      });
    }

    const { data: shippingAddress, error: shippingError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", input.shippingAddressId)
      .eq("user_id", user.id)
      .single();

    if (shippingError || !shippingAddress) {
      return { ok: false, error: "Select a shipping address." };
    }

    let billingSnapshot = toAddressSnapshot(shippingAddress);
    if (input.billingAddressId) {
      const { data: billingAddress, error: billingError } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", input.billingAddressId)
        .eq("user_id", user.id)
        .single();

      if (billingError || !billingAddress) {
        return { ok: false, error: "Select a billing address." };
      }
      billingSnapshot = toAddressSnapshot(billingAddress);
    }

    const shippingOption =
      getShippingOption(input.shippingMethodId) ?? getShippingOption(DEFAULT_SHIPPING_OPTION_ID)!;

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingCost = shippingOption.cost;
    // Tax calculation is out of scope for Sprint 8.0 -- flagged in the
    // closing report, not silently assumed to be zero forever.
    const tax = 0;
    const discount = 0;
    const total = subtotal + shippingCost + tax - discount;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        payment_status: "unpaid",
        fulfillment_status: "unfulfilled",
        subtotal,
        shipping_cost: shippingCost,
        tax,
        discount,
        total,
        currency: "USD",
        payment_provider: "stripe",
        shipping_method: shippingOption.id,
        shipping_address_id: input.shippingAddressId,
        shipping_address_snapshot: toAddressSnapshot(shippingAddress),
        billing_address_snapshot: billingSnapshot,
        customer_notes: input.customerNotes ?? null,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) throw orderError ?? new Error("Failed to create order");

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

    if (itemsError) throw itemsError;

    await supabase
      .from("carts")
      .update({ status: "converted", converted_order_id: order.id })
      .eq("id", cartId);

    return { ok: true, orderNumber: order.order_number };
  } catch (err) {
    console.error("[createOrder]", err);
    return { ok: false, error: "Something went wrong placing your order. Please try again." };
  }
}
