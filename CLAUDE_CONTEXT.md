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
**Last sprint completed:** Sprint 7.0 — Authentication Foundation.  
**Date of last update:** 2026-07-13

---

## Current Sprint

**Sprint 7.0 — Authentication Foundation** ✅ COMPLETE

The originally-planned single "Sprint 7 — Full Authentication" was split into 7.0/7.1/7.2 per explicit user instruction — see ADR-020 (also records that "Sprint 7.1" is intentionally reused: it already names the shipped Product Edit sprint below). This sprint covers customer email/password registration and login (`src/app/login/actions.ts`), Google OAuth + a shared `/auth/callback` code-exchange route (also used by password recovery), a password reset flow (`/forgot-password` → `/auth/reset-password`), customer session helpers (`verifySession`/`getUser` in `src/lib/auth/dal.ts`, generalized from the admin-only pair), a session-aware Navbar, and `src/proxy.ts` extended to gate `/checkout` and `/account/*`. Account dashboard, orders, wishlist, and cart merge are explicitly out of scope — see Sprint 7.1/7.2 below. Email/password flows were verified end-to-end against the live Supabase project in-browser; Google OAuth is wired but requires a manual Supabase Dashboard step (real client ID/secret + enabling the provider) before it's testable end-to-end, same category as Sprint 6's admin-account step.

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

---

## Pending Work (next sprints)

| Sprint | Goal |
|---|---|
| Sprint 7.1 | User Area — profile page, addresses, account dashboard shell, orders placeholder, wishlist placeholder. Not to be confused with the already-shipped "Sprint 7.1 — Edit Product" above — see ADR-020. |
| Sprint 7.2 | Cart & Session Continuity — scope to be defined later; expected to cover cart merge on login. No `cart`/`cart_items` table exists yet, so this likely needs a schema decision first. |
| Sprint 8 | Stripe payments + orders system + order confirmation email (Resend) |
| Sprint 9 | AI Smart Search — Claude API, Upstash Redis cache, search logs. Also wires the Sprint 5.1 `AIAssistantPanel` and adds AI-assisted content quality analysis to `ProductQualitySection` (the deterministic scoring shipped in Sprint 6.1 remaining stays as the non-AI baseline — see ADR-018) |

**Do NOT implement** Sprint 7.1, 7.2, Stripe, or AI search until the relevant sprint begins.

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
│   ├── page.tsx           ← Homepage
│   └── layout.tsx         ← Root layout (fonts, providers)
│
├── components/
│   ├── admin/            ← AdminShell, AdminSidebar, AdminTopBar (sign-out wired)
│   │   └── products/     ← ProductsView, ProductsToolbar, ProductsTable, ProductsPagination, ProductActionsMenu (fully wired: View/Edit/Duplicate/Archive-or-Restore/Delete), status.ts (real is_active/published_at derivation)
│   │       └── studio/   ← ProductStudio (action prop: createProduct default, or updateProduct.bind(null, id)) + StudioSection/FormField/TagInput/ScoreCard/CharacterCounter + validation.ts (shared Zod schema) + images.ts (syncProductImages) + scoring.ts (computeProductQualityScores) + sections/
│   ├── home/              ← Homepage sections
│   ├── layout/            ← Navbar, Footer
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

**Tables:** 34 tables defined in `docs/DATABASE.md`. 7 migrations applied (`supabase/migrations/`); most of the 34 have schema but no write policies yet — see the RLS coverage gap noted in the architecture review.

**Storage:** `products` bucket (public, 10MiB limit, image/webp+jpeg+png+avif only) — created by migration 007, matches `supabase/config.toml`'s declared bucket.

**Currently seeded:**
- `categories` — 7 rows: Kitchen, Bathroom, Storage, Cleaning, Bedroom, Office, Outdoor
- `products` — 8 seed rows + whatever's been created since via `/admin/products/new`
- `product_images` — 2 images per seed product (Unsplash URLs, `media_id = NULL` — these legacy rows are preserved through edits, see ADR-018) + whatever's been uploaded since via the Studio's Media section

**RLS:** Default-deny on every table. `products`/`categories`/most catalogue tables: public SELECT (active only) + full staff/admin SELECT. `products`/`seo_metadata`: staff/admin INSERT (migration 005) and UPDATE (migration 006) too. `products` also has a narrow staff/admin DELETE, scoped to Create's compensating rollback, not general use — the admin Delete action reuses the UPDATE policy for a soft delete instead (ADR-018). `media`/`product_images`: staff/admin INSERT (migration 007); `product_images` also has staff/admin UPDATE/DELETE. `storage.objects` on the `products` bucket: staff/admin INSERT/DELETE (migration 007). Almost everything else (including `orders`/`order_items`) has no write policy at all yet.

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

**Sprint 7.0 (Authentication Foundation) is complete.** Customer register/login (email+password and Google OAuth), password reset, session-aware Navbar, and protected-route scaffolding for `/checkout` and `/account/*` are all real. What's left, in rough priority order:

- A dedicated Media Library so a previously-uploaded image can be reused across products, rather than uploaded fresh each time (not yet scheduled to a sprint)
- **Sprint 7.1 — User Area**: profile page, addresses, account dashboard shell, orders placeholder, wishlist placeholder — the pages that now sit behind Sprint 7.0's `/account/*` proxy gate.
- **Sprint 7.2 — Cart & Session Continuity**: scope to be defined later; expected to cover cart merge on login, pending a schema decision (no `cart`/`cart_items` table exists yet).

Do NOT start Sprint 7.1 or 7.2 work without explicit user instruction.

---

*Last updated: 2026-07-13*
