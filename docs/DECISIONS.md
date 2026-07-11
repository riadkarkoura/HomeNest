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

*Document maintained by: Lead Product Engineer*  
*Last updated: 2026-07-11*
