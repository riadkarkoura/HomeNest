-- ============================================================
-- Migration 002 — Schema
--
-- Purpose: Creates all 34 tables in the FK dependency order
--          specified in DATABASE.md Appendix C. Includes all
--          columns, constraints, and indexes.
--
-- Run order: After 001 (extensions must exist for GIN, vector).
--
-- Dependency order (Appendix C):
--   1  auth.users      (Supabase-managed, already exists)
--   2  profiles
--   3  categories
--   4  products
--   5  product_variants
--   6  addresses
--   7  problem_tags
--   8  ai_tags
--   9  media
--   10 product_images
--   11 product_videos
--   12 tiktok_assets
--   13 product_problem_tags
--   14 problem_tag_synonyms
--   15 product_ai_tags
--   16 product_embeddings
--   17 seo_metadata
--   18 coupons
--   19 orders
--   20 order_items
--   21 coupon_redemptions
--   22 reviews
--   23 review_votes
--   24 wishlists
--   25 wishlist_items
--   26 search_logs
--   27 search_rules
--   28 recommendations
--   29 ai_generated_content
--   30 newsletter_subscribers
--   31 notifications
--   32 page_views
--   33 product_events
--   34 conversion_events
--   35 settings
--   36 feature_flags
--   37 audit_log
-- ============================================================

-- ============================================================
-- 2. profiles
-- Extended user record linked 1:1 to auth.users.
-- Created automatically by handle_new_user() trigger (migration 003).
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text        UNIQUE NOT NULL,
  name            text,
  first_name      text,
  last_name       text,
  phone           text,
  avatar_url      text,
  role            text        NOT NULL DEFAULT 'user'
                              CHECK (role IN ('user', 'staff', 'admin')),
  marketing_opt_in boolean    NOT NULL DEFAULT false,
  language        text        NOT NULL DEFAULT 'en',
  currency        text        NOT NULL DEFAULT 'USD',
  timezone        text        NOT NULL DEFAULT 'UTC',
  total_orders    integer     NOT NULL DEFAULT 0,
  total_spent     numeric(12,2) NOT NULL DEFAULT 0,
  last_seen_at    timestamptz,
  deleted_at      timestamptz DEFAULT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON profiles(role) WHERE role != 'user';
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at
  ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;


-- ============================================================
-- 3. categories
-- Product taxonomy. Supports one level of parent/child nesting.
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text        UNIQUE NOT NULL,
  name          text        NOT NULL,
  description   text,
  parent_id     uuid        REFERENCES categories(id) ON DELETE SET NULL,
  icon_name     text,
  image_url     text,
  color_hex     text,
  sort_order    integer     NOT NULL DEFAULT 0,
  is_active     boolean     NOT NULL DEFAULT true,
  product_count integer     NOT NULL DEFAULT 0,
  deleted_at    timestamptz DEFAULT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug
  ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id
  ON categories(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_active
  ON categories(sort_order) WHERE is_active = true AND deleted_at IS NULL;


-- ============================================================
-- 4. products
-- Central catalogue table. All other catalogue tables reference it.
-- cost_price is admin-only — kept server-side via RLS projection.
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text          UNIQUE NOT NULL,
  name                text          NOT NULL,
  tagline             text,
  description         text,
  long_description    text,
  problem_solved      text,
  problem_headline    text,
  problem_intro       text,
  solution_headline   text,
  solution_body       text,
  material            text,
  dimensions          text,
  weight_grams        integer,
  price               numeric(10,2) NOT NULL CHECK (price > 0),
  original_price      numeric(10,2) CHECK (original_price > 0),
  cost_price          numeric(10,2),
  currency            text          NOT NULL DEFAULT 'USD',
  category_id         uuid          REFERENCES categories(id) ON DELETE SET NULL,
  badge               text          CHECK (badge IN ('Bestseller', 'New', 'Editor''s Pick', 'Sale')),
  has_variants        boolean       NOT NULL DEFAULT false,
  rating              numeric(3,2)  NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count        integer       NOT NULL DEFAULT 0,
  in_stock            boolean       NOT NULL DEFAULT true,
  stock_quantity      integer       NOT NULL DEFAULT 0,
  featured            boolean       NOT NULL DEFAULT false,
  is_active           boolean       NOT NULL DEFAULT true,
  sort_order          integer       NOT NULL DEFAULT 0,
  tags                text[]        NOT NULL DEFAULT '{}',
  published_at        timestamptz,
  deleted_at          timestamptz   DEFAULT NULL,
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug
  ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products(sort_order) WHERE featured = true AND is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_in_stock
  ON products(category_id) WHERE in_stock = true AND is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_tags
  ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_price
  ON products(price) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_rating
  ON products(rating DESC) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_fts
  ON products USING GIN(
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(problem_solved, '')
    )
  );
