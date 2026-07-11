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
**Last sprint completed:** Sprint 6 — Product Create (CRUD) + minimal admin auth bridge  
**Date of last update:** 2026-07-12

---

## Current Sprint

**Sprint 6 — Product Create (CRUD) + minimal admin auth bridge** ✅ COMPLETE (code) — ⚠️ one manual step outstanding

Sprints 6 and 7 were swapped from the original plan: Product Create shipped before full Authentication, at the user's explicit instruction. The build passes. **Before this is live, you must create one Supabase Auth user and promote it to `role='admin'`** — see `docs/ROADMAP.md` Sprint 6 for the exact steps. Until then, `/admin/login` will correctly reject every sign-in attempt (no admin account exists yet), which is the intended, secure default — not a bug.

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

---

## Pending Work (next sprints)

| Sprint | Goal |
|---|---|
| Sprint 6.1 | Rest of Product CRUD — wire `/admin/products` table to live Supabase reads (replacing the static list + `status.ts` placeholder), edit and delete products, image upload to Supabase Storage, real `ProductQualitySection` scoring |
| Sprint 7 | Full Authentication — customer accounts, register, OAuth, password reset, session-aware Navbar, protected `/account` area. Extends (does not replace) the Sprint 6 auth bridge files. |
| Sprint 8 | Stripe payments + orders system + order confirmation email (Resend) |
| Sprint 9 | AI Smart Search — Claude API, Upstash Redis cache, search logs |

**Do NOT implement** Stripe, or AI search until the relevant sprint begins. Sprint 6 only covers Product **Create** — edit/delete, image upload, and real quality scoring remain Sprint 6.1.

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
├── app/
│   ├── admin/           ← Admin dashboard (all routes stubbed; NO auth yet)
│   │   ├── layout.tsx   ← Server wrapper → <AdminShell>
│   │   ├── page.tsx     ← Overview dashboard
│   │   ├── products/    ← Management UI (table/search/filters), read-only — CRUD in Sprint 7
│   │   │   └── new/     ← Add Product Studio (8-section form UI), no save yet — CRUD in Sprint 7
│   │   ├── categories/  ← Stub
│   │   ├── orders/      ← Stub
│   │   ├── customers/   ← Stub
│   │   ├── promotions/  ← Stub
│   │   ├── media/       ← Stub
│   │   ├── ai-studio/   ← Stub
│   │   ├── analytics/   ← Stub
│   │   └── settings/    ← Stub
│   ├── products/        ← Listing + detail pages (live Supabase data)
│   ├── cart/            ← Cart page (Zustand state)
│   ├── login/           ← Login stub (no auth yet)
│   ├── page.tsx         ← Homepage
│   └── layout.tsx       ← Root layout (fonts, providers)
│
├── components/
│   ├── admin/           ← AdminShell, AdminSidebar, AdminTopBar
│   │   └── products/    ← ProductsView, ProductsToolbar, ProductsTable, ProductActionsMenu, status.ts
│   │       └── studio/  ← ProductStudio + StudioSection/FormField/TagInput/ScoreCard/CharacterCounter + sections/ (Add Product Studio)
│   ├── home/            ← Homepage sections
│   ├── layout/          ← Navbar, Footer
│   ├── product/         ← Product detail sections
│   ├── shop/            ← ProductCard, CartDrawer
│   └── ui/              ← shadcn/ui primitives
│
├── lib/
│   ├── supabase/
│   │   ├── queries/
│   │   │   └── products.ts  ← getProducts, getProductBySlug, getFeaturedProducts, getAllProductSlugs
│   │   ├── client.ts        ← Browser Supabase client (for future auth)
│   │   └── server.ts        ← Server Supabase client (for future auth)
│   ├── motion.ts            ← EASE constant + animation variants
│   ├── products.ts          ← Static product data (still used by admin overview page)
│   ├── product-content.ts   ← Enriched product page content
│   ├── store.ts             ← Zustand cart store
│   └── utils.ts             ← cn() utility
│
├── types/
│   └── index.ts             ← All TypeScript types + future feature stubs
│
└── middleware.ts            ← Route protection (JWT not yet implemented)
```

---

## Coding Rules

1. **Never rebuild** what already exists. Improve, extend, or fix existing code.
2. **Server Components by default**. Add `"use client"` only at the component that actually needs browser APIs (`useState`, `useEffect`, `usePathname`, etc.).
3. **No authentication yet**. Sprint 6 will add it. Do not stub auth checks in components.
4. **No CRUD yet**. Sprint 7 will add it. Admin pages are read-only (Products has a full read-only UI as of Sprint 5, plus a fully-built but non-saving creation form — the Add Product Studio — as of Sprint 5.1; the rest remain stubs).
5. **No Supabase mutations yet**. All current Supabase usage is read-only product queries.
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

**Supabase project:** Connected. Env vars in `.env.local`.

**Tables:** 34 tables defined in `docs/DATABASE.md`. Schema is designed; not all tables are migrated yet.

**Currently seeded:**
- `categories` — Kitchen, Bathroom, Storage
- `products` — 8 products
- `product_images` — 2 images per product (Unsplash URLs, `media_id = NULL`)

**RLS:** All products have `USING (true)` for public read. All other tables are default-deny.

**Current Supabase client pattern:**

```typescript
// For product queries (SSG-safe, no cookies needed):
import { createClient } from "@supabase/supabase-js"
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// For future auth-aware server queries:
// import { createServerClient } from "@supabase/ssr"  (uses cookies — forces dynamic rendering)
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

**Sprint 6.1 — Rest of Product CRUD**

Wires the remaining Sprint 5 Products UI (`src/components/admin/products/`) to live Supabase reads/writes: replaces the static `products` data source, the simulated loading state, and the placeholder `status.ts` mapping with the real `is_active`/`published_at` model (see `docs/DATABASE.md` and `createProduct`'s `statusToColumns` mapping in `src/app/admin/products/new/actions.ts` for the pattern). Wires up `ProductActionsMenu` (View/Edit/Duplicate/Archive/Delete). `ProductQualitySection`'s placeholder tiles get real scoring. Static Media dropzones become real Supabase Storage upload (bucket `products` → `media` row → `product_images` row, per `docs/DATABASE.md` §7). `/admin/products/[id]/edit` reuses `ProductStudio` via its `initialDraft` prop. All of it goes through the same RLS-gated Server Action pattern established in Sprint 6 (ADR-013) — no service-role key.

**Sprint 7 — Full Authentication** extends, not replaces, the Sprint 6 auth bridge (`src/proxy.ts`, `src/lib/auth/dal.ts`, `src/lib/supabase/{client,server,middleware}.ts`): customer accounts, register, Google OAuth (`supabase.auth.signInWithOAuth`), `/auth/callback/route.ts`, password reset, session-aware Navbar, protected `/account/*` area, cart merge on login. The existing storefront `/login` page (Google OAuth button, register toggle) was left as-is in Sprint 6 specifically so this sprint can wire it up rather than rebuild it.

Do NOT start Sprint 7 work without explicit user instruction.

---

*Last updated: 2026-07-12*
