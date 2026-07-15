-- ============================================================
-- Migration: Checkout write access (Sprint 8.0)
-- ============================================================
-- Adds the columns and RLS write policies needed for customers to place
-- orders. orders/order_items already existed (migration 20260711000002)
-- but had SELECT-only RLS -- nobody could insert an order until now.
-- See ADR-022.
--
-- Contents:
--   1. products.sku            -- independent business identifier
--   2. orders.shipping_method  -- delivery option chosen at checkout
--   3. carts.converted_order_id -- traceability from a converted cart to its order
--   4. orders/order_items INSERT policies (authenticated, own-row only)
-- ============================================================

-- 1. products.sku
-- Nullable + UNIQUE so it's additive, not breaking. Backfilled once below
-- from each product's slug -- this is a one-time seed of a real, permanent
-- identifier, not a generated/virtual column. No trigger ties it to slug,
-- so future slug edits (renames, SEO changes) never touch sku.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku text UNIQUE;

UPDATE public.products
SET sku = 'HN-' || upper(slug)
WHERE sku IS NULL;

-- Variants already have their own sku (product_variants.sku, migration
-- 20260711000002) which order_items prefers when a variant is selected,
-- falling back to this column when a product has no variants.

-- 2. orders.shipping_method
-- Records which static delivery option (src/lib/checkout/shipping-options.ts)
-- the customer chose. Nullable -- existing rows (none yet, orders has never
-- been writable) are unaffected either way.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_method text;

-- 3. carts.converted_order_id
-- carts.status already had an unused 'converted' value (migration
-- 20260714000001) with nothing linking it back to the order it produced.
-- ON DELETE SET NULL: losing this traceability link is acceptable if an
-- order is ever hard-deleted; it must never take the cart row down with it.
ALTER TABLE public.carts
  ADD COLUMN IF NOT EXISTS converted_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;

-- 4. orders/order_items INSERT policies
-- Order creation is authenticated-only (ADR-022): a guest may browse the
-- checkout flow, but createOrder() requires a session, so no anon policy
-- is needed here -- same posture as addresses/carts (auth.uid()-owned-row,
-- no service-role key, ADR-013).
CREATE POLICY "orders_own_insert" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "order_items_own_insert" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );
