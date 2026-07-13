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
**Date:** 2026-07-13

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
- Zustand cart with localStorage persistence
- Responsive design (mobile-first)
- Framer Motion animations throughout

### What's not yet live

- Full Authentication (customer accounts, OAuth, register, password reset) — the storefront `/login` page is still a UI stub
- Payments (Stripe, PayPal)
- Orders system
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

## 3. Upcoming Sprints

**Note:** The originally-planned single "Sprint 7 — Full Authentication" was split into three sequentially-numbered sprints per explicit user instruction (2026-07-13) — see ADR-020. Number 7.1 is intentionally reused: it also names the already-shipped Product Edit sprint below (2026-07-12); dates disambiguate which "Sprint 7.1" is meant. Sprint 7.2 (Cart & Session Continuity) similarly reuses a number already associated with the still-pending bulk-actions proposal from ADR-019 — see ADR-020's Consequence section.

### Sprint 7.0 — Authentication Foundation
**Goal:** Real customer authentication and session-aware app shell, on top of the Sprint 6 admin-only bridge. No account-facing UI yet — that's Sprint 7.1.

**Tasks:**
- [ ] Email/password registration (Server Action, `supabase.auth.signUp`)
- [ ] Email/password login (Server Action, `supabase.auth.signInWithPassword`)
- [ ] Wire the existing storefront `/login` page's Google OAuth button to `supabase.auth.signInWithOAuth`
- [ ] `/auth/callback` route for OAuth redirect
- [ ] Session management — generalize `src/lib/auth/dal.ts`'s `verifyAdminSession`/`getAdminUser` pattern for customer sessions
- [ ] Session-aware Navbar (show avatar + account menu when logged in)
- [ ] Extend `src/proxy.ts` (not a new file — see ADR-014) to also gate `/checkout` and `/account/*` for customer sessions
- [ ] Password reset flow

**Explicitly excluded from this sprint:** account dashboard, orders, wishlist, cart merge — see Sprint 7.1 and 7.2.

**Constraint:** No breaking changes to storefront. Auth must be additive. Extend `src/lib/auth/dal.ts` and `src/lib/supabase/{client,server,middleware}.ts` rather than duplicating them.

### Sprint 7.1 — User Area
**Goal:** Customer-facing account UI, behind the protection Sprint 7.0 wires up. (Not to be confused with the already-shipped "Sprint 7.1 — Edit Product" below — see ADR-020.)

**Tasks:**
- [ ] Profile page (`/account`) — read/update own `profiles` row
- [ ] Addresses (`/account/addresses`) — full CRUD against `addresses`
- [ ] Account dashboard shell/nav
- [ ] Orders placeholder (`/account/orders`) — UI only, no `orders` table writes yet (Sprint 8)
- [ ] Wishlist placeholder (`/account/wishlist`) — UI only

### Sprint 7.2 — Cart & Session Continuity
**Goal:** Scope to be defined later. Expected to cover cart merge on login (localStorage → server) and related session-continuity concerns.

**Note:** No `cart`/`cart_items` table exists yet in `docs/DATABASE.md` — this sprint likely needs its own schema decision before implementation, not just application code.

### Sprint 8 — Payments & Orders
**Goal:** End-to-end checkout with Stripe

**Tasks:**
- [ ] Checkout page
- [ ] Stripe Elements integration
- [ ] `POST /api/payments/stripe/intent` — PaymentIntent creation
- [ ] `POST /api/webhooks/stripe` — payment confirmation + order status update
- [ ] Orders table and order detail page
- [ ] Order confirmation email via Resend
- [ ] Customer order history at `/account/orders`

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

*Last updated: 2026-07-13*  
*Maintained by: Lead Product Engineer*
