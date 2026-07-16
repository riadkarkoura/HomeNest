# CLAUDE_CONTEXT.md — HomeNest Session Brief

> Read this file at the start of every Claude session working on HomeNest.
> It answers the most important questions before you touch any code.
> For deeper detail, read: `PROJECT_VISION.md` · `DESIGN_SYSTEM.md` · `docs/ARCHITECTURE.md` · `docs/DATABASE.md`

---

## What is HomeNest?

HomeNest is a premium Smart Home Solutions ecommerce platform. It sells **solutions to household problems**, not just products. Every product must answer: *"What specific problem does this solve?"*

The homepage user journey is: **Problem → Solution → Benefits → Reviews → Purchase**. Never deviate from this sequence.

Brand: premium, minimal, warm, helpful. Inspired by Apple simplicity and IKEA usability.

---

## Long-Term Architectural Note

HomeNest's long-term vision (not the current roadmap) is an **AI-native commerce operating system** — the owner eventually only selects products, approves key AI decisions, monitors analytics, and sets strategy; specialized agents (Product Research, Import, Optimization, SEO, Pricing, Image Generation, Marketing, Advertising, Email, Social, Support, Inventory, Analytics, Operations) handle the rest. Full statement: `PROJECT_VISION.md`. Recorded as ADR-017 in `docs/DECISIONS.md`.

**Practical effect now:** favor a clean server-side entry point a future AI agent could call over a human-only UI flow with no equivalent path in. This does **not** change the current roadmap and does **not** authorize building any AI feature ahead of its scheduled sprint.

---

## Current Project Status

**Version:** 0.1.0  
**Phase:** Phase 0 complete (frontend). Phase 1 (backend) in progress.  
**Last sprint completed:** Sprint 8.1 — Checkout UI & Flow Hardening.  
**Date of last update:** 2026-07-16

---

## Current Sprint

**Sprint 8.1 — Checkout UI & Flow Hardening** ✅ COMPLETE

Planning-first (no code until approved), then implemented incrementally on top of Sprint 8.0's checkout — no new commerce capability, no payment activation. **Naming note:** reuses the number the Sprint 8.0 closing report had provisionally proposed for "Payment Activation & Order Notifications"; that placeholder was never approved as fixed, so it's renumbered to Sprint 8.2 in `docs/ROADMAP.md` (same reuse-and-disambiguate precedent as ADR-020).

- **Visual step indicator** (`src/components/checkout/CheckoutSteps.tsx`) — Shipping/Billing/Delivery/Review completion, computed from existing state. Guidance only; no wizard navigation, per-step routing, or back-button system introduced, per explicit instruction.
- **Hydration guard, local to `CheckoutClient` only** — `useCartStore.persist.hasHydrated()`/`onFinishHydration()` (Zustand's own built-in persist API, not a change to `store.ts`'s public contract) gate a new `CheckoutSkeleton.tsx`, so a returning customer's cart never briefly reads as empty before `localStorage` rehydrates. Same root cause as the pre-existing Navbar cart-badge hydration mismatch, addressed here for checkout specifically.
- **Server-side validation** — `createOrder()` now Zod-parses its input first. `shippingMethodId`'s enum is derived from `SHIPPING_OPTIONS.map(o => o.id)` at runtime, per explicit instruction, so it can never drift from `src/lib/checkout/shipping-options.ts`.
- **Per-section inline hints** and **loading-state polish** (`CheckoutPayment.tsx`'s skeleton, `CheckoutIdentify.tsx`'s toggle disabled while pending) round out the hardening pass.
- Verified live: step-indicator accuracy, hint visibility, no empty-cart flash across repeated reloads, a real order placed successfully post-validation-change, mobile pass at 375×812.

---

## Previous Sprint

**Sprint 8.0 — Checkout Architecture Review & Implementation** ✅ COMPLETE (Milestone 2: First Sale)

An architecture review was produced first (no code), approved with refinements, then implemented. `orders`/`order_items` existed since the initial schema (migration `20260711000002`) with SELECT-only RLS — Sprint 8.0's core job was giving them their first-ever write path, not designing new tables. Migration `20260715000001_checkout_write_access.sql` adds `products.sku` (nullable `UNIQUE`, backfilled once from slug, never regenerated on rename), `orders.shipping_method`, `carts.converted_order_id` (closes a gap ADR-021 flagged), and `orders_own_insert`/`order_items_own_insert` (`auth.uid()`-owned-row, no service-role key — ADR-013 upheld). A second migration (`20260715000002_stripe_payment_functions.sql`) adds two `SECURITY DEFINER` RPC functions so Stripe's webhook — the one part of checkout with no end-user session — can update `orders` without a service-role key; the webhook's HMAC signature check is the real authorization boundary.

