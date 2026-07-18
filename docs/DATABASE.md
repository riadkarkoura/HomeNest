# HomeNest — Production Database Design

> **Status:** Design reference · **Version:** 1.0 · **Date:** 2026-07-11
>
> This document is the complete production database specification for HomeNest.
> It covers every table, column, constraint, index, relationship, RLS policy,
> trigger, and scalability consideration. No implementation code here — this is
> the canonical design reference consulted before any migration is written.
>
> Read alongside: `docs/ARCHITECTURE.md` · `PROJECT_VISION.md`

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [PostgreSQL Extensions](#2-postgresql-extensions)
3. [Naming Conventions](#3-naming-conventions)
4. [Entity Relationship Overview](#4-entity-relationship-overview)
5. [Customers & Auth](#5-customers--auth)
   - profiles · addresses · notifications
6. [Catalogue](#6-catalogue)
   - categories · products · product_variants · problem_tags · ai_tags
7. [Media Library](#7-media-library)
   - media · product_images · product_videos · tiktok_assets
8. [Commerce](#8-commerce)
   - carts · cart_items · orders · order_items · coupons · coupon_redemptions
9. [Social Proof](#9-social-proof)
   - reviews · review_votes · wishlists · wishlist_items
10. [Discovery & AI](#10-discovery--ai)
    - search_logs · search_rules · product_embeddings · recommendations
11. [AI Content & Tags](#11-ai-content--tags)
    - ai_tags · ai_generated_content
12. [SEO](#12-seo)
    - seo_metadata
13. [Analytics](#13-analytics)
    - page_views · product_events · conversion_events
14. [Marketing](#14-marketing)
    - newsletter_subscribers
15. [Configuration](#15-configuration)
    - settings · feature_flags
16. [Observability](#16-observability)
    - audit_log
17. [Junction Tables Summary](#17-junction-tables-summary)
18. [Index Strategy](#18-index-strategy)
19. [Row-Level Security Policies](#19-row-level-security-policies)
20. [Triggers & Automatic Functions](#20-triggers--automatic-functions)
21. [Relationships Reference](#21-relationships-reference)
22. [Future Scalability](#22-future-scalability)

---

## 1. Design Principles

### Core rules every table must follow

1. **UUID primary keys everywhere** — `gen_random_uuid()` default. No integer sequences exposed to clients.
2. **Timezone-aware timestamps always** — `timestamptz`, never `timestamp`.
3. **Text over varchar** — PostgreSQL `text` type. Length constraints use `CHECK` where needed.
4. **Immutable order history** — snapshots over foreign keys for order items and addresses.
5. **Soft deletes where data has value** — `deleted_at timestamptz` instead of `DELETE` on products, orders, reviews.
6. **Denormalized counters for hot reads** — `review_count`, `total_orders`, `total_spent` maintained by triggers. Never `COUNT(*)` in hot paths.
7. **JSONB for flexible metadata** — configuration, snapshots, and rarely-queried detail stored in `jsonb` columns. Never serialize arrays of objects as `text`.
8. **Arrays for ordered sets** — `text[]` and `uuid[]` for ordered IDs and tags where joins are overkill.
9. **Explicit `CHECK` constraints** — all enum-style columns use `CHECK IN (...)`. No unconstrained text for state machines.
10. **Cascade deletes with care** — user data cascades, catalogue data uses `SET NULL` to preserve history.
11. **RLS on every table** — no table is accessible without a policy. Default deny.
12. **No application logic in column names** — columns describe data, not UI. `status` not `is_shipped_to_customer`.

---

## 2. PostgreSQL Extensions

Enable before any migration runs. These are Supabase-supported extensions, enabled in the Supabase dashboard or via migration:

| Extension | Purpose | Supabase enabled by default |
|---|---|---|
| `uuid-ossp` | `gen_random_uuid()` for PKs | Yes |
| `pgcrypto` | Secure token generation | Yes |
| `pg_trgm` | Trigram fuzzy search on product names and queries | No — enable in dashboard |
| `unaccent` | Remove accents for search normalisation | No — enable in dashboard |
| `pgvector` | Vector similarity search for AI embeddings | No — enable in dashboard |
| `moddatetime` | Auto-update `updated_at` via trigger | No — implement manually |

---

## 3. Naming Conventions

| Pattern | Rule | Example |
|---|---|---|
| Table names | `snake_case`, plural | `product_images` |
| Column names | `snake_case` | `created_at` |
| Primary keys | `id uuid` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| Foreign keys | `{table_singular}_id` | `product_id`, `user_id` |
| Self-referential FK | `parent_{table_singular}_id` | `parent_category_id` |
| Boolean columns | `is_` or `has_` prefix | `is_active`, `has_variants` |
| Timestamps | `_at` suffix | `created_at`, `shipped_at` |
| Counters | `_count` suffix | `review_count`, `uses_count` |
| Snapshots (jsonb) | `_snapshot` suffix | `shipping_address_snapshot` |
| Status enums | `status` column | `CHECK IN ('pending','active','archived')` |
| Soft delete | `deleted_at` | `deleted_at timestamptz DEFAULT NULL` |
| Junction tables | `{table_a}_{table_b}` alphabetical | `product_ai_tags` |

---

## 4. Entity Relationship Overview

```
auth.users (Supabase-managed)
    │ 1:1
    ▼
profiles ───────────────────────────────────────────────────────────────────┐
    │ 1:many                                                                 │
    ├── addresses                                                            │
    │                                                                        │
    ├── orders ─────────────────┬── order_items ──────┬── products          │
    │       │                   │                     │       │             │
    │   coupon_redemptions   order_items           variants   │             │
    │       │                                          │       │             │
    │   coupons                                  product_    │             │
    │                                              variants   │             │
    ├── carts ─────── cart_items ──────── products             │             │
    │                                                          │             │
    ├── wishlists ─── wishlist_items ──── products            │             │
    │                                                          │             │
    ├── reviews ──── products                                  │             │
    │       │                                                  │             │
    │   review_votes                                           │             │
    │                                                          │             │
    ├── search_logs ──── products (clicked)                    │             │
    │                                                          │             │
    ├── recommendations ──── products                          │             │
    │                                                          │             │
    ├── notifications                                          │             │
    │                                                          │             │
    └── newsletter_subscribers                                 │             │
                                                               │             │
categories ─── products ───────────────────────────────────────┘             │
    │               │                                                         │
    │           product_images                                                │
    │           product_videos                                                │
    │           product_problem_tags ── problem_tags                          │
    │           product_ai_tags ─────── ai_tags                              │
    │           product_embeddings                                            │
    │           tiktok_assets                                                 │
    │           seo_metadata (entity_type='product')                         │
    │                                                                         │
    └── seo_metadata (entity_type='category')                                │
                                                                              │
media ─── uploaded by ───────────────────────────────────────────────────────┘

settings (key-value, standalone)
feature_flags (key-value, standalone)
audit_log (standalone — append-only)
page_views (standalone — append-only)
product_events (standalone — append-only)
conversion_events (standalone — append-only)
ai_generated_content (standalone with optional entity_id)
search_rules (standalone, admin-managed)
```

---

## 5. Customers & Auth

### `profiles`

Extended user record linked 1:1 to Supabase `auth.users`. Created automatically via trigger on `auth.users` INSERT.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users(id)` ON DELETE CASCADE | Matches Supabase auth UID |
| `email` | `text` | UNIQUE NOT NULL | Synced from `auth.users.email` |
| `name` | `text` | | Display name (may be full name or handle) |
| `first_name` | `text` | | |
| `last_name` | `text` | | |
| `phone` | `text` | | E.164 format (+44...) |
| `avatar_url` | `text` | | CDN URL or auth provider avatar |
| `role` | `text` | DEFAULT `'user'` CHECK IN `('user','staff','admin')` | RBAC role |
| `marketing_opt_in` | `boolean` | DEFAULT `false` | Email marketing consent |
| `language` | `text` | DEFAULT `'en'` | ISO 639-1 language code |
| `currency` | `text` | DEFAULT `'USD'` | Preferred display currency |
| `timezone` | `text` | DEFAULT `'UTC'` | IANA timezone identifier |
| `total_orders` | `integer` | DEFAULT `0` | Denormalized — maintained by trigger |
| `total_spent` | `numeric(12,2)` | DEFAULT `0` | Denormalized — maintained by trigger |
| `last_seen_at` | `timestamptz` | | Updated on authenticated requests |
| `deleted_at` | `timestamptz` | DEFAULT NULL | Soft delete (GDPR right to erasure) |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Auto-updated by trigger |

**Indexes:**
```
idx_profiles_email          ON profiles(email)
idx_profiles_role           ON profiles(role) WHERE role != 'user'
idx_profiles_deleted_at     ON profiles(deleted_at) WHERE deleted_at IS NOT NULL
```

**Notes:**
- Soft delete nullifies PII but preserves the row for order history integrity.
- `total_orders` and `total_spent` are updated by the `orders` INSERT trigger — never computed at query time in hot paths.

---

### `addresses`

Shipping and billing addresses stored separately from order snapshots, so users can manage a saved address book.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE NOT NULL | |
| `type` | `text` | DEFAULT `'shipping'` CHECK IN `('shipping','billing')` | |
| `is_default` | `boolean` | DEFAULT `false` | Only one default per type per user enforced by partial unique index |
| `label` | `text` | | "Home", "Work", "Parents' house" |
| `first_name` | `text` | NOT NULL | |
| `last_name` | `text` | NOT NULL | |
| `company` | `text` | | |
| `line1` | `text` | NOT NULL | Street number + street name |
| `line2` | `text` | | Apartment, suite, unit |
| `city` | `text` | NOT NULL | |
| `state` | `text` | | State / province / county |
| `postal_code` | `text` | NOT NULL | |
| `country_code` | `text` | NOT NULL | ISO 3166-1 alpha-2 ("US", "GB") |
| `phone` | `text` | | For courier contact |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_addresses_user_id           ON addresses(user_id)
idx_addresses_default_shipping  ON addresses(user_id) WHERE is_default = true AND type = 'shipping'
idx_addresses_default_billing   ON addresses(user_id) WHERE is_default = true AND type = 'billing'
```

**Unique constraint:**
```
UNIQUE (user_id, type) WHERE is_default = true
```
Only one default address of each type per user.

---

### `notifications`

In-app notification feed per user. Read by Supabase Realtime.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE NOT NULL | |
| `type` | `text` | NOT NULL CHECK IN `('order_confirmed','order_shipped','order_delivered','review_approved','price_drop','back_in_stock','wishlist_sale','system')` | |
| `title` | `text` | NOT NULL | |
| `body` | `text` | | |
| `action_url` | `text` | | Deep link destination |
| `image_url` | `text` | | Optional thumbnail |
| `data` | `jsonb` | DEFAULT `'{}'` | Entity IDs, amounts, etc. |
| `is_read` | `boolean` | DEFAULT `false` | |
| `read_at` | `timestamptz` | | |
| `expires_at` | `timestamptz` | | Auto-archive after this date |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_notifications_user_unread   ON notifications(user_id, created_at DESC) WHERE is_read = false
idx_notifications_user_all      ON notifications(user_id, created_at DESC)
```

---

## 6. Catalogue

### `categories`

Supports one level of nesting (parent/child) for future subcategory use.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `slug` | `text` | UNIQUE NOT NULL | URL-safe identifier ("kitchen") |
| `name` | `text` | NOT NULL | Display name ("Kitchen") |
| `description` | `text` | | Shown on category landing pages |
| `parent_id` | `uuid` | FK → `categories(id)` ON DELETE SET NULL | NULL = top-level category |
| `icon_name` | `text` | | Lucide icon identifier ("UtensilsCrossed") |
| `image_url` | `text` | | Category hero image CDN URL |
| `color_hex` | `text` | | Optional accent colour for UI cards |
| `sort_order` | `integer` | DEFAULT `0` | Controls display order in navigation |
| `is_active` | `boolean` | DEFAULT `true` | Inactive categories hidden from storefront |
| `product_count` | `integer` | DEFAULT `0` | Denormalized — maintained by trigger |
| `deleted_at` | `timestamptz` | DEFAULT NULL | Soft delete |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Valid categories (current):** Kitchen · Bathroom · Storage · Cleaning · Bedroom · Office · Outdoor

**Indexes:**
```
idx_categories_slug         ON categories(slug)
idx_categories_parent_id    ON categories(parent_id) WHERE parent_id IS NOT NULL
idx_categories_active       ON categories(sort_order) WHERE is_active = true AND deleted_at IS NULL
```

---

### `products`

The central table. All other catalogue tables reference it.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `slug` | `text` | UNIQUE NOT NULL | URL slug ("silicone-sink-splash-guard") |
| `sku` | `text` | UNIQUE | Base-catalogue SKU, independent of `slug` — a rename never regenerates it. Added in migration `20260715000001` (Sprint 8.0, ADR-022), backfilled once from slug. `product_variants.sku` takes precedence when a variant is selected. |
| `name` | `text` | NOT NULL | |
| `tagline` | `text` | | Short value proposition (subtitle on product page) |
| `description` | `text` | | One-sentence summary for cards |
| `long_description` | `text` | | Full richtext product description |
| `problem_solved` | `text` | | One-line problem statement |
| `problem_headline` | `text` | | Section headline for ProblemSection |
| `problem_intro` | `text` | | Opening paragraph for ProblemSection |
| `solution_headline` | `text` | | Section headline for SolutionSection |
| `solution_body` | `text` | | Explanation paragraph for SolutionSection |
| `material` | `text` | | Primary material(s) |
| `dimensions` | `text` | | Human-readable dimensions string |
| `weight_grams` | `integer` | | For shipping cost calculation |
| `price` | `numeric(10,2)` | NOT NULL CHECK > 0 | Current selling price |
| `original_price` | `numeric(10,2)` | CHECK > 0 | Pre-discount price; NULL if no discount |
| `cost_price` | `numeric(10,2)` | | Purchase / COGS price. Admin-only via RLS |
| `currency` | `text` | DEFAULT `'USD'` | Base currency |
| `category_id` | `uuid` | FK → `categories(id)` ON DELETE SET NULL | |
| `badge` | `text` | CHECK IN `('Bestseller','New','Editor''s Pick','Sale')` | |
| `has_variants` | `boolean` | DEFAULT `false` | True when `product_variants` rows exist |
| `rating` | `numeric(3,2)` | DEFAULT `0` CHECK BETWEEN 0 AND 5 | Denormalized avg — trigger-maintained |
| `review_count` | `integer` | DEFAULT `0` | Denormalized count — trigger-maintained |
| `in_stock` | `boolean` | DEFAULT `true` | Aggregate stock flag |
| `stock_quantity` | `integer` | DEFAULT `0` | Total units available |
| `featured` | `boolean` | DEFAULT `false` | Shown on homepage FeaturedSection |
| `is_active` | `boolean` | DEFAULT `true` | Inactive = hidden from storefront |
| `sort_order` | `integer` | DEFAULT `0` | Admin-controlled display order |
| `tags` | `text[]` | DEFAULT `'{}'` | Keyword tags for search and filtering |
| `benefits` | `jsonb` | NOT NULL DEFAULT `'[]'` | Array of `{ id, text }` — the Product Story "Benefits" list from the Admin Studio. Added in migration 005 (Sprint 6) |
| `published_at` | `timestamptz` | | NULL = draft. Set on first publish |
| `deleted_at` | `timestamptz` | DEFAULT NULL | Soft delete |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_products_slug           ON products(slug)
idx_products_category_id    ON products(category_id)
idx_products_featured       ON products(sort_order) WHERE featured = true AND is_active = true AND deleted_at IS NULL
idx_products_in_stock       ON products(category_id) WHERE in_stock = true AND is_active = true AND deleted_at IS NULL
idx_products_tags           ON products USING GIN(tags)
idx_products_price          ON products(price) WHERE is_active = true AND deleted_at IS NULL
idx_products_rating         ON products(rating DESC) WHERE is_active = true AND deleted_at IS NULL
idx_products_fts            ON products USING GIN(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(problem_solved,'')))
idx_products_trgm_name      ON products USING GIN(name gin_trgm_ops)
```

**Notes:**
- `problem_headline`, `problem_intro`, `solution_headline`, `solution_body` migrate the content currently in `src/lib/product-content.ts` into the database.
- `cost_price` is only visible to roles `'staff'` and `'admin'` via RLS — customers never see it.
- Full-text index covers name, description, and problem_solved simultaneously.

---

### `product_variants`

Variations of a product (colour, size, material). Only used when `products.has_variants = true`.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `product_id` | `uuid` | FK → `products(id)` ON DELETE CASCADE NOT NULL | |
| `sku` | `text` | UNIQUE NOT NULL | Stock-keeping unit |
| `option_name` | `text` | NOT NULL | e.g. "Colour", "Size" |
| `option_value` | `text` | NOT NULL | e.g. "Stone White", "Large" |
| `price_delta` | `numeric(10,2)` | DEFAULT `0` | Added to base product price |
| `stock_quantity` | `integer` | DEFAULT `0` | |
| `in_stock` | `boolean` | DEFAULT `true` | |
| `image_url` | `text` | | Variant-specific swatch/image |
| `sort_order` | `integer` | DEFAULT `0` | |
| `is_active` | `boolean` | DEFAULT `true` | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_product_variants_product_id     ON product_variants(product_id)
idx_product_variants_sku            ON product_variants(sku)
idx_product_variants_active         ON product_variants(product_id, sort_order) WHERE is_active = true
```

---

### `problem_tags`

A curated taxonomy of household problems. Products are tagged with the problems they solve. This drives the "Shop by Problem" UX and AI search categorisation.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `slug` | `text` | UNIQUE NOT NULL | e.g. "water-splash", "small-space" |
| `name` | `text` | NOT NULL | e.g. "Water Splashing" |
| `description` | `text` | | What this problem feels like to the customer |
| `category_id` | `uuid` | FK → `categories(id)` ON DELETE SET NULL | Primary category this problem belongs to |
| `icon_name` | `text` | | Lucide icon for UI cards |
| `image_url` | `text` | | Hero image for "Shop by Problem" cards |
| `sort_order` | `integer` | DEFAULT `0` | Order in ShopByProblemSection |
| `is_active` | `boolean` | DEFAULT `true` | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Current problem tags (from ShopByProblemSection):**
- `water-splashing` / Stop Water Splashing
- `small-spaces` / Organize Small Spaces
- `kitchen-clutter` / Declutter Your Kitchen
- `bathroom-storage` / Bathroom Storage
- `cleaning` / Cleaning Made Easy
- `cable-management` / Cable Management

---

### `product_problem_tags` (junction)

Maps products to the problems they solve. A product can solve multiple problems; a problem can be solved by multiple products.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `product_id` | `uuid` | FK → `products(id)` ON DELETE CASCADE NOT NULL | |
| `problem_tag_id` | `uuid` | FK → `problem_tags(id)` ON DELETE CASCADE NOT NULL | |
| `relevance_score` | `numeric(3,2)` | DEFAULT `1.0` CHECK BETWEEN 0 AND 1 | How strongly this product solves this problem |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Primary key:** `(product_id, problem_tag_id)`

**Indexes:**
```
idx_product_problem_tags_problem    ON product_problem_tags(problem_tag_id, relevance_score DESC)
```

---

### `problem_tag_synonyms`

Natural-language synonyms for each problem tag. Used by AI search to expand query matching.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `problem_tag_id` | `uuid` | FK → `problem_tags(id)` ON DELETE CASCADE NOT NULL | |
| `synonym` | `text` | NOT NULL | e.g. "water on counter", "damp worktop" |

**Primary key:** `(problem_tag_id, synonym)`

---

## 7. Media Library

### `media`

Central media registry. All uploaded files are registered here regardless of where they're used. One row per uploaded file.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `uploaded_by` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | |
| `storage_bucket` | `text` | NOT NULL | Supabase Storage bucket name ("products","avatars","media") |
| `storage_path` | `text` | NOT NULL | Path within bucket ("products/uuid.webp") |
| `cdn_url` | `text` | NOT NULL | Full public CDN URL |
| `filename` | `text` | NOT NULL | Stored filename |
| `original_filename` | `text` | | Original upload filename (for admin reference) |
| `mime_type` | `text` | NOT NULL | e.g. "image/webp", "video/mp4" |
| `size_bytes` | `bigint` | | File size |
| `width` | `integer` | | Pixels (images and videos) |
| `height` | `integer` | | Pixels (images and videos) |
| `duration_seconds` | `integer` | | Videos and audio only |
| `alt_text` | `text` | | Accessibility alt text |
| `caption` | `text` | | Optional display caption |
| `tags` | `text[]` | DEFAULT `'{}'` | Admin labels for filtering media library |
| `metadata` | `jsonb` | DEFAULT `'{}'` | EXIF data, encoding info, etc. |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_media_uploaded_by       ON media(uploaded_by)
idx_media_mime_type         ON media(mime_type)
idx_media_tags              ON media USING GIN(tags)
idx_media_bucket            ON media(storage_bucket, created_at DESC)
```

---

### `product_images`

Ordered gallery images for each product. References `media` for the actual file record.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `product_id` | `uuid` | FK → `products(id)` ON DELETE CASCADE NOT NULL | |
| `variant_id` | `uuid` | FK → `product_variants(id)` ON DELETE SET NULL | NULL = shared across all variants |
| `media_id` | `uuid` | FK → `media(id)` ON DELETE RESTRICT | |
| `cdn_url` | `text` | NOT NULL | Denormalized from `media.cdn_url` for fast reads |
| `alt_text` | `text` | | Overrides `media.alt_text` for this product context |
| `sort_order` | `integer` | DEFAULT `0` | Gallery display order |
| `is_primary` | `boolean` | DEFAULT `false` | First image shown (product card thumbnail) |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Unique constraint:**
```
UNIQUE (product_id) WHERE is_primary = true
```
Enforces exactly one primary image per product.

**Indexes:**
```
idx_product_images_product_id       ON product_images(product_id, sort_order)
idx_product_images_variant_id       ON product_images(variant_id) WHERE variant_id IS NOT NULL
```

---

### `product_videos`

Video content for product pages. Supports both hosted (Supabase Storage) and social embed types.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `product_id` | `uuid` | FK → `products(id)` ON DELETE CASCADE NOT NULL | |
| `type` | `text` | NOT NULL CHECK IN `('hosted','tiktok','instagram_reels','youtube')` | |
| `media_id` | `uuid` | FK → `media(id)` ON DELETE SET NULL | For hosted type only |
| `cdn_url` | `text` | | Hosted video CDN URL |
| `external_url` | `text` | | Embed or share URL for social types |
| `external_id` | `text` | | Platform-specific video ID |
| `thumbnail_url` | `text` | | Preview frame CDN URL |
| `caption` | `text` | | Display caption / CTA text |
| `duration_seconds` | `integer` | | |
| `sort_order` | `integer` | DEFAULT `0` | |
| `is_featured` | `boolean` | DEFAULT `false` | Shown in VideoSection (one per product) |
| `is_active` | `boolean` | DEFAULT `true` | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_product_videos_product_id   ON product_videos(product_id, sort_order)
idx_product_videos_featured     ON product_videos(product_id) WHERE is_featured = true AND is_active = true
```

---

### `tiktok_assets`

TikTok / Instagram Reels content linked to products or used for brand-level campaigns. Synced from TikTok's API or added manually by admin.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `product_id` | `uuid` | FK → `products(id)` ON DELETE SET NULL | NULL = brand-level (not product-specific) |
| `platform` | `text` | DEFAULT `'tiktok'` CHECK IN `('tiktok','instagram')` | |
| `external_id` | `text` | NOT NULL | TikTok video ID or Instagram media ID |
| `author_id` | `text` | | Platform user ID |
| `author_username` | `text` | | @handle |
| `author_display_name` | `text` | | |
| `caption` | `text` | | Original video caption |
| `embed_html` | `text` | | Platform-provided oEmbed HTML |
| `thumbnail_url` | `text` | | Cached thumbnail CDN URL |
| `share_url` | `text` | | Shareable link to original |
| `view_count` | `bigint` | DEFAULT `0` | Last-synced metric |
| `like_count` | `bigint` | DEFAULT `0` | |
| `comment_count` | `bigint` | DEFAULT `0` | |
| `share_count` | `bigint` | DEFAULT `0` | |
| `duration_seconds` | `integer` | | |
| `is_featured` | `boolean` | DEFAULT `false` | Shown in VideoSection |
| `is_ugc` | `boolean` | DEFAULT `false` | User-generated content (vs. brand content) |
| `is_approved` | `boolean` | DEFAULT `false` | Admin must approve UGC before display |
| `status` | `text` | DEFAULT `'active'` CHECK IN `('active','archived','removed','pending_approval')` | |
| `metrics_synced_at` | `timestamptz` | | Last time view/like counts were refreshed |
| `published_at` | `timestamptz` | | Original platform publish date |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Unique constraint:** `UNIQUE (platform, external_id)` — prevents duplicate imports.

**Indexes:**
```
idx_tiktok_assets_product_id    ON tiktok_assets(product_id) WHERE status = 'active'
idx_tiktok_assets_featured      ON tiktok_assets(product_id) WHERE is_featured = true AND status = 'active'
idx_tiktok_assets_ugc           ON tiktok_assets(is_approved, created_at DESC) WHERE is_ugc = true
idx_tiktok_assets_views         ON tiktok_assets(view_count DESC) WHERE status = 'active'
```

---

## 8. Commerce

### `carts`

The active shopping cart for an authenticated user. Guests do not get a server-side cart — their cart lives client-side (Zustand + `localStorage`) until they sign in, at which point it's merged into their `carts` row. See ADR-021.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE NOT NULL | |
| `status` | `text` | NOT NULL DEFAULT `'active'` CHECK IN `('active','converted','abandoned')` | `converted` when checkout succeeds; the row (and its `cart_items`) is kept, not deleted, for conversion-funnel analytics |
| `converted_order_id` | `uuid` | FK → `orders(id)` ON DELETE SET NULL | The order this cart produced, when `status = 'converted'`. Added in migration `20260715000001` (Sprint 8.0, ADR-022) — closes the traceability gap ADR-021 flagged. |
| `currency` | `text` | NOT NULL DEFAULT `'USD'` | matches `products.currency` convention |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` | bumped whenever `cart_items` change (trigger); powers abandoned-cart queries |

**Unique constraint:** `UNIQUE (user_id) WHERE status = 'active'` — exactly one active cart per user, same partial-unique pattern as `addresses`' one-default-per-type constraint. Historical `converted`/`abandoned` rows are never deleted.

**Indexes:**
```
idx_carts_user_active    ON carts(user_id) WHERE status = 'active'
idx_carts_updated_at      ON carts(updated_at) WHERE status = 'active'
```

---

### `cart_items`

Line items in a cart. Deliberately holds **no price/name snapshot** — unlike `order_items`, a cart reflects *live* product data (price, stock) looked up at render and checkout time, not a frozen-in-time record. Snapshotting only happens once a cart converts to an order.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `cart_id` | `uuid` | FK → `carts(id)` ON DELETE CASCADE NOT NULL | |
| `product_id` | `uuid` | FK → `products(id)` ON DELETE CASCADE NOT NULL | |
| `variant_id` | `uuid` | FK → `product_variants(id)` ON DELETE CASCADE | nullable |
| `quantity` | `integer` | NOT NULL CHECK > 0 | |
| `source` | `text` | NOT NULL DEFAULT `'web'` | Free-text attribution of what added this line item — `'web'` today; reserved for `'ai'` (a future recommendation/shopping-assistant agent adding items on the customer's behalf) and `'partner'` (a future external integration) once those exist. Same unconstrained-text-with-documented-values convention as `product_events.source`, not a `CHECK` enum, so a new source doesn't require a migration. |
| `added_at` | `timestamptz` | NOT NULL DEFAULT `now()` | When this line was first added |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` | Bumped on quantity changes |

**Unique constraint:** `UNIQUE (cart_id, product_id, variant_id)` — adding an already-present product increments `quantity` (upsert) rather than inserting a duplicate row. **Note (Patch 8.2.1):** this alone never fires when `variant_id IS NULL` — standard SQL uniqueness semantics never treat two `NULL`s as equal, so it silently permitted duplicate `(cart_id, product_id, NULL)` rows under concurrent adds (100% of the catalogue has no variants today). Closed by a second, partial unique index: `cart_items_cart_product_no_variant_key` — `UNIQUE (cart_id, product_id) WHERE variant_id IS NULL`, added in migration `20260716000002_cart_items_null_variant_unique.sql`. See ADR-021 addendum.

**Indexes:**
```
idx_cart_items_cart_id      ON cart_items(cart_id)
idx_cart_items_product_id   ON cart_items(product_id)
```

---

### `orders`

The order lifecycle record. Contains a complete snapshot of the shipping address and payment intent at the moment of purchase.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `order_number` | `text` | UNIQUE NOT NULL | Human-readable: "HN-20260711-0001" |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | NULL for guest checkout |
| `guest_email` | `text` | | For guest checkout (no account) |
| `status` | `text` | DEFAULT `'pending'` CHECK IN `('pending','processing','shipped','delivered','cancelled','refunded','partially_refunded')` | Top-level order status |
| `payment_status` | `text` | DEFAULT `'unpaid'` CHECK IN `('unpaid','paid','refunded','partially_refunded','failed')` | Payment-specific status |
| `fulfillment_status` | `text` | DEFAULT `'unfulfilled'` CHECK IN `('unfulfilled','processing','fulfilled','partially_fulfilled')` | Warehouse/shipping status |
| `subtotal` | `numeric(10,2)` | NOT NULL | Sum of line items before discount/shipping/tax |
| `shipping_cost` | `numeric(10,2)` | DEFAULT `0` | |
| `tax` | `numeric(10,2)` | DEFAULT `0` | |
| `discount` | `numeric(10,2)` | DEFAULT `0` | Total discount applied |
| `total` | `numeric(10,2)` | NOT NULL | Final charged amount |
| `currency` | `text` | DEFAULT `'USD'` | ISO 4217 currency code |
| `coupon_id` | `uuid` | FK → `coupons(id)` ON DELETE SET NULL | Applied coupon (if any) |
| `coupon_code` | `text` | | Snapshot of coupon code used |
| `payment_provider` | `text` | CHECK IN `('stripe','paypal','manual')` | |
| `stripe_payment_intent_id` | `text` | | |
| `stripe_charge_id` | `text` | | |
| `paypal_order_id` | `text` | | |
| `paypal_capture_id` | `text` | | |
| `shipping_address_id` | `uuid` | FK → `addresses(id)` ON DELETE SET NULL | Live FK (may change) |
| `shipping_address_snapshot` | `jsonb` | NOT NULL | Immutable address at time of order |
| `billing_address_snapshot` | `jsonb` | | |
| `shipping_method` | `text` | | Delivery option chosen at checkout (e.g. "standard", "express") — matches an entry in `src/lib/checkout/shipping-options.ts`, not a DB table. Added in migration `20260715000001` (Sprint 8.0, ADR-022). |
| `customer_notes` | `text` | | Notes from customer at checkout |
| `admin_notes` | `text` | | Internal notes — not visible to customer |
| `tracking_number` | `text` | | Courier tracking number |
| `tracking_url` | `text` | | Courier tracking page URL |
| `carrier` | `text` | | e.g. "UPS", "FedEx", "Royal Mail" |
| `shipped_at` | `timestamptz` | | |
| `delivered_at` | `timestamptz` | | |
| `cancelled_at` | `timestamptz` | | |
| `cancel_reason` | `text` | | |
| `refunded_at` | `timestamptz` | | |
| `refund_reason` | `text` | | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_orders_user_id          ON orders(user_id, created_at DESC)
idx_orders_order_number     ON orders(order_number)
idx_orders_status           ON orders(status, created_at DESC)
idx_orders_payment_status   ON orders(payment_status) WHERE payment_status != 'paid'
idx_orders_stripe_intent    ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL
idx_orders_paypal_order     ON orders(paypal_order_id) WHERE paypal_order_id IS NOT NULL
idx_orders_created_at       ON orders(created_at DESC)
```

**Notes:**
- `shipping_address_snapshot` stores the complete address as JSON — it is frozen at order creation and never updated, ensuring order history accuracy even if the customer later edits their address.
- `order_number` is generated by a database function: `'HN-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 4, '0')`.

---

### `order_items`

Line items within an order. Preserves a full product snapshot for permanent history.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `order_id` | `uuid` | FK → `orders(id)` ON DELETE CASCADE NOT NULL | |
| `product_id` | `uuid` | FK → `products(id)` ON DELETE SET NULL | Nullable — product may be deleted later |
| `variant_id` | `uuid` | FK → `product_variants(id)` ON DELETE SET NULL | |
| `product_snapshot` | `jsonb` | NOT NULL | Complete product record at purchase time (immutable) |
| `quantity` | `integer` | NOT NULL CHECK > 0 | |
| `unit_price` | `numeric(10,2)` | NOT NULL | Price per item at time of purchase |
| `subtotal` | `numeric(10,2)` | NOT NULL | `unit_price × quantity` |
| `discount` | `numeric(10,2)` | DEFAULT `0` | Per-line discount |
| `total` | `numeric(10,2)` | NOT NULL | `subtotal - discount` |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_order_items_order_id        ON order_items(order_id)
idx_order_items_product_id      ON order_items(product_id) WHERE product_id IS NOT NULL
```

**Notes:**
- `product_snapshot` captures the full product name, images, price, and variant at purchase time. This ensures order confirmation emails and order history pages always display what was actually sold, even if the product is later edited or deleted.

---

### `coupons`

Promotional discount codes managed via the Admin Dashboard.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `code` | `text` | UNIQUE NOT NULL | Case-insensitive ("SUMMER20") |
| `description` | `text` | | Admin-facing description of the promotion |
| `type` | `text` | NOT NULL CHECK IN `('percentage','fixed','free_shipping','buy_x_get_y')` | |
| `value` | `numeric(10,2)` | | Percentage (20.00) or fixed amount (10.00) |
| `buy_quantity` | `integer` | | For buy_x_get_y: buy this many |
| `get_quantity` | `integer` | | For buy_x_get_y: get this many free |
| `minimum_order` | `numeric(10,2)` | DEFAULT `0` | Minimum order subtotal to apply |
| `maximum_discount` | `numeric(10,2)` | | Cap on percentage discounts |
| `currency` | `text` | DEFAULT `'USD'` | For fixed-amount coupons |
| `applies_to` | `text` | DEFAULT `'order'` CHECK IN `('order','product','category')` | Scope of discount |
| `product_ids` | `uuid[]` | | Specific products (if applies_to = 'product') |
| `category_ids` | `uuid[]` | | Specific categories (if applies_to = 'category') |
| `max_uses` | `integer` | | NULL = unlimited total redemptions |
| `max_uses_per_user` | `integer` | DEFAULT `1` | NULL = unlimited per user |
| `uses_count` | `integer` | DEFAULT `0` | Denormalized — incremented by trigger |
| `is_active` | `boolean` | DEFAULT `true` | |
| `starts_at` | `timestamptz` | | NULL = active immediately |
| `expires_at` | `timestamptz` | | NULL = never expires |
| `created_by` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | Admin who created it |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_coupons_code            ON coupons(upper(code))
idx_coupons_active          ON coupons(expires_at) WHERE is_active = true
idx_coupons_product_ids     ON coupons USING GIN(product_ids)
idx_coupons_category_ids    ON coupons USING GIN(category_ids)
```

---

### `coupon_redemptions`

Audit trail of every coupon use. Prevents duplicate use and enables per-user limits.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `coupon_id` | `uuid` | FK → `coupons(id)` ON DELETE CASCADE NOT NULL | |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | NULL for guest orders |
| `order_id` | `uuid` | FK → `orders(id)` ON DELETE CASCADE NOT NULL | |
| `discount_applied` | `numeric(10,2)` | NOT NULL | Actual discount amount granted |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Unique constraint:** `UNIQUE (coupon_id, order_id)` — one redemption per order.

**Indexes:**
```
idx_coupon_redemptions_coupon_id    ON coupon_redemptions(coupon_id)
idx_coupon_redemptions_user_id      ON coupon_redemptions(user_id, coupon_id) WHERE user_id IS NOT NULL
```

---

## 9. Social Proof

### `reviews`

Customer product reviews, gated by verified purchase.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `product_id` | `uuid` | FK → `products(id)` ON DELETE CASCADE NOT NULL | |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | |
| `order_item_id` | `uuid` | FK → `order_items(id)` ON DELETE SET NULL | Verified purchase link |
| `rating` | `integer` | NOT NULL CHECK BETWEEN 1 AND 5 | |
| `title` | `text` | | Optional review headline |
| `body` | `text` | | Review text |
| `verified` | `boolean` | DEFAULT `false` | Set `true` by trigger when `order_item_id` links to a delivered order |
| `helpful_count` | `integer` | DEFAULT `0` | Denormalized — maintained by trigger |
| `not_helpful_count` | `integer` | DEFAULT `0` | |
| `status` | `text` | DEFAULT `'published'` CHECK IN `('pending_moderation','published','flagged','removed')` | |
| `admin_note` | `text` | | Internal moderation note |
| `images` | `text[]` | DEFAULT `'{}'` | Customer-uploaded review image CDN URLs |
| `reviewer_location` | `text` | | Optional "City, Country" display string |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Unique constraint:** `UNIQUE (user_id, product_id)` — one review per customer per product.

**Indexes:**
```
idx_reviews_product_id          ON reviews(product_id, created_at DESC) WHERE status = 'published'
idx_reviews_product_rating      ON reviews(product_id, rating DESC) WHERE status = 'published'
idx_reviews_user_id             ON reviews(user_id)
idx_reviews_verified            ON reviews(product_id) WHERE verified = true AND status = 'published'
idx_reviews_pending             ON reviews(created_at DESC) WHERE status = 'pending_moderation'
```

---

### `review_votes`

Tracks whether users found a review helpful. Prevents duplicate voting.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE NOT NULL | |
| `review_id` | `uuid` | FK → `reviews(id)` ON DELETE CASCADE NOT NULL | |
| `is_helpful` | `boolean` | NOT NULL | `true` = helpful, `false` = not helpful |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Primary key:** `(user_id, review_id)`

---

### `wishlists`

A user can have multiple named wishlists. One is always marked default.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE NOT NULL | |
| `name` | `text` | NOT NULL DEFAULT `'My Wishlist'` | |
| `is_default` | `boolean` | DEFAULT `true` | |
| `is_public` | `boolean` | DEFAULT `false` | Enables share link |
| `share_token` | `text` | UNIQUE | Generated on first public share |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_wishlists_user_id       ON wishlists(user_id)
idx_wishlists_share_token   ON wishlists(share_token) WHERE is_public = true
```

---

### `wishlist_items`

Products saved to a wishlist.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `wishlist_id` | `uuid` | FK → `wishlists(id)` ON DELETE CASCADE NOT NULL | |
| `product_id` | `uuid` | FK → `products(id)` ON DELETE CASCADE NOT NULL | |
| `variant_id` | `uuid` | FK → `product_variants(id)` ON DELETE SET NULL | Specific variant saved |
| `notes` | `text` | | Optional personal note ("gift for mum") |
| `price_when_saved` | `numeric(10,2)` | | For "price dropped!" notifications |
| `added_at` | `timestamptz` | DEFAULT `now()` | |

**Unique constraint:** `UNIQUE (wishlist_id, product_id, variant_id)`

**Indexes:**
```
idx_wishlist_items_wishlist_id  ON wishlist_items(wishlist_id, added_at DESC)
idx_wishlist_items_product_id   ON wishlist_items(product_id)
```

---

## 10. Discovery & AI

### `search_logs`

Every search query — anonymous or authenticated — is logged. The AI search quality loop reads from this table.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `session_id` | `text` | NOT NULL | Anonymous or authenticated session UUID |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | NULL for anonymous |
| `query` | `text` | NOT NULL | Raw user query text |
| `query_normalized` | `text` | | Lowercase, stripped, stemmed version for dedup |
| `query_type` | `text` | DEFAULT `'ai'` CHECK IN `('ai','keyword','category_chip','related')` | How the search was triggered |
| `results_count` | `integer` | | Number of products returned |
| `problem_category` | `text` | | AI-detected problem category |
| `clicked_product_id` | `uuid` | FK → `products(id)` ON DELETE SET NULL | Product user clicked on (if any) |
| `click_position` | `integer` | | Position in results that was clicked (0-based) |
| `time_to_click_ms` | `integer` | | Milliseconds from results shown to click |
| `ai_response_cached` | `boolean` | DEFAULT `false` | Was this served from Redis cache? |
| `ai_latency_ms` | `integer` | | Time for AI API response (null if cached) |
| `country_code` | `text` | | ISO 3166-1 from request IP |
| `device_type` | `text` | CHECK IN `('desktop','tablet','mobile')` | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_search_logs_user_id         ON search_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL
idx_search_logs_query_fts       ON search_logs USING GIN(to_tsvector('english', query))
idx_search_logs_query_trgm      ON search_logs USING GIN(query gin_trgm_ops)
idx_search_logs_zero_results    ON search_logs(created_at DESC) WHERE results_count = 0
idx_search_logs_no_click        ON search_logs(created_at DESC) WHERE clicked_product_id IS NULL AND results_count > 0
idx_search_logs_created_at      ON search_logs(created_at DESC)
```

**Retention:** Anonymise `session_id` and `user_id` after 90 days via scheduled Supabase Edge Function.

---

### `search_rules`

Admin-defined overrides for specific query patterns. Allows boosting, blocking, or redirecting without touching AI logic.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `query_pattern` | `text` | NOT NULL | Exact phrase, or regex pattern |
| `match_type` | `text` | DEFAULT `'exact'` CHECK IN `('exact','contains','regex')` | |
| `boost_product_ids` | `uuid[]` | DEFAULT `'{}'` | Force these products to top of results |
| `block_product_ids` | `uuid[]` | DEFAULT `'{}'` | Hide these from results |
| `redirect_url` | `text` | | Skip results and redirect here instead |
| `is_active` | `boolean` | DEFAULT `true` | |
| `note` | `text` | | Admin explanation of why this rule exists |
| `created_by` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

---

### `product_embeddings`

Vector embeddings for semantic search. Stored in a separate table to keep the `products` table lightweight and to isolate the pgvector index.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `product_id` | `uuid` | PK, FK → `products(id)` ON DELETE CASCADE | |
| `embedding` | `vector(1536)` | NOT NULL | Text embedding of product description + problem |
| `embedding_text` | `text` | NOT NULL | The text that was embedded (for debugging and re-embed) |
| `model` | `text` | NOT NULL | Embedding model used (e.g. "text-embedding-3-small") |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_product_embeddings_vector   ON product_embeddings USING ivfflat(embedding vector_cosine_ops)
                                WITH (lists = 100)
```
IVFFlat index for approximate nearest-neighbour search. Lists = 100 is appropriate up to 1 million vectors; rebuild with `lists = sqrt(n_rows)` as catalogue grows.

---

### `recommendations`

AI-generated personalised product recommendations per authenticated user.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE NOT NULL | |
| `product_id` | `uuid` | FK → `products(id)` ON DELETE CASCADE NOT NULL | |
| `score` | `numeric(5,4)` | NOT NULL CHECK BETWEEN 0 AND 1 | Relevance confidence score |
| `reason` | `text` | | AI-generated human-readable reason |
| `source` | `text` | DEFAULT `'ai_personalised'` CHECK IN `('ai_personalised','ai_collaborative','trending','manually_curated')` | Algorithm that generated this |
| `shown_count` | `integer` | DEFAULT `0` | How many times shown to user |
| `clicked` | `boolean` | DEFAULT `false` | Whether user clicked the recommendation |
| `purchased` | `boolean` | DEFAULT `false` | Whether user purchased the product |
| `generated_at` | `timestamptz` | DEFAULT `now()` | |
| `expires_at` | `timestamptz` | | Stale after this — triggers regeneration |

**Indexes:**
```
idx_recommendations_user        ON recommendations(user_id, score DESC) WHERE expires_at > now()
idx_recommendations_product     ON recommendations(product_id)
```

---

## 11. AI Content & Tags

### `ai_tags`

Machine-generated semantic tags produced by Claude. Different from human `problem_tags` — these capture attributes, moods, and features the AI detects.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `name` | `text` | UNIQUE NOT NULL | e.g. "eco-friendly", "quick-install", "kid-safe" |
| `description` | `text` | | What this tag means |
| `source` | `text` | DEFAULT `'generated'` CHECK IN `('generated','curated','imported')` | |
| `model_version` | `text` | | Claude model that generated this tag |
| `embedding` | `vector(1536)` | | For tag similarity and clustering |
| `usage_count` | `integer` | DEFAULT `0` | Denormalized count — trigger-maintained |
| `is_approved` | `boolean` | DEFAULT `false` | Admin must approve before tag is used in search |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

---

### `product_ai_tags` (junction)

Links AI-generated tags to products with a confidence score.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `product_id` | `uuid` | FK → `products(id)` ON DELETE CASCADE NOT NULL | |
| `ai_tag_id` | `uuid` | FK → `ai_tags(id)` ON DELETE CASCADE NOT NULL | |
| `confidence` | `numeric(3,2)` | DEFAULT `1.0` CHECK BETWEEN 0 AND 1 | AI confidence in this tag for this product |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Primary key:** `(product_id, ai_tag_id)`

**Indexes:**
```
idx_product_ai_tags_product     ON product_ai_tags(product_id)
idx_product_ai_tags_tag         ON product_ai_tags(ai_tag_id, confidence DESC)
```

---

### `ai_generated_content`

Audit trail of every piece of content generated by Claude. Admins review and approve before publishing.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `entity_type` | `text` | NOT NULL CHECK IN `('product','category','email','ad_copy','faq','review_summary','recommendation_reason','search_answer')` | What was being generated for |
| `entity_id` | `uuid` | | FK to the entity (polymorphic, no DB-level FK) |
| `field_name` | `text` | | Which field was generated (e.g. "long_description") |
| `prompt` | `text` | NOT NULL | Full prompt sent to Claude |
| `model` | `text` | NOT NULL | e.g. "claude-sonnet-4-6", "claude-haiku-4-5" |
| `input_tokens` | `integer` | | |
| `output_tokens` | `integer` | | |
| `latency_ms` | `integer` | | API response time |
| `content` | `text` | NOT NULL | The generated output |
| `status` | `text` | DEFAULT `'draft'` CHECK IN `('draft','approved','rejected','published','superseded')` | |
| `reviewed_by` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | Admin reviewer |
| `reviewed_at` | `timestamptz` | | |
| `rejection_reason` | `text` | | |
| `published_at` | `timestamptz` | | When pushed live |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_ai_content_entity           ON ai_generated_content(entity_type, entity_id, created_at DESC)
idx_ai_content_status           ON ai_generated_content(status, created_at DESC)
idx_ai_content_pending          ON ai_generated_content(created_at DESC) WHERE status = 'draft'
```

---

## 12. SEO

### `seo_metadata`

SEO and Open Graph metadata for any entity: products, categories, or static pages. One row per entity.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `entity_type` | `text` | NOT NULL CHECK IN `('product','category','page')` | |
| `entity_id` | `uuid` | NOT NULL | ID of the product, category, or page |
| `title` | `text` | | `<title>` tag override (defaults to entity name) |
| `description` | `text` | | `<meta name="description">` |
| `og_title` | `text` | | Open Graph title |
| `og_description` | `text` | | Open Graph description |
| `og_image_url` | `text` | | Open Graph image (1200×630 recommended) |
| `twitter_card` | `text` | DEFAULT `'summary_large_image'` | |
| `twitter_title` | `text` | | |
| `twitter_description` | `text` | | |
| `twitter_image_url` | `text` | | |
| `canonical_url` | `text` | | Canonical URL if different from page URL |
| `keywords` | `text[]` | NOT NULL DEFAULT `'{}'` | Admin-entered SEO keywords (Studio's "Keywords" tag input). Added in migration 005 (Sprint 6) |
| `no_index` | `boolean` | DEFAULT `false` | Adds `noindex` meta tag |
| `structured_data` | `jsonb` | | JSON-LD schema.org markup (Product, BreadcrumbList, etc.) |
| `hreflang` | `jsonb` | | `{"en": "/path", "fr": "/fr/path"}` for i18n |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Unique constraint:** `UNIQUE (entity_type, entity_id)` — one SEO record per entity.

**Indexes:**
```
idx_seo_metadata_entity         ON seo_metadata(entity_type, entity_id)
```

---

## 13. Analytics

All analytics tables are **append-only** — no row is ever updated or deleted. Data older than the retention window is archived to cold storage, not deleted.

### `page_views`

One row per page view. Powers traffic analytics in the Admin Dashboard.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `session_id` | `text` | NOT NULL | Anonymous or authenticated session UUID |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | |
| `page_type` | `text` | CHECK IN `('home','product','category','cart','checkout','order_confirmation','account','admin','other')` | |
| `page_path` | `text` | NOT NULL | URL path (no query string) |
| `referrer` | `text` | | HTTP Referer header |
| `utm_source` | `text` | | |
| `utm_medium` | `text` | | |
| `utm_campaign` | `text` | | |
| `country_code` | `text` | | ISO 3166-1 from IP geolocation |
| `device_type` | `text` | CHECK IN `('desktop','tablet','mobile')` | |
| `browser` | `text` | | e.g. "Chrome", "Safari" |
| `os` | `text` | | e.g. "macOS", "iOS" |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_page_views_created_at       ON page_views(created_at DESC)
idx_page_views_page_path        ON page_views(page_path, created_at DESC)
idx_page_views_session_id       ON page_views(session_id)
```

**Retention:** 2 years online. Archive to Supabase Storage (Parquet) beyond that.

---

### `product_events`

Granular events on the product discovery and purchase funnel.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `session_id` | `text` | NOT NULL | |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | |
| `product_id` | `uuid` | FK → `products(id)` ON DELETE SET NULL | |
| `event_type` | `text` | NOT NULL CHECK IN `('view','add_to_cart','remove_from_cart','add_to_wishlist','remove_from_wishlist','purchase','review_submitted','quick_view')` | |
| `source` | `text` | | Where the action originated: "product_page","search_results","homepage_featured","related_section","recommendation" |
| `quantity` | `integer` | | For cart events |
| `value` | `numeric(10,2)` | | Revenue value (for purchase events) |
| `metadata` | `jsonb` | DEFAULT `'{}'` | Any additional context |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_product_events_product_id   ON product_events(product_id, event_type, created_at DESC)
idx_product_events_session_id   ON product_events(session_id)
idx_product_events_funnel       ON product_events(event_type, created_at DESC)
```

---

### `conversion_events`

Explicit funnel tracking. One row per funnel step per session.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `session_id` | `text` | NOT NULL | |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | |
| `funnel_step` | `text` | NOT NULL CHECK IN `('product_view','add_to_cart','checkout_start','payment_info_entered','purchase_complete')` | |
| `order_id` | `uuid` | FK → `orders(id)` ON DELETE SET NULL | Set only on `purchase_complete` |
| `revenue` | `numeric(10,2)` | | Set only on `purchase_complete` |
| `step_index` | `integer` | NOT NULL | 1–5, for funnel drop-off analysis |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_conversion_events_session   ON conversion_events(session_id, step_index)
idx_conversion_events_step      ON conversion_events(funnel_step, created_at DESC)
```

---

## 14. Marketing

### `newsletter_subscribers`

Email marketing list. Separate from `profiles` — allows anonymous subscribers without an account.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `email` | `text` | UNIQUE NOT NULL | |
| `name` | `text` | | Optional first name for personalisation |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | Links to account if subscriber later signs up |
| `status` | `text` | DEFAULT `'active'` CHECK IN `('active','unsubscribed','bounced','complained','cleaned')` | |
| `source` | `text` | | Where they subscribed: "homepage","checkout","product_page","footer" |
| `tags` | `text[]` | DEFAULT `'{}'` | Segmentation tags ("Kitchen","first_purchase") |
| `subscribed_at` | `timestamptz` | DEFAULT `now()` | |
| `unsubscribed_at` | `timestamptz` | | |
| `bounce_type` | `text` | CHECK IN `('hard','soft')` | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Indexes:**
```
idx_newsletter_email            ON newsletter_subscribers(email)
idx_newsletter_status           ON newsletter_subscribers(status) WHERE status = 'active'
idx_newsletter_tags             ON newsletter_subscribers USING GIN(tags)
```

---

## 15. Configuration

### `settings`

Key-value store for application configuration. Replaces hardcoded constants.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `key` | `text` | PK | Namespaced: "store.name", "store.currency", "ai.search_enabled" |
| `value` | `jsonb` | NOT NULL | Supports any JSON type (string, number, boolean, object) |
| `description` | `text` | | Human-readable explanation for admin UI |
| `is_public` | `boolean` | DEFAULT `false` | Public settings can be read by unauthenticated clients |
| `group` | `text` | | For grouping in admin UI: "store","email","ai","payments","social" |
| `updated_by` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | Last admin to modify |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**Seed values:**

| Key | Value | Public |
|---|---|---|
| `store.name` | `"HomeNest"` | Yes |
| `store.tagline` | `"Smart Home Solutions"` | Yes |
| `store.currency` | `"USD"` | Yes |
| `store.free_shipping_threshold` | `50` | Yes |
| `store.returns_days` | `30` | Yes |
| `store.warranty_years` | `2` | Yes |
| `ai.search_enabled` | `false` | No |
| `ai.recommendations_enabled` | `false` | No |
| `payments.stripe_enabled` | `false` | No |
| `payments.paypal_enabled` | `false` | No |
| `email.order_from` | `"orders@homenest.com"` | No |
| `reviews.require_verified_purchase` | `true` | No |

---

### `feature_flags`

Progressive feature rollout. Checked at runtime — no redeploy needed to enable features.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `key` | `text` | PK | e.g. "ai_search", "paypal", "tiktok_feed", "wishlist" |
| `is_enabled` | `boolean` | DEFAULT `false` | Global on/off |
| `rollout_percentage` | `integer` | DEFAULT `0` CHECK BETWEEN 0 AND 100 | Percentage of users who see the feature |
| `allowed_user_ids` | `uuid[]` | DEFAULT `'{}'` | Always-on for these users (internal QA) |
| `description` | `text` | | What this feature does |
| `updated_by` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

---

## 16. Observability

### `audit_log`

Append-only record of admin actions and sensitive state changes. Never modified after insertion.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE SET NULL | Actor — may be NULL for system actions |
| `action` | `text` | NOT NULL | Namespaced verb: "product.created", "order.refunded", "user.role_changed", "coupon.deactivated" |
| `entity_type` | `text` | | "product", "order", "profile", "coupon" |
| `entity_id` | `uuid` | | ID of the affected record |
| `old_value` | `jsonb` | | Full record before change |
| `new_value` | `jsonb` | | Full record after change |
| `ip_address` | `inet` | | Client IP address |
| `user_agent` | `text` | | Browser/client user agent |
| `metadata` | `jsonb` | DEFAULT `'{}'` | Any additional context |
| `created_at` | `timestamptz` | DEFAULT `now()` NOT NULL | |

**Indexes:**
```
idx_audit_log_user_id       ON audit_log(user_id, created_at DESC)
idx_audit_log_entity        ON audit_log(entity_type, entity_id, created_at DESC)
idx_audit_log_action        ON audit_log(action, created_at DESC)
idx_audit_log_created_at    ON audit_log(created_at DESC)
```

**Security note:** No RLS UPDATE or DELETE policy exists on this table. Rows are immutable once written. Only `admin` role can SELECT.

---

## 17. Junction Tables Summary

| Table | Left | Right | Notes |
|---|---|---|---|
| `product_problem_tags` | `products` | `problem_tags` | With `relevance_score` |
| `product_ai_tags` | `products` | `ai_tags` | With `confidence` score |
| `review_votes` | `profiles` | `reviews` | With `is_helpful` bool |
| `coupon_redemptions` | `coupons` | `orders` | With `discount_applied` amount |
| `problem_tag_synonyms` | `problem_tags` | — | Tag ↔ synonym mapping |

---

## 18. Index Strategy

### Principles

1. **Index every foreign key column** — prevents full-table scans on JOINs.
2. **Partial indexes for filtered queries** — `WHERE is_active = true` is the most common filter; partial indexes on these conditions are significantly smaller and faster than full indexes.
3. **GIN for arrays and JSONB** — `tags text[]`, `product_ids uuid[]`, `metadata jsonb`.
4. **GIN + `pg_trgm`** for fuzzy text matching on `products.name`, `search_logs.query`.
5. **GIN + `to_tsvector`** for PostgreSQL full-text search on product descriptions.
6. **IVFFlat (pgvector)** for approximate nearest-neighbour on embeddings — faster than exact at scale.
7. **Composite indexes** ordered by selectivity: high-selectivity column first.
8. **Covering indexes** for hot read paths where all needed columns fit in the index.

### Index Type Reference

| Query pattern | Index type | Example |
|---|---|---|
| Exact equality | B-Tree | `ON products(slug)` |
| Range / ORDER BY | B-Tree | `ON orders(created_at DESC)` |
| Filtered subset | Partial B-Tree | `ON products(sort_order) WHERE is_active = true` |
| Full-text search | GIN + `tsvector` | `ON products USING GIN(to_tsvector(...))` |
| Fuzzy text | GIN + `pg_trgm` | `ON products USING GIN(name gin_trgm_ops)` |
| Array contains | GIN | `ON coupons USING GIN(product_ids)` |
| JSONB key lookup | GIN | `ON settings USING GIN(value)` |
| Vector similarity | IVFFlat | `ON product_embeddings USING ivfflat(...)` |

### Critical Hot-Path Queries (must be covered by indexes)

```
1. Product listing by category, in-stock only
   → idx_products_in_stock ON products(category_id) WHERE in_stock = true AND is_active = true

2. Product by slug (product detail page)
   → idx_products_slug ON products(slug)

3. User's orders, most recent first
   → idx_orders_user_id ON orders(user_id, created_at DESC)

4. Published reviews for a product, by rating
   → idx_reviews_product_rating ON reviews(product_id, rating DESC) WHERE status = 'published'

5. User's wishlist items
   → idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id, added_at DESC)

6. Active coupons by code
   → idx_coupons_code ON coupons(upper(code))

7. User's unread notifications
   → idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE is_read = false

8. AI recommendations for user
   → idx_recommendations_user ON recommendations(user_id, score DESC) WHERE expires_at > now()
```

---

## 19. Row-Level Security Policies

RLS is **enabled on every table** with a default-deny posture. Policies follow a consistent pattern:

```
Anonymous users    → read-only access to public catalogue data
Authenticated users → read/write own data only
Staff              → extended read access for customer support
Admin              → full access (uses service_role key server-side)
```

**Deviation (Sprint 6/7.1/6.1-remaining, migrations 005–007):** Product Create, Edit, Delete, Archive/Restore, Duplicate, and image upload do not use the service_role key at all — see ADR-013/ADR-016/ADR-018. `products` and `seo_metadata` gained explicit `get_my_role() IN ('staff','admin')` write policies (INSERT on both — migration 005; UPDATE on both — migration 006; DELETE on `products`, scoped to Create's compensating rollback — migration 005). `media` and `product_images` gained the same staff/admin INSERT (migration 007); `product_images` also gained staff/admin UPDATE/DELETE (migration 007), used by the Studio's "replace the image set on every save" sync helper. `storage.objects` gained staff/admin INSERT/DELETE scoped to `bucket_id = 'products'` (migration 007) — Storage RLS defaults to deny the same as every table here, so upload was blocked without it regardless of the table-level policies. Any future admin write path built the same way (Server Action + cookie-based client) needs the same treatment — the "Admin → service_role bypass" assumption only holds for code that actually uses the service_role key.

### Policy Summary

| Table | Anonymous | Authenticated user | Staff | Admin |
|---|---|---|---|---|
| `categories` | SELECT | SELECT | SELECT | ALL |
| `products` | SELECT (active only) | SELECT | SELECT + INSERT + UPDATE² + DELETE¹ | ALL |
| `product_variants` | SELECT | SELECT | SELECT | ALL |
| `product_images` | SELECT | SELECT | SELECT + INSERT³ + UPDATE³ + DELETE³ | ALL |
| `product_videos` | SELECT | SELECT | SELECT | ALL |
| `tiktok_assets` | SELECT (approved only) | SELECT | SELECT | ALL |
| `problem_tags` | SELECT | SELECT | SELECT | ALL |
| `ai_tags` | SELECT (approved only) | SELECT | SELECT | ALL |
| `profiles` | NONE | SELECT/UPDATE own row | SELECT | ALL |
| `addresses` | NONE | ALL own rows | SELECT | ALL |
| `carts` | NONE | ALL own rows | SELECT | ALL |
| `cart_items` | NONE | ALL via own cart | SELECT via own cart | ALL |
| `notifications` | NONE | SELECT/UPDATE own rows | NONE | ALL |
| `orders` | NONE | SELECT own orders + INSERT⁴ own orders | SELECT | ALL |
| `order_items` | NONE | SELECT via own orders + INSERT⁴ via own orders | SELECT | ALL |
| `reviews` | SELECT (published only) | SELECT + INSERT own | SELECT | ALL |
| `review_votes` | NONE | ALL own votes | NONE | ALL |
| `wishlists` | SELECT (public only) | ALL own rows | NONE | ALL |
| `wishlist_items` | SELECT (public wishlist only) | ALL via own wishlist | NONE | ALL |
| `coupons` | NONE | NONE | SELECT | ALL |
| `coupon_redemptions` | NONE | SELECT own | NONE | ALL |
| `search_logs` | INSERT only | INSERT only | SELECT | ALL |
| `product_embeddings` | SELECT | SELECT | SELECT | ALL |
| `recommendations` | NONE | SELECT own | NONE | ALL |
| `seo_metadata` | SELECT | SELECT | SELECT + INSERT¹ + UPDATE² | ALL |
| `page_views` | INSERT only | INSERT only | SELECT | ALL |
| `product_events` | INSERT only | INSERT only | SELECT | ALL |
| `conversion_events` | INSERT only | INSERT only | SELECT | ALL |
| `newsletter_subscribers` | INSERT only | SELECT own | SELECT | ALL |
| `settings` | SELECT (public only) | SELECT (public only) | SELECT | ALL |
| `feature_flags` | SELECT | SELECT | SELECT | ALL |
| `audit_log` | NONE | NONE | SELECT | SELECT |
| `ai_generated_content` | NONE | NONE | SELECT | ALL |
| `media` | SELECT | NONE | SELECT + INSERT³ | ALL |

¹ Added in migration 005 (Sprint 6), for the Product Create Server Action — see ADR-013. `WITH CHECK (public.get_my_role() IN ('staff', 'admin'))`, no service_role key involved.

² Added in migration 006 (Sprint 7.1), for the Product Edit Server Action (`updateProduct`) — see ADR-016. Same pattern, same posture: `WITH CHECK (public.get_my_role() IN ('staff', 'admin'))`, no service_role key.

³ Added in migration 007 (Sprint 6.1 remaining), for real image upload — see ADR-018. Same `get_my_role() IN ('staff', 'admin')` pattern. Migration 007 also adds matching `storage.objects` INSERT/DELETE policies scoped to `bucket_id = 'products'` (not a table in this list, but gates the same upload path) and creates the `products` Storage bucket itself (public, 10MiB limit, image/webp+jpeg+png+avif only), matching the bucket already declared in `supabase/config.toml`.

⁴ Added in migration `20260715000001` (Sprint 8.0), for `createOrder()` — see ADR-022. `orders_own_insert`: `WITH CHECK (auth.uid() = user_id)`. `order_items_own_insert`: `WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid()))`. Authenticated only — no `anon` policy; a guest may browse `/checkout` but `createOrder()` requires a session, so no order is ever inserted without one.

### Key Policies (Detail)

**Products — anonymised soft-delete:**
```
-- Public can only see active, non-deleted products
USING (is_active = true AND deleted_at IS NULL)
```

**Profiles — own row only:**
```
-- Users can only read and update their own profile
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id)
```

**Orders — user owns their orders:**
```
-- User can only see their own orders
USING (auth.uid() = user_id OR user_id IS NULL AND guest_email = auth.email())
```

**Reviews — INSERT requires auth; no duplicate:**
```
-- Anyone logged in can insert one review per product
-- The UNIQUE (user_id, product_id) constraint enforces the "one per product" rule
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL)
```

**Cost price — admin-only column:**
```
-- cost_price is never returned to non-admin roles
-- Handled via Supabase Column-Level Security or server-side projection
```

---

## 20. Triggers & Automatic Functions

### Function: `handle_new_user()`

Fires on `INSERT` into `auth.users`. Creates a matching `profiles` row automatically.

```
TRIGGER: on_auth_user_created
ON: auth.users AFTER INSERT
CALLS: handle_new_user()

Action:
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
```

### Function: `update_product_rating()`

Fires on `INSERT`, `UPDATE`, `DELETE` of `reviews` when `status` = 'published'. Recalculates the product's aggregate rating and count.

```
TRIGGER: on_review_change
ON: reviews AFTER INSERT OR UPDATE OR DELETE
CALLS: update_product_rating()

Action:
  UPDATE products
  SET rating       = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = ... AND status = 'published'),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ... AND status = 'published'),
      updated_at   = now()
  WHERE id = product_id
```

### Function: `update_profile_order_stats()`

Fires on `INSERT` into `orders` when `payment_status` transitions to `'paid'`. Maintains `profiles.total_orders` and `profiles.total_spent`.

```
TRIGGER: on_order_paid
ON: orders AFTER UPDATE
WHEN: OLD.payment_status != 'paid' AND NEW.payment_status = 'paid'
CALLS: update_profile_order_stats()

Action:
  UPDATE profiles
  SET total_orders = total_orders + 1,
      total_spent  = total_spent + NEW.total,
      updated_at   = now()
  WHERE id = NEW.user_id
```

### Function: `set_review_verified()`

Fires on `INSERT` of a review. Checks whether the user has a delivered `order_item` for this product and sets `verified = true` if so.

```
TRIGGER: on_review_insert
ON: reviews AFTER INSERT
CALLS: set_review_verified()

Action:
  If EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.product_id = NEW.product_id
      AND o.user_id = NEW.user_id
      AND o.status = 'delivered'
  )
  THEN UPDATE reviews SET verified = true WHERE id = NEW.id
```

### Function: `increment_coupon_uses()`

Fires on `INSERT` into `coupon_redemptions`. Atomically increments the coupon's `uses_count`.

```
TRIGGER: on_coupon_redemption
ON: coupon_redemptions AFTER INSERT
CALLS: increment_coupon_uses()

Action:
  UPDATE coupons SET uses_count = uses_count + 1 WHERE id = NEW.coupon_id
```

### Function: `update_category_product_count()`

Fires on product `INSERT`, `UPDATE`, or `DELETE`. Maintains `categories.product_count`.

```
TRIGGER: on_product_change
ON: products AFTER INSERT OR UPDATE OR DELETE
CALLS: update_category_product_count()
```

### Function: `set_updated_at()`

Generic trigger applied to all tables with an `updated_at` column. Replaces `moddatetime` extension.

```
TRIGGER: set_updated_at
ON: every table BEFORE UPDATE
CALLS: set_updated_at()

Action:
  NEW.updated_at = now();
  RETURN NEW;
```

### Function: `generate_order_number()`

Fires `BEFORE INSERT` on `orders`. Generates a human-readable order number.

```
TRIGGER: on_order_insert
ON: orders BEFORE INSERT
CALLS: generate_order_number()

Action:
  NEW.order_number = 'HN-' || to_char(now(), 'YYYYMMDD') || '-'
                     || lpad(nextval('order_number_seq')::text, 4, '0');
  RETURN NEW;
```

### RPC Functions (called directly via `.rpc()`, not triggers)

These are invoked explicitly from application code rather than firing automatically — documented here since they're still part of this schema's write surface.

**`create_order_atomic(...)`** — migration `20260716000001` (Sprint 8.2, ADR-023). `SECURITY INVOKER` (confirmed: `prosecdef = false`) — runs as the calling `authenticated` role, so RLS on `carts`/`orders`/`order_items` applies to every statement inside it exactly as it would to separate calls. Replaces what used to be three sequential calls from `createOrder()` (`src/app/checkout/actions.ts`) with one atomic write:
1. `SELECT ... FOR UPDATE` locks the target `carts` row for the transaction's duration — this is what makes the function safe under real concurrency, not just sequential resubmission (see ADR-023 for the full race-condition walkthrough).
2. If `converted_order_id` is already set on that cart, returns the existing order (idempotent replay) — no new rows written.
3. Otherwise inserts `orders`, inserts `order_items`, and sets the cart's `converted_order_id`, all in one implicit transaction — a failure partway through rolls back everything already done in the call, so a real order row with zero line items ("ghost order") can no longer occur.

**`record_stripe_payment_intent(order_id, payment_intent_id)`** and **`apply_stripe_payment_result(payment_intent_id, status, payment_status)`** — migration `20260715000002` (Sprint 8.0, ADR-022 addendum), `apply_stripe_payment_result` updated by migration `20260716000003` (Sprint 8.3, ADR-024), `record_stripe_payment_intent` updated by migration `20260718000001` (Patch 8.3.2 — PaymentIntent concurrency guard, ADR-024 addendum). Both `SECURITY DEFINER`, covering the one part of checkout with no end-user session to attach RLS to (Stripe's webhook) — see ADR-022 for the full reasoning. `record_stripe_payment_intent` re-checks `auth.uid() = orders.user_id` internally since `SECURITY DEFINER` bypasses RLS; `apply_stripe_payment_result` is called only after `/api/webhooks/stripe` verifies Stripe's HMAC signature, which is the actual authorization boundary for that one. **Sprint 8.3 addition:** `apply_stripe_payment_result`'s `UPDATE` now includes `AND payment_status != 'paid'` — Stripe doesn't guarantee webhook delivery order and can redeliver events, so this guards against a stale `payment_intent.payment_failed` arriving after `payment_intent.succeeded` for the same intent from downgrading an already-paid order. Same signature, same `SECURITY DEFINER` posture, same grants — only the function body changed. **Patch 8.3.2 addition:** `record_stripe_payment_intent`'s return type changed from `void` to `text`, and its `UPDATE` now includes `AND stripe_payment_intent_id IS NULL` — two near-simultaneous requests for the same order both used to observe a `NULL` intent id and race to overwrite each other's write, silently orphaning one real Stripe PaymentIntent per collision. The conditional `UPDATE` relies on Postgres's ordinary implicit per-row locking (no `FOR UPDATE`, no held-open transaction) to serialize concurrent calls, and always returns the order's current `stripe_payment_intent_id` afterward so the caller can tell whether its own write won and reuse the winner's intent if not.

---

## 21. Relationships Reference

### One-to-One
```
auth.users → profiles          (via profiles.id = auth.uid())
products → product_embeddings  (via product_embeddings.product_id)
(entity) → seo_metadata        (via entity_type + entity_id — polymorphic)
```

### One-to-Many
```
categories → products
categories → problem_tags
profiles → addresses
profiles → orders
profiles → wishlists
profiles → reviews
profiles → recommendations
profiles → notifications
products → product_variants
products → product_images
products → product_videos
products → tiktok_assets
products → reviews
products → order_items        (SET NULL on product delete)
orders → order_items
wishlists → wishlist_items
coupons → coupon_redemptions
```

### Many-to-Many (via junction tables)
```
products ←→ problem_tags       via product_problem_tags
products ←→ ai_tags            via product_ai_tags
profiles ←→ reviews            via review_votes (voted helpful/not)
```

### Self-Referential
```
categories.parent_id → categories.id   (category hierarchy, max 2 levels)
```

### Polymorphic (application-level, no DB-level FK)
```
seo_metadata.entity_id → products | categories | (pages)
ai_generated_content.entity_id → products | categories | orders
audit_log.entity_id → any table
```

---

## 22. Future Scalability

### Partition Strategy

As row volumes grow, the following tables should be partitioned:

| Table | Strategy | When to partition | Partition key |
|---|---|---|---|
| `orders` | Range | > 500k rows | `created_at` by year |
| `order_items` | Range | > 2M rows | `created_at` by year |
| `search_logs` | Range | > 5M rows | `created_at` by month |
| `page_views` | Range | > 10M rows | `created_at` by month |
| `product_events` | Range | > 10M rows | `created_at` by month |
| `audit_log` | Range | > 1M rows | `created_at` by quarter |

Range partitioning allows old partitions to be detached and archived to cold storage (Supabase Storage as Parquet) without touching live data.

### Read Replica

When query load on the Supabase project exceeds comfortable thresholds:

- Add a **read replica** in the nearest geographic region (eu-west-1 for European traffic, ap-southeast-1 for Asian traffic)
- Route all `SELECT` queries for products, reviews, and recommendations through the read replica
- Only write operations and auth go to the primary

The Supabase `createServerClient` supports read replica routing via the `db.schema` connection URL.

### Product Catalogue Scale

| Scale | Approach |
|---|---|
| < 1,000 products | PostgreSQL full-text search is sufficient |
| 1,000–50,000 | pgvector semantic search + pg_trgm fuzzy match |
| > 50,000 | Evaluate Typesense or Meilisearch as a dedicated search layer, synced from PostgreSQL via webhook |

### Vector Index Tuning

IVFFlat index performance degrades if `lists` is not tuned to the number of rows:

| Row count | Recommended lists |
|---|---|
| < 1,000 | No index needed — use exact search |
| 1,000–100,000 | `lists = 100` |
| 100,000–1,000,000 | `lists = 1,000` |
| > 1,000,000 | Consider HNSW index (more memory, faster queries) |

Run `REINDEX INDEX idx_product_embeddings_vector` after bulk embedding inserts.

### Connection Pooling

Supabase uses PgBouncer for connection pooling. Default pool size per API instance: 6 connections.

For heavy admin dashboard loads with many simultaneous users:
- Use transaction mode pooling for Route Handlers (short-lived)
- Use session mode pooling for long-running admin queries
- Monitor via Supabase Dashboard → Database → Reports → Most time consuming

### Data Retention & Archiving

| Data type | Online retention | Archive strategy |
|---|---|---|
| Active products, orders, reviews | Indefinite | No archiving |
| Delivered orders (> 3 years) | Keep online | No archiving needed for compliance |
| `search_logs` | 90 days online | Archive to Supabase Storage (Parquet) |
| `page_views` | 2 years online | Archive to Supabase Storage (Parquet) |
| `audit_log` | 7 years online (legal) | No archiving |
| `ai_generated_content` (rejected) | 1 year | Delete or archive |

### Multi-Region (Phase 3)

For global expansion:

1. **Primary database:** Supabase us-east-1 (write master)
2. **Read replicas:** eu-west-1, ap-southeast-1
3. **Edge caching:** Next.js fetch cache + Upstash Redis at each edge region
4. **Currency:** `orders.currency` already supports multi-currency; `settings.store.currency` is the base
5. **Language:** `profiles.language` and `seo_metadata.hreflang` support i18n from day one

### Multi-Tenant (Phase 4+)

If HomeNest evolves into a marketplace with third-party sellers:

- Add a `vendors` table
- Add `vendor_id` FK to `products`, `orders`, `order_items`
- Add `vendor_payouts` table (Stripe Connect)
- Add `vendor_id` scope to all RLS policies
- Commission rate stored in `settings` → `vendor.commission_rate`

---

## Appendix A — Sequence Objects

```
order_number_seq    — Used by generate_order_number() trigger. Starts at 1, no cycle.
```

## Appendix B — Full Table Count

| Group | Tables |
|---|---|
| Customers & Auth | profiles, addresses, notifications |
| Catalogue | categories, products, product_variants, problem_tags, product_problem_tags, problem_tag_synonyms |
| Media | media, product_images, product_videos, tiktok_assets |
| Commerce | orders, order_items, coupons, coupon_redemptions |
| Social Proof | reviews, review_votes, wishlists, wishlist_items |
| Discovery & AI | search_logs, search_rules, product_embeddings, recommendations |
| AI Content | ai_tags, product_ai_tags, ai_generated_content |
| SEO | seo_metadata |
| Analytics | page_views, product_events, conversion_events |
| Marketing | newsletter_subscribers |
| Configuration | settings, feature_flags |
| Observability | audit_log |
| **Total** | **34 tables** |

## Appendix C — Migration Order

Tables must be created in dependency order to satisfy foreign key constraints:

```
1.  auth.users         (Supabase-managed — already exists)
2.  profiles
3.  categories
4.  products
5.  product_variants
6.  addresses
7.  problem_tags
8.  ai_tags
9.  media
10. product_images
11. product_videos
12. tiktok_assets
13. product_problem_tags
14. problem_tag_synonyms
15. product_ai_tags
16. product_embeddings
17. seo_metadata
18. coupons
19. orders
20. order_items
21. coupon_redemptions
22. reviews
23. review_votes
24. wishlists
25. wishlist_items
26. search_logs
27. search_rules
28. recommendations
29. ai_generated_content
30. newsletter_subscribers
31. notifications
32. page_views
33. product_events
34. conversion_events
35. settings
36. feature_flags
37. audit_log
```

---

*Document maintained by: Lead Product Engineer*
*Last updated: 2026-07-18 — `record_stripe_payment_intent()` changed to a conditional write with a `text` return, closing a PaymentIntent-creation race under concurrent requests (Patch 8.3.2 — PaymentIntent concurrency guard, ADR-024 addendum); added an ordering guard to `apply_stripe_payment_result()` to prevent out-of-order webhook delivery from downgrading a paid order (Sprint 8.3, ADR-024); added a partial unique index closing the `cart_items` NULL-variant race (Patch 8.2.1, ADR-021 addendum); added `create_order_atomic()` RPC function and documented the previously-undocumented `record_stripe_payment_intent()`/`apply_stripe_payment_result()` functions (Sprint 8.2, ADR-023)*
*Next review: before writing the first Supabase migration*
