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
- Zustand cart with localStorage persistence
- Responsive design (mobile-first)
- Framer Motion animations throughout

### What's not yet live

- Authentication (Supabase Auth)
- Payments (Stripe, PayPal)
- Orders system
- AI-powered search (Claude API)
- Real admin CRUD operations
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

---

## 3. Upcoming Sprints

### Sprint 5 — Authentication
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

### Sprint 6 — Admin Product CRUD
**Goal:** Admins can create, edit, and delete products from the dashboard

**Tasks:**
- [ ] `/admin/products` — paginated product table with search
- [ ] `/admin/products/new` — product creation form
- [ ] `/admin/products/[id]` — product edit form
- [ ] Image upload to Supabase Storage (products bucket)
- [ ] `revalidateTag('products')` on create/update/delete
- [ ] Server Actions for all mutations
- [ ] Zod validation on all form inputs

### Sprint 7 — Payments & Orders
**Goal:** End-to-end checkout with Stripe

**Tasks:**
- [ ] Checkout page
- [ ] Stripe Elements integration
- [ ] `POST /api/payments/stripe/intent` — PaymentIntent creation
- [ ] `POST /api/webhooks/stripe` — payment confirmation + order status update
- [ ] Orders table and order detail page
- [ ] Order confirmation email via Resend
- [ ] Customer order history at `/account/orders`

### Sprint 8 — AI Search
**Goal:** Natural language product discovery powered by Claude

**Tasks:**
- [ ] `POST /api/search` Route Handler
- [ ] Claude API integration (claude-haiku-4-5-20251001 for search)
- [ ] Upstash Redis cache for search results
- [ ] SmartSearchSection wired to live API
- [ ] Search log recording to `search_logs` table
- [ ] AI Studio search quality section

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
