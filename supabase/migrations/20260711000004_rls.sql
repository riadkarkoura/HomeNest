-- ============================================================
-- Migration 004 — Row-Level Security
--
-- Purpose: Enables RLS on all 34 tables and creates policies
--          following the matrix in DATABASE.md §19.
--
-- Run order: After 003 (get_my_role() must exist).
--
-- Role model:
--   anon          — anonymous requests (Supabase anon key)
--   authenticated — logged-in users (anon key + valid JWT)
--   service_role  — server-side admin (bypasses RLS entirely —
--                   no explicit admin policies needed)
--
-- Staff access:
--   Users with profiles.role = 'staff' or 'admin' gain extended
--   SELECT via the get_my_role() helper from migration 003.
--
-- Default posture: DENY ALL. Every accessible row must be
--   explicitly permitted by a policy.
-- ============================================================

-- ============================================================
-- Enable RLS on all 34 tables
-- FORCE ROW LEVEL SECURITY ensures table owners (postgres role)
-- also go through RLS when not using service_role.
-- ============================================================
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles             FORCE ROW LEVEL SECURITY;

ALTER TABLE public.categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories           FORCE ROW LEVEL SECURITY;

ALTER TABLE public.products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products             FORCE ROW LEVEL SECURITY;

ALTER TABLE public.product_variants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants     FORCE ROW LEVEL SECURITY;

ALTER TABLE public.addresses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses            FORCE ROW LEVEL SECURITY;

ALTER TABLE public.problem_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_tags         FORCE ROW LEVEL SECURITY;

ALTER TABLE public.ai_tags              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tags              FORCE ROW LEVEL SECURITY;

ALTER TABLE public.media                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media                FORCE ROW LEVEL SECURITY;

ALTER TABLE public.product_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images       FORCE ROW LEVEL SECURITY;

ALTER TABLE public.product_videos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_videos       FORCE ROW LEVEL SECURITY;

ALTER TABLE public.tiktok_assets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_assets        FORCE ROW LEVEL SECURITY;

ALTER TABLE public.product_problem_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_problem_tags FORCE ROW LEVEL SECURITY;

ALTER TABLE public.problem_tag_synonyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_tag_synonyms FORCE ROW LEVEL SECURITY;

ALTER TABLE public.product_ai_tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ai_tags      FORCE ROW LEVEL SECURITY;

ALTER TABLE public.product_embeddings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_embeddings   FORCE ROW LEVEL SECURITY;

ALTER TABLE public.seo_metadata         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_metadata         FORCE ROW LEVEL SECURITY;

ALTER TABLE public.coupons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons              FORCE ROW LEVEL SECURITY;

ALTER TABLE public.orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders               FORCE ROW LEVEL SECURITY;

ALTER TABLE public.order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items          FORCE ROW LEVEL SECURITY;

ALTER TABLE public.coupon_redemptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions   FORCE ROW LEVEL SECURITY;

ALTER TABLE public.reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews              FORCE ROW LEVEL SECURITY;

ALTER TABLE public.review_votes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes         FORCE ROW LEVEL SECURITY;

ALTER TABLE public.wishlists            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists            FORCE ROW LEVEL SECURITY;

ALTER TABLE public.wishlist_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items       FORCE ROW LEVEL SECURITY;

ALTER TABLE public.search_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs          FORCE ROW LEVEL SECURITY;

ALTER TABLE public.search_rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_rules         FORCE ROW LEVEL SECURITY;

ALTER TABLE public.recommendations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations      FORCE ROW LEVEL SECURITY;

ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content FORCE ROW LEVEL SECURITY;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers FORCE ROW LEVEL SECURITY;

ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        FORCE ROW LEVEL SECURITY;

ALTER TABLE public.page_views           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views           FORCE ROW LEVEL SECURITY;

ALTER TABLE public.product_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_events       FORCE ROW LEVEL SECURITY;

ALTER TABLE public.conversion_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events    FORCE ROW LEVEL SECURITY;

ALTER TABLE public.settings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings             FORCE ROW LEVEL SECURITY;

ALTER TABLE public.feature_flags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags        FORCE ROW LEVEL SECURITY;

ALTER TABLE public.audit_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log            FORCE ROW LEVEL SECURITY;