CREATE INDEX IF NOT EXISTS idx_products_trgm_name
  ON products USING GIN(name gin_trgm_ops);


-- ============================================================
-- 5. product_variants
-- Size / colour / material variations of a product.
-- Only rows exist when products.has_variants = true.
-- ============================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku             text          UNIQUE NOT NULL,
  option_name     text          NOT NULL,
  option_value    text          NOT NULL,
  price_delta     numeric(10,2) NOT NULL DEFAULT 0,
  stock_quantity  integer       NOT NULL DEFAULT 0,
  in_stock        boolean       NOT NULL DEFAULT true,
  image_url       text,
  sort_order      integer       NOT NULL DEFAULT 0,
  is_active       boolean       NOT NULL DEFAULT true,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
  ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku
  ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_active
  ON product_variants(product_id, sort_order) WHERE is_active = true;


-- ============================================================
-- 6. addresses
-- Saved shipping and billing addresses per user.
-- Immutable order snapshots are stored in orders.shipping_address_snapshot.
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          text        NOT NULL DEFAULT 'shipping'
                            CHECK (type IN ('shipping', 'billing')),
  is_default    boolean     NOT NULL DEFAULT false,
  label         text,
  first_name    text        NOT NULL,
  last_name     text        NOT NULL,
  company       text,
  line1         text        NOT NULL,
  line2         text,
  city          text        NOT NULL,
  state         text,
  postal_code   text        NOT NULL,
  country_code  text        NOT NULL,
  phone         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id
  ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default_shipping
  ON addresses(user_id) WHERE is_default = true AND type = 'shipping';
CREATE INDEX IF NOT EXISTS idx_addresses_default_billing
  ON addresses(user_id) WHERE is_default = true AND type = 'billing';

-- Only one default address of each type per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_default_unique
  ON addresses(user_id, type) WHERE is_default = true;


