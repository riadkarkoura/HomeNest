# HomeNest — Product Roadmap

> **Version:** 0.1.0 · **Date:** 2026-07-11
>
> Sprint history, upcoming work, and long-term vision for the HomeNest platform.
> Read alongside: `PROJECT_VISION.md` · `docs/ARCHITECTURE.md`

---

## Table of Contents

1. [Current Version](#1-current-version)
2. [Sprint History](#2-sprint-history)
3. [Upcoming Sprints](#3-upcoming-sprints)
4. [Long-Term Vision](#4-long-term-vision)
5. [Phase Roadmap](#5-phase-roadmap)

---

## 1. Current Version

**Version:** 0.1.0  
**Status:** Phase 0 — Frontend Foundation complete; Phase 1 (Backend) in progress  
**Date:** 2026-07-16

### What's live

- Full storefront UI: homepage, product listing, product detail pages, cart
- 8 products in the catalogue (Kitchen, Bathroom, Storage categories)
- Supabase database connected for product data (Sprint 3.3)
- Admin Dashboard foundation: sidebar, topbar, overview, all route stubs (Sprint 4)
- Admin Products Management UI: table, search, category/status/featured filters, row actions menu, empty/loading states (Sprint 5)
- Add Product Studio: 8-section product creation form (Basic Info, Pricing, Organization, Media, Product Story, SEO, Product Quality, AI Assistant) with mount animation, disabled AI panel (6 actions) and Publish card (Sprint 5.1)
- **Product Create**, wired to real Supabase writes, RLS-gated, no service-role key (Sprint 6) — requires the one-time manual admin-account step described under Sprint 6 below
- **Minimal admin-only sign-in** at `/admin/login`, protecting `/admin/*` (Sprint 6 — temporary bridge, not full Authentication)
- **Live, paginated, filterable Products list** at `/admin/products` (Sprint 6.1, partial) — real Supabase reads, no static data
- **Product Edit** at `/admin/products/[id]/edit` (Sprint 7.1) — reuses the Add Product Studio entirely
- **Product Delete (soft), Archive/Restore, Duplicate, image upload to Supabase Storage, and real Product Quality scoring** (Sprint 6.1 — now fully complete) — see Sprint History below
- **Customer authentication** — email/password register/login, Google OAuth, password reset, session-aware Navbar, protected `/account/*` (Sprint 7.0; `/checkout`'s gate was later relaxed for guests in Sprint 8.0 — see below)
- **Customer Account hub** at `/account` — Profile, Addresses (full CRUD), Orders (real data) and Wishlist placeholder, designed to scale to Security/Invoices/Home Projects/Service Bookings/Home Documents/Warranty Files without a redesign (Sprint 7.1, Orders wired to real data in Sprint 8.0)
- **Cart & Session Continuity** — Zustand + localStorage cart for guests, automatically merged into a server-persisted `carts`/`cart_items` cart on login and kept continuously synced for authenticated users across devices (Sprint 7.2, ADR-021)
- **Checkout & Orders** — full guest-accessible checkout flow at `/checkout` (shipping/billing address, delivery options, order review), inline sign-in/registration gate before an order is created, real order placement into `orders`/`order_items` with immutable product snapshots (name/SKU/image/variant), order confirmation page, real order history and detail at `/account/orders` (Sprint 8.0, ADR-022) — hardened with a visual step indicator, server-side input validation, and a cart-hydration guard (Sprint 8.1), and with an atomic, race-safe, idempotent order-creation write path (Sprint 8.2, ADR-023)
- Responsive design (mobile-first)
- Framer Motion animations throughout

### What's not yet live

- **Real payment collection** — Stripe integration (`/api/payments/stripe/intent`, `/api/webhooks/stripe`, `CheckoutPayment.tsx`) is fully coded and gracefully degrades, but `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are not yet configured (external dependency, Sprint 8.0 — see `TESTING.md` §5) — orders place successfully today as `pending`/`unpaid`, no charge is actually collected yet
- PayPal, Klarna, Apple Pay, Google Pay (architecture supports adding these behind the existing `src/lib/payments` provider boundary — not built)
- Wishlist data (real save-for-later — today's `/account/wishlist` is a UI-only placeholder)
- Admin-side order management (fulfillment status changes, refunds, staff workflows) — explicitly out of scope for Sprint 8.0
- AI-powered search (Claude API)
- A dedicated Media Library (reusing a previously-uploaded image across products) — each product's images are uploaded fresh today

---

## 2. Sprint History

### Sprint 1 — Frontend Foundation
**Status:** ✅ Complete

- Built full Next.js 16 App Router project structure
- Homepage with Hero, SmartSearch, ShopByProblem, Featured, Craft, Newsletter sections
- Product listing page with filter and sort
- Product detail page with full story layout (Problem → Solution → Benefits → Reviews → Purchase)
- Cart page and CartDrawer
- Login page stub
- Navbar (glassmorphism) and Footer
- Framer Motion animation system (`src/lib/motion.ts`)
- Zustand cart store with localStorage persistence
- Static product data in `src/lib/products.ts`
- TypeScript types for all entities in `src/types/index.ts`

### Sprint 2 — Database & Supabase Setup
**Status:** ✅ Complete

- Supabase project configured
- Full database schema designed (`docs/DATABASE.md`)
- `supabase/seed.sql` created with all 8 products + categories
- `supabase/migrations/` directory with initial migration
- Supabase client architecture: browser, server, middleware clients
- `.env.local` wired with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- RLS policies on all tables

### Sprint 3 — Product Detail Enhancement
**Status:** ✅ Complete

- Enriched product content in `src/lib/product-content.ts`
- Problem, Solution, Benefits, Reviews, Related products sections
- `generateMetadata` for SEO per product page
- `generateStaticParams` for SSG

### Sprint 3.3 — Live Products (Supabase Integration)
**Status:** ✅ Complete

- Created `src/lib/supabase/queries/products.ts` — data access layer
- Plain `createClient` (no cookies) for SSG-safe build-time product fetching
- `getProducts()` — filtered and sorted product listing
- `getProductBySlug()` — wrapped in `React.cache` (deduplicates calls between `generateMetadata` and page function)
- `getFeaturedProducts()` — homepage featured section
- `getAllProductSlugs()` — for `generateStaticParams`
- `mapRow()` — DB row → frontend `Product` type, with image sorting
- Added 16 `product_images` rows to `supabase/seed.sql` (2 per product, Unsplash URLs)
- Updated `src/app/page.tsx`, `src/app/products/page.tsx`, `src/app/products/[slug]/page.tsx`
- Graceful error handling: all query functions return empty arrays/null on error; build never fails
- Static product data (`src/lib/products.ts`) retained as fallback and for Admin Dashboard overview

### Sprint 4 — Admin Dashboard Foundation
**Status:** ✅ Complete

- `src/app/admin/layout.tsx` — thin server wrapper rendering `<AdminShell>`
- `src/components/admin/AdminShell.tsx` — Client Component owning sidebar/topbar state, keyboard and escape handlers, body scroll lock
- `src/components/admin/AdminSidebar.tsx` — responsive sidebar with nav groups, active state, mobile backdrop and close button
- `src/components/admin/AdminTopBar.tsx` — page title resolver, mobile menu button, admin avatar
- `src/app/admin/page.tsx` — overview dashboard with stat cards, recent orders table, top products list
- Stub pages created for all 9 admin routes: products, categories, orders, customers, promotions, media, ai-studio, analytics, settings
- Design System compliant: stone/amber palette only, no blue/green/purple
- Build verified: 17 static pages, TypeScript check passes

### Sprint 5 — Product Management Foundation
**Status:** ✅ Complete

- `src/app/admin/products/page.tsx` — page header, "Add Product" button, renders `ProductsView`
- `src/components/admin/products/ProductsView.tsx` — client orchestrator: search/filter state, simulated loading state, derives filtered list from static `products` data
- `src/components/admin/products/ProductsToolbar.tsx` — search input, category filter, status filter, featured toggle (`DropdownMenu`-based, pill-button style matching the storefront's `ProductsClient.tsx`)
- `src/components/admin/products/ProductsTable.tsx` — responsive table (thumbnail, name, category, price, status pill, featured star, stock, actions), empty state, loading skeleton rows
- `src/components/admin/products/ProductActionsMenu.tsx` — per-row `DropdownMenu` (View / Edit / Duplicate / Archive / Delete) — presentational only, no handlers wired
- `src/components/admin/products/status.ts` — placeholder Active/Draft/Archived classification keyed by product id, standing in for the real `is_active`/`published_at` derivation until Sprint 7 wires it
- `src/app/admin/products/new/page.tsx` — placeholder page ("Add Product" destination), same dashed-border stub pattern as other unbuilt admin routes (replaced by the real Studio in Sprint 5.1)
- No CRUD, no auth, no Supabase mutations — reuses `AdminShell`/`AdminSidebar`/`AdminTopBar` unchanged and the existing `products` static dataset
- Build verified: `npm run build` passes, both new routes prerender as static pages

### Sprint 5.1 — Add Product Studio
**Status:** ✅ Complete

- `src/app/admin/products/new/page.tsx` — replaces the Sprint 5 placeholder; renders `ProductStudio`
- `src/components/admin/products/studio/ProductStudio.tsx` — client orchestrator, owns one local `ProductDraft` state object (no persistence — nothing survives navigation/reload, by design)
- `src/components/admin/products/studio/StudioSection.tsx` / `FormField.tsx` / `TagInput.tsx` — reusable building blocks shared across all content sections (card-with-header scaffold, label+input scaffold, chip-style tag input reused by both Tags and Keywords)
- `src/components/admin/products/studio/types.ts` — `ProductDraft` shape, `STUDIO_CATEGORIES`, `slugify()`
- `src/components/admin/products/studio/sections/` — `BasicInfoSection` (Product Name, auto-generated slug, short description), `PricingSection` (Price, Compare Price, Cost, Featured switch), `OrganizationSection` (Category/Status `Select`, reusing `PRODUCT_STATUSES` from Sprint 5's `status.ts`), `MediaSection` (static image/video dropzone placeholders, non-functional), `ProductStorySection` (Problem/Solution textareas + repeatable Benefits list), `SeoSection` (meta title/description, keywords), `ProductQualitySection` (read-only score strip)
- `sections/AIAssistantPanel.tsx` — amber-tinted "AI Product Assistant / Coming in Sprint 9" card, six disabled buttons (Import from AliExpress, Generate Product Story, Generate SEO, Generate FAQs, Generate TikTok Content, Generate Product Images) in a 2-column tile grid
- `sections/PublishCard.tsx` — three disabled buttons in order: Draft, Schedule, Publish
- `sections/ProductQualitySection.tsx` — full-width strip above the two-column layout, five read-only `ScoreCard` tiles (Title, Description, SEO, Images, Overall). Placeholder-only ("Not yet scored") — no scoring logic, per explicit "no calculations yet" instruction; reuses the Overview dashboard's stat-card visual pattern rather than inventing a new one
- `studio/ScoreCard.tsx` — reusable placeholder score tile, used 5× by `ProductQualitySection`
- `studio/CharacterCounter.tsx` — reusable live counter with color state (stone → amber-600 near limit → destructive at limit), extracted from SEO's inline hint text so it's a real shared component
- New shared primitives added to `src/components/ui/`: `select.tsx`, `switch.tsx`, `textarea.tsx` — wrap the `@base-ui/react` `select`/`switch` primitives already installed (ADR-003 pattern), reusable by future admin forms, not one-offs for this page
- Two-column layout (`lg:grid-cols-3`): main column follows the authoring flow (Basic Info → Pricing → Product Story → SEO); sidebar holds Publish, Organization, Media, and the AI panel; Product Quality spans full width above both
- Mount-time entrance animation added — `stagger`/`fadeUp` from `src/lib/motion.ts` (no new easing curves), the first use of Framer Motion anywhere in `/admin`
- `ProductStudio` accepts an optional `initialDraft?: Partial<ProductDraft>` prop (unused today, defaults to nothing) so the future Edit Product page can reuse the entire component tree pre-filled instead of duplicating it
- All inputs are locally interactive (typing, toggling, tagging) — no persistence. All Draft/Schedule/Publish/AI/upload actions are disabled
- No CRUD, no auth, no Supabase mutations, no AI wiring — reuses `AdminShell` unchanged
- Build verified: `npm run build` passes (TypeScript + ESLint clean), `/admin/products/new` prerenders as a static page

### Sprint 6 — Product Create (CRUD) + minimal admin auth bridge
**Status:** ✅ Complete (code) — ⚠️ requires one manual step before it's usable

Sprints 6 and 7 were swapped from the original plan at explicit user instruction: Product Create shipped before full Authentication. Three approval rounds shaped the final architecture — see `docs/DECISIONS.md` ADR-013/014/015 for the full reasoning.

- **No service-role key anywhere.** `SUPABASE_SERVICE_ROLE_KEY` is not used by the app. The Create Server Action uses the same cookie-based `@supabase/ssr` client (`src/lib/supabase/server.ts`) as everything else.
- **Migration `20260712000001_product_create_write_access.sql`** — adds `products.benefits jsonb` and `seo_metadata.keywords text[]` (columns the Sprint 5.1 Studio UI already collected but had nowhere to persist), plus three RLS policies: `products_staff_insert`, `products_staff_delete`, `seo_metadata_staff_insert` — all `get_my_role() IN ('staff','admin')`. Applied to the linked Supabase project.
- **Minimal admin-only auth bridge** (temporary — not the full Authentication sprint): `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`; protects `/admin/:path*`, optimistic session check only), `src/lib/auth/dal.ts` (`verifyAdminSession`, the reusable seam for future auth work), `src/app/admin/login/{page.tsx,actions.ts}` (email/password sign-in only — no OAuth, no register, no password reset; non-admin accounts are signed out immediately on login attempt). The existing storefront `/login` page (Google OAuth, register toggle) was deliberately left untouched for the real Sprint 7 to wire up.
- **`src/app/admin/products/new/actions.ts`** — `createProduct` Server Action: Zod `safeParse` (not `parse`, so field errors return cleanly to the UI), `verifyAdminSession()`, category name → `category_id` lookup, maps the Studio's Draft/Active/Archived status to `is_active`/`published_at`, inserts `products` then conditionally `seo_metadata`. **No RPC/transaction** (explicit instruction — keep it simple, revisit with a `SECURITY INVOKER` Postgres function only if a future sprint needs true multi-table atomicity, e.g. AI import or bulk import). If the `seo_metadata` insert fails after `products` succeeded, the action compensates with a `DELETE` on the just-created product row.
- `FormField.tsx` gained an `error?: string` prop; `PublishCard`'s Draft/Publish buttons are now live (Schedule remains disabled, unchanged).

**⚠️ Manual step required before this works end-to-end:** no admin account exists yet.
1. Supabase Dashboard → Authentication → Users → Add User (email + password).
2. In the SQL editor, run: `UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';` (the `handle_new_user()` trigger already created the `profiles` row with `role='user'`).
3. Sign in at `/admin/login`.

Until step 1–2 are done, every sign-in attempt at `/admin/login` will correctly fail — that's RLS and the auth bridge working as designed, not a bug.

### Sprint 6.1 (partial) — Live Products list
**Status:** ✅ Complete — list/read only; delete, image upload, and quality scoring shipped afterward (see Sprint 6.1 remaining, below)

- `src/lib/supabase/queries/admin-products.ts` (new) — `getAdminProducts()` (paginated, filtered, sorted, RLS-gated via `products_staff_select_all`, browser client) and `getAdminCategories()`
- `src/components/admin/products/status.ts` — `getProductStatus()` now derives Active/Draft/Archived from real `is_active`/`published_at`, replacing the hardcoded id-keyed placeholder map from Sprint 5
- `src/components/admin/products/ProductsView.tsx` rewritten for live, debounced, filter-triggered fetching with real database pagination (`ProductsPagination.tsx`, new)
- `src/types/index.ts` — `Product` gained optional `isActive`/`publishedAt` fields, backward compatible with the static catalogue (`src/lib/products.ts`, still used by the Admin Overview page) and the storefront query module
- `src/app/admin/products/page.tsx` — dropped the static `products` import/prop

### Sprint 7.1 — Edit Product
**Status:** ✅ Complete

Shipped ahead of Sprint 7 (Full Authentication) — same kind of out-of-order numbering as the Sprint 6/7 swap documented above; the label reflects when the work happened, not a fixed plan.

- `/admin/products/[id]/edit` (new dynamic route) — reuses `ProductStudio` entirely via the `initialDraft` prop built for this exact purpose in Sprint 5.1, plus a new `action` prop (defaults to `createProduct`) so the same component tree submits to either Create or Edit with no UI duplication
- `src/lib/supabase/queries/admin-product.ts` (new, singular — deliberately separate from the browser-client `admin-products.ts`, so a `"use client"` import of that module never risks pulling `next/headers` into a browser bundle) — `getAdminProductForEdit()` fetches the product plus its `seo_metadata` row and maps both to `Partial<ProductDraft>`, reusing `getProductStatus()` rather than a third copy of status derivation
- `src/app/admin/products/[id]/edit/actions.ts` (new) — `updateProduct(id, prevState, draft)`, wired via `updateProduct.bind(null, id)` so it matches the `(prevState, draft)` shape `useActionState` expects from `ProductStudio`; `.update()` on `products`, `.upsert()` on `seo_metadata` (its `UNIQUE(entity_type, entity_id)` constraint makes upsert the natural fit for "may or may not already have SEO content")
- `src/components/admin/products/studio/validation.ts` (new) — `ProductDraftSchema`, `statusToColumns`, `zodErrorsToFieldErrors` extracted out of `new/actions.ts` so Create and Edit validate identically instead of via two hand-kept-in-sync copies; `new/actions.ts` is behaviorally unchanged, only its schema's *location* moved
- Migration `20260712000002_product_edit_write_access.sql` — `products_staff_update` and `seo_metadata_staff_update` RLS policies, same `get_my_role() IN ('staff','admin')` pattern as ADR-013. Neither existed before this sprint — editing was blocked at the database regardless of application code (see ADR-016)
- `ProductActionsMenu`'s Edit item now links to the new route; View/Duplicate/Archive/Delete shipped next (Sprint 6.1 remaining, below)
- No rollback-on-partial-failure for the `seo_metadata` write, unlike Create's compensating delete — the product row already existed before the edit started, so there's no equivalent "delete what didn't exist a moment ago." A failed SEO write returns an honest partial-success message instead (see ADR-016)

### Sprint 6.1 (remaining) — Delete, images, scoring
**Status:** ✅ Complete — Sprint 6.1 is now fully done

- **Delete** — soft delete (`deleted_at`), reusing the existing `products_staff_update` RLS policy rather than a new general-purpose hard-DELETE grant (DATABASE.md §1 mandates soft deletes for products). `src/app/admin/products/actions.ts` (new) — `deleteProduct`, plus `archiveProduct`/`restoreProduct` (both reuse `statusToColumns`) and `duplicateProduct` (reuses `products_staff_insert`). `ProductActionsMenu` now shows Archive or Restore depending on the row's current status, and every item is wired: View (opens the storefront page), Edit, Duplicate (navigates to Edit on the new product), Archive/Restore, Delete (with a confirm step)
- **Image upload** — real upload replaces the static Media dropzone. `src/app/admin/products/media-actions.ts` (new) — `uploadProductImage` writes to the `products` Storage bucket, then a `media` row. `src/components/admin/products/studio/images.ts` (new) — `syncProductImages`, called from both `createProduct` and `updateProduct`, replaces a product's entire `product_images` set on every save rather than diffing. Migration `20260712000003_product_images_write_access.sql` creates the `products` bucket and adds the `storage.objects`/`media`/`product_images` staff policies that didn't exist before (see ADR-018). `ProductDraft` gained an `images` field; `next.config.ts` now whitelists the Supabase Storage hostname for `next/image`
- **Product Quality scoring** — `src/components/admin/products/studio/scoring.ts` (new) — `computeProductQualityScores()`, deterministic field-completeness heuristics (not AI), covering Title/Description/SEO/Images/Overall. `ScoreCard` now renders a real 0–100 score in stone/amber only, no green/red
- See ADR-018 for the full reasoning behind reusing existing RLS for Delete/Archive/Restore/Duplicate vs. the new policies image upload required

### Sprint 7.0 — Authentication Foundation
**Status:** ✅ Complete

The originally-planned single "Sprint 7 — Full Authentication" was split into 7.0/7.1/7.2 per explicit user instruction — see ADR-020. Real customer authentication, on top of the Sprint 6 admin-only bridge, with no account-facing UI yet (that's Sprint 7.1 below).

- Email/password registration and login — `src/app/login/actions.ts` (`signup`, `login`), wired to the existing `/login` page's register/login toggle
- Google OAuth sign-in (`supabase.auth.signInWithOAuth`) + a shared `src/app/auth/callback/route.ts` code-exchange Route Handler, also reused by password recovery via a `next` query param
- Password reset flow — `/forgot-password` (request) → `/auth/reset-password` (set new password under the recovery session)
- Customer session helpers `verifySession`/`getUser` added to `src/lib/auth/dal.ts`, generalized from the existing admin-only `verifyAdminSession`/`getAdminUser` pair
- Session-aware Navbar — account dropdown (email + Sign out) when logged in, live via `supabase.auth.onAuthStateChange`, plain link to `/login` when logged out
- `src/proxy.ts` extended to gate `/checkout` and `/account/*` for customer sessions (same optimistic, session-only check as the existing `/admin/*` gate)
- No new RLS/migrations needed — `profiles`/`addresses` policies already existed
- A real bug (Suspense + `useSearchParams()` breaking all click interactivity on `/login`) was found and fixed during implementation by removing the `next`-redirect-back enhancement that required it — see `TESTING.md`

### Sprint 7.1 — User Area
**Status:** ✅ Complete

Customer-facing account UI behind Sprint 7.0's protection. (Not to be confused with the earlier "Sprint 7.1 — Edit Product" above — see ADR-020.) Designed as a future-ready customer hub per explicit user instruction: the nav config already anticipates Security, Invoices, Home Projects, Service Bookings, Home Documents, and Warranty Files as "coming soon" categories, so shipping any of them later is a config flip plus a page, not a redesign.

- `src/app/account/layout.tsx` — Server Component, `verifySession()` + `<AccountShell>` wrapper (ADR-009 Server/Client split pattern)
- `src/components/account/nav-items.ts` — typed, grouped nav config (`AccountNavItem[]` with `status: "active" | "comingSoon"`) — the single source of truth `AccountShell`'s pill nav and `ComingSoonGrid` both read from
- `src/components/account/AccountShell.tsx` + `ComingSoonGrid.tsx` — storefront-styled shell (pill-tab nav matching the existing filter-tab pattern, warm stone/amber palette, no admin `stone-900` chrome) and the six-tile "More from HomeNest, coming soon" teaser
- `src/app/account/page.tsx` + `ProfileForm.tsx` + `actions.ts` (`updateProfile`) — view/edit name, first/last name, phone, marketing opt-in against the caller's own `profiles` row
- `src/app/account/addresses/{page.tsx,actions.ts}` + `AddressesView`/`AddressCard`/`AddressForm` — full CRUD (create/edit/delete/set-default) against `addresses`, using a `Sheet` for the add/edit form; set-default unsets the prior default of that type first (two plain updates, no transaction, same posture as ADR-015/016)
- `src/app/account/orders/page.tsx` and `.../wishlist/page.tsx` — UI-only placeholders (no data operations), matching the dashed-border stub pattern from Sprint 4/5
- `src/lib/supabase/queries/account.ts` — `getProfile()` (wrapped in `React.cache`, same rationale as ADR-008) and `getAddresses()`
- No new RLS/migrations needed — `profiles` (own-row SELECT/UPDATE) and `addresses` (own-row ALL) policies already existed
- A real bug (Base UI's `DropdownMenuLabel` requiring a `<DropdownMenuGroup>` wrapper, unlike Radix — crashed the Navbar's account dropdown the first time it was actually opened with a live session) was found and fixed in `src/components/layout/Navbar.tsx` during this sprint's verification, even though the dropdown itself was Sprint 7.0 code — it had never been click-tested with a real session until this sprint's permanent test account existed

**Post-sprint UX integration (2026-07-14):** the Navbar's account dropdown and mobile panel were wired up with My Account / Addresses / Orders / Wishlist links (previously only email + Sign out) — navigation-only, no logic changes.

### Sprint 7.2 — Cart & Session Continuity
**Status:** ✅ Complete

**Phase 1 — schema (2026-07-14, ADR-021):** `carts` + `cart_items` — normalized tables mirroring `orders`/`order_items`, server-persisted for authenticated users only (guests remain client-only), no price/name snapshot (cart reflects live product data), `cart_items.source` prepared for future `'ai'`/`'partner'` attribution alongside today's `'web'`. Migration `20260714000001_cart_schema.sql` applied to the linked project.

**Phase 2 — application layer (2026-07-14):** guest carts now merge into the server on login and stay continuously synced for authenticated users, with zero changes to `CartDrawer` or the `/cart` page.

- `src/lib/supabase/queries/products.ts` — exported `mapRow`/`ProductRow`/`PRODUCT_FIELDS` so the cart query module reuses the exact same product-row mapping instead of duplicating it
- `src/lib/supabase/queries/cart.ts` — `getOrCreateActiveCart()` (partial-unique-safe, retries on a create race), `getActiveCartItems()` (joins `cart_items` → `products`, maps to `CartItem[]`)
- `src/app/cart/actions.ts` — `syncAddItem`/`syncUpdateQuantity`/`syncRemoveItem`/`syncClearCart` (all `auth.uid()`-scoped via `getUser()`, atomic single-row updates, no transaction — same posture as ADR-015/016/021), `mergeGuestCart()` (one-time local→server fold on first login), `fetchServerCart()` (plain hydrate for repeat loads)
- `src/lib/store.ts` — internal-only changes: a `userId` field (excluded from the persisted `localStorage` blob via `partialize`, since a stale value could make a fresh browser think it's still signed in as whoever used it last) and a `setUserId()` that merges once per account per device (guarded by a `homenest-cart-merged-user` `localStorage` flag), hydrates on repeat loads instead of re-merging, and clears the cart on sign-out so a shared device never leaks one account's cart to the next. `addItem`/`removeItem`/`updateQuantity`/`clearCart` each also fire the matching Server Action when authenticated — the public API is unchanged, so every existing caller needed no edits
- `src/components/layout/Navbar.tsx` — three lines added to the *existing* auth-state effect to call `setUserId`; no new effect
- Verified live: guest add-to-cart unaffected, merge-on-login confirmed, repeat-load hydration confirmed non-duplicating, full `localStorage` wipe-and-restore from the server confirmed (proves true server persistence, not just an optimistic cache), `clearCart` sync confirmed, sign-out cleanup confirmed

### Sprint 8.0 — Checkout Architecture Review & Implementation
**Status:** ✅ Complete (Milestone 2: First Sale)

An architecture review was produced first (no code) per explicit instruction, approved with refinements, then implemented:

- **Schema (migration `20260715000001_checkout_write_access.sql`, ADR-022):** `products.sku` (nullable `UNIQUE`, backfilled once from slug — an independent business identifier that a later slug rename never regenerates), `orders.shipping_method`, `carts.converted_order_id` (closes the traceability gap ADR-021 flagged), and the **first-ever write policies** on `orders`/`order_items` (`orders_own_insert`/`order_items_own_insert`, `auth.uid()`-owned-row, no service-role key) — both tables existed since the initial schema with SELECT-only RLS.
- **Stripe payment RPC functions (migration `20260715000002_stripe_payment_functions.sql`):** `record_stripe_payment_intent()` and `apply_stripe_payment_result()`, both `SECURITY DEFINER`, cover the one part of checkout with no end-user session to attach RLS to (Stripe's webhook) without a service-role key — the webhook's HMAC signature check is the real authorization boundary, mirrored in the ADR-022 addendum.
- **Guest-can-browse, must-identify-to-order:** `src/proxy.ts`'s `/checkout` gate was relaxed so guests reach the full flow; `createOrder()` still requires a session (`getUser()`), and identification happens inline on the checkout page itself (`src/components/checkout/CheckoutIdentify.tsx`, new `checkoutSignIn`/`checkoutSignUp` actions that return a result instead of redirecting) — not via a `next=`-redirect-back to `/login`, which already broke click interactivity once in Sprint 7.0.
- **Checkout UI:** `src/app/checkout/page.tsx` + `CheckoutClient.tsx` (shipping/billing address via a reused `AddressForm`, static delivery options from `src/lib/checkout/shipping-options.ts`, order review), `src/app/checkout/actions.ts`'s `createOrder()` (re-fetches live prices/stock, never trusts client-submitted totals, builds immutable `order_items.product_snapshot` — name/SKU/image/variant — from the user's server-side cart, converts the cart via `converted_order_id`).
- **Payment:** `src/lib/payments/` — a provider-agnostic `createPaymentIntent()` boundary with Stripe as the only concrete implementation today (PayPal/Klarna/Apple Pay/Google Pay can be added behind the same boundary later without touching checkout code), `/api/payments/stripe/intent` and `/api/webhooks/stripe` Route Handlers, `CheckoutPayment.tsx` (renders Stripe's Payment Element when configured, otherwise a graceful "Stripe is not configured yet" fallback — order creation and payment are decoupled, so an order always exists as `pending`/`unpaid` regardless).
- **Order confirmation and real order history:** `/order-confirmation/[orderNumber]`, `/account/orders` (real data, replacing the Sprint 7.1 placeholder) and `/account/orders/[orderNumber]`, sharing one `OrderSummary` component.
- `src/lib/store.ts`'s `setUserId()` now returns a promise (additive — existing callers like Navbar ignore it) so checkout can await the guest→account cart merge before enabling "Place Order".
- Verified live end-to-end: guest reaches `/checkout`, identifies inline (cart merges correctly, confirmed via existing account cart contents), places a real order with correct SKU/name/image snapshots, cart clears, order appears at `/account/orders` and its detail page, payment step degrades gracefully with no Stripe keys configured, RLS confirmed blocking anonymous inserts into `orders`.
- **Explicitly out of scope:** admin-side order management (fulfillment, refunds, staff workflows), tax calculation (hardcoded to 0, flagged not silently assumed permanent), coupon redemption UI (tables already exist, not wired this sprint), real payment collection (blocked on Stripe keys, external dependency — see `TESTING.md` §5).

### Sprint 8.1 — Checkout UI & Flow Hardening
**Status:** ✅ Complete

A planning-first pass (no code until approved) that hardens the UI/UX of the checkout flow Sprint 8.0 shipped — no new commerce capability, no payment activation. **Naming note:** this reuses the number the Sprint 8.0 closing report had provisionally proposed for "Payment Activation & Order Notifications" — that placeholder was never approved as fixed, so it's renumbered to Sprint 8.2 below, consistent with how this project has handled sprint-number reuse before (ADR-020).

- **Visual step indicator:** `src/components/checkout/CheckoutSteps.tsx` — Shipping/Billing/Delivery/Review completion state, computed from existing form state. Guidance only, no navigation/routing/back-button complexity introduced, per explicit instruction.
- **Hydration guard, local to `CheckoutClient` only:** `useCartStore.persist.hasHydrated()`/`onFinishHydration()` (Zustand's built-in persist API — `src/lib/store.ts` itself is untouched, no change to `useCartStore`'s public contract) gate a new `CheckoutSkeleton.tsx`, so a returning customer's cart never briefly appears empty before `localStorage` rehydrates — the same root cause as the pre-existing Navbar cart-badge hydration mismatch, fixed here for checkout specifically.
- **Server-side validation:** `createOrder()` now Zod-parses its input before doing anything else. `shippingMethodId`'s enum is derived from `SHIPPING_OPTIONS.map(o => o.id)` at runtime — not a hand-typed literal — so the schema can't drift from `src/lib/checkout/shipping-options.ts`.
- **Per-section inline hints:** Shipping/Billing sections show their own "select or add an address" message when incomplete, replacing the single generic message that previously sat only near the Place Order button.
- **Loading polish:** `CheckoutPayment.tsx`'s bare loading text replaced with a skeleton matching this app's existing `animate-pulse` convention (`ProductsTable.tsx`'s `SkeletonRow`); `CheckoutIdentify.tsx`'s sign-in/register toggle disabled while a submission is pending.
- Verified live: step indicator accuracy at multiple states, per-section hints appear/clear correctly, a full order placed successfully post-Zod-validation with no regression, mobile pass at 375×812 (step indicator wraps cleanly, no horizontal overflow).

### Sprint 8.2 — Order Engine Hardening (Atomicity & Concurrency)
**Status:** ✅ Complete

A planning-first pass hardening the order-creation write path itself — no new UI, no payment activation. **Naming note:** reuses the number the Sprint 8.1 entry above had provisionally reserved for "Payment Activation & Order Notifications"; that placeholder was never approved as fixed, so it's renumbered to Sprint 8.3 below.

- **Atomic write** (migration `20260716000001_order_engine_atomic.sql`, ADR-023): `create_order_atomic(...)` replaces `createOrder()`'s three sequential calls (insert `orders`, insert `order_items`, update `carts`) with one Postgres function running inside a single implicit transaction — a mid-sequence failure can no longer leave a real order row with zero line items ("ghost order").
- **Concurrency:** the function's first statement, `SELECT ... FOR UPDATE` on the target cart row, is what actually prevents a race — if two checkout requests for the same customer arrive nearly simultaneously, the second blocks on that lock until the first's transaction commits, then sees the cart already converted and returns the existing order instead of racing to insert a duplicate. Standard Postgres row-locking semantics, not a custom mutex.
- **Idempotency:** reuses `carts.converted_order_id` (already added in Sprint 8.0) rather than a new column or client-generated token — a resubmission against an already-converted cart returns the existing order.
- **Security:** `SECURITY INVOKER` (confirmed via `prosecdef = false` post-deploy), unlike the Sprint 8.0 webhook functions' `SECURITY DEFINER` — the caller here is the authenticated customer's own session, so RLS on `carts`/`orders`/`order_items` applies to every statement inside the function exactly as it would to separate calls.
- All business logic (validation, pricing, snapshot-building) stays in TypeScript, per explicit instruction — the function's body is limited to the final write.
- `createOrder()`'s public contract is unchanged — no component, Server Action signature, or DAL query needed to change.
- Verified live: a normal order placed successfully through the new path (`HN-20260716-0009`), reading back correctly at `/account/orders`. A live two-concurrent-request test against the shared linked database was deliberately not performed (would require writing fabricated test orders into real project data outside the application layer); the concurrency guarantee rests on Postgres's standard `SELECT ... FOR UPDATE` semantics plus code review, not an empirical race reproduction.

#### Patch 8.2.1 — `cart_items` NULL-variant race (2026-07-16)
**Status:** ✅ Complete (small patch, not a sprint)

A pre-Sprint-8.3 architecture audit of the whole Commerce Layer found that `UNIQUE (cart_id, product_id, variant_id)` never fires when `variant_id IS NULL` — silently permitting duplicate cart line items for the same non-variant product (100% of today's catalogue) under concurrent "add to cart" requests. Fixed with one additive, partial unique index (`cart_items_cart_product_no_variant_key`, migration `20260716000002_cart_items_null_variant_unique.sql`) — no application code changes, no architecture change, fully isolated to `cart_items`. Checked live first for pre-existing duplicates (none found); verified post-deploy that a duplicate insert is now correctly rejected. See ADR-021 addendum.

#### Patch 8.2.2 — Navbar cart-badge hydration mismatch (2026-07-16)
**Status:** ✅ Complete (small patch, not a sprint)

The Navbar cart badge read `useCartStore`'s `totalItems()` with no hydration guard — `useCartStore.persist` (Zustand's `persist` middleware) can't read `localStorage` during SSR, so the server-rendered HTML always showed `Cart, 0 items`; once the client rehydrated from `localStorage` a moment after React's hydration pass, it silently updated to the real count, producing a mismatch (e.g. "Cart, 0 items" vs. "Cart, 3 items"). Long-observed across earlier sprints but never formally fixed. Fixed with a local hydration guard in `src/components/layout/Navbar.tsx` — same pattern as `CheckoutClient`'s Sprint 8.1 guard, scoped entirely to Navbar, no changes to `useCartStore`'s public API, no changes to checkout. **A first attempt using the same lazy-`useState`-initializer form `CheckoutClient` uses broke `next build`** (`Cannot read properties of undefined (reading 'hasHydrated')` on `/cart` and `/account/addresses`'s static-prerender pass — `useCartStore.persist` isn't available in that build-time worker context, unlike a real request-time SSR pass) — fixed by initializing to a plain `false` literal and deferring every `useCartStore.persist` read into `useEffect`, which never runs during server/build-time rendering. Verified live: no hydration warning on a hard reload with items in the cart, badge settles to the correct count, `npm run build` passes including the two previously-crashing pages.

### Sprint 8.3 — Stripe Payment Architecture Planning
**Status:** ✅ Complete

Payment architecture only, per explicit scope — order confirmation email, tax, and coupon redemption moved to Sprint 8.4 below (this sprint's placeholder had bundled them; the actual request was narrower).

- **Stripe Payment Element ratified over Stripe Checkout** (ADR-024) — the choice already implemented in Sprint 8.0, not a new build; keeps the customer on `/checkout` throughout rather than redirecting to a Stripe-hosted page.
- **Card-only PaymentIntents:** `payment_method_types: ["card"]` replaces `automatic_payment_methods: { enabled: true }` in `src/lib/payments/stripe.ts` — avoids silently expanding into redirect-based methods (e.g. iDEAL) the checkout flow has no return-handling for yet; deliberately keeps this sprint scoped to successful card payments.
- **Webhook ordering guard** (migration `20260716000003_stripe_webhook_ordering_guard.sql`): `apply_stripe_payment_result()` now refuses to move `payment_status` away from `'paid'` — Stripe doesn't guarantee webhook delivery order and can redeliver events; without this, a stale `payment_intent.payment_failed` arriving after `succeeded` for the same intent could have downgraded an already-paid order.
- **PaymentIntent reuse** (`/api/payments/stripe/intent/route.ts`): checks `orders.stripe_payment_intent_id` first and reuses the existing intent's `client_secret` if still payable, instead of creating an orphaned second PaymentIntent every time the route is called for the same order.
- **Webhook failures now return a non-2xx status** instead of a false-positive `200` when `apply_stripe_payment_result()` errors — this is what makes Stripe's own retry/backoff mechanism actually usable.
- **Failed-payment path documented, not implemented** (`TESTING.md` §6, ADR-024 addendum) — declined card and both retry paths are implemented; abandoned checkout, explicit cancellation, and client-side timeout are explicitly deferred (no `payment_intent.canceled` subscription yet, no cleanup job, no client-side confirmation timeout).
- `createOrder()`, `create_order_atomic()`, `CheckoutClient.tsx`, and the provider-agnostic payment boundary are all unchanged — every fix landed inside the existing Stripe-specific modules or one existing function's body.
- Verified: production build clean; end-to-end live-charge verification remains blocked on Stripe test-mode keys not being configured in this environment (external dependency, same category as Sprint 7.0's Google OAuth).

## 3. Upcoming Sprints

**Note:** The originally-planned single "Sprint 7 — Full Authentication" was split into three sequentially-numbered sprints per explicit user instruction (2026-07-13) — see ADR-020. Sprints 7.0, 7.1, and 7.2 are all complete (see Sprint History above). Number 7.1 was intentionally reused: it also names the already-shipped Product Edit sprint above (2026-07-12); dates disambiguate which "Sprint 7.1" is meant. Sprint 7.2 (Cart & Session Continuity) similarly reused a number already associated with the still-pending bulk-actions proposal from ADR-019 — see ADR-020's Consequence section. Sprint 8.0 (Checkout), Sprint 8.1 (Checkout UI & Flow Hardening), Sprint 8.2 (Order Engine Hardening), and Sprint 8.3 (Stripe Payment Architecture) are all complete (see Sprint History above); the original single "Sprint 8 — Payments & Orders" sketch's remaining, unscoped pieces move to Sprint 8.4 below.

### Sprint 8.4 — Payment Activation & Order Notifications (proposed, not scoped)
**Goal:** Configure real Stripe keys and verify a live charge; add the remaining commerce pieces Sprint 8.3 deliberately didn't cover

**Tasks:**
- [ ] Configure `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (external, `TESTING.md` §5)
- [ ] Verify a real test-mode charge end-to-end (`payment_status` unpaid → paid via webhook), including the Sprint 8.3 fixes (intent reuse, ordering guard, retry behavior)
- [ ] Order confirmation email via Resend
- [ ] Tax calculation (currently hardcoded to 0)
- [ ] Coupon redemption UI at checkout (tables already exist)
- [ ] Consider: `payment_intent.canceled` webhook subscription and/or a stale-order cleanup job (Sprint 8.3's deferred failed-payment items, `TESTING.md` §6)

### Backlog — Operational Cleanup (not scheduled, not correctness-critical)

- [ ] **PaymentIntent orphan cleanup** (Patch 8.3.2 — PaymentIntent concurrency guard, ADR-024
      addendum) — when a request loses the PaymentIntent-creation race, its own PaymentIntent is real but never referenced by any order, and is left alone rather than canceled (see the comment in `src/app/api/payments/stripe/intent/route.ts`). These orphans are inert (unconfirmed, never charged) and Stripe expires them on its own, so this is purely a Stripe-dashboard-tidiness concern, not a data-integrity one. A future pass could call `stripe.paymentIntents.cancel()` on the loser before returning, or run a periodic sweep for old `requires_payment_method` intents with no matching `orders.stripe_payment_intent_id`. **Explicitly not part of the correctness path** — the race itself is already fully fixed at the database layer; this is cosmetic follow-up only, and must not be bundled into a future correctness fix.

### Sprint 9 — AI Search
**Goal:** Natural language product discovery powered by Claude

**Tasks:**
- [ ] `POST /api/search` Route Handler
- [ ] Claude API integration (claude-haiku-4-5-20251001 for search)
- [ ] Upstash Redis cache for search results
- [ ] SmartSearchSection wired to live API
- [ ] Search log recording to `search_logs` table
- [ ] AI Studio search quality section
- [ ] Wire the Sprint 5.1 `AIAssistantPanel` (`/admin/products/new`) — Import from AliExpress, Generate Product Story, Generate SEO, Generate FAQs, Generate TikTok Content, Generate Product Images, currently disabled placeholders

---

## 4. Long-Term Vision

HomeNest's mission is to become one of the best Smart Home Solutions ecommerce experiences on the web. Every product must solve a real household problem. The UI must guide visitors through: Problem → Solution → Benefits → Reviews → Purchase.

**Inspired by:** Apple simplicity, IKEA usability, modern ecommerce craft.

**Target customers:** Families, parents, busy professionals, home organisation enthusiasts.

**Long-term goals:**
- AI-powered product discovery that understands the problem, not just the keyword
- Personalised recommendations per authenticated user
- Multi-currency, multi-language global store
- TikTok/Instagram social proof integration
- Marketplace expansion (third-party vendors) in Phase 4

---

## 5. Phase Roadmap

| Phase | Focus | Status |
|---|---|---|
| **Phase 0** | Frontend Foundation | ✅ Complete |
| **Phase 1** | Backend Foundation (Auth + CRUD + Payments) | 🔄 In progress |
| **Phase 2** | AI & Personalisation (Claude search, pgvector, recommendations) | ⏳ Planned |
| **Phase 3** | Global Scale (multi-currency, multi-language, R2 CDN) | ⏳ Planned |
| **Phase 4** | Marketplace (vendor dashboard, Stripe Connect, commission) | ⏳ Planned |

---

*Last updated: 2026-07-14*  
*Maintained by: Lead Product Engineer*