-- ============================================================
-- categories
-- Everyone sees active, non-deleted categories.
-- Staff / admin see all including inactive.
-- ============================================================
CREATE POLICY "categories_public_select" ON public.categories
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "categories_staff_select_all" ON public.categories
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- products
-- Anonymous and authenticated: active, non-deleted only.
-- Staff / admin: all products including inactive and soft-deleted.
-- cost_price is excluded from non-admin responses at the server
-- layer (SELECT projection) — not via column-level security.
-- ============================================================
CREATE POLICY "products_public_select" ON public.products
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "products_staff_select_all" ON public.products
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- product_variants
-- Public read — variants are always visible alongside the product.
-- ============================================================
CREATE POLICY "product_variants_public_select" ON public.product_variants
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "product_variants_staff_select_all" ON public.product_variants
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- problem_tags
-- Public read — drives the Shop by Problem UX.
-- ============================================================
CREATE POLICY "problem_tags_public_select" ON public.problem_tags
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "problem_tags_staff_select_all" ON public.problem_tags
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- ai_tags
-- Only approved tags are visible to public.
-- Staff / admin see all including unapproved.
-- ============================================================
CREATE POLICY "ai_tags_public_select" ON public.ai_tags
  FOR SELECT
  USING (is_approved = true);

CREATE POLICY "ai_tags_staff_select_all" ON public.ai_tags
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- media
-- Only staff / admin can browse the media library.
-- Public access to media is via cdn_url (direct CDN, not DB).
-- ============================================================
CREATE POLICY "media_staff_select" ON public.media
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- product_images / product_videos
-- Public read — images and videos are part of the product page.
-- ============================================================
CREATE POLICY "product_images_public_select" ON public.product_images
  FOR SELECT
  USING (true);

CREATE POLICY "product_videos_public_select" ON public.product_videos
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "product_videos_staff_select_all" ON public.product_videos
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- tiktok_assets
-- Public: approved assets only.
-- Staff: all including pending_approval.
-- ============================================================
CREATE POLICY "tiktok_assets_public_select" ON public.tiktok_assets
  FOR SELECT
  USING (is_approved = true AND status = 'active');

CREATE POLICY "tiktok_assets_staff_select_all" ON public.tiktok_assets
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- product_problem_tags / problem_tag_synonyms / product_ai_tags
-- Public read — these tables are pure reference data.
-- ============================================================
CREATE POLICY "product_problem_tags_public_select" ON public.product_problem_tags
  FOR SELECT
  USING (true);

CREATE POLICY "problem_tag_synonyms_public_select" ON public.problem_tag_synonyms
  FOR SELECT
  USING (true);

CREATE POLICY "product_ai_tags_public_select" ON public.product_ai_tags
  FOR SELECT
  USING (true);


-- ============================================================
-- product_embeddings
-- Public read — required for AI similarity search queries.
-- ============================================================
CREATE POLICY "product_embeddings_public_select" ON public.product_embeddings
  FOR SELECT
  USING (true);


-- ============================================================
-- seo_metadata
-- Public read — needed by Server Components for <head> tags.
-- ============================================================
CREATE POLICY "seo_metadata_public_select" ON public.seo_metadata
  FOR SELECT
  USING (true);


-- ============================================================
-- profiles
-- Users can only read and update their own row.
-- Staff can SELECT any profile (for customer support).
-- Admin (service_role) has full access via RLS bypass.
-- ============================================================
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_staff_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- addresses
-- Users can manage only their own addresses.
-- Staff can SELECT for customer support.
-- ============================================================
CREATE POLICY "addresses_own_all" ON public.addresses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "addresses_staff_select" ON public.addresses
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- notifications
-- Users can read and mark-as-read their own notifications.
-- No public access. Staff cannot read notifications (private).
-- ============================================================
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================
-- coupons
-- No public or authenticated access — coupon lookup goes through
-- a server-side Route Handler that validates the code.
-- Staff can read (for customer support).
-- ============================================================
CREATE POLICY "coupons_staff_select" ON public.coupons
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- orders
-- Users see only their own orders.
-- Guest orders are matched by email (auth.email()).
-- Staff can SELECT all orders.
-- ============================================================
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND guest_email = auth.email())
  );

CREATE POLICY "orders_staff_select_all" ON public.orders
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- order_items
-- Users can read items within their own orders.
-- Checked via the orders table JOIN (correlated subquery).
-- ============================================================
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid()
             OR (o.user_id IS NULL AND o.guest_email = auth.email()))
    )
  );

