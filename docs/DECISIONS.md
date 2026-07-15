# HomeNest — Architecture Decision Records

> **Format:** ADR (Architecture Decision Record)
> Each record captures: date, decision, reason, and alternatives considered.
> Records are append-only — never edited after the fact.
>
> Read alongside: `docs/ARCHITECTURE.md` · `PROJECT_VISION.md`

---

## ADR-001 — Next.js 16 App Router
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** Use Next.js 16 with App Router and Turbopack as the application framework.

**Reason:** App Router provides Server Components (RSC) which allow server-side data fetching without useEffect. Turbopack gives faster HMR in development. SSG via `generateStaticParams` gives near-zero latency on product pages. Vercel is the natural deployment target with zero-config integration.

**Alternatives considered:**
- Remix — strong data conventions but weaker SSG story and less mature ecosystem
- Nuxt (Vue) — team prefers React ecosystem
- SvelteKit — compelling but lower hiring pool

---

## ADR-002 — Tailwind CSS v4
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** Use Tailwind CSS v4 with `@import "tailwindcss"` in globals.css. No `tailwind.config.js` file.

**Reason:** v4 removes the config file requirement. Theme values are set in CSS directly. Smaller footprint, faster builds, better IDE support in the future.

**Alternatives considered:**
- Tailwind CSS v3 — stable, well-documented, but requires config file and has slower build
- CSS Modules — more explicit but verbose and less co-location of styles
- Emotion / styled-components — runtime CSS-in-JS conflicts with RSC

**Consequence:** No arbitrary value theme extensions. All values used directly as Tailwind classes. Some tooling (e.g. tailwind-merge) requires care because v4 class names may differ.

---

## ADR-003 — shadcn/ui v4 with base-ui
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** Use shadcn/ui v4 backed by `@base-ui/react`, not Radix UI.

**Reason:** shadcn/ui v4 migrated from Radix UI to base-ui. The `asChild` pattern is replaced with a `render` prop pattern. Components are copy-owned — no upstream lock-in.

**Alternatives considered:**
- shadcn/ui v3 (Radix) — well-known but older version; would need upgrading later
- MUI — too opinionated, harder to match custom design
- Headless UI (Tailwind Labs) — less comprehensive

**Consequence:** All primitive usage must use `render` prop, not `asChild`. e.g. `<SheetTrigger render={<button />}>` not `<SheetTrigger asChild><button /></SheetTrigger>`.

---

## ADR-004 — Framer Motion for animations
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** Use Framer Motion 12 for all UI animations. Shared constants in `src/lib/motion.ts`.

**Reason:** Industry standard for React animation. Declarative spring physics. Excellent scroll trigger support via `whileInView`. The `EASE` constant (`[0.16, 1, 0.3, 1]`) is defined once and imported everywhere — never redefined.

**Alternatives considered:**
- CSS transitions — simpler but cannot achieve the scroll-triggered entrance effects required
- GSAP — more powerful but larger bundle and less React-native
- React Spring — comparable but less community momentum

**Rule:** `VIEW_ONCE = { once: true, margin: "-80px 0px" }` is the standard for all scroll triggers. Exit animations must be shorter than entrance animations.

---

## ADR-005 — Zustand for client state
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** Use Zustand 5 with persist middleware for cart state. localStorage key: `"homenest-cart"`.

**Reason:** Minimal boilerplate. SSR-safe with the persist middleware. No provider wrapping needed. Easy to add middleware (devtools, immer).

**Alternatives considered:**
- Redux Toolkit — heavier, more ceremony for a simple cart
- Jotai — fine choice but team prefers Zustand's store API
- React Context — re-renders entire tree on every cart change

---

## ADR-006 — Supabase as backend
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** Use Supabase (PostgreSQL) for database, auth, storage, and realtime.

**Reason:** Open-source. Unified BaaS — one provider for DB, Auth, Storage, Realtime, Edge Functions. RLS enforces data access at the database level. Generous free tier for development.

**Alternatives considered:**
- PlanetScale — MySQL, no RLS, deprecated free tier
- Neon — PostgreSQL but no bundled auth or storage
- Firebase — NoSQL, worse for relational ecommerce data

---

## ADR-007 — Plain createClient for SSG product queries
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** Use plain `createClient` from `@supabase/supabase-js` (not the cookie-based `@supabase/ssr` server client) for product queries in `src/lib/supabase/queries/products.ts`.

**Reason:** The `@supabase/ssr` server client calls `cookies()` from Next.js headers, which forces dynamic rendering. Products are publicly readable via RLS (`USING (true)`) and do not need auth context. Using the plain client allows `generateStaticParams` and static product pages to work at build time.

