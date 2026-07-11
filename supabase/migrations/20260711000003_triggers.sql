-- ============================================================
-- Migration 003 — Trigger Functions & Triggers
--
-- Purpose: Creates all trigger functions and wires them to their
--          tables. Also creates the get_my_role() helper used by
--          RLS policies in migration 004.
--
-- Run order: After 002 (tables must exist).
--
-- Functions created:
--   get_my_role()                  — RLS role helper
--   set_updated_at()               — Generic updated_at maintenance
--   handle_new_user()              — Auto-create profile on signup
--   generate_order_number()        — HN-YYYYMMDD-NNNN before INSERT
--   update_product_rating()        — Recalculate rating + count
--   update_profile_order_stats()   — Maintain total_orders + total_spent
--   set_review_verified()          — Set verified=true if order delivered
--   increment_coupon_uses()        — Atomically bump uses_count
--   update_category_product_count() — Maintain product_count
-- ============================================================


-- ============================================================
-- Helper: get_my_role()
-- Returns the authenticated user's role from profiles.
-- SECURITY DEFINER so it can read profiles without causing
-- infinite recursion in RLS policies.
-- Used in: migration 004 RLS policies.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'user'
  );
$$;


-- ============================================================
-- Trigger function: set_updated_at()
-- Generic BEFORE UPDATE trigger applied to every table that has
-- an updated_at column. Replaces the moddatetime extension.
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to all 17 tables that have an updated_at column
CREATE OR REPLACE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_addresses
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_categories
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_product_variants
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_product_videos
  BEFORE UPDATE ON public.product_videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_tiktok_assets
  BEFORE UPDATE ON public.tiktok_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_product_embeddings
  BEFORE UPDATE ON public.product_embeddings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_seo_metadata
  BEFORE UPDATE ON public.seo_metadata
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_coupons
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_reviews
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_wishlists
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_search_rules
  BEFORE UPDATE ON public.search_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_newsletter_subscribers
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_settings
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_feature_flags
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- Trigger function: handle_new_user()
-- Fires AFTER INSERT on auth.users (Supabase-managed table).
-- Creates a matching profiles row automatically so the app
-- never needs to insert profiles manually.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- Trigger function: generate_order_number()
-- Fires BEFORE INSERT on orders. Sets order_number to the
-- human-readable format: HN-YYYYMMDD-NNNN
-- The sequence (order_number_seq) is created in migration 001.
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.order_number :=
    'HN-' ||
    to_char(now(), 'YYYYMMDD') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_order_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();


-- ============================================================
-- Trigger function: update_product_rating()
-- Fires AFTER INSERT, UPDATE, or DELETE on reviews.
-- Recalculates products.rating (avg) and products.review_count
-- whenever a published review changes.
-- The two-trigger pattern on reviews (this + on_review_insert)
-- means rating is recalculated twice on a new verified review —
-- this is acceptable since the operation is idempotent.
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_product_id := OLD.product_id;
  ELSE
    v_product_id := NEW.product_id;
  END IF;

  UPDATE public.products
  SET
    rating = COALESCE(
      (
        SELECT AVG(rating)::numeric(3,2)
        FROM public.reviews
        WHERE product_id = v_product_id AND status = 'published'
      ),
      0
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = v_product_id AND status = 'published'
    ),
    updated_at = now()
  WHERE id = v_product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();


-- ============================================================
-- Trigger function: update_profile_order_stats()
-- Fires AFTER UPDATE on orders, only when payment_status
-- transitions from any non-paid value to 'paid'.
-- Maintains profiles.total_orders and profiles.total_spent
-- without requiring COUNT(*) or SUM() at query time.
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_profile_order_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET
      total_orders = total_orders + 1,
      total_spent  = total_spent + NEW.total,
      updated_at   = now()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- WHEN clause filters trigger to only fire on the paid transition
CREATE OR REPLACE TRIGGER on_order_paid
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.payment_status <> 'paid' AND NEW.payment_status = 'paid')
  EXECUTE FUNCTION public.update_profile_order_stats();


-- ============================================================
-- Trigger function: set_review_verified()
-- Fires AFTER INSERT on reviews. Checks whether the reviewer
-- has a delivered order_item for this product. If so, sets
-- verified = true on the newly inserted review.
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_review_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = NEW.product_id
      AND o.user_id     = NEW.user_id
      AND o.status      = 'delivered'
  ) THEN
    UPDATE public.reviews
    SET verified = true
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_review_verified();


-- ============================================================
-- Trigger function: increment_coupon_uses()
-- Fires AFTER INSERT on coupon_redemptions.
-- Atomically increments coupons.uses_count without a
-- SELECT + UPDATE race condition.
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_coupon_uses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET uses_count = uses_count + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_coupon_redemption
  AFTER INSERT ON public.coupon_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.increment_coupon_uses();


-- ============================================================
-- Trigger function: update_category_product_count()
-- Fires AFTER INSERT, UPDATE, or DELETE on products.
-- Maintains categories.product_count for the affected
-- category (or both old and new categories on a category change).
-- Only counts active, non-deleted products.
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_category_product_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recount the new (or current) category
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.category_id IS NOT NULL THEN
    UPDATE public.categories
    SET product_count = (
      SELECT COUNT(*)
      FROM public.products
      WHERE category_id = NEW.category_id
        AND is_active   = true
        AND deleted_at  IS NULL
    )
    WHERE id = NEW.category_id;
  END IF;

  -- Recount the old category on DELETE or on category_id change
  IF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN
    UPDATE public.categories
    SET product_count = (
      SELECT COUNT(*)
      FROM public.products
      WHERE category_id = OLD.category_id
        AND is_active   = true
        AND deleted_at  IS NULL
    )
    WHERE id = OLD.category_id;
  END IF;

  IF TG_OP = 'UPDATE'
    AND OLD.category_id IS DISTINCT FROM NEW.category_id
    AND OLD.category_id IS NOT NULL
  THEN
    UPDATE public.categories
    SET product_count = (
      SELECT COUNT(*)
      FROM public.products
      WHERE category_id = OLD.category_id
        AND is_active   = true
        AND deleted_at  IS NULL
    )
    WHERE id = OLD.category_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE TRIGGER on_product_change
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_category_product_count();