**Guest-can-browse, must-identify-to-order** (the user's explicit resolution to a tension the architecture review raised): `src/proxy.ts`'s `/checkout` gate was relaxed so guests reach the full flow, but `createOrder()` still requires a session — identification happens inline on the checkout page (`CheckoutIdentify.tsx`, new non-redirecting `checkoutSignIn`/`checkoutSignUp` actions), not via a `next=`-redirect-back to `/login` (that pattern already broke click interactivity once in Sprint 7.0).

**Checkout UI and order creation:** `src/app/checkout/{page.tsx,actions.ts}` + `src/components/checkout/*` — shipping/billing address (reuses Sprint 7.1's `AddressForm`), static delivery options (`src/lib/checkout/shipping-options.ts`, deliberately not a DB table), order review, `createOrder()` (re-fetches live prices/stock, never trusts client totals, builds an immutable `order_items.product_snapshot` with name/SKU/image/variant so an order never depends on `products` again, converts the cart via `converted_order_id`).

**Payment:** `src/lib/payments/` exposes one provider-agnostic `createPaymentIntent()` boundary with Stripe as the only concrete implementation — PayPal/Klarna/Apple Pay/Google Pay can be added behind the same boundary later without touching checkout code. `/api/payments/stripe/intent`, `/api/webhooks/stripe`, and `CheckoutPayment.tsx` are fully coded; `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are not yet configured (external dependency, `TESTING.md` §5), so orders place successfully as `pending`/`unpaid` and the UI shows a graceful fallback rather than collecting a real charge — order creation and payment are deliberately decoupled (matches the flow already documented in `docs/ARCHITECTURE.md` §12.1).

Order confirmation (`/order-confirmation/[orderNumber]`) and real order history (`/account/orders`, `/account/orders/[orderNumber]`, replacing the Sprint 7.1 placeholder) share one `OrderSummary` component. See ADR-022 for full reasoning, alternatives considered, and what's explicitly out of scope (admin order management, tax calculation, coupon redemption UI).

---

## Previous Sprint (Cart & Session Continuity)

**Sprint 7.2 — Cart & Session Continuity** ✅ COMPLETE (schema + application layer)

`carts` + `cart_items` tables were designed and migrated (2026-07-14, ADR-021) per explicit user architecture review + refinements: normalized, structurally parallel to `orders`/`order_items`; server-persisted for **authenticated users only**; no price/name snapshot on `cart_items` (a cart reflects live product data, unlike the immutable `order_items` snapshot); `cart_items.source` (`text NOT NULL DEFAULT 'web'`, unconstrained) prepared for future `'ai'`/`'partner'` attribution without needing a migration to introduce them. Migration `20260714000001_cart_schema.sql` is applied to the linked Supabase project (verified via `supabase migration list` and a REST smoke test). RLS matches the existing `auth.uid()`-owned-row pattern (`addresses`/`wishlists`) — no service-role key. Full detail in `docs/DATABASE.md` §8 and ADR-021.

**Phase 2 (application layer) is also complete**, after an explicit final architecture consistency check against Checkout/Orders/Payments/Marketplace/Partner Companies/AI Services found no blocking issues: `src/app/cart/actions.ts` (`syncAddItem`/`syncUpdateQuantity`/`syncRemoveItem`/`syncClearCart`/`mergeGuestCart`/`fetchServerCart`, all scoped by `getUser()` → RLS `auth.uid()`, no service-role key) and `src/lib/supabase/queries/cart.ts` (`getOrCreateActiveCart`/`getActiveCartItems`, reusing `products.ts`'s exported `PRODUCT_FIELDS`/`mapRow`). `src/lib/store.ts` gained `userId`/`setUserId` internally — the public API (`addItem`/`removeItem`/`updateQuantity`/`clearCart`) is unchanged, so `CartDrawer.tsx` and `src/app/cart/page.tsx` needed zero edits. `setUserId` is called from the Navbar's existing `onAuthStateChange` effect (no second listener): on first login it merges the guest's local cart into the server (summing quantities), on return visits/devices for an already-merged account it hydrates from the server instead of re-merging (tracked via a `homenest-cart-merged-user` localStorage flag), and on sign-out it clears the local cart so nothing leaks to the next person on a shared device.

---

## Previous Sprint

**Sprint 7.1 — User Area** ✅ COMPLETE

The originally-planned single "Sprint 7 — Full Authentication" was split into 7.0/7.1/7.2 per explicit user instruction — see ADR-020 (also records that "Sprint 7.1" is intentionally reused: it already names the shipped Product Edit sprint below). Sprint 7.0 (Authentication Foundation) shipped customer email/password registration and login, Google OAuth, password reset, session-aware Navbar, and `src/proxy.ts` gating `/checkout` and `/account/*`. Sprint 7.1 (this one) builds the customer-facing account hub behind that gate: Profile (`/account`), full Address CRUD (`/account/addresses`), and UI-only Orders/Wishlist placeholders — designed, per explicit user instruction, as a **future-ready customer hub**: `src/components/account/nav-items.ts` already models Security, Invoices, Home Projects, Service Bookings, Home Documents, and Warranty Files as "coming soon" categories, so shipping any of them later is a config flip plus a page, not a redesign. Styled to match the storefront's warm stone/amber palette throughout — no admin `stone-900` chrome anywhere in `/account`.

**Verification (2026-07-13, live Supabase, real test account):** The Sprint 7.0 verification pass had been blocked on Login's success path and Logout — no working test account existed. The user created a permanent, Dashboard-created, Auto-Confirmed test account (per `TESTING.md` §1) and shared its credentials for this session only — not stored anywhere, per explicit instruction. Every previously-unverified item passed: Login success, Logout, and now also Profile edit/persistence, full Address CRUD (create/edit/set-default/delete), Orders/Wishlist placeholders, protected routes in both directions, and mobile responsiveness. **One real bug was found and fixed**: Base UI's `DropdownMenuLabel` requires a `<DropdownMenuGroup>` ancestor (unlike Radix) — the Navbar's account dropdown (Sprint 7.0 code) crashed the first time it was ever opened with a live session, simply because no session had existed to test it with until now. Fixed in `src/components/layout/Navbar.tsx`. Google OAuth remains blocked on the external Supabase Dashboard step noted below. Full detail in `SESSION.md`'s "Sprint 7.1 Verification" section.

---

## Completed Work

| Sprint | What was built |
|---|---|
| Sprint 1 | Full storefront UI — homepage, product listing, product detail, cart, login stub, Navbar, Footer |
| Sprint 2 | Supabase database schema, seed data, migrations, Supabase client files |
| Sprint 3 | Enriched product content, problem/solution/reviews story layout on product pages |
| Sprint 3.3 | Supabase product queries (`src/lib/supabase/queries/products.ts`) — live DB data replaces static data |
| Sprint 4 | Admin Dashboard: `AdminShell`, `AdminSidebar`, `AdminTopBar`, overview page, 9 stub route pages |
| Sprint 5 | Admin Products Management UI: table, search, category/status/featured filters, row actions menu, empty/loading states, `/admin/products/new` placeholder — read-only, no CRUD/auth/mutations |
| Sprint 5.1 | Add Product Studio at `/admin/products/new`: 8-section product creation UI (Basic Info, Pricing, Organization, Media, Product Story, SEO, Product Quality score strip, disabled AI panel with 6 actions, disabled Publish card) — mount-time motion, `initialDraft` prop future-proofed for Edit Product — local state only, no CRUD/auth/mutations/AI wiring |
| Sprint 6 | **Product Create (CRUD)**, wired to real Supabase writes via a Server Action (`src/app/admin/products/new/actions.ts`) — no `SUPABASE_SERVICE_ROLE_KEY` anywhere, authorization is entirely RLS (`get_my_role() IN ('staff','admin')`, migration `20260712000001`). Includes a **temporary, minimal admin-only auth bridge** (`src/proxy.ts`, `src/lib/auth/dal.ts`, `/admin/login`) — NOT the full Authentication sprint; see ADR-013/014/015 in `docs/DECISIONS.md`. |
| Sprint 6.1 (partial) | **Live Products list** at `/admin/products` — `src/lib/supabase/queries/admin-products.ts` (paginated, filtered, RLS-gated, browser client), real `status.ts` derivation from `is_active`/`published_at`, `ProductsPagination.tsx`. |
| Sprint 7.1 | **Product Edit** at `/admin/products/[id]/edit` — reuses `ProductStudio` entirely via `initialDraft` + a new `action` prop. New `updateProduct` Server Action (`.update()` + `.upsert()` on `seo_metadata`), new `products_staff_update`/`seo_metadata_staff_update` RLS policies (migration `20260712000002`), shared Zod schema extracted to `src/components/admin/products/studio/validation.ts` so Create and Edit validate identically. See ADR-016. |
| Sprint 6.1 (remaining) | **Delete (soft), Archive/Restore, Duplicate** — `src/app/admin/products/actions.ts` (new), all reusing existing RLS (`products_staff_update`/`products_staff_insert`), no new migration needed for these three. **Image upload to Supabase Storage** — `src/app/admin/products/media-actions.ts` (upload) + `src/components/admin/products/studio/images.ts` (`syncProductImages`, called from Create/Edit), migration `20260712000003` (new `products` bucket + `storage.objects`/`media`/`product_images` staff policies). **Real Product Quality scoring** — `src/components/admin/products/studio/scoring.ts`, deterministic (not AI). See ADR-018. |
| Sprint 7.0 | **Authentication Foundation** — customer email/password registration + login (`src/app/login/actions.ts`, wired to the existing `/login` page's register/login toggle), Google OAuth (`supabase.auth.signInWithOAuth`) + shared `/auth/callback` Route Handler (code-exchange, reused by password recovery via a `next` query param), password reset (`/forgot-password` + `/auth/reset-password`), customer session helpers `verifySession`/`getUser` added to `src/lib/auth/dal.ts`, session-aware Navbar (account dropdown + sign out, live via `supabase.auth.onAuthStateChange`), `src/proxy.ts` extended to gate `/checkout` and `/account/*`. No new RLS/migrations needed — `profiles`/`addresses` policies already existed. See ADR-020. |
| Sprint 7.1 | **User Area** — future-ready customer account hub. `src/components/account/nav-items.ts` (typed, grouped nav config, `active`/`comingSoon` status — single source of truth for both the pill nav and the "coming soon" teaser), `AccountShell.tsx`/`ComingSoonGrid.tsx` (storefront-styled, no admin chrome), `src/app/account/layout.tsx` (`verifySession()` gate), Profile (`page.tsx`/`ProfileForm.tsx`/`actions.ts` — `updateProfile`), Addresses (`addresses/{page.tsx,actions.ts}` + `AddressesView`/`AddressCard`/`AddressForm` — full CRUD via a `Sheet`, set-default unsets the prior default first, no transaction, same posture as ADR-015/016), Orders/Wishlist UI-only placeholders, `src/lib/supabase/queries/account.ts` (`getProfile` wrapped in `React.cache`, `getAddresses`). No new RLS/migrations needed. Also fixed a Sprint 7.0 bug found during this sprint's verification: Base UI's `DropdownMenuLabel` needs a `<DropdownMenuGroup>` wrapper. |
| Sprint 7.2 | **Cart & Session Continuity** — `carts` + `cart_items` tables, normalized, structurally parallel to `orders`/`order_items`, server-persisted for authenticated users only (guests stay client-only). No price/name snapshot on `cart_items` — reflects live product data. `cart_items.source` prepared for future `'ai'`/`'partner'` attribution (unconstrained text, not a `CHECK` enum, so no migration needed to introduce a new source later). Migration `20260714000001_cart_schema.sql`, applied to the linked project. RLS matches the `addresses`/`wishlists` `auth.uid()`-owned-row pattern. See ADR-021. **Application layer**: `src/app/cart/actions.ts` (add/update/remove/clear/merge/fetch Server Actions), `src/lib/supabase/queries/cart.ts`, and `src/lib/store.ts` extended with `userId`/`setUserId` so the existing Zustand cart merges a guest's local cart into the server on first login, hydrates from the server on return visits, and clears on sign-out — `CartDrawer.tsx`/`src/app/cart/page.tsx` unchanged. Also includes the post-7.1 Navbar UX integration (My Account/Addresses/Orders/Wishlist links). |
| Sprint 8.0 | **Checkout (Milestone 2: First Sale)** — `products.sku`, `orders.shipping_method`, `carts.converted_order_id`, and the first-ever `orders`/`order_items` INSERT RLS policies (migration `20260715000001_checkout_write_access.sql`); two `SECURITY DEFINER` RPC functions so Stripe's webhook can write to `orders` with no service-role key (migration `20260715000002_stripe_payment_functions.sql`). Guests browse the full checkout flow; `createOrder()` requires a session, identified inline (no `next=`-redirect-back). `src/app/checkout/{page.tsx,actions.ts}` + `src/components/checkout/*` (shipping/billing via reused `AddressForm`, static delivery options, order review, immutable `order_items.product_snapshot`). Provider-agnostic `src/lib/payments/` with Stripe as the only concrete provider (PayPal/Klarna/Apple Pay/Google Pay can be added behind the same boundary later); `/api/payments/stripe/intent`, `/api/webhooks/stripe`, `CheckoutPayment.tsx` gracefully degrade without configured Stripe keys. Order confirmation (`/order-confirmation/[orderNumber]`) and real order history (`/account/orders`, replacing the Sprint 7.1 placeholder). See ADR-022. |
| Sprint 8.1 | **Checkout UI & Flow Hardening** — `CheckoutSteps.tsx` (visual step indicator, guidance only, no navigation added), a `CheckoutClient`-local hydration guard using Zustand's own `useCartStore.persist.hasHydrated()`/`onFinishHydration()` (no change to `store.ts`'s public API) plus a new `CheckoutSkeleton.tsx`, server-side Zod validation on `createOrder()` with `shippingMethodId`'s enum derived from `SHIPPING_OPTIONS` at runtime (never hand-typed, so it can't drift), per-section inline validation hints, and loading-state polish on `CheckoutPayment.tsx`/`CheckoutIdentify.tsx`. No new schema, no new Server Actions, no DAL changes. |

---

## Pending Work (next sprints)

| Sprint | Goal |
|---|---|
| Sprint 8.2 | Payment Activation & Order Notifications — configure Stripe keys and verify a real test-mode charge end-to-end (the integration is fully coded, see Sprint 8.0 above), order confirmation email (Resend), tax calculation (currently hardcoded to 0), coupon redemption UI at checkout (`coupons`/`coupon_redemptions` tables already exist) |
| Sprint 9 | AI Smart Search — Claude API, Upstash Redis cache, search logs. Also wires the Sprint 5.1 `AIAssistantPanel` and adds AI-assisted content quality analysis to `ProductQualitySection` (the deterministic scoring shipped in Sprint 6.1 remaining stays as the non-AI baseline — see ADR-018) |

**Do NOT implement** Sprint 7.2's application layer, Stripe, or AI search until the relevant sprint begins.

---

## Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js | 16.2.10, App Router, Turbopack |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | v4 — `@import "tailwindcss"` in globals.css — NO config file |
| UI Components | shadcn/ui | v4 backed by `@base-ui/react` — use `render` prop, NOT `asChild` |
| Animation | Framer Motion | v12 — `EASE` from `src/lib/motion.ts`, never redefine it |
| State | Zustand | v5 — cart store, localStorage key `"homenest-cart"` |
| Database | Supabase (PostgreSQL) | `@supabase/supabase-js` + `@supabase/ssr` installed |
| Icons | lucide-react | v1.24.0 — does NOT export `LucideIcon`; use `React.ElementType` |
| Font | Cormorant Garamond | via `next/font/google`, CSS var `--font-cormorant` |
| Runtime | React | v19 — Server Components by default; `"use client"` only at leaves |

---

## Folder Structure

```
src/
├── proxy.ts              ← Next 16's renamed middleware.ts. Optimistic gate on /admin/:path* (→ /admin/login) and /checkout + /account/:path* (→ /login, Sprint 7.0), session-only checks. NOT the security boundary (RLS is) — see ADR-013/014.
├── app/
│   ├── admin/
│   │   ├── layout.tsx    ← Server wrapper → <AdminShell>
│   │   ├── page.tsx      ← Overview dashboard
│   │   ├── login/        ← Minimal admin-only sign-in (page.tsx + actions.ts) — NOT full Authentication, see ADR-014
│   │   ├── products/     ← Live, paginated, filterable list (Sprint 6.1); actions.ts (delete/archive/restore/duplicate) + media-actions.ts (uploadProductImage) — Sprint 6.1 remaining
│   │   │   ├── new/      ← Add Product Studio + actions.ts (createProduct) — Sprint 6
│   │   │   └── [id]/edit/← Edit Product + actions.ts (updateProduct) — Sprint 7.1, reuses ProductStudio entirely
│   │   ├── categories/   ← Stub
│   │   ├── orders/       ← Stub
│   │   ├── customers/    ← Stub
│   │   ├── promotions/   ← Stub
│   │   ├── media/        ← Stub
│   │   ├── ai-studio/    ← Stub
│   │   ├── analytics/    ← Stub
│   │   └── settings/     ← Stub
│   ├── products/         ← Listing + detail pages (live Supabase data)
│   ├── cart/              ← Cart page (Zustand state)
│   ├── login/             ← Storefront register/login (Sprint 7.0) — actions.ts (signup, login), page.tsx wires the register/login toggle via useActionState. Google OAuth button calls signInWithOAuth client-side.
│   ├── forgot-password/   ← Password reset request (Sprint 7.0) — actions.ts (requestPasswordReset), page.tsx
│   ├── auth/
│   │   ├── callback/      ← Route Handler (Sprint 7.0) — shared code-exchange for OAuth and password-recovery links, `next` query param picks the post-exchange destination
│   │   └── reset-password/← Set new password under the recovery session (Sprint 7.0) — actions.ts (resetPassword), page.tsx
│   ├── account/           ← Customer account hub (Sprint 7.1), gated by layout.tsx's verifySession()
│   │   ├── layout.tsx     ← Server wrapper → <AccountShell>, fetches the profile once for the header
│   │   ├── page.tsx       ← Profile — ProfileForm + ComingSoonGrid
│   │   ├── actions.ts     ← updateProfile
│   │   ├── addresses/     ← Full CRUD — page.tsx (AddressesView) + actions.ts (createAddress/updateAddress/deleteAddress/setDefaultAddress)
│   │   ├── orders/        ← UI-only placeholder, no data
│   │   └── wishlist/      ← UI-only placeholder, no data
│   ├── page.tsx           ← Homepage
│   └── layout.tsx         ← Root layout (fonts, providers)
│
├── components/
│   ├── admin/            ← AdminShell, AdminSidebar, AdminTopBar (sign-out wired)
│   │   └── products/     ← ProductsView, ProductsToolbar, ProductsTable, ProductsPagination, ProductActionsMenu (fully wired: View/Edit/Duplicate/Archive-or-Restore/Delete), status.ts (real is_active/published_at derivation)
│   │       └── studio/   ← ProductStudio (action prop: createProduct default, or updateProduct.bind(null, id)) + StudioSection/FormField/TagInput/ScoreCard/CharacterCounter + validation.ts (shared Zod schema) + images.ts (syncProductImages) + scoring.ts (computeProductQualityScores) + sections/
│   ├── account/           ← Sprint 7.1 — AccountShell/ComingSoonGrid (storefront-styled, no admin chrome), nav-items.ts (typed, grouped, active/comingSoon config — single source of truth for the pill nav and the teaser grid), ProfileForm, AddressesView/AddressCard/AddressForm
│   ├── home/              ← Homepage sections
│   ├── layout/            ← Navbar (session-aware account dropdown, Sprint 7.0), Footer
│   ├── product/            ← Product detail sections
│   ├── shop/                ← ProductCard, CartDrawer
│   └── ui/                  ← shadcn/ui primitives
│
├── lib/
│   ├── auth/
│   │   └── dal.ts        ← verifyAdminSession/getAdminUser (admin) plus verifySession/getUser (customer, Sprint 7.0) — same redirect-vs-no-redirect split for each pair
│   ├── supabase/
│   │   ├── queries/
│   │   │   ├── products.ts        ← Storefront reads (plain client, SSG-safe, is_active=true only)
│   │   │   ├── admin-products.ts  ← Admin list reads (browser client, no is_active filter, paginated)
│   │   │   ├── admin-product.ts   ← Admin single-product read for Edit (server client — kept separate from admin-products.ts to avoid next/headers in a client bundle)
│   │   │   └── account.ts         ← getProfile (React.cache, Sprint 7.1) + getAddresses, server client
│   │   ├── client.ts     ← Browser Supabase client
│   │   ├── server.ts     ← Server Supabase client (Server Components/Actions)
│   │   └── middleware.ts ← updateSession() helper, called from src/proxy.ts
│   ├── motion.ts          ← EASE constant + animation variants
│   ├── products.ts        ← Static product data (still used by admin overview page)
│   ├── product-content.ts ← Enriched product page content
│   ├── store.ts            ← Zustand cart store
│   └── utils.ts             ← cn() utility
│
└── types/
    └── index.ts          ← All TypeScript types + future feature stubs
```

---

## Coding Rules

1. **Never rebuild** what already exists. Improve, extend, or fix existing code.
2. **Server Components by default**. Add `"use client"` only at the component that actually needs browser APIs (`useState`, `useEffect`, `usePathname`, etc.).
3. **Admin auth is still a minimal bridge** (Sprint 6, ADR-014) — `/admin/*` is gated by `src/proxy.ts` + admin-only sign-in at `/admin/login`, no OAuth, no register, no customer accounts, and that's intentional; it's a separate concern from customer auth. **Customer auth is real as of Sprint 7.0** — storefront `/login` wires real registration, email/password login, and Google OAuth via `src/app/login/actions.ts`; `src/proxy.ts` also gates `/checkout` and `/account/*` for customer sessions (optimistic check only, same posture as the admin gate).
4. **Product CRUD is complete**: Create (Sprint 6), Read/List (Sprint 6.1), Edit (Sprint 7.1), and Delete/Archive/Restore/Duplicate + image upload (Sprint 6.1 remaining) are all real, RLS-gated, no service-role key. AI-assisted content quality analysis is still Sprint 9 — Product Quality scoring today is deterministic, not AI (see ADR-018).
5. **No service-role key anywhere, ever** (ADR-013). Admin writes are authorized entirely through RLS (`get_my_role() IN ('staff','admin')`) on the normal cookie-based/browser Supabase client. If a new admin mutation needs a write path that doesn't exist yet, add the RLS policy — do not reach for `SUPABASE_SERVICE_ROLE_KEY`.
6. **Error handling in data queries**: all query functions `try/catch` and return `[]` or `null` on failure. The build must never fail due to DB connectivity.
7. **`React.cache`** wraps `getProductBySlug` to deduplicate between `generateMetadata` and the page function.
8. **`generateStaticParams`** returns `[]` on error — falls back to dynamic rendering, never breaks the build.
9. **No `NEXT_PUBLIC_` prefix on secret keys**. `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`, etc. are server-only.
10. **`.env.local` is never committed**.
11. **No comments** unless the WHY is non-obvious. No docstrings.
12. **Double-cast `data` from Supabase**: use `(data as unknown as MyType[])` for non-overlapping types.

---

## Design Rules

1. **Stone/amber palette ONLY**. Never use `blue-*`, `green-*`, `purple-*`, `red-*` (except danger states), or `zinc-*`.
2. **Rounded corners for new elements** — `rounded-lg`, `rounded-xl`, `rounded-2xl`. Do NOT retrofit existing components.
3. **Existing components use sharp edges** — do not change existing component border-radius.
4. **Icon type**: `React.ElementType` for icon props (lucide-react v1.24.0 does NOT export `LucideIcon`).
5. **Admin palette**: sidebar is `bg-stone-900`. Active nav items: `bg-stone-800 text-white`, active icon: `text-amber-400`. Top bar: `bg-white border-stone-100`.
6. **EASE**: always import from `src/lib/motion.ts`, never redefine `[0.16, 1, 0.3, 1]`.
7. **`VIEW_ONCE`**: `{ once: true, margin: "-80px 0px" }` for all scroll triggers.
8. **No decorative elements** without purpose. No overcrowding. Large white space.
9. **Section headers follow this pattern**: amber eyebrow text (12px uppercase tracking-widest) → h1/h2 → description.

---

## AI Integration Status

| Feature | Status | Sprint |
|---|---|---|
| Smart Search (Claude API) | Not started | Sprint 9 |
| AI Studio (admin) | Stub page exists | Sprint 9+ |
| AI Product Assistant (`/admin/products/new`) | Disabled UI panel exists (Sprint 5.1) — 6 buttons: Import from AliExpress, Generate Product Story, Generate SEO, Generate FAQs, Generate TikTok Content, Generate Product Images | Sprint 9 |
| Product content generation | Not started | Future |
| Personalised recommendations | Not started | Future |

**Model plan:**
- Search: `claude-haiku-4-5-20251001` (fast, cost-efficient)
- Content + recommendations: `claude-sonnet-4-6` (higher quality)

---

## Database Status

**Supabase project:** Connected. Env vars in `.env.local` — only `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. No service-role key, by design (ADR-013).

**Tables:** 36 tables defined in `docs/DATABASE.md` (added `carts`/`cart_items`, migration 008, ADR-021). 8 migrations applied (`supabase/migrations/`); most tables have schema but no write policies yet — see the RLS coverage gap noted in the architecture review. `carts`/`cart_items` are a full exception — schema, RLS, and indexes all shipped together in migration 008, own-row `auth.uid()` policies already live.

**Storage:** `products` bucket (public, 10MiB limit, image/webp+jpeg+png+avif only) — created by migration 007, matches `supabase/config.toml`'s declared bucket.

**Currently seeded:**
- `categories` — 7 rows: Kitchen, Bathroom, Storage, Cleaning, Bedroom, Office, Outdoor
- `products` — 8 seed rows + whatever's been created since via `/admin/products/new`
- `product_images` — 2 images per seed product (Unsplash URLs, `media_id = NULL` — these legacy rows are preserved through edits, see ADR-018) + whatever's been uploaded since via the Studio's Media section

**RLS:** Default-deny on every table. `products`/`categories`/most catalogue tables: public SELECT (active only) + full staff/admin SELECT. `products`/`seo_metadata`: staff/admin INSERT (migration 005) and UPDATE (migration 006) too. `products` also has a narrow staff/admin DELETE, scoped to Create's compensating rollback, not general use — the admin Delete action reuses the UPDATE policy for a soft delete instead (ADR-018). `media`/`product_images`: staff/admin INSERT (migration 007); `product_images` also has staff/admin UPDATE/DELETE. `storage.objects` on the `products` bucket: staff/admin INSERT/DELETE (migration 007). `carts`/`cart_items`: full own-row ALL for authenticated (`auth.uid() = user_id`, `cart_items` scoped via its owning cart), staff SELECT, no anonymous access (migration 008). Almost everything else (including `orders`/`order_items`) has no write policy at all yet.

**Supabase client pattern — three clients, pick by call site:**

```typescript
// Storefront reads (Server Components, SSG-safe, no cookies):
// src/lib/supabase/queries/products.ts — plain createClient from @supabase/supabase-js

// Admin Server Components / Server Actions (needs the session cookie):
// src/lib/supabase/server.ts — createServerClient from @supabase/ssr, awaits cookies()

// Admin Client Components that read live (e.g. ProductsView's filters):
// src/lib/supabase/client.ts — createBrowserClient from @supabase/ssr, same session cookie
```

---

## Git Workflow

- Branch: `main` (single branch, no feature branches currently)
- No CI/CD configured yet
- Do NOT commit unless the user explicitly asks
- After any sprint: run `npm run build` to verify, check TypeScript (the build's built-in TS check), check ESLint

**Note:** `npx tsc` and `npx eslint` CLI binaries are broken in node_modules (missing internal package.json). The `npm run build` command runs TypeScript internally and is the reliable check.

---

## Next Priority

**Sprint 7.0 (Authentication Foundation) and Sprint 7.1 (User Area) are both complete.** Customer register/login (email+password and Google OAuth), password reset, session-aware Navbar, and the `/account` hub (Profile, Addresses, Orders/Wishlist placeholders) are all real and verified live. Sprint 7.2's schema (`carts`/`cart_items`, ADR-021) is also done and applied. What's left, in rough priority order:

- A dedicated Media Library so a previously-uploaded image can be reused across products, rather than uploaded fresh each time (not yet scheduled to a sprint)
- **Sprint 7.2 — Cart & Session Continuity, application layer**: merge-on-login flow, cart Server Actions, Zustand/UI changes to read from the server cart for authenticated users. Not yet scoped with an implementation plan.
- **Sprint 8 — Payments & Orders**: will wire real data into the existing `/account/orders` placeholder.

Do NOT start Sprint 7.2's application-layer work without explicit user instruction.

---

*Last updated: 2026-07-14*
