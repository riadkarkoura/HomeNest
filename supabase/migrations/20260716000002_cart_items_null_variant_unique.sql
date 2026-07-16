-- ============================================================
-- Patch 8.2.1: close the NULL-variant race in cart_items
-- ============================================================
-- UNIQUE (cart_id, product_id, variant_id) never protects rows where
-- variant_id IS NULL -- standard SQL uniqueness semantics never treat two
-- NULLs as equal, so two concurrent "add to cart" requests for the same
-- non-variant product (100% of the catalogue today) could each insert a
-- separate cart_items row instead of the second one hitting a unique
-- violation and falling back to an UPDATE, as incrementCartItem()
-- (src/app/cart/actions.ts) already assumes happens.
--
-- Verified via a live, read-only check before writing this migration:
-- zero existing (cart_id, product_id) groups with variant_id IS NULL have
-- more than one row today, so no data cleanup is required first.
--
-- This is additive only -- the existing UNIQUE constraint is untouched and
-- keeps protecting the has-variant case exactly as before. No application
-- code changes: incrementCartItem()'s existing insert/catch/fallback-to-
-- update logic already handles a unique violation correctly; it simply
-- never had one to catch for the NULL-variant case until now.

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_cart_product_no_variant_key
  ON public.cart_items (cart_id, product_id)
  WHERE variant_id IS NULL;
