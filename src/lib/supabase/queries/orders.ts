import { createClient } from "@/lib/supabase/server";

// The order's line items never re-read `products`/`product_variants` after
// purchase -- product_snapshot is the permanent record. See ADR-022.
export interface OrderItemSnapshot {
  name: string;
  sku: string;
  image: string | null;
  variant: { optionName: string; optionValue: string } | null;
}

export interface OrderItemRow {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_snapshot: OrderItemSnapshot;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  shipping_method: string | null;
  shipping_address_snapshot: Record<string, unknown>;
  billing_address_snapshot: Record<string, unknown> | null;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  created_at: string;
  order_items?: OrderItemRow[];
}

const ORDER_FIELDS =
  "id, order_number, status, payment_status, fulfillment_status, subtotal, shipping_cost, tax, discount, total, currency, shipping_method, shipping_address_snapshot, billing_address_snapshot, tracking_number, tracking_url, carrier, created_at";

const ORDER_ITEM_FIELDS =
  "id, product_id, variant_id, product_snapshot, quantity, unit_price, subtotal, discount, total";

export async function getOrders(userId: string): Promise<OrderRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_FIELDS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];

    return (data as unknown as OrderRow[]) ?? [];
  } catch {
    return [];
  }
}

// Used by both the order confirmation page and /account/orders/[orderNumber]
// -- same RLS-scoped read, just parameterized by order_number instead of id
// since that's the human-facing identifier in the URL.
export async function getOrderByNumber(
  orderNumber: string,
  userId: string
): Promise<OrderRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`${ORDER_FIELDS}, order_items ( ${ORDER_ITEM_FIELDS} )`)
      .eq("order_number", orderNumber)
      .eq("user_id", userId)
      .single();

    if (error) return null;

    return data as unknown as OrderRow;
  } catch {
    return null;
  }
}
