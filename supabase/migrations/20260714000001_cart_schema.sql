-- ============================================================
-- Migration 008 — Cart schema (Sprint 7.2)
--
-- Purpose: Adds carts + cart_items, the server-persisted cart for
--          authenticated users. Guests continue to use the existing
--          client-side cart (Zustand + localStorage) unchanged;
--          merging a guest cart into a user's carts row on login is
--          separate, not-yet-scoped application-level work — this
--          migration covers schema only. See ADR-021.
--
-- Design notes (full detail in docs/DATABASE.md §8 and ADR-021):
--   - cart_items holds no price/name snapshot — a cart reflects
--     live product data, unlike the immutable snapshots on
--     order_items. Snapshotting happens once, at order conversion.
--   - carts.status lets a cart convert to an order without deleting
--     it (kept for conversion-funnel analytics), same "soft delete
--     where data has value" posture as the rest of this schema.
--   - cart_items.source is unconstrained text (not a CHECK enum),
--     same convention as the existing product_events.source column,
--     so a future source ('ai', 'partner') never requires a
--     migration to introduce.
--
-- Run order: After 007. No changes to any existing table.
-- ============================================================

-- ============================================================
-- carts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      text        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'converted', 'abandoned')),
  currency    text        NOT NULL DEFAULT 'USD',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Exactly one active cart per user; converted/abandoned rows are
-- never deleted, so this only constrains the current active one.
CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_user_active
  ON public.carts(user_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_carts_updated_at
  ON public.carts(updated_at) WHERE status = 'active';

CREATE OR REPLACE TRIGGER set_updated_at_carts
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- cart_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     uuid        NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id  uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id  uuid        REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity    integer     NOT NULL CHECK (quantity > 0),
  source      text        NOT NULL DEFAULT 'web',
  added_at    timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE (cart_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id
  ON public.cart_items(cart_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
  ON public.cart_items(product_id);

CREATE OR REPLACE TRIGGER set_updated_at_cart_items
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- RLS — same auth.uid()-owned-row pattern as addresses/wishlists.
-- No SUPABASE_SERVICE_ROLE_KEY; authorization is entirely RLS
-- against the normal cookie-based/browser Supabase client.
-- ============================================================
ALTER TABLE public.carts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items  FORCE ROW LEVEL SECURITY;

-- carts — users manage only their own; staff can SELECT for support.
CREATE POLICY "carts_own_all" ON public.carts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "carts_staff_select" ON public.carts
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));

-- cart_items — same, scoped through the owning cart.
CREATE POLICY "cart_items_own_all" ON public.cart_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "cart_items_staff_select" ON public.cart_items
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));