**Alternatives considered:**
- Using `@supabase/ssr` with `cookies()` — makes all product pages dynamic, destroying SSG
- Keeping static data in `products.ts` — simpler but not CMS-editable by admins

**Consequence:** All product queries are unauthenticated. This is correct and safe because RLS already limits product reads to public data.

---

## ADR-008 — React.cache for getProductBySlug
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** Wrap `getProductBySlug` in `React.cache` to deduplicate Supabase calls within a single request.

**Reason:** Both `generateMetadata` and the page function call `getProductBySlug(slug)` for the same slug. Without `React.cache`, this results in two identical database calls per request. `React.cache` memoizes the result for the duration of the React render tree.

**Alternatives considered:**
- Next.js `fetch` cache — not applicable to Supabase JS client (not a raw `fetch` call)
- Manual module-level cache — works but not request-scoped; would leak between requests

---

## ADR-009 — AdminShell pattern for admin layout
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** The admin layout is a Server Component that renders `<AdminShell>` (a Client Component) which wraps the sidebar, topbar, and `{children}`.

**Reason:** Active sidebar state requires `usePathname()` which requires a Client Component. But the layout itself should remain a Server Component to allow Server Component children to stay server-rendered. Wrapping in a Client Component shell preserves this: the Server Component passes `children` (an RSC subtree) as a prop to the Client Component, and React renders them server-side.

**Alternatives considered:**
- Making `layout.tsx` itself `"use client"` — forces all children to be client-rendered, losing RSC benefits
- Polling `window.location.pathname` in a useEffect — brittle, no SSR

---

## ADR-010 — React.ElementType for Lucide icon props
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** Use `React.ElementType` as the TypeScript type for icon props, not `LucideIcon`.

**Reason:** `lucide-react` version 1.24.0 (installed in this project) does not export `LucideIcon`. Using `LucideIcon` causes a TypeScript error. `React.ElementType` is the correct type for any React component that accepts standard HTML/SVG props.

**Verified by:** `node -e "const lr = require('lucide-react'); console.log('LucideIcon' in lr)"` → `false`

**Alternatives considered:**
- `ForwardRefExoticComponent<LucideProps>` — too verbose and Lucide-version-specific
- `ComponentType<{ className?: string }>` — works but `React.ElementType` is more standard

---

## ADR-011 — Anthropic Claude API for AI search
**Date:** 2026-07-11  
**Status:** Accepted (planned, not yet implemented)

**Decision:** Use Anthropic Claude for all AI features. Haiku for search (fast, cheap). Sonnet for content generation and recommendations.

**Model assignments:**
- `claude-haiku-4-5-20251001` — Smart Search API
- `claude-sonnet-4-6` — AI Studio content generation, recommendations

**Reason:** Best-in-class reasoning and reliable structured JSON output. Safety alignment means fewer unexpected outputs in production. Prompt caching reduces cost for the static system prompt.

**Alternatives considered:**
- OpenAI GPT-4o — comparable capability but different pricing and safety profile
- Google Gemini — less JSON reliability in early benchmarks
- Local models (Ollama) — latency and infrastructure overhead

---

## ADR-012 — No authentication in Sprint 4
**Date:** 2026-07-11  
**Status:** Accepted

**Decision:** Admin routes are accessible without authentication in the current sprint. Authentication will be added in Sprint 5.

**Reason:** Building auth correctly (JWT verification, OAuth callback, role checks in middleware, session refresh on every request) is non-trivial and was explicitly out of scope for Sprint 4 per the user's instruction: "Do not implement authentication yet."

**Consequence:** Admin dashboard is publicly accessible at `/admin` until Sprint 5. This is acceptable for local development. Must not be deployed to production before Sprint 5 ships.

---

## ADR-013 — RLS-gated admin writes, no service-role key
**Date:** 2026-07-12
**Status:** Accepted

**Decision:** Product Create (Sprint 6) never uses `SUPABASE_SERVICE_ROLE_KEY`. The Create Server Action uses the same cookie-based `@supabase/ssr` client as everything else (`src/lib/supabase/server.ts`), and writes are authorized entirely through explicit RLS policies (`products_staff_insert`, `products_staff_delete`, `seo_metadata_staff_insert` — all `get_my_role() IN ('staff','admin')`, migration 005).

**Reason:** Migration 004 and `docs/DATABASE.md` §19 originally assumed "Admin → full access (uses service_role key server-side)" — i.e. admin writes were meant to bypass RLS entirely via the service_role key. The user explicitly ruled that out for this sprint: the browser must never have any path to a service-role-backed request, and the real authorization boundary should be RLS evaluated against a real authenticated session, not a bypass credential. This is a stricter posture than originally designed, kept intentionally rather than reverted.

