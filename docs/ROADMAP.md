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
**Date:** 2026-07-11

### What's live

- Full storefront UI: homepage, product listing, product detail pages, cart
- 8 products in the catalogue (Kitchen, Bathroom, Storage categories)
- Supabase database connected for product data (Sprint 3.3)
- Admin Dashboard foundation: sidebar, topbar, overview, all route stubs (Sprint 4)
- Admin Products Management UI: table, search, category/status/featured filters, row actions menu, empty/loading states (Sprint 5)
- Add Product Studio: multi-section product creation form (Basic Info, Pricing, Organization, Media, Product Story, SEO), disabled AI panel and Publish card (Sprint 5.1)
- Zustand cart with localStorage persistence
- Responsive design (mobile-first)
- Framer Motion animations throughout

### What's not yet live

- Authentication (Supabase Auth)
- Payments (Stripe, PayPal)
- Orders system
- AI-powered search (Claude API)
- Real admin CRUD operations (the Products UI is read-only until Sprint 7)
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
- `src/components/admin/products/studio/sections/` — `BasicInfoSection` (title, auto-generated slug, short description), `PricingSection` (price, compare-at price, cost, Featured switch), `OrganizationSection` (Category/Status `Select`, reusing `PRODUCT_STATUSES` from Sprint 5's `status.ts`), `MediaSection` (static image/video dropzone placeholders, non-functional), `ProductStorySection` (Problem/Solution textareas + repeatable Benefits list), `SeoSection` (meta title/description, keywords)
- `sections/AIAssistantPanel.tsx` — amber-tinted "AI Product Assistant / Coming in Sprint 9" card, four disabled buttons (Import from AliExpress, Generate SEO, Generate Product Story, Generate TikTok Content)
- `sections/PublishCard.tsx` — three disabled buttons (Publish, Save as Draft, Schedule)
- New shared primitives added to `src/components/ui/`: `select.tsx`, `switch.tsx`, `textarea.tsx` — wrap the `@base-ui/react` `select`/`switch` primitives already installed (ADR-003 pattern), reusable by future admin forms, not one-offs for this page
- Two-column layout (`lg:grid-cols-3`): main column follows the authoring flow (Basic Info → Pricing → Product Story → SEO); sidebar holds Publish, Organization, Media, and the AI panel
- All inputs are locally interactive (typing, toggling, tagging) — no persistence. All Save/Publish/Schedule/AI/upload actions are disabled
- No CRUD, no auth, no Supabase mutations, no AI wiring — reuses `AdminShell` unchanged
- Build verified: `npm run build` passes, `/admin/products/new` prerenders as a static page

---

## 3. Upcoming Sprints

### Sprint 6 — Authentication
**Goal:** Supabase Auth integration for customer accounts

**Tasks:**
- [ ] Supabase Auth client wiring (browser + server + middleware)
- [ ] Login page: email/password + Google OAuth
- [ ] Register page
- [ ] `/auth/callback` route for OAuth redirect
- [ ] `src/middleware.ts` — JWT verification on `/admin/*` and `/checkout`
- [ ] Session-aware Navbar (show avatar + account menu when logged in)
- [ ] Protected account area `/account/` (profile, orders, wishlist)
- [ ] Cart merge on login (localStorage → server)

**Constraint:** No breaking changes to storefront. Auth must be additive.

### Sprint 7 — Admin Product CRUD
**Goal:** Admins can create, edit, and delete products from the dashboard

**Tasks:**
- [ ] Wire `/admin/products` table to live, paginated Supabase reads (replacing the static `products` array and simulated loading state built in Sprint 5)
- [ ] Add real `status`/`is_active`/`published_at` fields to `Product` and replace the placeholder mapping in `src/components/admin/products/status.ts`
- [ ] Wire the Sprint 5.1 `ProductStudio` (`/admin/products/new`) to a real Server Action — Publish/Save as Draft/Schedule buttons, currently disabled, become live
- [ ] `/admin/products/[id]` — product edit form, reusing the Sprint 5.1 Studio sections
- [ ] Wire up `ProductActionsMenu` (View / Edit / Duplicate / Archive / Delete) to real navigation and mutations
- [ ] Image upload to Supabase Storage (products bucket) — replaces the Sprint 5.1 static Media dropzone placeholders
- [ ] `revalidateTag('products')` on create/update/delete
- [ ] Server Actions for all mutations
- [ ] Zod validation on all form inputs

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
- [ ] Wire the Sprint 5.1 `AIAssistantPanel` (`/admin/products/new`) — Import from AliExpress, Generate SEO, Generate Product Story, Generate TikTok Content, currently disabled placeholders

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

*Last updated: 2026-07-11*  
*Maintained by: Lead Product Engineer*
