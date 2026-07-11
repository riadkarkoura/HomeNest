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
**Date:** 2026-07-12

### What's live

- Full storefront UI: homepage, product listing, product detail pages, cart
- 8 products in the catalogue (Kitchen, Bathroom, Storage categories)
- Supabase database connected for product data (Sprint 3.3)
- Admin Dashboard foundation: sidebar, topbar, overview, all route stubs (Sprint 4)
- Admin Products Management UI: table, search, category/status/featured filters, row actions menu, empty/loading states (Sprint 5)
- Add Product Studio: 8-section product creation form (Basic Info, Pricing, Organization, Media, Product Story, SEO, Product Quality, AI Assistant) with mount animation, disabled AI panel (6 actions) and Publish card (Sprint 5.1)
- **Product Create**, wired to real Supabase writes, RLS-gated, no service-role key (Sprint 6) — requires the one-time manual admin-account step described under Sprint 6 below
- **Minimal admin-only sign-in** at `/admin/login`, protecting `/admin/*` (Sprint 6 — temporary bridge, not full Authentication)
- Zustand cart with localStorage persistence
- Responsive design (mobile-first)
- Framer Motion animations throughout

### What's not yet live

- Full Authentication (customer accounts, OAuth, register, password reset) — the storefront `/login` page is still a UI stub
- Product edit/delete, live products table, image upload, quality scoring (Sprint 6.1)
- Payments (Stripe, PayPal)
- Orders system
- AI-powered search (Claude API)
- Supabase Storage for media

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

### Sprint 6.1 — Rest of Product CRUD
**Goal:** Complete admin product management — edit, delete, live list, images, scoring

**Tasks:**
- [ ] Wire `/admin/products` table to live, paginated Supabase reads (replacing the static `products` array and simulated loading state built in Sprint 5)
- [ ] Replace the placeholder mapping in `src/components/admin/products/status.ts` with the real `is_active`/`published_at` derivation (Sprint 6's `statusToColumns` in `actions.ts` establishes the mapping direction; this is the reverse — DB → UI status label)
- [ ] Replace `ProductQualitySection`'s placeholder score tiles with real computed scores (Title/Description/SEO/Images/Overall)
- [ ] `/admin/products/[id]` — product edit form, reusing the Sprint 5.1/6 Studio sections via `initialDraft`
- [ ] Wire up `ProductActionsMenu` (View / Edit / Duplicate / Archive / Delete) to real navigation and mutations — same RLS-gated Server Action pattern as Create (ADR-013), no service-role key
- [ ] Image upload to Supabase Storage (products bucket) — replaces the static Media dropzone placeholders; bucket → `media` row → `product_images` row per `docs/DATABASE.md` §7
- [ ] `revalidatePath`/`revalidateTag` on update/delete (Create already does this for `/admin/products` and `/products`)

### Sprint 7 — Full Authentication
**Goal:** Customer accounts, on top of the Sprint 6 admin-only bridge

**Tasks:**
- [ ] Wire the existing storefront `/login` page (already has the Google OAuth button and register toggle UI) to `supabase.auth.signInWithOAuth` and a real register Server Action
- [ ] `/auth/callback` route for OAuth redirect
- [ ] Extend `src/proxy.ts` (not a new file — see ADR-014) to also gate `/checkout` and `/account/*` for customer sessions
- [ ] Session-aware Navbar (show avatar + account menu when logged in)
- [ ] Protected account area `/account/` (profile, orders, wishlist)
- [ ] Cart merge on login (localStorage → server)
- [ ] Password reset flow

**Constraint:** No breaking changes to storefront. Auth must be additive. Extend `src/lib/auth/dal.ts` and `src/lib/supabase/{client,server,middleware}.ts` rather than duplicating them.

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

*Last updated: 2026-07-12*  
*Maintained by: Lead Product Engineer*