**Consequence:** Every future admin write path (bulk import, AI-generated content approval, etc.) must add its own explicit staff/admin RLS policy the same way — the service_role assumption in migration 004's header comment no longer holds for anything built through a Server Action. `docs/DATABASE.md` §19 has been annotated accordingly.

**Alternatives considered:**
- Service-role key in a Server Action (original plan) — rejected per explicit instruction; also weaker in principle, since it bypasses RLS entirely rather than being checked by it.
- A dedicated non-`service_role` Postgres role for the app server — unnecessary complexity for a single Server Action; RLS + `authenticated` role already gives the same guarantee.

---

## ADR-014 — Minimal admin-only auth bridge ahead of full Authentication sprint
**Date:** 2026-07-12
**Status:** Accepted

**Decision:** A small, deliberately incomplete auth slice was built to unblock Product Create, since ADR-013 requires a real authenticated staff/admin session to exist: `src/proxy.ts` (Next.js 16's renamed `middleware.ts`, protecting `/admin/:path*` — optimistic session check only), `src/lib/auth/dal.ts` (`verifyAdminSession`), and `src/app/admin/login/{page,actions}.tsx` (email/password sign-in via `supabase.auth.signInWithPassword`, non-admin accounts are signed out immediately). No registration, no password reset, no OAuth, no customer-facing auth, no profile/account pages.

**Reason:** RLS policies in ADR-013 are meaningless without a session to check `get_my_role()` against, and none could exist — `/login` was a static UI stub and no admin `profiles` row existed. This is the minimum slice that makes ADR-013 actually work, scoped tightly per the user's explicit instruction not to build the complete authentication system yet.

**Consequence:** `/login` (the customer-facing storefront page with Google OAuth and a register toggle) was left untouched — it's scaffolding for the real, future Authentication sprint (ROADMAP), not repurposed for admin. `/admin/login` is a separate, purpose-built route. The future Authentication sprint should extend `src/lib/supabase/{client,server,middleware}.ts` and `src/lib/auth/dal.ts` rather than replace them — they're written to be reusable (e.g. `verifyAdminSession`'s pattern generalizes to a future `verifySession` for customers).

**Alternatives considered:**
- Defer Product Create until the full Authentication sprint — rejected; the user explicitly chose to build CRUD first (see ROADMAP renumbering) and only needs an admin session, not the full customer auth surface.
- Service-role key instead of any auth — rejected per ADR-013.

---

## ADR-015 — No RPC/transaction function for Product Create's two-table write
**Date:** 2026-07-12
**Status:** Accepted

**Decision:** `createProduct` performs two plain Supabase inserts (`products`, then `seo_metadata`) via the normal client, not a Postgres RPC function. If the second insert fails, the action compensates with a `DELETE` on the just-created `products` row (supported by the new `products_staff_delete` RLS policy) rather than relying on a single database transaction.

**Reason:** Explicit user instruction: keep the implementation simple and aligned with the current architecture (no existing RPCs in this codebase); introduce a real transaction only when multi-table atomicity actually becomes necessary (e.g. AI import, bulk import).

**Consequence:** There's a narrow window between the two inserts where a crash (not just an error — actual process/connectivity loss) could leave an orphaned `products` row with no compensating delete. Acceptable at this feature's volume (single admin, occasional creates); logged loudly server-side if it happens. Revisit with a `SECURITY INVOKER` Postgres function (preserves RLS, doesn't bypass it) if a future sprint needs true atomicity across more than two tables.

---

## ADR-016 — Product Edit: RLS UPDATE policies, upsert for SEO, no rollback
**Date:** 2026-07-12
**Status:** Accepted

**Decision:** Sprint 7.1 (Edit Product) extends the ADR-013 posture rather than introducing a new one: migration 006 adds `products_staff_update` and `seo_metadata_staff_update` (same `get_my_role() IN ('staff','admin')` shape as migration 005's INSERT policies), and `updateProduct` uses `.update()` on `products` plus `.upsert()` (keyed on `seo_metadata`'s existing `UNIQUE(entity_type, entity_id)` constraint) rather than a manual insert-or-update branch. Unlike `createProduct`, there is no compensating action if the `seo_metadata` write fails after the `products` update succeeds — the action returns an explicit partial-success message instead.

**Reason:** No UPDATE policy existed on either table before this sprint — editing was blocked at the database regardless of what application code attempted, a gap the Sprint 6.1/6.1.1 architecture review had already flagged. `.upsert()` was chosen over Create's insert-only pattern because Edit has a real case Create doesn't: a product that was created without SEO content might be edited to add some, or vice versa — upsert covers "row may or may not already exist" in one call instead of a fetch-then-branch.

The no-rollback decision is a deliberate asymmetry with ADR-015, not an oversight: Create's compensating delete works because a failed create can simply remove a row that didn't exist a moment ago. Edit's product row already existed before the edit began — "rolling back" would mean restoring its exact prior field values, which requires snapshotting the whole row first, a materially bigger feature than this sprint's scope. Reporting the true partial state honestly was judged better than a misleading full-success or full-failure message.

**Consequence:** A failed `seo_metadata` write during an edit leaves the `products` row's new values saved with stale (pre-edit) SEO data — the returned message says so explicitly rather than implying the whole save failed. Revisit with a real "previous value" snapshot (or a `SECURITY INVOKER` transaction function) if this proves confusing in practice, or once a broader undo/audit-trail feature exists that would need the same snapshot data anyway.

**Alternatives considered:**
- A single Postgres function wrapping both writes in a transaction — rejected for the same reason as ADR-015 (no RPC until multi-table atomicity is actually needed); revisit together if a future sprint adds one for either Create or Edit.
- Manual "select existing seo_metadata row, then insert or update" branch instead of `.upsert()` — rejected as unnecessary complexity given the unique constraint already exists to make upsert atomic and correct.

---

## ADR-017 — Long-term vision: AI-native commerce operating system
**Date:** 2026-07-12
**Status:** Accepted (strategic — not a sprint, not an implementation instruction)

**Decision:** HomeNest's long-term direction is not a traditional ecommerce platform run by staff. It's an AI-native commerce operating system, where the human owner's role narrows over time to: selecting products, approving important AI decisions, monitoring analytics, and setting business strategy. Specialized AI agents (Product Research, Product Import, Product Optimization, SEO, Pricing, Image Generation, Marketing, Advertising, Email Campaigns, Social Media, Customer Support, Inventory, Analytics, Operations) are the eventual target for everything else. The full statement lives in `PROJECT_VISION.md` — this ADR records it as a durable architectural constraint rather than duplicating the vision text.

**Reason:** Stated by the project owner as the long-term goal, ahead of Sprint 7.2. Recording it as an ADR — not just a paragraph in the vision doc — makes it something every future technical decision gets checked against, the same way ADR-013 (no service-role key) or ADR-015 (no RPC yet) already constrain how features get built.

**Consequence:** Every future feature should be designed with a clean AI integration point — a server-side entry a future agent could call — even while it's built and used by a human today. This is a design lens, not new scope: it adds no AI sprint, changes no line of `docs/ROADMAP.md`, and authorizes no agent-facing capability ahead of its scheduled sprint. The current roadmap (Sprint 6.1 remaining, Sprint 7 Full Authentication, Sprint 8 Payments, Sprint 9 AI Search, Sprint 7.2 pending approval) is unaffected.

**Alternatives considered:**
- Keep this as prose only in `PROJECT_VISION.md`, no ADR — rejected; this project already treats strategic/architectural commitments as ADR-worthy (e.g. ADR-014's auth-bridge scoping), and a vision this consequential to future feature design warrants the same traceability.

---

## ADR-018 — Sprint 6.1 remaining: Delete/Archive/Restore/Duplicate reuse existing RLS; image upload gets new RLS; quality scoring is deterministic, not AI
**Date:** 2026-07-12
**Status:** Accepted

**Decision:** Four things closed out Sprint 6.1:

1. **Delete is a soft delete** (`deleted_at`), reusing the `products_staff_update` policy from migration 006 — not the narrow `products_staff_delete` policy from migration 005, which stays scoped to Create's compensating rollback (ADR-015) and is never used for a general admin delete. `getAdminProducts()` already filtered `deleted_at IS NULL` before this sprint, so no query changes were needed.
2. **Archive/Restore/Duplicate also reuse existing RLS** — Archive and Restore call `statusToColumns("Archived"/"Active")` (`src/components/admin/products/studio/validation.ts`), the same mapping `createProduct`/`updateProduct` already use, so the row-menu shortcuts and editing a product's status dropdown by hand always agree. Duplicate reuses `products_staff_insert` (migration 005). None of the three needed a new migration.
3. **Image upload needed three new write policies** (migration 007): `media` and `product_images` had SELECT-only staff access before this sprint — the same kind of gap ADR-016 closed for `products`/`seo_metadata` UPDATE — plus new `storage.objects` policies for the `products` bucket, since Storage RLS defaults to deny like every other table. The bucket itself is created by the migration (idempotent `INSERT ... ON CONFLICT DO NOTHING`) rather than only declared in `supabase/config.toml`, since config.toml's bucket block is a local-dev convenience and isn't applied by `db push` to the linked remote project. The Studio's save flow (`src/components/admin/products/studio/images.ts`) replaces a product's entire `product_images` set on every save (delete all, then re-insert the current draft's list) instead of diffing add/remove/reorder — same "no transaction, keep it simple" posture as ADR-015/ADR-016. This also sidesteps `product_images`' partial unique index on `is_primary`: the table is fully cleared before the fresh batch insert, so two rows can never claim `is_primary = true` for the same product mid-save. The original 8 seed products have `product_images` rows with `media_id = NULL` (Unsplash URLs, no backing `media` row) — `ProductDraft.images[].id` is `string | null` specifically so those legacy rows round-trip through an edit instead of being silently deleted the next time someone saves an unrelated field on one of those products.
4. **Product Quality scoring is deterministic field-completeness heuristics** (`src/components/admin/products/studio/scoring.ts`) — title/description length bands, SEO field presence against the same 60/160-character limits `CharacterCounter` already enforces, image count — not an AI call. `ScoreCard` renders scores using stone/amber only (no green "good" or red "bad" state), per `DESIGN_SYSTEM.md` §15.

**Reason:** All four follow the pattern ADR-013 established (no `SUPABASE_SERVICE_ROLE_KEY`, every new admin write path gets its own explicit `get_my_role() IN ('staff','admin')` RLS policy where one doesn't already exist) and the "keep it simple, no transaction" posture ADR-015/ADR-016 established for multi-table writes. Scoring is explicitly kept non-AI per ADR-017: real computed scores now, AI-assisted content analysis stays scoped to Sprint 9's AI Assistant panel, unchanged and still disabled.

**Consequence:** `ProductActionsMenu`'s row menu is now fully wired (View/Edit/Duplicate/Archive-or-Restore/Delete). The Media section's video dropzone remains a placeholder — `product_videos` is a separate table/sprint, not part of this pass. Removing an image from the Studio never deletes its Storage object or `media` row (only the `product_images` link), so re-adding a recently-removed image would currently require re-uploading it — acceptable for this pass; revisit with a dedicated Media Library (ROADMAP-adjacent, not yet scheduled) if reusing previously-uploaded images becomes a real workflow.

**Alternatives considered:**
- A general-purpose hard-DELETE policy for products — rejected; DATABASE.md §1 mandates soft deletes specifically because `order_items.product_id` and other tables reference products and must survive deletion for order history.
- Diffing `product_images` add/remove/reorder against the database instead of delete-then-reinsert — rejected as more complexity than this feature's volume justifies, same reasoning ADR-015 used for Create's two-table write.
- Wiring `ProductQualitySection` to Claude now instead of Sprint 9 — rejected per ADR-017 and the explicit "Do NOT implement AI search until the relevant sprint begins" instruction; deterministic scoring satisfies ROADMAP's Sprint 6.1 "real computed scores" requirement without pulling AI scope forward.

---

## ADR-019 — Sprint 6.1 (remaining): ProductActionsMenu wiring reuses existing RLS, no new migration
**Date:** 2026-07-12
**Status:** Accepted

**Decision:** Wiring View/Duplicate/Archive/Restore/Delete on the Products list row menu (`src/app/admin/products/actions.ts`) required no new RLS policy. `archiveProduct`/`restoreProduct` are plain `UPDATE`s (via `statusToColumns`, shared with Create/Edit) covered by `products_staff_update` (migration 006). `duplicateProduct` is a plain `INSERT` covered by `products_staff_insert` (migration 005). `deleteProduct` is a **soft** delete (`UPDATE ... SET deleted_at = now()`) — also covered by `products_staff_update`, deliberately not the narrower `products_staff_delete` policy from migration 005, which stays scoped to Create's compensating rollback. This is the same soft-delete-via-`deleted_at` choice discussed for the (still-pending) Sprint 7.2 proposal, applied here to the smaller Sprint 6.1 (remaining) scope.

**Reason:** `docs/DATABASE.md` §1 names `products` explicitly under "Soft deletes where data has value" — a hard `DELETE` would also orphan `order_items.product_id` history once orders exist. Reusing `products_staff_update` rather than adding a new policy keeps the RLS surface minimal, consistent with every prior sprint's practice of adding only the policy a feature actually needs.

**Consequence:** Archive and Restore are symmetric one-click actions (`archiveProduct`/`restoreProduct`), each hidden from the row menu when it would be a no-op (Archive only shown when Active, Restore only when Archived) — a product's status can still be set directly via the Edit Studio's Organization section regardless, this is just the shortcut. Duplicate always lands as a Draft, never inheriting the source product's live/featured state, so a duplicate never accidentally goes live unreviewed.

**Scope note:** This is Sprint 6.1 (remaining)'s row-menu wiring only — single-row actions, native `window.confirm` for the one destructive action (Delete), no bulk operations, no dedicated confirmation-dialog component. The fuller Sprint 7.2 proposal (bulk selection, bulk archive/delete, a styled `ConfirmDialog` reused across every destructive action) remains separate and still pending approval; this ADR does not supersede that discussion, it resolves the identical delete-semantics question for the smaller scope that shipped first.

---

## ADR-020 — Sprint 7 split into 7.0/7.1/7.2; "Sprint 7.1" intentionally reused
**Date:** 2026-07-13
**Status:** Accepted

**Decision:** The originally-planned single "Sprint 7 — Full Authentication" is split into three sequentially-numbered sprints per explicit user instruction:
- **Sprint 7.0 — Authentication Foundation:** email/password registration and login, Google OAuth, `/auth/callback`, session management, session-aware Navbar, protected routes (`proxy.ts` extended to `/checkout` and `/account/*`), password reset. Explicitly excludes account dashboard, orders, wishlist, and cart merge.
- **Sprint 7.1 — User Area:** profile page, addresses, account dashboard shell, orders placeholder, wishlist placeholder. Depends on Sprint 7.0's session plumbing and protected-route gate.
- **Sprint 7.2 — Cart & Session Continuity:** scope intentionally deferred; will cover cart merge on login (localStorage → server) and any related session-continuity concerns once the underlying schema question (no `cart`/`cart_items` table exists yet) is resolved.

The number **7.1 is deliberately reused**: it already names the shipped Product Edit work (see the Sprint 7.1 entry in `docs/ROADMAP.md`'s Sprint History and ADR-016). That entry is **not renamed or renumbered** — ADRs and shipped sprint history are treated as append-only in this project (see ADR-019's precedent, where a duplicate ADR number was fixed by renumbering the newer entry, never the older one). Going forward, "Sprint 7.1" is ambiguous by name only; context (Product Edit vs. User Area) disambiguates which one is meant. This ADR exists specifically so that ambiguity is traceable rather than silent.

**Reason:** The user approved the Sprint 7 authentication plan with two changes: (1) split it into a foundation sprint and a user-facing-area sprint so account/orders/wishlist UI doesn't ship before session plumbing exists to protect it, and (2) explicitly requested sequential numbering (7.0/7.1/7.2) after being shown that 7.1 and 7.2 were already taken by, respectively, the shipped Product Edit sprint and the pending bulk-actions proposal (ADR-017/ADR-019). The user confirmed proceeding with the collision rather than alternative numbering.

**Consequence:** Any future reference to "Sprint 7.1" must specify which one (Product Edit vs. User Area) if ambiguity matters — dates disambiguate (Product Edit: 2026-07-12; User Area: not yet started as of this ADR). The pending Sprint 7.2 bulk-actions proposal (ADR-019) is a **separate, still-unrelated, still-pending** item from this Sprint 7.2 (Cart & Session Continuity) — two different proposals now share the same number for two different scopes. This should be resolved (renamed or merged) before either actually ships, to avoid a third overload of the same number.

**Alternatives considered:**
- Number the new sprints 7.0/7.3 to avoid any collision (proposed first) — rejected by explicit user instruction in favor of strict sequential numbering, accepting the disambiguation cost documented above.
- Rename the existing Product Edit sprint's label — rejected; it's shipped, referenced by ADR-016 and `docs/ROADMAP.md` Sprint History, and this project treats shipped sprint history as append-only the same way it treats ADRs.

---

## ADR-021 — Sprint 7.2 cart architecture: normalized `carts`/`cart_items`, authenticated-only server persistence, per-item source tracking
**Date:** 2026-07-14
**Status:** Accepted

**Decision:** Add `carts` and `cart_items` tables, structurally parallel to `orders`/`order_items`, rather than a single JSONB blob or staying client-only. Server persistence covers **authenticated users only** — guests continue to use the existing client-side cart (Zustand + `localStorage`) unchanged, merged into the user's `carts` row on login (merge logic itself is separate, not-yet-scoped implementation work — this ADR covers schema only). `cart_items` holds no price/name snapshot — a cart reflects live product data; snapshotting happens only once at order conversion, same as it already does for `order_items`. `cart_items.source` (`text NOT NULL DEFAULT 'web'`, unconstrained rather than a `CHECK` enum) records what added each line item, following the same documented-values-not-CHECK-constraint convention already used by `product_events.source` — so a future value (`'ai'`, `'partner'`) never requires a migration to introduce. RLS follows the existing `auth.uid()`-owned-row pattern used by `addresses`/`wishlists`; no service-role key, consistent with ADR-013.

**Reason:** Solves Sprint 7.2's actual named problem (session continuity for identified users) without inventing a second, cookie-based authorization pattern this schema doesn't otherwise have anywhere (every owned-row table here uses `auth.uid()`), and without violating this project's own stated principle against serializing relational data as JSONB (`docs/DATABASE.md` §1: *"Never serialize arrays of objects as text"*). Structural parallelism with `order_items` means checkout (Sprint 8) is a direct field mapping, not a data-shape translation.

**Future compatibility this design was explicitly built to support:**

- **Marketplace (Phase 4):** `cart_items.product_id` already FKs to `products`. Once `products` gains a vendor/seller relationship, splitting a cart's contents by vendor for multi-vendor checkout is a plain `cart_items JOIN products GROUP BY vendor_id` — no cart schema change needed. The complexity of "one order per vendor from one cart" lives entirely on the Orders side at that time, not here. `cart_items.source = 'partner'` also gives marketplace/reseller integrations a way to distinguish items a partner's system added from organic customer adds, which matters for commission/revenue attribution once that model exists.
- **AI:** `cart_items.source = 'ai'` lets a future shopping-assistant or recommendation agent (per `PROJECT_VISION.md`'s long-term "AI-native commerce operating system" direction) add items to a customer's cart on their behalf while remaining fully auditable and visually distinguishable from a manual add — this matters for user trust (a customer should be able to tell "the AI added this, not me") and for measuring AI-driven conversion separately from organic conversion. Because `carts`/`cart_items` are normal queryable rows rather than an opaque JSONB blob, abandoned-cart detection (`status='active' AND updated_at < now() - interval '1 day'`), demand-signal queries ("how many active carts currently contain product X"), and cart-recovery content generation are all plain SQL an agent can run directly — the same reasoning ADR-013's RLS-first posture already applies to every other write path in this app.
- **Payments (Sprint 8):** no schema coupling — a PaymentIntent amount is computed from live `cart_items × product price` at checkout initiation; payments consume the cart's current state, they don't need to understand its internal shape.
- **Partner Companies:** normalized tables with real FKs and RLS extend naturally to a new authenticated caller (e.g., a partner integration adding items via API on a customer's behalf) — every constraint the database already enforces for a normal cart add continues to apply. A JSONB blob would have pushed that integrity checking into every integration's application code individually instead of the database once.

**Consequence:** One migration (`20260714000001_cart_schema.sql`) adds the schema, indexes, RLS, and reuses the existing `set_updated_at()` trigger function. Sprint 7.2's application-level work (merge-on-login flow, cart Server Actions, Zustand integration, UI) is explicitly **not** covered by this ADR and remains unscoped pending its own implementation plan. Sprint 8 may want an optional `orders.cart_id` FK for direct conversion-funnel analytics — not required now, flagged for later, not built ahead of need.

**Alternatives considered:**
- Single JSONB blob (rejected — contradicts `docs/DATABASE.md` §1's own principle; weaker for exactly the Marketplace/AI query patterns this ADR was asked to support).
- Guest server-side carts via a session-cookie token (rejected — solves a problem that isn't coherent for anonymous users, who aren't identified across devices regardless, and would introduce a second RLS mechanism alongside the `auth.uid()` one used everywhere else in this schema).
- A `CHECK` enum on `cart_items.source` (rejected — would require a migration every time a new source type is introduced, defeating the purpose of preparing for sources not yet built; the unconstrained-text-with-documented-values convention already exists in this schema via `product_events.source`).

---

## ADR-022 — Sprint 8.0 checkout: orders/order_items write access, guest-can-browse/must-identify-to-order, `products.sku`, provider-agnostic payments
**Date:** 2026-07-15
**Status:** Accepted

**Decision:** Four related changes, all in migration `20260715000001_checkout_write_access.sql`:

1. **`orders`/`order_items` gain their first-ever write policies.** Both tables existed since the initial schema (`20260711000002_schema.sql`) with SELECT-only RLS — nothing could ever insert an order. `orders_own_insert` (`WITH CHECK (auth.uid() = user_id)`) and `order_items_own_insert` (via the same `EXISTS (SELECT 1 FROM orders …)` correlation already used by that table's SELECT policy) follow the identical `auth.uid()`-owned-row pattern as `addresses_own_all` and `carts_own_all`. No service-role key, consistent with ADR-013.
2. **Checkout is reachable by guests; placing an order is not.** A visitor with no session can open `/checkout` and complete shipping address, billing address, and delivery-option selection. `createOrder()` requires `getUser()` to succeed — an unauthenticated visitor is prompted to sign in or register at the review step, before the Server Action ever runs. Because order creation stays authenticated-only, no `anon`-role RLS policy is needed on `orders`/`order_items` — the `guest_email` column that already exists on `orders` remains unused for now, not removed (schema was already ahead of this decision; nothing here contradicts it, it simply isn't exercised yet).
3. **`products.sku`** (nullable, `UNIQUE`) — a base-catalogue SKU independent of `product_variants.sku`. Backfilled once from each product's slug (`'HN-' || upper(slug)`) as a one-time seed of a permanent business identifier, not a generated/virtual column — no trigger ties it to `slug`, so a future rename never regenerates it. `order_items`'s product snapshot uses `product_variants.sku` when a variant is selected, falling back to `products.sku` otherwise, so every order line has a SKU regardless of whether the product has variants.
4. **`orders.shipping_method`** (nullable text) and **`carts.converted_order_id`** (nullable FK → `orders.id`, `ON DELETE SET NULL`) — the former records which static delivery option was chosen (see `src/lib/checkout/shipping-options.ts`, deliberately not a DB table this sprint); the latter gives the `'converted'` value `carts.status` has had since ADR-021 a way to actually point at the order it produced, closing the gap ADR-021's Consequence section flagged but left for this sprint.

**Payment provider architecture:** Sprint 8.0 integrates Stripe only. The checkout code never calls the Stripe SDK directly — `src/lib/payments/index.ts` exposes one provider-agnostic `createPaymentIntent(order)` boundary that today dispatches to `src/lib/payments/stripe.ts`. Adding PayPal, Klarna, Apple Pay, or Google Pay later means adding a second concrete module behind that same function and branching on `orders.payment_provider`, not touching checkout UI or `createOrder()`. `orders.stripe_payment_intent_id`/`paypal_order_id` etc. already exist as separate inline columns (pre-dating this ADR) — acceptable for two providers; revisit only if a third *distinct processor* (not just another payment method routed through Stripe's own Payment Element, e.g. iDEAL/SEPA for European expansion) is actually scheduled.

**Reason:** Mirrors this project's own precedent exactly — `products` also existed with SELECT-only RLS before Sprint 6 added `products_staff_insert` when Product Create actually needed it (ADR-013). Guest-can-browse/must-identify-to-order was the user's explicit resolution to the tension the Sprint 8.0 architecture review raised: the schema's `guest_email` column anticipated true guest orders, but `src/proxy.ts` already gated all of `/checkout` behind login, and no `anon` RLS policy existed to let a true anonymous session read its own just-placed order back. Requiring identification before the write means the simpler, already-proven `auth.uid()` pattern needs no exception.

**Consequence:** `src/proxy.ts`'s `/checkout` gate is relaxed to allow unauthenticated visitors through (it no longer redirects away); the inline identify step lives inside the checkout flow itself, not as a `next=`-param redirect back to `/login` — that pattern was already tried and removed in Sprint 7.0 (broke all click interactivity, see `TESTING.md`) and is not being reintroduced. Admin-side order mutation (fulfillment status changes, refunds) still has no RLS write policy at all — explicitly out of scope for Sprint 8.0, not an oversight.

**Alternatives considered:**
- Allow `anon`-role order inserts keyed on `guest_email` (rejected — introduces a second, weaker authorization pattern into a schema that otherwise uses `auth.uid()` everywhere, and still leaves no way for that same anonymous session to read the order back afterward under RLS).
- A `next=`-redirect-back to `/login` from checkout (rejected — this exact pattern already broke the login page's interactivity in Sprint 7.0 and was removed; reintroducing it here would risk the same regression on the highest-value page in the app).
- A `payments` table normalizing `stripe_*`/`paypal_*` into rows now (rejected as premature — two already-existing inline column sets cover Stripe + PayPal; normalize only if a third distinct processor is actually scheduled, not preemptively).

**Addendum — Stripe webhook write access (migration `20260715000002_stripe_payment_functions.sql`):** Stripe's webhook is server-to-server with no end-user session, so it has no `auth.uid()` for RLS to check — the one place in this sprint that doesn't fit the `auth.uid()`-owned-row pattern used everywhere else. Rather than a service-role key (forbidden, ADR-013), two narrow `SECURITY DEFINER` functions were added: `record_stripe_payment_intent(order_id, payment_intent_id)` (called by the customer's own authenticated session right after PaymentIntent creation; re-checks `auth.uid() = orders.user_id` internally since `SECURITY DEFINER` bypasses RLS) and `apply_stripe_payment_result(payment_intent_id, status, payment_status)` (called only by `/api/webhooks/stripe`, only after that handler verifies Stripe's HMAC signature on the raw request body — the signature check is the actual authorization boundary, playing the same role `auth.uid()` plays for every user-initiated write). Each function does exactly one narrowly-scoped update, not the blanket table access a service-role key would grant. This is the one new trust-boundary pattern this sprint introduces beyond plain RLS policies — flagged explicitly for review, not slipped in silently.

---

*Document maintained by: Lead Product Engineer*
*Last updated: 2026-07-15*