-- ============================================================
-- 7. problem_tags
-- Curated taxonomy of household problems.
-- Drives the "Shop by Problem" UX and AI search categorisation.
-- ============================================================
CREATE TABLE IF NOT EXISTS problem_tags (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text        UNIQUE NOT NULL,
  name          text        NOT NULL,
  description   text,
  category_id   uuid        REFERENCES categories(id) ON DELETE SET NULL,
  icon_name     text,
  image_url     text,
  sort_order    integer     NOT NULL DEFAULT 0,
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_problem_tags_slug
  ON problem_tags(slug);
CREATE INDEX IF NOT EXISTS idx_problem_tags_active
  ON problem_tags(sort_order) WHERE is_active = true;


-- ============================================================
-- 8. ai_tags
-- Machine-generated semantic tags produced by Claude.
-- Different from problem_tags — these capture attributes, moods,
-- and features that AI detects, not user-stated problems.
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_tags (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text          UNIQUE NOT NULL,
  description     text,
  source          text          NOT NULL DEFAULT 'generated'
                                CHECK (source IN ('generated', 'curated', 'imported')),
  model_version   text,
  embedding       vector(1536),
  usage_count     integer       NOT NULL DEFAULT 0,
  is_approved     boolean       NOT NULL DEFAULT false,
  created_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_tags_approved
  ON ai_tags(name) WHERE is_approved = true;


-- ============================================================
-- 9. media
-- Central media registry. All uploaded files are registered here
-- regardless of where they're used. One row per uploaded file.
-- ============================================================
CREATE TABLE IF NOT EXISTS media (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by         uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  storage_bucket      text        NOT NULL,
  storage_path        text        NOT NULL,
  cdn_url             text        NOT NULL,
  filename            text        NOT NULL,
  original_filename   text,
  mime_type           text        NOT NULL,
  size_bytes          bigint,
  width               integer,
  height              integer,
  duration_seconds    integer,
  alt_text            text,
  caption             text,
  tags                text[]      NOT NULL DEFAULT '{}',
  metadata            jsonb       NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_uploaded_by
  ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_mime_type
  ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_tags
  ON media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_bucket
  ON media(storage_bucket, created_at DESC);


-- ============================================================
-- 10. product_images
-- Ordered gallery images for each product.
-- cdn_url is denormalized from media.cdn_url for fast reads.
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id  uuid        REFERENCES product_variants(id) ON DELETE SET NULL,
  media_id    uuid        REFERENCES media(id) ON DELETE RESTRICT,
  cdn_url     text        NOT NULL,
  alt_text    text,
  sort_order  integer     NOT NULL DEFAULT 0,
  is_primary  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON product_images(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_images_variant_id
  ON product_images(variant_id) WHERE variant_id IS NOT NULL;

-- Exactly one primary image per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_primary_unique
  ON product_images(product_id) WHERE is_primary = true;


-- ============================================================
-- 11. product_videos
-- Video content for product pages.
-- Supports hosted (Supabase Storage) and social embed types.
-- ============================================================
CREATE TABLE IF NOT EXISTS product_videos (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type              text        NOT NULL
                                CHECK (type IN ('hosted', 'tiktok', 'instagram_reels', 'youtube')),
  media_id          uuid        REFERENCES media(id) ON DELETE SET NULL,
  cdn_url           text,
  external_url      text,
  external_id       text,
  thumbnail_url     text,
  caption           text,
  duration_seconds  integer,
  sort_order        integer     NOT NULL DEFAULT 0,
  is_featured       boolean     NOT NULL DEFAULT false,
  is_active         boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_videos_product_id
  ON product_videos(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_videos_featured
  ON product_videos(product_id) WHERE is_featured = true AND is_active = true;


-- ============================================================
-- 12. tiktok_assets
-- TikTok / Instagram Reels content linked to products or brand.
-- is_ugc content requires admin approval before display.
-- ============================================================
CREATE TABLE IF NOT EXISTS tiktok_assets (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id            uuid        REFERENCES products(id) ON DELETE SET NULL,
  platform              text        NOT NULL DEFAULT 'tiktok'
                                    CHECK (platform IN ('tiktok', 'instagram')),
  external_id           text        NOT NULL,
  author_id             text,
  author_username       text,
  author_display_name   text,
  caption               text,
  embed_html            text,
  thumbnail_url         text,
  share_url             text,
  view_count            bigint      NOT NULL DEFAULT 0,
  like_count            bigint      NOT NULL DEFAULT 0,
  comment_count         bigint      NOT NULL DEFAULT 0,
  share_count           bigint      NOT NULL DEFAULT 0,
  duration_seconds      integer,
  is_featured           boolean     NOT NULL DEFAULT false,
  is_ugc                boolean     NOT NULL DEFAULT false,
  is_approved           boolean     NOT NULL DEFAULT false,
  status                text        NOT NULL DEFAULT 'active'
                                    CHECK (status IN ('active', 'archived', 'removed', 'pending_approval')),
  metrics_synced_at     timestamptz,
  published_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  UNIQUE (platform, external_id)
);

CREATE INDEX IF NOT EXISTS idx_tiktok_assets_product_id
  ON tiktok_assets(product_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_tiktok_assets_featured
  ON tiktok_assets(product_id) WHERE is_featured = true AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_tiktok_assets_ugc
  ON tiktok_assets(is_approved, created_at DESC) WHERE is_ugc = true;
CREATE INDEX IF NOT EXISTS idx_tiktok_assets_views
  ON tiktok_assets(view_count DESC) WHERE status = 'active';


-- ============================================================
-- 13. product_problem_tags  (junction)
-- Maps products ↔ the problems they solve.
-- relevance_score (0–1) drives search result ranking.
-- ============================================================
CREATE TABLE IF NOT EXISTS product_problem_tags (
  product_id        uuid          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  problem_tag_id    uuid          NOT NULL REFERENCES problem_tags(id) ON DELETE CASCADE,
  relevance_score   numeric(3,2)  NOT NULL DEFAULT 1.0
                                  CHECK (relevance_score >= 0 AND relevance_score <= 1),
  created_at        timestamptz   NOT NULL DEFAULT now(),

  PRIMARY KEY (product_id, problem_tag_id)
);

CREATE INDEX IF NOT EXISTS idx_product_problem_tags_problem
  ON product_problem_tags(problem_tag_id, relevance_score DESC);


-- ============================================================
-- 14. problem_tag_synonyms
-- Natural-language synonyms for each problem tag.
-- Used by AI search to expand query matching.
-- ============================================================
CREATE TABLE IF NOT EXISTS problem_tag_synonyms (
  problem_tag_id  uuid  NOT NULL REFERENCES problem_tags(id) ON DELETE CASCADE,
  synonym         text  NOT NULL,

  PRIMARY KEY (problem_tag_id, synonym)
);


-- ============================================================
-- 15. product_ai_tags  (junction)
-- Links AI-generated tags to products with a confidence score.
-- Only approved ai_tags appear in search.
-- ============================================================
CREATE TABLE IF NOT EXISTS product_ai_tags (
  product_id  uuid          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ai_tag_id   uuid          NOT NULL REFERENCES ai_tags(id) ON DELETE CASCADE,
  confidence  numeric(3,2)  NOT NULL DEFAULT 1.0
                            CHECK (confidence >= 0 AND confidence <= 1),
  created_at  timestamptz   NOT NULL DEFAULT now(),

  PRIMARY KEY (product_id, ai_tag_id)
);

CREATE INDEX IF NOT EXISTS idx_product_ai_tags_product
  ON product_ai_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ai_tags_tag
  ON product_ai_tags(ai_tag_id, confidence DESC);


-- ============================================================
-- 16. product_embeddings
-- Vector embeddings for semantic AI search.
-- One row per product; separate table keeps products lightweight.
-- Requires pgvector extension (migration 001).
-- ============================================================
CREATE TABLE IF NOT EXISTS product_embeddings (
  product_id      uuid          PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  embedding       vector(1536)  NOT NULL,
  embedding_text  text          NOT NULL,
  model           text          NOT NULL,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

-- IVFFlat approximate nearest-neighbour index.
-- lists=100 is appropriate up to ~1 million vectors.
-- Rebuild with lists=sqrt(n_rows) as catalogue grows.
CREATE INDEX IF NOT EXISTS idx_product_embeddings_vector
  ON product_embeddings USING ivfflat(embedding vector_cosine_ops)
  WITH (lists = 100);


-- ============================================================
-- 17. seo_metadata
-- SEO and Open Graph metadata for products, categories, and pages.
-- Polymorphic: entity_type + entity_id identify the owner.
-- No DB-level FK on entity_id (polymorphic — app enforces integrity).
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_metadata (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type         text        NOT NULL CHECK (entity_type IN ('product', 'category', 'page')),
  entity_id           uuid        NOT NULL,
  title               text,
  description         text,
  og_title            text,
  og_description      text,
  og_image_url        text,
  twitter_card        text        NOT NULL DEFAULT 'summary_large_image',
  twitter_title       text,
  twitter_description text,
  twitter_image_url   text,
  canonical_url       text,
  no_index            boolean     NOT NULL DEFAULT false,
  structured_data     jsonb,
  hreflang            jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  UNIQUE (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_seo_metadata_entity
  ON seo_metadata(entity_type, entity_id);


-- ============================================================
-- 18. coupons
-- Promotional discount codes managed via the Admin Dashboard.
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  code                text          UNIQUE NOT NULL,
  description         text,
  type                text          NOT NULL
                                    CHECK (type IN ('percentage', 'fixed', 'free_shipping', 'buy_x_get_y')),
  value               numeric(10,2),
  buy_quantity        integer,
  get_quantity        integer,
  minimum_order       numeric(10,2) NOT NULL DEFAULT 0,
  maximum_discount    numeric(10,2),
  currency            text          NOT NULL DEFAULT 'USD',
  applies_to          text          NOT NULL DEFAULT 'order'
                                    CHECK (applies_to IN ('order', 'product', 'category')),
  product_ids         uuid[]        NOT NULL DEFAULT '{}',
  category_ids        uuid[]        NOT NULL DEFAULT '{}',
  max_uses            integer,
  max_uses_per_user   integer       DEFAULT 1,
  uses_count          integer       NOT NULL DEFAULT 0,
  is_active           boolean       NOT NULL DEFAULT true,
  starts_at           timestamptz,
  expires_at          timestamptz,
  created_by          uuid          REFERENCES profiles(id) ON DELETE SET NULL,
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now()
);

-- Case-insensitive code lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code
  ON coupons(upper(code));
CREATE INDEX IF NOT EXISTS idx_coupons_active
  ON coupons(expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_product_ids
  ON coupons USING GIN(product_ids);
CREATE INDEX IF NOT EXISTS idx_coupons_category_ids
  ON coupons USING GIN(category_ids);


-- ============================================================
-- 19. orders
-- The order lifecycle record. Contains immutable snapshots of
-- the shipping address and coupon at the moment of purchase.
-- order_number is generated by the generate_order_number() trigger
-- (migration 003) — never set by application code.
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number                text          UNIQUE NOT NULL,
  user_id                     uuid          REFERENCES profiles(id) ON DELETE SET NULL,
  guest_email                 text,
  status                      text          NOT NULL DEFAULT 'pending'
                                            CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'partially_refunded')),
  payment_status              text          NOT NULL DEFAULT 'unpaid'
                                            CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partially_refunded', 'failed')),
  fulfillment_status          text          NOT NULL DEFAULT 'unfulfilled'
                                            CHECK (fulfillment_status IN ('unfulfilled', 'processing', 'fulfilled', 'partially_fulfilled')),
  subtotal                    numeric(10,2) NOT NULL,
  shipping_cost               numeric(10,2) NOT NULL DEFAULT 0,
  tax                         numeric(10,2) NOT NULL DEFAULT 0,
  discount                    numeric(10,2) NOT NULL DEFAULT 0,
  total                       numeric(10,2) NOT NULL,
  currency                    text          NOT NULL DEFAULT 'USD',
  coupon_id                   uuid          REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code                 text,
  payment_provider            text          CHECK (payment_provider IN ('stripe', 'paypal', 'manual')),
  stripe_payment_intent_id    text,
  stripe_charge_id            text,
  paypal_order_id             text,
  paypal_capture_id           text,
  shipping_address_id         uuid          REFERENCES addresses(id) ON DELETE SET NULL,
  shipping_address_snapshot   jsonb         NOT NULL,
  billing_address_snapshot    jsonb,
  customer_notes              text,
  admin_notes                 text,
  tracking_number             text,
  tracking_url                text,
  carrier                     text,
  shipped_at                  timestamptz,
  delivered_at                timestamptz,
  cancelled_at                timestamptz,
  cancel_reason               text,
  refunded_at                 timestamptz,
  refund_reason               text,
  created_at                  timestamptz   NOT NULL DEFAULT now(),
  updated_at                  timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id
  ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number
  ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON orders(payment_status) WHERE payment_status != 'paid';
CREATE INDEX IF NOT EXISTS idx_orders_stripe_intent
  ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_paypal_order
  ON orders(paypal_order_id) WHERE paypal_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders(created_at DESC);


-- ============================================================
-- 20. order_items
-- Line items within an order. Preserves a full product snapshot
-- for permanent history — even if the product is later edited or
-- deleted, order history always shows what was actually sold.
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        uuid          REFERENCES products(id) ON DELETE SET NULL,
  variant_id        uuid          REFERENCES product_variants(id) ON DELETE SET NULL,
  product_snapshot  jsonb         NOT NULL,
  quantity          integer       NOT NULL CHECK (quantity > 0),
  unit_price        numeric(10,2) NOT NULL,
  subtotal          numeric(10,2) NOT NULL,
  discount          numeric(10,2) NOT NULL DEFAULT 0,
  total             numeric(10,2) NOT NULL,
  created_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON order_items(product_id) WHERE product_id IS NOT NULL;


-- ============================================================
-- 21. coupon_redemptions
-- Audit trail of every coupon use.
-- Prevents duplicate use and enables per-user limits.
-- ============================================================
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id         uuid          NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id           uuid          REFERENCES profiles(id) ON DELETE SET NULL,
  order_id          uuid          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_applied  numeric(10,2) NOT NULL,
  created_at        timestamptz   NOT NULL DEFAULT now(),

  -- One redemption per order
  UNIQUE (coupon_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id
  ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id
  ON coupon_redemptions(user_id, coupon_id) WHERE user_id IS NOT NULL;


-- ============================================================
-- 22. reviews
-- Customer product reviews. verified = true when the reviewer
-- has a delivered order containing this product.
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id             uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  order_item_id       uuid        REFERENCES order_items(id) ON DELETE SET NULL,
  rating              integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title               text,
  body                text,
  verified            boolean     NOT NULL DEFAULT false,
  helpful_count       integer     NOT NULL DEFAULT 0,
  not_helpful_count   integer     NOT NULL DEFAULT 0,
  status              text        NOT NULL DEFAULT 'published'
                                  CHECK (status IN ('pending_moderation', 'published', 'flagged', 'removed')),
  admin_note          text,
  images              text[]      NOT NULL DEFAULT '{}',
  reviewer_location   text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  -- One review per customer per product
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id
  ON reviews(product_id, created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating
  ON reviews(product_id, rating DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_reviews_user_id
  ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_verified
  ON reviews(product_id) WHERE verified = true AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_reviews_pending
  ON reviews(created_at DESC) WHERE status = 'pending_moderation';


-- ============================================================
-- 23. review_votes
-- Tracks whether users found a review helpful.
-- Prevents duplicate voting via composite PK.
-- ============================================================
CREATE TABLE IF NOT EXISTS review_votes (
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_id   uuid        NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  is_helpful  boolean     NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, review_id)
);


-- ============================================================
-- 24. wishlists
-- A user can have multiple named wishlists.
-- share_token is generated on first public share (app level).
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlists (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          text        NOT NULL DEFAULT 'My Wishlist',
  is_default    boolean     NOT NULL DEFAULT true,
  is_public     boolean     NOT NULL DEFAULT false,
  share_token   text        UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id
  ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_share_token
  ON wishlists(share_token) WHERE is_public = true;


-- ============================================================
-- 25. wishlist_items
-- Products saved to a wishlist.
-- price_when_saved enables "price dropped!" notifications.
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id       uuid          NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id        uuid          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id        uuid          REFERENCES product_variants(id) ON DELETE SET NULL,
  notes             text,
  price_when_saved  numeric(10,2),
  added_at          timestamptz   NOT NULL DEFAULT now(),

  UNIQUE (wishlist_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id
  ON wishlist_items(wishlist_id, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id
  ON wishlist_items(product_id);


-- ============================================================
-- 26. search_logs
-- Every search query — anonymous or authenticated — is logged.
-- The AI search quality loop reads from this table.
-- Retention: anonymise session_id + user_id after 90 days.
-- ============================================================
CREATE TABLE IF NOT EXISTS search_logs (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            text        NOT NULL,
  user_id               uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  query                 text        NOT NULL,
  query_normalized      text,
  query_type            text        NOT NULL DEFAULT 'ai'
                                    CHECK (query_type IN ('ai', 'keyword', 'category_chip', 'related')),
  results_count         integer,
  problem_category      text,
  clicked_product_id    uuid        REFERENCES products(id) ON DELETE SET NULL,
  click_position        integer,
  time_to_click_ms      integer,
  ai_response_cached    boolean     NOT NULL DEFAULT false,
  ai_latency_ms         integer,
  country_code          text,
  device_type           text        CHECK (device_type IN ('desktop', 'tablet', 'mobile')),
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_user_id
  ON search_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_search_logs_query_fts
  ON search_logs USING GIN(to_tsvector('english', query));
CREATE INDEX IF NOT EXISTS idx_search_logs_query_trgm
  ON search_logs USING GIN(query gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_search_logs_zero_results
  ON search_logs(created_at DESC) WHERE results_count = 0;
CREATE INDEX IF NOT EXISTS idx_search_logs_no_click
  ON search_logs(created_at DESC)
  WHERE clicked_product_id IS NULL AND results_count > 0;
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at
  ON search_logs(created_at DESC);


-- ============================================================
-- 27. search_rules
-- Admin-defined overrides for specific query patterns.
-- Allows boosting, blocking, or redirecting without touching
-- AI logic.
-- ============================================================
CREATE TABLE IF NOT EXISTS search_rules (
  id                uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  query_pattern     text      NOT NULL,
  match_type        text      NOT NULL DEFAULT 'exact'
                              CHECK (match_type IN ('exact', 'contains', 'regex')),
  boost_product_ids uuid[]    NOT NULL DEFAULT '{}',
  block_product_ids uuid[]    NOT NULL DEFAULT '{}',
  redirect_url      text,
  is_active         boolean   NOT NULL DEFAULT true,
  note              text,
  created_by        uuid      REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 28. recommendations
-- AI-generated personalised product recommendations per user.
-- expires_at drives regeneration — stale rows are ignored.
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id    uuid          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  score         numeric(5,4)  NOT NULL CHECK (score >= 0 AND score <= 1),
  reason        text,
  source        text          NOT NULL DEFAULT 'ai_personalised'
                              CHECK (source IN ('ai_personalised', 'ai_collaborative', 'trending', 'manually_curated')),
  shown_count   integer       NOT NULL DEFAULT 0,
  clicked       boolean       NOT NULL DEFAULT false,
  purchased     boolean       NOT NULL DEFAULT false,
  generated_at  timestamptz   NOT NULL DEFAULT now(),
  expires_at    timestamptz
);

-- Note: expires_at > now() cannot be used as a partial index predicate
-- (now() is STABLE, not IMMUTABLE). Query layer filters on expires_at.
CREATE INDEX IF NOT EXISTS idx_recommendations_user
  ON recommendations(user_id, score DESC, expires_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_product
  ON recommendations(product_id);


-- ============================================================
-- 29. ai_generated_content
-- Audit trail of every piece of content generated by Claude.
-- Admins review and approve before content goes live.
-- entity_id is polymorphic (no DB-level FK).
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type       text        NOT NULL
                                CHECK (entity_type IN ('product', 'category', 'email', 'ad_copy', 'faq', 'review_summary', 'recommendation_reason', 'search_answer')),
  entity_id         uuid,
  field_name        text,
  prompt            text        NOT NULL,
  model             text        NOT NULL,
  input_tokens      integer,
  output_tokens     integer,
  latency_ms        integer,
  content           text        NOT NULL,
  status            text        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft', 'approved', 'rejected', 'published', 'superseded')),
  reviewed_by       uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at       timestamptz,
  rejection_reason  text,
  published_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_content_entity
  ON ai_generated_content(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_content_status
  ON ai_generated_content(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_content_pending
  ON ai_generated_content(created_at DESC) WHERE status = 'draft';


-- ============================================================
-- 30. newsletter_subscribers
-- Email marketing list. Separate from profiles — allows anonymous
-- subscribers without a HomeNest account.
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text        UNIQUE NOT NULL,
  name              text,
  user_id           uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  status            text        NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained', 'cleaned')),
  source            text,
  tags              text[]      NOT NULL DEFAULT '{}',
  subscribed_at     timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at   timestamptz,
  bounce_type       text        CHECK (bounce_type IN ('hard', 'soft')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email
  ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status
  ON newsletter_subscribers(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_newsletter_tags
  ON newsletter_subscribers USING GIN(tags);


-- ============================================================
-- 31. notifications
-- In-app notification feed per user. Read by Supabase Realtime.
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text        NOT NULL
                          CHECK (type IN (
                            'order_confirmed', 'order_shipped', 'order_delivered',
                            'review_approved', 'price_drop', 'back_in_stock',
                            'wishlist_sale', 'system'
                          )),
  title       text        NOT NULL,
  body        text,
  action_url  text,
  image_url   text,
  data        jsonb       NOT NULL DEFAULT '{}',
  is_read     boolean     NOT NULL DEFAULT false,
  read_at     timestamptz,
  expires_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, created_at DESC) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_all
  ON notifications(user_id, created_at DESC);


-- ============================================================
-- 32. page_views
-- Append-only. One row per page view.
-- Retention: 2 years online; archive to Parquet beyond that.
-- ============================================================
CREATE TABLE IF NOT EXISTS page_views (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    text        NOT NULL,
  user_id       uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  page_type     text        CHECK (page_type IN ('home', 'product', 'category', 'cart', 'checkout', 'order_confirmation', 'account', 'admin', 'other')),
  page_path     text        NOT NULL,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  country_code  text,
  device_type   text        CHECK (device_type IN ('desktop', 'tablet', 'mobile')),
  browser       text,
  os            text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at
  ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path
  ON page_views(page_path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id
  ON page_views(session_id);


-- ============================================================
-- 33. product_events
-- Append-only. Granular events on the product discovery funnel.
-- ============================================================
CREATE TABLE IF NOT EXISTS product_events (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  text          NOT NULL,
  user_id     uuid          REFERENCES profiles(id) ON DELETE SET NULL,
  product_id  uuid          REFERENCES products(id) ON DELETE SET NULL,
  event_type  text          NOT NULL
                            CHECK (event_type IN (
                              'view', 'add_to_cart', 'remove_from_cart',
                              'add_to_wishlist', 'remove_from_wishlist',
                              'purchase', 'review_submitted', 'quick_view'
                            )),
  source      text,
  quantity    integer,
  value       numeric(10,2),
  metadata    jsonb         NOT NULL DEFAULT '{}',
  created_at  timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_events_product_id
  ON product_events(product_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_events_session_id
  ON product_events(session_id);
CREATE INDEX IF NOT EXISTS idx_product_events_funnel
  ON product_events(event_type, created_at DESC);


-- ============================================================
-- 34. conversion_events
-- Append-only. Explicit funnel step tracking per session.
-- ============================================================
CREATE TABLE IF NOT EXISTS conversion_events (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    text          NOT NULL,
  user_id       uuid          REFERENCES profiles(id) ON DELETE SET NULL,
  funnel_step   text          NOT NULL
                              CHECK (funnel_step IN (
                                'product_view', 'add_to_cart', 'checkout_start',
                                'payment_info_entered', 'purchase_complete'
                              )),
  order_id      uuid          REFERENCES orders(id) ON DELETE SET NULL,
  revenue       numeric(10,2),
  step_index    integer       NOT NULL,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_session
  ON conversion_events(session_id, step_index);
CREATE INDEX IF NOT EXISTS idx_conversion_events_step
  ON conversion_events(funnel_step, created_at DESC);


-- ============================================================
-- 35. settings
-- Key-value store for application configuration.
-- is_public=true settings are readable by anonymous clients.
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key         text    PRIMARY KEY,
  value       jsonb   NOT NULL,
  description text,
  is_public   boolean NOT NULL DEFAULT false,
  "group"     text,
  updated_by  uuid    REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 36. feature_flags
-- Progressive feature rollout. Checked at runtime — no redeploy
-- needed to enable or disable features.
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  key                 text      PRIMARY KEY,
  is_enabled          boolean   NOT NULL DEFAULT false,
  rollout_percentage  integer   NOT NULL DEFAULT 0
                                CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  allowed_user_ids    uuid[]    NOT NULL DEFAULT '{}',
  description         text,
  updated_by          uuid      REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at          timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 37. audit_log
-- Append-only record of admin actions and sensitive state changes.
-- Rows are NEVER updated or deleted after insertion.
-- Retention: 7 years (legal requirement).
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  action      text        NOT NULL,
  entity_type text,
  entity_id   uuid,
  old_value   jsonb,
  new_value   jsonb,
  ip_address  inet,
  user_agent  text,
  metadata    jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity
  ON audit_log(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON audit_log(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
  ON audit_log(created_at DESC);