CREATE POLICY "order_items_staff_select" ON public.order_items
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- coupon_redemptions
-- Users can read their own redemptions (e.g. order history UI).
-- ============================================================
CREATE POLICY "coupon_redemptions_select_own" ON public.coupon_redemptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- ============================================================
-- reviews
-- Public: published reviews only.
-- Authenticated: can INSERT one review per product (enforced by
--   UNIQUE (user_id, product_id) constraint on the table).
--   Can SELECT own reviews regardless of status.
-- Staff: all reviews including pending_moderation and flagged.
-- ============================================================
CREATE POLICY "reviews_public_select" ON public.reviews
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "reviews_auth_select_own" ON public.reviews
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "reviews_auth_insert" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "reviews_auth_update_own" ON public.reviews
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_staff_select_all" ON public.reviews
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- review_votes
-- Authenticated users can manage only their own votes.
-- ============================================================
CREATE POLICY "review_votes_own_all" ON public.review_votes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================
-- wishlists
-- Public: shared wishlists (is_public = true) are readable by all.
-- Authenticated: full control over own wishlists.
-- ============================================================
CREATE POLICY "wishlists_public_select" ON public.wishlists
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "wishlists_own_all" ON public.wishlists
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================
-- wishlist_items
-- Public: items in public wishlists are readable (for share links).
-- Authenticated: full control over items in own wishlists.
-- ============================================================
CREATE POLICY "wishlist_items_public_select" ON public.wishlist_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists w
      WHERE w.id = wishlist_items.wishlist_id
        AND w.is_public = true
    )
  );

CREATE POLICY "wishlist_items_own_all" ON public.wishlist_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists w
      WHERE w.id = wishlist_items.wishlist_id
        AND w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wishlists w
      WHERE w.id = wishlist_items.wishlist_id
        AND w.user_id = auth.uid()
    )
  );


-- ============================================================
-- search_logs
-- INSERT only for all users (anonymous search tracking).
-- Staff can read for search quality analysis.
-- ============================================================
CREATE POLICY "search_logs_insert" ON public.search_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "search_logs_staff_select" ON public.search_logs
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- search_rules
-- Staff / admin read only (admin writes via service_role).
-- ============================================================
CREATE POLICY "search_rules_staff_select" ON public.search_rules
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- recommendations
-- Authenticated users see only their own recommendations.
-- ============================================================
CREATE POLICY "recommendations_select_own" ON public.recommendations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- ============================================================
-- ai_generated_content
-- Staff / admin only — never exposed to customers.
-- ============================================================
CREATE POLICY "ai_content_staff_select" ON public.ai_generated_content
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- newsletter_subscribers
-- Anonymous: INSERT only (homepage/footer sign-up form).
-- Authenticated: SELECT own subscription (account settings).
-- Staff: SELECT all.
-- ============================================================
CREATE POLICY "newsletter_anon_insert" ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "newsletter_auth_select_own" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "newsletter_staff_select_all" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- page_views / product_events / conversion_events
-- INSERT only for all users (client-side analytics tracking).
-- Staff can read for dashboard analytics.
-- ============================================================
CREATE POLICY "page_views_insert" ON public.page_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "page_views_staff_select" ON public.page_views
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));

CREATE POLICY "product_events_insert" ON public.product_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "product_events_staff_select" ON public.product_events
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));

CREATE POLICY "conversion_events_insert" ON public.conversion_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "conversion_events_staff_select" ON public.conversion_events
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- settings
-- Public and authenticated: only public settings (is_public=true).
-- Staff / admin: all settings.
-- ============================================================
CREATE POLICY "settings_public_select" ON public.settings
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "settings_staff_select_all" ON public.settings
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- feature_flags
-- All roles: full SELECT.
-- Feature flag values are non-sensitive — the UI reads them to
-- show/hide features, and they contain no secrets.
-- ============================================================
CREATE POLICY "feature_flags_public_select" ON public.feature_flags
  FOR SELECT
  USING (true);


-- ============================================================
-- audit_log
-- No public access. Staff and admin can read.
-- No UPDATE or DELETE policies — rows are immutable by design.
-- ============================================================
CREATE POLICY "audit_log_staff_select" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));
