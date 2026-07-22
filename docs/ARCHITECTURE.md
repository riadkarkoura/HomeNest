# HomeNest — Technical Architecture

> **Status:** Production blueprint · **Version:** 1.0 · **Date:** 2026-07-11
>
> This document is the authoritative technical reference for the HomeNest platform.
> It describes the complete system architecture — current state and target state — for
> engineering, infrastructure, and review purposes.
>
> Read alongside: `PROJECT_VISION.md` · `DESIGN_SYSTEM.md`

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Supabase Integration](#4-supabase-integration)
5. [Authentication Flow](#5-authentication-flow)
6. [Database Schema & Flow](#6-database-schema--flow)
7. [Product Flow](#7-product-flow)
8. [Smart Search Flow](#8-smart-search-flow)
9. [AI Search Architecture](#9-ai-search-architecture)
10. [AI Studio Architecture](#10-ai-studio-architecture)
11. [Media Storage](#11-media-storage)
12. [Orders Flow](#12-orders-flow)
13. [Payments Flow](#13-payments-flow)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Security Architecture](#15-security-architecture)
16. [Folder Architecture](#16-folder-architecture)
17. [Future Scalability](#17-future-scalability)

---

## 1. System Overview

### 1.1 Platform Summary

HomeNest is a **premium Smart Home Solutions ecommerce platform** built for global scale. The architecture follows a modern Jamstack-plus-backend-as-a-service pattern:

- **Frontend**: Next.js 16 App Router on Vercel (static, SSG, server, and edge rendering)
- **Database & Auth**: Supabase (PostgreSQL, Row-Level Security, OAuth, Realtime)
- **Storage**: Supabase Storage (CDN-backed) for product images and media
- **Payments**: Stripe (primary) + PayPal (alternative)
- **AI**: Anthropic Claude API for natural language product discovery
- **Email**: Resend for transactional email; Mailchimp / Kit for marketing
- **Deployment**: Vercel (global edge network, preview deployments, serverless functions)

### 1.2 High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser / Mobile)                      │
│  Next.js App · React 19 · Framer Motion · Zustand · Tailwind CSS v4    │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │  HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK (100+ PoPs)                      │
│  CDN · TLS termination · DDoS protection · Rate limiting · WAF          │
└──────┬────────────────────────────────────┬──────────────────────────────┘
       │                                    │
       ▼                                    ▼
┌──────────────────┐              ┌─────────────────────┐
│  Static Assets   │              │   Next.js Runtime   │
│  (Vercel CDN)    │              │  Serverless / Edge  │
│                  │              │                     │
│  · JS bundles    │              │  · Server Components│
│  · CSS           │              │  · Route Handlers   │
│  · Images        │              │  · Server Actions   │
│  · Fonts         │              │  · Middleware       │
└──────────────────┘              └─────────┬───────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
        ┌───────────────────┐  ┌────────────────────┐  ┌──────────────────┐
        │     SUPABASE      │  │   ANTHROPIC API    │  │  STRIPE / PAYPAL │
        │                   │  │   (Claude AI)      │  │                  │
        │ · PostgreSQL DB   │  │ · Smart Search     │  │ · Payments       │
        │ · Auth (JWT/OAuth)│  │ · Recommendations  │  │ · Webhooks       │
        │ · Storage (CDN)   │  │ · Problem matching │  │ · Refunds        │
        │ · Realtime        │  │                    │  │                  │
        │ · Edge Functions  │  └────────────────────┘  └──────────────────┘
        │ · Row-Level Sec.  │
        └───────────────────┘
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
┌──────────────┐       ┌──────────────────┐
│    RESEND    │       │    UPSTASH       │
│   (Email)    │       │  (Redis cache)   │
│              │       │                  │
│ · Transact.  │       │ · Search cache   │
│ · Order conf.│       │ · Session store  │
│ · Shipping   │       │ · Rate limiting  │
└──────────────┘       └──────────────────┘
```

### 1.3 Current vs Target State

| Capability | Current (Phase 0) | Target (Phase 1–3) |
|---|---|---|
| Product data | Static TypeScript file | Supabase PostgreSQL |
| Authentication | None (stub page) | Supabase Auth (email + Google) |
| Cart | Zustand localStorage | Zustand + server-synced on login |
| Search | Client-side category filter | AI natural language (Claude) |
| Reviews | Static demo data | Supabase with verified purchase gate |
| Wishlist | Local toggle state | Supabase, synced across devices |
| Orders | None | Supabase + Stripe webhooks |
| Payments | None | Stripe + PayPal |
| Admin | Static UI stub | Supabase-backed live dashboard |
| Images | Unsplash URLs | Supabase Storage CDN |
| Email | None | Resend transactional |

---

## 2. Frontend Architecture

### 2.1 Rendering Strategy Matrix

Next.js 16 App Router supports four rendering modes. HomeNest uses each deliberately:

| Route | Mode | Reason |
|---|---|---|
| `/` | Static (SSG) | Homepage never changes at request time |
| `/products` | Dynamic Server | Filters and sort params vary per request |
| `/products/[slug]` | Static (SSG via `generateStaticParams`) | Product pages prebuilt for performance; ISR on edits |
| `/cart` | Static shell + Client hydration | Cart state is client-only (Zustand) |
| `/checkout` | Dynamic Server | Must reflect live price + stock |
| `/login`, `/register` | Static shell | Auth handled client-side via Supabase JS |
| `/admin/*` | Dynamic Server + auth middleware | Protected, always fresh data |
| `/api/*` | Serverless (Route Handlers) | API endpoints for AI, payments, webhooks |

### 2.2 Component Architecture

Components follow a strict three-tier hierarchy:

```
src/components/
│
├── ui/                    TIER 1 — Design System primitives
│   └── (shadcn/ui v4, base-ui backed, render prop pattern)
│
├── layout/                TIER 2 — Page-level structural components
│   ├── Navbar.tsx         Glassmorphism, mega menu, search overlay
│   └── Footer.tsx         Links, brand copy, legal
│
├── home/                  TIER 2 — Homepage section components
│   ├── HeroSection.tsx
│   ├── SmartSearchSection.tsx   ← AI integration point
│   ├── ShopByProblemSection.tsx
│   └── ...
│
├── product/               TIER 2 — Product detail story components
│   ├── ProductHero.tsx
│   ├── ProblemSection.tsx
│   ├── SolutionSection.tsx
│   └── ...
│
└── shop/                  TIER 2 — Commerce components
    ├── ProductCard.tsx
    └── CartDrawer.tsx
```

**Rules:**
- Tier 1 components accept no business logic — only styling props
- Tier 2 components receive data via props from server or client parents
- No component imports from a higher tier (ProductCard never imports Navbar)
- `"use client"` is applied only at the leaf that requires browser APIs

### 2.3 State Management Architecture

Three distinct state layers, each with a specific scope:

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1 — URL State (Next.js router)                        │
│ Products filter, sort, search query, pagination             │
│ Source of truth for shareable, bookmarkable state           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2 — Client State (Zustand)                            │
│ Cart (persisted to localStorage key "homenest-cart")        │
│ Wishlist (persisted, synced to Supabase on auth)            │
│ UI state: active menu, search overlay, mobile panel         │
│ Toast / notification queue                                  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3 — Server State (Supabase + React cache)             │
│ Products, orders, reviews, user profile                     │
│ Fetched in Server Components; revalidated on mutation       │
│ Cached by Next.js fetch cache with tag-based invalidation   │
└─────────────────────────────────────────────────────────────┘
```

**Cart sync strategy:** On successful login, the client merges localStorage cart with the server-side cart (server wins on conflicts). On logout, localStorage cart is preserved.

### 2.4 Animation Architecture

All animations follow the shared motion system in `src/lib/motion.ts`:

- `EASE = [0.16, 1, 0.3, 1]` — ease-out-expo, imported everywhere, never redefined
- `VIEW_ONCE = { once: true, margin: "-80px 0px" }` — all scroll triggers
- Standard variants: `fadeUp`, `fadeIn`, `slideRight`, `scaleIn`, `lineReveal`
- Stagger: `stagger` (0.12s children) and `staggerFast` (0.07s)
- Exit animations always shorter than entrance (exit = responsive, enter = cinematic)
- `backdrop-blur` animated via child `opacity` only — never on the element itself

### 2.5 Data Fetching Conventions

```
Server Components      → fetch() with Next.js cache tags
Client Components      → Supabase JS client (with session)
Mutations              → Server Actions (forms) or Route Handlers (API)
Real-time updates      → Supabase Realtime subscription (order status)
Optimistic updates     → useOptimistic hook (cart, wishlist)
```

---

## 3. Backend Architecture

### 3.1 API Layer

All server-side logic routes through Next.js Route Handlers (`src/app/api/`). No separate Express or Fastify server. Each Route Handler is a serverless function on Vercel.

```
/api/
├── search/
│   └── route.ts          POST — AI natural language product search
│
├── products/
│   ├── route.ts          GET — paginated product listing
│   └── [id]/
│       └── route.ts      GET / PATCH (admin) — single product
│
├── reviews/
│   └── route.ts          GET / POST — product reviews (verified purchase gate)
│
├── wishlist/
│   └── route.ts          GET / POST / DELETE — user wishlist items
│
├── newsletter/
│   └── route.ts          POST — subscribe email address
│
├── orders/
│   ├── route.ts          GET — list user's orders
│   └── [id]/
│       └── route.ts      GET — single order detail
│
├── payments/
│   ├── stripe/
│   │   ├── intent/route.ts     POST — create PaymentIntent
│   │   └── confirm/route.ts    POST — confirm payment
│   └── paypal/
│       ├── create/route.ts     POST — create PayPal order
│       └── capture/route.ts    POST — capture payment
│
└── webhooks/
    ├── stripe/route.ts   POST — Stripe event handler (signature verified)
    └── paypal/route.ts   POST — PayPal webhook handler
```

### 3.2 Middleware

`src/middleware.ts` runs at the Edge before every request:

```
Request → Middleware
    │
    ├── /admin/*  → Verify JWT → Check role = "admin" → Pass or redirect /login
    │
    ├── /api/*    → Verify JWT (if required) → Rate limit → Pass
    │
    ├── /checkout → Verify JWT → Pass or redirect /login?next=/checkout
    │
    └── all       → Security headers → Pass
```

Security headers set by middleware:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=()`
- `Content-Security-Policy` (configured per environment)

### 3.3 Server Actions

Used for form submissions that require server-side mutation without a full API round-trip:

| Action | Route | Operation |
|---|---|---|
| `subscribeNewsletter` | `NewsletterSection` | Insert into `newsletter_subscribers` |
| `submitReview` | Product detail | Insert into `reviews` (verified purchase check) |
| `updateProfile` | Account settings | Update `profiles` |
| `createOrder` | Checkout | Insert `orders` + `order_items`, trigger payment |

---

## 4. Supabase Integration

### 4.1 Client Architecture

Two Supabase client instances — one for each rendering environment:

```
src/lib/supabase/
│
├── client.ts        Browser client — used in Client Components
│                    createBrowserClient(url, anon_key)
│                    Handles auth session cookies automatically
│
├── server.ts        Server client — used in Server Components and Route Handlers
│                    createServerClient(url, service_key, { cookies })
│                    Reads/writes auth cookies via Next.js headers()
│
└── middleware.ts    Edge client — used in middleware.ts
                     createMiddlewareClient for session refresh on every request
```

**Rule:** The browser client uses the `anon` key. The server client uses the `service_role` key only for admin-privileged operations. Standard server-side reads use the `anon` key with the user's session cookie for RLS enforcement.

### 4.2 Realtime Architecture

Supabase Realtime subscriptions are used for:

| Channel | Table | Event | Consumer |
|---|---|---|---|
| `order:{orderId}` | `orders` | `UPDATE` | Order tracking page |
| `inventory` | `products` | `UPDATE` | Cart (out-of-stock alert) |
| `admin:orders` | `orders` | `INSERT`, `UPDATE` | Admin dashboard live feed |

### 4.3 Edge Functions

Supabase Edge Functions handle compute-intensive server-side work:

| Function | Trigger | Purpose |
|---|---|---|
| `generate-recommendations` | Post-purchase | Run AI personalisation per user |
| `update-product-rating` | Review insert | Recalculate `rating` + `review_count` |
| `send-order-email` | Order status change | Trigger Resend email via template |
| `sync-search-index` | Product upsert | Update product embedding index |

---

## 5. Authentication Flow

### 5.1 Auth Providers

| Provider | Type | Use case |
|---|---|---|
| Email + Password | Supabase Auth | Primary signup / login |
| Google OAuth | Supabase Auth (OAuth 2.0) | One-click social login |
| Magic Link | Supabase Auth | Passwordless fallback |

### 5.2 Session Architecture

Supabase Auth issues JWTs stored as HTTP-only cookies (set server-side):

```
User logs in
    │
    ▼
Supabase Auth
    │  Issues: access_token (1 hour TTL) + refresh_token (30 day TTL)
    │
    ▼
Next.js middleware
    │  Reads cookies → validates JWT → refreshes on expiry
    │  Writes fresh cookies on every request (session sliding)
    │
    ▼
Server Components / Route Handlers
    │  createServerClient() picks up session from cookies
    │  All Supabase queries automatically scoped to user via RLS
    │
    ▼
Client Components
    │  createBrowserClient() syncs session from cookies
    │  Exposes useSession() hook for reactive auth state
```

### 5.3 Role-Based Access Control

```
Role: "user"
    ├── Read: own profile, own orders, own wishlist
    ├── Write: own profile, reviews (verified purchase), own wishlist
    └── Cannot: access /admin, modify other users' data

Role: "admin"
    ├── Read: all tables (including user data, all orders)
    ├── Write: products, promotions, content
    └── Cannot: access payment secret keys (handled server-side only)
```

### 5.4 Auth Flow Diagram

```
/login page
    │
    ├── Google OAuth ──────────────────────────────────────────────────────────┐
    │       │                                                                  │
    │       ▼                                                                  │
    │   supabase.auth.signInWithOAuth({ provider: "google" })                  │
    │       │                                                                  │
    │       ▼                                                                  │
    │   Google consent screen                                                  │
    │       │                                                                  │
    │       ▼                                                                  │
    │   /auth/callback route → exchange code → set session cookies ────────────┤
    │                                                                          │
    └── Email + Password                                                       │
            │                                                                  │
            ▼                                                                  │
        supabase.auth.signInWithPassword({ email, password })                  │
            │                                                                  │
            ▼                                                                  │
        Session cookies set ───────────────────────────────────────────────────┤
                                                                               │
                                                                               ▼
                                                                       Middleware reads JWT
                                                                               │
                                                                       ├── Valid admin → /admin
                                                                       ├── Valid user  → /?welcome=1
                                                                       └── Unverified  → /verify-email
```

---

## 6. Database Schema & Flow

### 6.1 Entity Relationship Overview

```
auth.users (Supabase managed)
    │ 1:1
    ▼
profiles ──────────────────────────── reviews (1:many via user_id)
    │                                      │
    │ 1:many                               │ many:1
    ▼                                      ▼
orders ────────────── order_items ──── products ──── product_images
    │                     │                │
    │ many:1              │ many:1         │ 1:many
    ▼                     ▼               ▼
(self)              products          wishlist_items
                                          │
                                          │ many:1
                                          ▼
                                       profiles

search_logs ──── many:1 ──── profiles
               └── many:1 ── products (clicked)

newsletter_subscribers (standalone)
recommendations ──── many:1 ──── profiles
                └─── many:1 ──── products
```

### 6.2 Full Database Schema

#### `profiles`
```
id              uuid        PK, FK → auth.users
name            text
email           text        UNIQUE
role            text        DEFAULT 'user' — CHECK IN ('user', 'admin')
avatar_url      text
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

#### `products`
```
id              uuid        PK, DEFAULT gen_random_uuid()
slug            text        UNIQUE NOT NULL
name            text        NOT NULL
description     text
long_description text
price           numeric(10,2) NOT NULL
original_price  numeric(10,2)
category        text        NOT NULL
badge           text        CHECK IN ('Bestseller','New','Editor''s Pick','Sale', NULL)
problem_solved  text
images          text[]      — array of Storage CDN URLs
rating          numeric(3,2) DEFAULT 0
review_count    integer     DEFAULT 0
in_stock        boolean     DEFAULT true
featured        boolean     DEFAULT false
tags            text[]
dimensions      text
material        text
sort_order      integer     DEFAULT 0  — admin ordering
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

#### `product_variants` (future — multi-colour, multi-size)
```
id              uuid        PK
product_id      uuid        FK → products
sku             text        UNIQUE NOT NULL
option_name     text        e.g. 'Colour'
option_value    text        e.g. 'Stone'
price_delta     numeric(10,2) DEFAULT 0
in_stock        boolean     DEFAULT true
```

#### `reviews`
```
id              uuid        PK
product_id      uuid        FK → products (CASCADE DELETE)
user_id         uuid        FK → profiles
rating          integer     NOT NULL, CHECK BETWEEN 1 AND 5
title           text
body            text
verified        boolean     DEFAULT false  — set true if user has delivered order with this product
helpful         integer     DEFAULT 0
created_at      timestamptz DEFAULT now()
UNIQUE          (user_id, product_id)  — one review per user per product
```

#### `orders`
```
id                      uuid        PK
user_id                 uuid        FK → profiles
status                  text        DEFAULT 'pending'
                                    CHECK IN ('pending','processing','shipped',
                                              'delivered','cancelled','refunded')
total                   numeric(10,2) NOT NULL
subtotal                numeric(10,2)
shipping_cost           numeric(10,2) DEFAULT 0
tax                     numeric(10,2) DEFAULT 0
currency                text        DEFAULT 'USD'
stripe_payment_intent_id text
paypal_order_id         text
shipping_address        jsonb
billing_address         jsonb
notes                   text
created_at              timestamptz DEFAULT now()
updated_at              timestamptz DEFAULT now()
```

#### `order_items`
```
id              uuid        PK
order_id        uuid        FK → orders (CASCADE DELETE)
product_id      uuid        FK → products
variant_id      uuid        FK → product_variants (nullable)
quantity        integer     NOT NULL CHECK > 0
unit_price      numeric(10,2) NOT NULL  — price at time of purchase (immutable)
created_at      timestamptz DEFAULT now()
```

#### `wishlist_items`
```
id              uuid        PK
user_id         uuid        FK → profiles (CASCADE DELETE)
product_id      uuid        FK → products (CASCADE DELETE)
added_at        timestamptz DEFAULT now()
UNIQUE          (user_id, product_id)
```

#### `search_logs`
```
id                  uuid        PK
query               text        NOT NULL
user_id             uuid        FK → profiles (nullable — anonymous searches logged)
session_id          text        — anonymous session identifier
results_count       integer
clicked_product_id  uuid        FK → products (nullable)
time_to_click_ms    integer
created_at          timestamptz DEFAULT now()
```

#### `newsletter_subscribers`
```
id              uuid        PK
email           text        UNIQUE NOT NULL
name            text
subscribed_at   timestamptz DEFAULT now()
source          text        — 'homepage', 'checkout', 'product_page'
```

#### `recommendations`
```
id              uuid        PK
user_id         uuid        FK → profiles
product_id      uuid        FK → products
score           numeric(5,4)  — 0.0000 to 1.0000
reason          text        — AI-generated explanation string
generated_at    timestamptz DEFAULT now()
INDEX           (user_id, score DESC)
```

#### `promotions`
```
id              uuid        PK
code            text        UNIQUE NOT NULL
type            text        CHECK IN ('percentage', 'fixed', 'free_shipping')
value           numeric(10,2)
minimum_order   numeric(10,2) DEFAULT 0
max_uses        integer
uses_count      integer     DEFAULT 0
starts_at       timestamptz
expires_at      timestamptz
active          boolean     DEFAULT true
created_at      timestamptz DEFAULT now()
```

### 6.3 Row-Level Security Policies

Every table has RLS enabled. Key policies:

| Table | Policy | Rule |
|---|---|---|
| `profiles` | SELECT | `auth.uid() = id` OR `role = 'admin'` |
| `products` | SELECT | `true` (public read) |
| `products` | INSERT/UPDATE/DELETE | `auth.role() = 'admin'` (service key only) |
| `reviews` | SELECT | `true` (public read) |
| `reviews` | INSERT | `auth.uid() IS NOT NULL` AND verified purchase check |
| `orders` | SELECT | `auth.uid() = user_id` OR `role = 'admin'` |
| `order_items` | SELECT | Parent order belongs to `auth.uid()` |
| `wishlist_items` | ALL | `auth.uid() = user_id` |
| `search_logs` | INSERT | `true` (any anonymous user can log) |
| `search_logs` | SELECT | `auth.role() = 'admin'` only |

### 6.4 Database Indexes

```sql
-- Performance-critical indexes
CREATE INDEX idx_products_category    ON products(category);
CREATE INDEX idx_products_featured    ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_in_stock    ON products(in_stock) WHERE in_stock = true;
CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_reviews_product_id   ON reviews(product_id);
CREATE INDEX idx_orders_user_id       ON orders(user_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_wishlist_user_id     ON wishlist_items(user_id);
CREATE INDEX idx_search_logs_query    ON search_logs USING gin(to_tsvector('english', query));
CREATE INDEX idx_recommendations_user ON recommendations(user_id, score DESC);
```

---

## 7. Product Flow

### 7.1 Public Product Listing (Phase 1 — Supabase)

```
User visits /products?category=Kitchen&sort=rating
    │
    ▼
Next.js Server Component
    │
    ▼
Supabase server client
    │  SELECT * FROM products
    │  WHERE category = 'Kitchen' AND in_stock = true
    │  ORDER BY rating DESC
    │  (Next.js fetch cache: tag='products', revalidate=3600)
    │
    ▼
RSC renders product grid
    │
    ▼
ProductsClient.tsx hydrates (category filter tabs, sort dropdown)
    │
    ▼
URL state change (router.push) → triggers RSC re-render with new params
```

### 7.2 Product Detail Page (SSG + ISR)

```
Build time:
    generateStaticParams() → fetches all product slugs from Supabase
    → pre-renders all /products/[slug] pages as static HTML

Runtime:
    User visits /products/silicone-sink-splash-guard
    → Vercel CDN serves cached static HTML (zero server latency)
    → JS hydrates ProductDetailClient

On product update (admin):
    Admin saves change → Next.js revalidateTag('product-[slug]')
    → Next.js triggers ISR regeneration
    → New static page served on next request
```

### 7.3 Admin Product Management Flow

```
Admin → /admin/products/new
    │
    ▼
Fill product form (name, price, category, images, etc.)
    │
    ▼
Upload images → Supabase Storage (products bucket)
    │           Returns CDN URL per image
    │
    ▼
Submit form → Server Action: createProduct()
    │
    ▼
Supabase INSERT INTO products (...)
    │
    ▼
revalidateTag('products')  ← invalidates all product caches
revalidatePath('/products')
    │
    ▼
Admin redirected to /admin/products/[id]
```

---

## 8. Smart Search Flow

### 8.1 Current Implementation (Phase 0)

The SmartSearchSection component provides the complete UX scaffold:
- Rotating animated placeholder examples
- Problem chip quick-navigation
- Search form with `onSearch` handler
- `// AI INTEGRATION POINT` comments at every wiring location

Currently routes to `/products?q={query}`. The `/products` page filters by query string against product names and tags in memory.

### 8.2 Phase 1 — AI-Powered Search

```
User types: "my sink gets wet every time I wash my hands"
    │
    ▼
SmartSearchSection.onSearch(query)
    │
    ▼
POST /api/search
    {
      query: "my sink gets wet every time I wash my hands",
      sessionId: "anon-uuid",
      userId: "user-uuid" | null
    }
    │
    ▼
Route Handler: /api/search/route.ts
    │
    ├── 1. Check Upstash Redis cache (query hash → cached result, TTL 1 hour)
    │       Cache hit → return immediately
    │
    └── Cache miss →
        │
        ▼
    Fetch product catalog summary from Supabase
        (product IDs, names, problem_solved, tags, category)
        │
        ▼
    Anthropic Claude API
        System prompt:
            "You are a home solutions expert. Given a user's household problem,
             identify matching products from the catalog and explain why they
             solve the problem. Return structured JSON."
        User message:
            "Problem: {query}
             Catalog: {product_catalog_json}"
        Response schema:
            {
              matchedProducts: [{ id, score, reason }],
              problemCategory: "Kitchen|Bathroom|Storage|...",
              suggestions: ["Try searching for...", ...],
              refinements: ["Are you looking for...", ...]
            }
        │
        ▼
    Cache result in Upstash (key: hash(query), TTL: 3600s)
        │
        ▼
    Log to search_logs (query, user_id, results_count)
        │
        ▼
    Return to client:
        {
          products: Product[],
          problemCategory: string,
          suggestions: string[],
          refinements: string[]
        }
    │
    ▼
SmartSearchSection renders results inline
    │
    ▼
User clicks product → /products/[slug]
User clicks suggestion → re-runs search with new query
```

### 8.3 Search Response Rendering

```
SmartSearchSection state machine:

idle ──► typing ──► loading ──► results
                                  │
                                  ├── Products grid (inline, below search box)
                                  ├── Problem classification chip
                                  └── Suggested refinements

error state → "We couldn't find a match — try browsing by category"
empty state → Suggest popular problem chips
```

---

## 9. AI Search Architecture

> **Foundation note (2026-07-22, ADR-025):** the Claude integration and prompt shape described below (§9.1–9.3) is the *target feature*, now scoped as **Sprint 11 — AI Runtime & Search Integration**. It will be built as a consumer of the provider-agnostic AI Foundation described in §18 (`src/ai/providers`, `src/ai/context-engine`, `src/ai/orchestration`) rather than a direct, standalone Anthropic SDK call — the Route Handler in §9.1 becomes a thin caller of `AIProvider.complete()` plus the Context Engine's `assemble()`, not a place that builds prompts or talks to Claude itself. Nothing in §9.1–9.3 is implemented yet.

### 9.1 Claude API Integration

**Model:** `claude-haiku-4-5-20251001` for search (fast, cost-efficient)
**Model:** `claude-sonnet-4-6` for recommendations and AI Studio (higher quality)

**Prompt Architecture:**

```
SYSTEM (static, cached):
    Role definition
    Product catalog format
    Output schema definition
    Tone and accuracy rules

USER (dynamic per request):
    User's natural language query
    Current product catalog (or embedding match pre-filter)
    Optional: user history context (if authenticated)

ASSISTANT (structured JSON output):
    matchedProducts[]
    problemCategory
    suggestions[]
    refinements[]
```

### 9.2 Embedding-Based Pre-filtering (Phase 2)

When the product catalog grows beyond 100 products, a two-stage approach is used:

```
Stage 1 — Vector similarity (fast, cheap)
    User query → text embedding (Supabase pgvector)
    → Retrieve top 20 semantically similar products
    → Pass only these 20 to Claude (not full catalog)

Stage 2 — LLM reranking (precise, context-aware)
    Claude reranks the 20 candidates
    → Returns final ordered results with explanations
```

**Schema addition for Phase 2:**
```
ALTER TABLE products ADD COLUMN embedding vector(1536);
CREATE INDEX ON products USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

### 9.3 Search Analytics Loop

Search logs feed back into product improvement:

```
search_logs table
    │
    ├── Query with 0 results → Admin alert → New product opportunity
    ├── Query with high CTR  → Boost matching products in featured
    └── Query with no click  → Review AI prompt quality
```

---

## 10. AI Studio Architecture

The AI Studio is a section of the Admin Dashboard for managing AI-powered features.

### 10.1 Sections

```
/admin/ai-studio/
├── search-quality/       Review recent searches, rate AI accuracy, tune prompts
├── problem-mapping/      Map product problem_solved fields to search categories
├── recommendations/      Review and approve AI-generated user recommendations
├── content/              AI-assisted product description generation
└── analytics/            Search volume, CTR, zero-result queries, top problems
```

### 10.2 Search Quality Tool

```
Admin views:
    list of recent search_logs
        ├── Query text
        ├── Matched products (AI result)
        ├── User-clicked product (actual signal)
        └── Match quality score (clicked / matched[0])

Admin can:
    ├── Flag poor matches → added to prompt fine-tuning dataset
    ├── Override product ordering for a specific query → saved as manual rule
    └── Add query synonyms → stored in search_rules table
```

### 10.3 Problem Mapping Tool

Visual editor for maintaining the Problem → Product taxonomy:

```
Problem Category: "Wet countertop"
    Synonyms: ["sink splash", "water on counter", "damp surface around sink"]
    Matched products: [Silicone Sink Splash Guard]
    Search volume: 847 queries/month
    Conversion rate: 34%
```

### 10.4 AI Content Generation

```
Admin selects product → clicks "Generate description"
    │
    ▼
POST /api/admin/ai/generate-content
    { productId, field: "long_description" | "problem_solved" | "faq" }
    │
    ▼
Claude (claude-sonnet-4-6)
    System: "You are a product copywriter for HomeNest, a premium smart home brand.
             Write in a warm, helpful, premium tone. No fluff."
    User: "Generate a {field} for: {product details}"
    │
    ▼
Draft returned to admin UI for review and editing
    │
    ▼
Admin approves → Server Action saves to Supabase
```

---

## 11. Media Storage

### 11.1 Storage Architecture

**Provider:** Supabase Storage (primary) — S3-compatible, CDN-backed

**Buckets:**

| Bucket | Access | Purpose |
|---|---|---|
| `products` | Public (read) | Product images served to customers |
| `admin-uploads` | Private | Staging area before product publish |
| `avatars` | Public (read) | User profile pictures |
| `media` | Private | Video thumbnails, documents, internal assets |

### 11.2 Image Upload Flow

```
Admin → Upload product image
    │
    ▼
Client: file → validate (type: JPEG/PNG/WebP, size < 10 MB)
    │
    ▼
POST /api/admin/media/upload (Route Handler)
    │
    ├── Generate filename: {productId}/{uuid}.{ext}
    ├── Resize to multiple sizes (Sharp library):
    │   ├── thumbnail: 400×300 (product card)
    │   ├── detail:    800×600 (product page)
    │   └── hero:      1200×900 (full gallery)
    │
    ▼
supabase.storage
    .from('products')
    .upload(filename, buffer, { contentType, cacheControl: '31536000' })
    │
    ▼
Returns CDN URL:
    https://{project}.supabase.co/storage/v1/object/public/products/{path}
    │
    ▼
URL saved to products.images[] array in DB
```

### 11.3 Image Delivery

Next.js `<Image>` component handles:
- Automatic format conversion (WebP/AVIF where supported)
- Responsive `srcset` via `sizes` attribute
- Lazy loading (non-priority images)
- Priority loading (`priority` + `fetchPriority="high"` on hero)

**Next.js image domain whitelist** (`next.config.ts`):
- `images.unsplash.com` (Phase 0 demo)
- `{project-ref}.supabase.co` (Phase 1+)

---

## 12. Orders Flow

### 12.1 Order Creation Flow

```
User reviews cart → clicks "Checkout"
    │
    ▼
/checkout page loads
    Server Component fetches: live prices, stock status
    Re-validates cart contents against DB (prevent stale cart issues)
    │
    ▼
User fills shipping address + selects payment method
    │
    ▼
Server Action: createOrder()
    │
    ├── INSERT INTO orders (status='pending', user_id, total, ...)
    ├── INSERT INTO order_items (order_id, product_id, qty, unit_price)
    │   (unit_price captured at order time — not re-fetched on delivery)
    │
    ▼
Order ID returned → payment initiated (see §13)
    │
    ▼
Payment succeeds → Stripe/PayPal webhook fires
    │
    ▼
Route Handler: /api/webhooks/stripe
    │
    ├── Verify webhook signature (HMAC)
    ├── UPDATE orders SET status='processing', stripe_payment_intent_id=...
    ├── Trigger Supabase Edge Function: send-order-email
    └── Trigger inventory check (update in_stock if qty = 0)
```

### 12.2 Order Status Machine

```
pending
    │ (payment received)
    ▼
processing
    │ (fulfillment picked + packed)
    ▼
shipped
    │ (delivery confirmed)
    ▼
delivered
    │
    └── (30-day window opens for returns)

Any state → cancelled (admin action)
shipped or delivered → refunded (admin initiates Stripe refund)
```

### 12.3 Order Confirmation Email

```
orders.status = 'processing' event
    │
    ▼
Supabase Edge Function: send-order-email
    │
    ├── Fetch order + items + user from DB
    ├── Build email HTML (Resend React Email template)
    │
    ▼
Resend API: POST /emails
    {
      from: "orders@homenest.com",
      to: user.email,
      subject: "Your HomeNest order is confirmed (#ORD-{id})",
      html: orderConfirmationTemplate(order)
    }
```

### 12.4 Customer Order Tracking

```
User → /account/orders
    │
    ▼
Server Component: SELECT * FROM orders WHERE user_id = auth.uid()
    │
    ▼
Order list with statuses

User clicks order → /account/orders/[id]
    │
    ▼
Supabase Realtime subscription on orders WHERE id = {orderId}
    → Status updates appear live without page refresh
```

---

## 13. Payments Flow

### 13.1 Stripe Integration

**Architecture principle:** Payment Intents are created server-side. Card details never touch HomeNest servers — Stripe Elements handle card data directly with Stripe.

```
STRIPE CHECKOUT FLOW
────────────────────

Client: User clicks "Buy Now"
    │
    ▼
POST /api/payments/stripe/intent
    Server:
        ├── Verify auth
        ├── Re-fetch prices from DB (prevent price tampering)
        ├── stripe.paymentIntents.create({
        │     amount: total_in_cents,
        │     currency: 'usd',
        │     metadata: { orderId, userId }
        │   })
        └── Return: { clientSecret }
    │
    ▼
Client: Stripe Elements renders card input
    (card details go directly to Stripe — never HomeNest server)
    │
    ▼
User submits → stripe.confirmPayment({ clientSecret, elements })
    │
    ├── Stripe processes payment
    │
    ▼
STRIPE WEBHOOK (async, server-to-server)
POST /api/webhooks/stripe
    │
    ├── stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    │   (verifies the request genuinely came from Stripe)
    │
    ├── Event: payment_intent.succeeded
    │   → UPDATE orders SET status='processing'
    │   → Trigger order confirmation email
    │
    └── Event: payment_intent.payment_failed
        → UPDATE orders SET status='cancelled'
        → Notify user
```

### 13.2 PayPal Integration

```
PAYPAL CHECKOUT FLOW
────────────────────

Client: User selects PayPal
    │
    ▼
POST /api/payments/paypal/create
    Server:
        └── paypalClient.execute(new OrdersCreateRequest({
              intent: 'CAPTURE',
              purchase_units: [{ amount: { value: total } }]
            }))
            Returns: { paypalOrderId }
    │
    ▼
Client: PayPal JS SDK renders PayPal button
    User authenticates via PayPal popup
    │
    ▼
POST /api/payments/paypal/capture
    { paypalOrderId }
    Server:
        └── paypalClient.execute(new OrdersCaptureRequest(paypalOrderId))
            → Returns capture details
    │
    ▼
Server:
    ├── UPDATE orders SET status='processing', paypal_order_id=...
    └── Trigger order confirmation email
```

### 13.3 Refund Flow

```
Admin → /admin/orders/[id] → clicks "Issue Refund"
    │
    ▼
Server Action: refundOrder({ orderId, amount?, reason })
    │
    ├── Fetch order.stripe_payment_intent_id
    │
    ├── stripe.refunds.create({
    │     payment_intent: paymentIntentId,
    │     amount: amount_in_cents | undefined (full refund)
    │   })
    │
    ├── UPDATE orders SET status='refunded'
    │
    └── Send refund confirmation email via Resend
```

### 13.4 Currency & Localisation (Phase 3)

```
User locale detected via Accept-Language header (middleware)
    │
    ▼
Prices fetched in base currency (USD from DB)
    │
    ▼
Exchange rates fetched from Open Exchange Rates API (cached 1 hour)
    │
    ▼
PriceLocale.formatted returned to client:
    { amount: 24, currency: 'GBP', formatted: '£19.20' }
    │
    ▼
Stripe PaymentIntent created in user's currency
Supabase order.currency column records settlement currency
```

---

## 14. Deployment Architecture

### 14.1 Infrastructure Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          VERCEL                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  PRODUCTION                              │    │
│  │  Domain: homenest.com                                   │    │
│  │  Branch: main                                           │    │
│  │  Next.js build: static + serverless + edge              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  STAGING                                 │    │
│  │  Domain: staging.homenest.com                          │    │
│  │  Branch: staging                                        │    │
│  │  Connected to: Supabase staging project                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              PREVIEW (per PR)                            │    │
│  │  Domain: homenest-git-{branch}.vercel.app              │    │
│  │  Branch: any feature branch                             │    │
│  │  Connected to: Supabase preview project (or staging)   │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                          SUPABASE                                │
│                                                                  │
│  Production project:  homenest-prod                             │
│  Staging project:     homenest-staging                          │
│  Preview project:     homenest-dev (shared, seeded data)        │
│                                                                  │
│  Region: us-east-1 (primary) + eu-west-1 (read replica, future)│
└──────────────────────────────────────────────────────────────────┘
```

### 14.2 Environment Variables

All secrets managed as Vercel environment variables, scoped per environment:

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Public anon key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin DB access |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | All | Stripe public key |
| `STRIPE_SECRET_KEY` | Server only | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Server only | Webhook signature verification |
| `PAYPAL_CLIENT_ID` | Server only | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | Server only | PayPal secret |
| `ANTHROPIC_API_KEY` | Server only | Claude AI key |
| `RESEND_API_KEY` | Server only | Email service key |
| `UPSTASH_REDIS_URL` | Server only | Redis cache URL |
| `UPSTASH_REDIS_TOKEN` | Server only | Redis auth token |

**Rule:** Variables prefixed `NEXT_PUBLIC_` are bundled into client JavaScript. All secret keys must be server-only (no `NEXT_PUBLIC_` prefix).

### 14.3 Build & Release Pipeline

```
Developer pushes to feature branch
    │
    ▼
Vercel creates preview deployment
    ├── TypeScript check
    ├── ESLint check
    └── Next.js build
    │
    ▼
PR opened → code review
    │
    ▼
Merge to staging
    ├── Vercel builds staging deployment
    ├── Supabase migrations run (supabase db push --linked)
    └── QA testing on staging.homenest.com
    │
    ▼
Merge to main
    ├── Vercel builds production deployment
    ├── Supabase migrations run on production project
    └── Deployment live (zero-downtime, atomic via Vercel)
```

### 14.4 ISR & Cache Invalidation Strategy

| Content Type | Cache Duration | Invalidation Trigger |
|---|---|---|
| Homepage | Static (build time) | Admin content change → `revalidatePath('/')` |
| Product listing | 1 hour (ISR) | Product create/update → `revalidateTag('products')` |
| Product detail | Static (SSG) | Product update → `revalidateTag('product-{slug}')` |
| Search results | 1 hour (Redis) | Product update flushes related cache keys |
| Admin dashboard | No cache | Always dynamic |

---

## 15. Security Architecture

### 15.1 Threat Model

| Threat | Mitigation |
|---|---|
| Unauthenticated admin access | Middleware JWT check on all `/admin/*` routes |
| Price tampering on checkout | Server re-fetches prices from DB before PaymentIntent creation |
| Fake Stripe webhooks | `stripe.webhooks.constructEvent()` HMAC signature verification |
| SQL injection | Supabase parameterised queries only; no raw SQL with user input |
| XSS | React's JSX escaping; CSP headers; no `dangerouslySetInnerHTML` |
| CSRF | SameSite=Strict cookies; Next.js Server Actions CSRF protection |
| Credential stuffing | Supabase Auth rate limiting; CAPTCHA on login (future) |
| Data enumeration | RLS policies prevent cross-user data access |
| Secret exposure | No `NEXT_PUBLIC_` prefix on secret keys; Vercel env var scoping |
| Dependency vulnerabilities | `npm audit` in CI; Dependabot PRs |

### 15.2 API Security

Every Route Handler follows this security checklist:

```
1. Authenticate:  Verify Supabase JWT from cookie (if required)
2. Authorise:     Check user role matches required permission
3. Validate:      Parse and validate request body with Zod schema
4. Sanitise:      Strip unknown fields before DB operations
5. Rate limit:    Check Upstash rate limit bucket per IP + user
6. Respond:       Return only necessary fields (no full DB rows)
7. Log:           Record operation in audit log (admin actions)
```

### 15.3 Zod Validation Schemas

All API inputs are validated with Zod before any database operation:

```typescript
// Example: review submission schema
const CreateReviewSchema = z.object({
  productId: z.string().uuid(),
  rating:    z.number().int().min(1).max(5),
  title:     z.string().min(3).max(120).trim(),
  body:      z.string().min(20).max(2000).trim(),
});
```

### 15.4 Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.paypal.com;
  frame-src https://js.stripe.com https://www.paypal.com;
  img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co;
  connect-src 'self' https://*.supabase.co https://api.anthropic.com;
  font-src 'self' https://fonts.gstatic.com;
  style-src 'self' 'unsafe-inline';
```

### 15.5 GDPR Compliance (Phase 2)

| Requirement | Implementation |
|---|---|
| Data consent | Cookie consent banner (analytics only) |
| Right to access | `/account/data-export` endpoint |
| Right to deletion | Admin tool: `DELETE FROM profiles CASCADE` + Supabase Auth user deletion |
| Data minimisation | Only store what's needed; search logs anonymised after 90 days |
| Data residency | Supabase EU region for EU customers (future) |

---

## 16. Folder Architecture

### 16.1 Target Directory Structure

The following structure represents the complete target state of the repository as all phases are implemented:

```
/
├── docs/
│   ├── ARCHITECTURE.md          ← this file
│   └── API.md                   ← Route Handler reference (future)
│
├── supabase/
│   ├── migrations/              ← Supabase DB migration files
│   │   ├── 00001_initial.sql
│   │   └── 00002_add_wishlists.sql
│   ├── seed.sql                 ← Development seed data
│   └── config.toml              ← Supabase local config
│
├── src/
│   ├── app/
│   │   ├── (shop)/              ← Route group: storefront
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         ← Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ProductsClient.tsx
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── ProductDetailClient.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   └── checkout/
│   │   │       ├── page.tsx
│   │   │       └── CheckoutClient.tsx
│   │   │
│   │   ├── (auth)/              ← Route group: authentication
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── auth/callback/route.ts   ← OAuth redirect handler
│   │   │
│   │   ├── (account)/           ← Route group: authenticated user area
│   │   │   ├── layout.tsx       ← Auth guard
│   │   │   ├── account/
│   │   │   │   ├── page.tsx     ← Profile
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   └── wishlist/page.tsx
│   │   │   └── checkout/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/               ← Admin dashboard (role-gated in middleware)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         ← Overview dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── promotions/page.tsx
│   │   │   ├── ai-studio/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── search-quality/page.tsx
│   │   │   │   ├── problem-mapping/page.tsx
│   │   │   │   ├── recommendations/page.tsx
│   │   │   │   └── content/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── api/                 ← Route Handlers (serverless)
│   │   │   ├── search/route.ts
│   │   │   ├── products/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── reviews/route.ts
│   │   │   ├── wishlist/route.ts
│   │   │   ├── newsletter/route.ts
│   │   │   ├── orders/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── payments/
│   │   │   │   ├── stripe/
│   │   │   │   │   ├── intent/route.ts
│   │   │   │   │   └── confirm/route.ts
│   │   │   │   └── paypal/
│   │   │   │       ├── create/route.ts
│   │   │   │       └── capture/route.ts
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/route.ts
│   │   │   │   └── paypal/route.ts
│   │   │   └── admin/
│   │   │       ├── media/upload/route.ts
│   │   │       └── ai/generate-content/route.ts
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx           ← Root layout (fonts, providers)
│   │
│   ├── components/
│   │   ├── ui/                  ← shadcn/ui v4 primitives (Tier 1)
│   │   ├── layout/              ← Navbar, Footer (Tier 2)
│   │   ├── home/                ← Homepage sections (Tier 2)
│   │   ├── product/             ← Product page sections (Tier 2)
│   │   ├── shop/                ← Commerce components (Tier 2)
│   │   ├── checkout/            ← Checkout steps, payment forms (Tier 2)
│   │   ├── account/             ← User account components (Tier 2)
│   │   └── admin/               ← Admin UI components (Tier 2)
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        ← Browser Supabase client
│   │   │   ├── server.ts        ← Server Supabase client
│   │   │   └── middleware.ts    ← Edge Supabase client for middleware
│   │   ├── ai/
│   │   │   ├── search.ts        ← Claude search logic + prompt
│   │   │   └── recommendations.ts ← Claude recommendation logic
│   │   ├── payments/
│   │   │   ├── stripe.ts        ← Stripe client + helpers
│   │   │   └── paypal.ts        ← PayPal client + helpers
│   │   ├── email/
│   │   │   └── resend.ts        ← Resend client + email templates
│   │   ├── cache/
│   │   │   └── redis.ts         ← Upstash Redis client + helpers
│   │   ├── validations/
│   │   │   └── schemas.ts       ← Zod schemas for all API inputs
│   │   ├── motion.ts            ← Framer Motion EASE + variants
│   │   ├── products.ts          ← Phase 0: static data (migrates to Supabase)
│   │   ├── product-content.ts   ← Phase 0: enriched demo content
│   │   ├── store.ts             ← Zustand stores (cart, wishlist, UI)
│   │   └── utils.ts             ← cn() and shared utilities
│   │
│   ├── hooks/                   ← Custom React hooks
│   │   ├── useCart.ts
│   │   ├── useWishlist.ts
│   │   ├── useSearch.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── types/
│   │   └── index.ts             ← All TypeScript types + future stubs
│   │
│   └── middleware.ts            ← Route protection + security headers
│
├── PROJECT_VISION.md
├── DESIGN_SYSTEM.md
├── AGENTS.md
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local                   ← Never committed
```

### 16.2 Naming Conventions

| Pattern | Convention | Example |
|---|---|---|
| Pages (App Router) | `page.tsx` | `app/products/page.tsx` |
| Client components | `PascalCase.tsx` | `ProductDetailClient.tsx` |
| Server components | `page.tsx` or `PascalCase.tsx` | `page.tsx` (default server) |
| Route Handlers | `route.ts` | `app/api/search/route.ts` |
| Utility functions | `camelCase.ts` | `lib/utils.ts` |
| Type files | `index.ts` | `types/index.ts` |
| Hooks | `useNoun.ts` | `hooks/useCart.ts` |
| Database migrations | `NNNNN_description.sql` | `00001_initial.sql` |

---

## 17. Future Scalability

### 17.1 Phase Roadmap

| Phase | Focus | Key additions |
|---|---|---|
| **Phase 0** *(current)* | Frontend foundation | Static data, demo UI, component library |
| **Phase 1** | Backend foundation | Supabase DB, Auth, product CRUD, orders, Stripe |
| **Phase 2** | AI & Personalisation | Claude search, recommendations, pgvector embeddings |
| **Phase 3** | Global scale | Multi-currency, multi-language, R2 media, Redis cache |
| **Phase 4** | Marketplace | Third-party vendors, commission system, Seller dashboard |

### 17.2 Database Scalability

| Scenario | Solution |
|---|---|
| > 10,000 products | Add category and in_stock partial indexes; paginate all queries |
| > 100,000 orders | Partition `orders` table by year; archive to cold storage |
| Product catalog search | pgvector embeddings + IVFFlat index |
| Global reads | Supabase read replicas (eu-west-1, ap-southeast-1) |
| Connection pool pressure | PgBouncer (included in Supabase) → connection pooling at 6 max |

### 17.3 Frontend Scalability

| Scenario | Solution |
|---|---|
| 10,000+ products | Server-side pagination; virtual list for admin tables |
| Bundle size growth | `next/dynamic` lazy imports for heavy components (R3F, rich editors) |
| Core Web Vitals degradation | Lighthouse CI in pipeline; Vercel Speed Insights monitoring |
| Third-party scripts | `next/script` with `strategy="lazyOnload"` |

### 17.4 API Scalability

| Scenario | Solution |
|---|---|
| Search API cost | Upstash Redis cache (1 hour TTL per query); semantic deduplication |
| Webhook volume | Idempotency keys on all webhook handlers; retry deduplication |
| Admin API abuse | Per-admin rate limiting; audit logging |
| Payment processing | Stripe payment intents are idempotent by design |

### 17.5 AI Scalability

| Scenario | Solution |
|---|---|
| Claude API latency | Stream responses for long content; cache common queries |
| Cost at scale | Haiku for search, Sonnet for content generation; usage monitoring |
| Product catalog too large for prompt | pgvector pre-filter to top 20 → Claude reranks |
| Search quality degradation | AI Studio quality loop; human-in-the-loop override system |

### 17.6 Infrastructure Evolution

```
Phase 0–1:   Vercel (Next.js) + Supabase + Stripe
Phase 2:     + Upstash Redis + Anthropic API + Resend
Phase 3:     + Cloudflare R2 (media CDN) + Supabase read replicas
Phase 4:     Evaluate: separate AI service on Fly.io if Vercel timeouts hit
             Evaluate: Turso for edge-distributed SQLite (read-heavy catalog)
             Evaluate: Dedicated search cluster (Typesense / Meilisearch)
```

### 17.7 Observability (Phase 2)

| Layer | Tool | Monitors |
|---|---|---|
| Frontend | Vercel Analytics + Web Vitals | LCP, CLS, INP, page views |
| API | Vercel Logs + Axiom | Response times, error rates, 5xx alerts |
| Database | Supabase Dashboard | Query performance, slow queries, connection pool |
| Payments | Stripe Dashboard | Success rate, failed payments, dispute rate |
| AI | Custom dashboard (search_logs table) | Query volume, zero-result %, CTR |
| Errors | Sentry | Client + server exceptions with full stack traces |

---

## 18. AI Foundation Architecture

**Status (2026-07-22):** Landed on `main` as Sprint 10 (ADR-025). Contracts-and-coordinators only — no concrete provider adapter, no live model call, no application code depends on this layer yet. Read alongside `docs/DECISIONS.md` ADR-025 and ADR-011, and `PROJECT_VISION.md`'s AI-native-OS long-term direction (ADR-017).

### 18.1 Why a foundation layer exists before any AI feature

Every module under `src/ai/` exists so a future AI feature — Search (Sprint 11), the disabled `AIAssistantPanel` (Sprint 5.1), or any of the specialized agents `PROJECT_VISION.md` lists (Pricing, SEO, Marketing, Inventory, ...) — is built against one stable, vendor-neutral contract instead of each hand-rolling its own Anthropic SDK call. This mirrors `src/lib/payments/`'s existing shape: one provider-agnostic boundary, one concrete adapter behind it today, room for more without touching callers.

### 18.2 Module map

```
src/ai/
├── index.ts            ← Public barrel. Import "@/ai", never a submodule path directly.
│
├── shared/              ← Cross-cutting primitives every other module depends on:
│   └── types.ts            AIMessage, AIResult<T>, AIError, AITokenUsage, AIModelIdentifier,
│                            AIProviderName. The one place a shared shape is defined.
│
├── providers/            ← PROVIDER ABSTRACTION (Sprint 10, complete)
│   ├── types.ts             AIProvider — the contract a concrete vendor adapter implements
│   │                        (OpenAI, Anthropic, Google, Ollama — none built yet).
│   ├── capabilities.ts      AIProviderCapability (e.g. "streaming") — what an adapter supports.
│   ├── factory.ts           AIProviderFactory — construction contract (config in, AIProvider out).
│   ├── registry.ts          AIProviderRegistry — discovery contract (register/resolve/list).
│   ├── metadata.ts          AIProviderMetadata — descriptive record paired with a registration.
│   ├── resolution.ts        Provider/model resolution helpers.
│   └── errors.ts             Provider-specific error shapes.
│
├── context-engine/       ← CONTEXT ENGINE (Sprint 10, complete — one real coordinator)
│   ├── engine.ts             DefaultContextEngine — the concrete class. Coordinates:
│   │                         resolver → sources (by category) → assembler → optional validator.
│   ├── resolver.ts           AIContextResolver — decides which context categories a request needs.
│   ├── source.ts             AIContextSource — contract a concrete data source implements.
│   ├── registry.ts           AIContextSourceRegistry — sources registered per category.
│   ├── assembler.ts          AIContextAssembler — builds the final AIAssembledContext.
│   ├── model.ts               AIContextCategory, AIContextFragment.
│   ├── request.ts / context.ts / validation.ts
│   │                          Request shape, the immutable assembled result, completeness checks.
│   └── (no concrete source/resolver/validator registered yet — nothing to gather from
│        until a feature, e.g. AI Search, supplies them)
│
├── orchestration/        ← AI ORCHESTRATOR (Sprint 10, complete — branch `feat/ai-orchestration-layer`,
│   │                        NOT YET MERGED to `main`; see ADR-025 Consequence)
│   ├── orchestrator.ts       PipelineOrchestrator — the concrete class. Builds an AIExecutionContext,
│   │                         runs it through an AIPipeline, emits request-level lifecycle events.
│   ├── pipeline.ts           SequentialPipeline — runs AIStages in order, threading context forward,
│   │                         stopping at the first failure. Other execution strategies (parallel,
│   │                         branching, retries) are meant to be *different AIPipeline
│   │                         implementations*, not changes to the orchestrator.
│   ├── stage.ts               AIStage — contract a single pipeline step implements.
│   ├── context.ts             AIExecutionContext + createExecutionContext().
│   ├── cancellation.ts        AICancellationToken — cooperative cancellation, checked between stages.
│   ├── events.ts / errors.ts / outcome.ts / request.ts
│   │                          Lifecycle events, error shape, per-stage outcome, run request shape.
│   └── (no concrete stage exists yet for any feature)
│
├── context/ prompts/ memory/ guardrails/ telemetry/ workflows/
│   ← AI CORE FOUNDATION (Sprint 10, complete). Each is a single `types.ts` (contract only) behind
│     an `index.ts` barrel — no runtime implementation in any of these six modules yet:
│   - context/    — AIContextFragment-adjacent shared context types (distinct from context-engine/)
│   - prompts/    — a prompt template's contract (Sprint 11: "Prompt Engine" gives this a real
│                   implementation — system/user template assembly, per §9.1's prompt sketch)
│   - memory/     — a memory record's contract (Sprint 11: "Memory" — conversation/session state)
│   - guardrails/ — a guardrail policy's contract (Sprint 11: "Guardrails" — output/safety checks)
│   - telemetry/  — an AI usage/event record's contract (no sprint scheduled yet)
│   - workflows/  — a multi-step workflow's contract, distinct from orchestration/'s pipeline
│                   (a workflow describes *what* a feature does step-by-step; the orchestrator
│                   + pipeline describe *how* any request, workflow or not, actually executes)
```

### 18.3 Design patterns in use

- **Factory Method** (`providers/factory.ts`) — one seam for "which adapter class for this config," instead of `if (name === "openai") ... else if (name === "anthropic")` scattered across call sites.
- **Registry/Service Locator** (`providers/registry.ts`, `context-engine/registry.ts`) — discovery without the discoverer knowing concrete implementations; neither registry contract imports a single concrete provider or source.
- **Strategy** (`AIPipeline` implementations, `AIContextResolver`/`AIContextAssembler` implementations) — the Open/Closed seam of this whole layer: to change *how* something executes or resolves, add an implementation; to change *what* runs, add stages/sources.
- **Result type over exceptions** (`AIResult<T>`, `src/ai/shared/types.ts`) — every fallible operation (a provider call, a context assembly, a pipeline stage) returns `{ ok: true, value }` or `{ ok: false, error }` rather than throwing, so a caller's error handling is uniform across the whole layer.

### 18.4 Explicit non-goals of this layer (today)

- No concrete provider adapter (no `AnthropicProvider` class, no `@anthropic-ai/sdk` dependency — confirmed absent from `package.json`).
- No live API call, no cost, no `ANTHROPIC_API_KEY` usage anywhere (confirmed absent from `.env.local`).
- No UI, Route Handler, or Server Action imports `@/ai` yet (`grep -rn "@/ai" src/app src/components src/lib` — zero matches, verified 2026-07-22).
- No new database table or RLS policy — this layer has no persistence of its own yet; `memory/` and `telemetry/` are contracts a future concrete store (Supabase-backed or otherwise) will implement.

### 18.5 What Sprint 11 builds on top of this

See §9 above for the target AI Search feature shape. In Foundation terms, Sprint 11 is: implement `AnthropicProvider` (Provider Runtime) → implement a concrete prompt assembler (Prompt Engine) → implement concrete `memory`/`guardrails` stores → register a Context Engine source for the product catalogue → wire `/api/search` to call `AIOrchestrator.run()` with a pipeline of stages (assemble context → render prompt → call provider → validate/guard output) instead of any of these being built ad hoc inside the Route Handler itself.

---

## Appendix A — Technology Decisions

| Decision | Choice | Rationale | Alternative considered |
|---|---|---|---|
| Frontend framework | Next.js 16 | App Router, RSC, SSG/ISR, Edge, Vercel integration | Remix, Nuxt |
| Styling | Tailwind CSS v4 | Zero-config, purges unused CSS, co-located styles | CSS Modules, Emotion |
| Component library | shadcn/ui v4 (base-ui) | Headless, unstyled, copy-owned, no lock-in | Radix UI (older shadcn), MUI |
| Animation | Framer Motion | Industry standard for React, declarative, spring physics | CSS animations, GSAP |
| State management | Zustand | Minimal boilerplate, SSR-safe, middleware ecosystem | Redux Toolkit, Jotai |
| Database | Supabase (PostgreSQL) | Open-source, BaaS, RLS, Auth, Storage, Realtime | PlanetScale, Neon, Firebase |
| Authentication | Supabase Auth | Unified with DB, built-in OAuth, JWT, MFA | NextAuth.js, Clerk |
| Payments | Stripe + PayPal | Market coverage (Stripe: cards; PayPal: global trust) | Adyen, Square |
| AI | Anthropic Claude | Best-in-class reasoning, reliable JSON, safety | OpenAI GPT-4, Gemini |
| Email | Resend | Developer-first, React Email templates, reliable | SendGrid, Postmark |
| Cache | Upstash Redis | Serverless-native, per-request billing, global | Redis Cloud, Momento |
| Deployment | Vercel | Native Next.js, global CDN, preview deployments | Netlify, Railway, Fly.io |

---

## Appendix B — API Response Shapes

### Search Response
```typescript
interface SearchResponse {
  products: Product[];
  problemCategory: string;
  suggestions: string[];
  refinements: string[];
  cached: boolean;
  latencyMs: number;
}
```

### Order Response
```typescript
interface OrderResponse {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  currency: string;
  shippingAddress: Address;
  createdAt: string;
  estimatedDelivery?: string;
}
```

### Webhook Event (Stripe)
```typescript
// All webhooks are idempotent — safe to replay
interface StripeWebhookEvent {
  id: string;                 // Used as idempotency key
  type: string;               // payment_intent.succeeded | payment_intent.payment_failed
  data: { object: StripePaymentIntent };
  created: number;
}
```

---

*Document maintained by: Lead Product Engineer*
*Last updated: 2026-07-11*
*Next review: on any major architectural change*
