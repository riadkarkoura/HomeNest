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

## Current Project Status

**Version:** 0.1.0  
**Phase:** Phase 0 complete (frontend). Phase 1 (backend) in progress.  
**Last sprint completed:** Sprint 7.1 — Edit Product  
**Date of last update:** 2026-07-12

---

## Current Sprint

**Sprint 7.1 — Edit Product** ✅ COMPLETE

Shipped ahead of Sprint 7 (Full Authentication) — same out-of-order pattern as the Sprint 6/7 swap. `/admin/products/[id]/edit` reuses `ProductStudio` completely (the `initialDraft` prop built for this in Sprint 5.1, plus a new `action` prop so the same component submits to either Create or Edit). The build passes. The manual admin-account step from Sprint 6 is still the only thing gating end-to-end testing — see Sprint 6 in `docs/ROADMAP.md` if it hasn't been done yet.

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
| Sprint 6.1 (partial) | **Live Products list** at `/admin/products` — `src/lib/supabase/queries/admin-products.ts` (paginated, filtered, RLS-gated, browser client), real `status.ts` derivation from `is_active`/`published_at`, `ProductsPagination.tsx`. Delete, image upload, and quality scoring remain — see Pending Work. |
| Sprint 7.1 | **Product Edit** at `/admin/products/[id]/edit` — reuses `ProductStudio` entirely via `initialDraft` + a new `action` prop. New `updateProduct` Server Action (`.update()` + `.upsert()` on `seo_metadata`), new `products_staff_update`/`seo_metadata_staff_update` RLS policies (migration `20260712000002`), shared Zod schema extracted to `src/components/admin/products/studio/validation.ts` so Create and Edit validate identically. See ADR-016. |

---

## Pending Work (next sprints)

| Sprint | Goal |
|---|---|
| Sprint 6.1 (remaining) | Delete, image upload to Supabase Storage, real `ProductQualitySection` scoring, remaining `ProductActionsMenu` items (View/Duplicate/Archive/Delete) |
| Sprint 7 | Full Authentication — customer accounts, register, OAuth, password reset, session-aware Navbar, protected `/account` area. Extends (does not replace) the Sprint 6 auth bridge files. |
| Sprint 8 | Stripe payments + orders system + order confirmation email (Resend) |
| Sprint 9 | AI Smart Search — Claude API, Upstash Redis cache, search logs |

**Do NOT implement** Stripe, or AI search until the relevant sprint begins.

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
├── proxy.ts              ← Next 16's renamed middleware.ts. Optimistic gate on /admin/:path* — redirects to /admin/login if no session. NOT the security boundary (RLS is) — see ADR-013/014.
├── app/
│   ├── admin/
│   │   ├── layout.tsx    ← Server wrapper → <AdminShell>
│   │   ├── page.tsx      ← Overview dashboard
│   │   ├── login/        ← Minimal admin-only sign-in (page.tsx + actions.ts) — NOT full Authentication, see ADR-014
│   │   ├── products/     ← Live, paginated, filterable list (Sprint 6.1)
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
│   ├── login/             ← Storefront login UI stub — untouched on purpose, for the future Sprint 7 Authentication to wire up (see ADR-014)
│   ├── page.tsx           ← Homepage
│   └── layout.tsx         ← Root layout (fonts, providers)
│
├── components/
│   ├── admin/            ← AdminShell, AdminSidebar, AdminTopBar (sign-out wired)
│   │   └── products/     ← ProductsView, ProductsToolbar, ProductsTable, ProductsPagination, ProductActionsMenu (Edit wired, rest presentational), status.ts (real is_active/published_at derivation)
│   │       └── studio/   ← ProductStudio (action prop: createProduct default, or updateProduct.bind(null, id)) + StudioSection/FormField/TagInput/ScoreCard/CharacterCounter + validation.ts (shared Zod schema) + sections/
│   ├── home/              ← Homepage sections
│   ├── layout/            ← Navbar, Footer
│   ├── product/            ← Product detail sections
│   ├── shop/                ← ProductCard, CartDrawer
│   └── ui/                  ← shadcn/ui primitives
│
├── lib/
│   ├── auth/
│   │   └── dal.ts        ← verifyAdminSession (redirects — for Server Components) and getAdminUser (no redirect — for Server Actions mid-mutation)
│   ├── supabase/
│   │   ├── queries/
│   │   │   ├── products.ts        ← Storefront reads (plain client, SSG-safe, is_active=true only)
│   │   │   ├── admin-products.ts  ← Admin list reads (browser client, no is_active filter, paginated)
│   │   │   └── admin-product.ts   ← Admin single-product read for Edit (server client — kept separate from admin-products.ts to avoid next/headers in a client bundle)
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
3. **Admin auth exists, but it's a minimal bridge, not full Authentication**. `/admin/*` is gated by `src/proxy.ts` + admin-only sign-in at `/admin/login` (Sprint 6, ADR-014) — no OAuth, no register, no customer accounts. Don't build those into the bridge; Sprint 7 replaces it properly. Storefront `/login` is still an untouched UI stub, left that way on purpose.
4. **Product CRUD is partial**: Create (Sprint 6), Read/List (Sprint 6.1), and Edit (Sprint 7.1) are real, RLS-gated, no service-role key. Delete, image upload, and quality scoring are not built — see Pending Work.
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

**Tables:** 34 tables defined in `docs/DATABASE.md`. 6 migrations applied (`supabase/migrations/`); most of the 34 have schema but no write policies yet — see the RLS coverage gap noted in the architecture review.

**Currently seeded:**
- `categories` — 7 rows: Kitchen, Bathroom, Storage, Cleaning, Bedroom, Office, Outdoor
- `products` — 8 seed rows + whatever's been created since via `/admin/products/new`
- `product_images` — 2 images per seed product (Unsplash URLs, `media_id = NULL`)

**RLS:** Default-deny on every table. `products`/`categories`/most catalogue tables: public SELECT (active only) + full staff/admin SELECT. `products`/`seo_metadata`: staff/admin INSERT (migration 005) and UPDATE (migration 006) too. `products` also has a narrow staff/admin DELETE, scoped to Create's compensating rollback, not general use. Almost everything else (including `orders`/`order_items`) has no write policy at all yet.

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

**Sprint 6.1 (remaining) — Delete, images, scoring**

List (Sprint 6.1 partial) and Edit (Sprint 7.1) are done. What's left: real `DELETE` for products (needs its own RLS policy — the one that exists today is scoped narrowly to Create's rollback), the remaining `ProductActionsMenu` items (View/Duplicate/Archive/Delete), `ProductQualitySection`'s real scoring, and Supabase Storage image upload (bucket `products` → `media` row → `product_images` row, per `docs/DATABASE.md` §7). Same RLS-gated Server Action pattern as Create/Edit (ADR-013) — no service-role key.

**Sprint 7 — Full Authentication** extends, not replaces, the Sprint 6 auth bridge (`src/proxy.ts`, `src/lib/auth/dal.ts`, `src/lib/supabase/{client,server,middleware}.ts`): customer accounts, register, Google OAuth (`supabase.auth.signInWithOAuth`), `/auth/callback/route.ts`, password reset, session-aware Navbar, protected `/account/*` area, cart merge on login. The existing storefront `/login` page (Google OAuth button, register toggle) was left as-is specifically so this sprint can wire it up rather than rebuild it.

Do NOT start Sprint 7 work without explicit user instruction.

---

*Last updated: 2026-07-12*
