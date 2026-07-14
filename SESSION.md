# HomeNest Session

## Current Sprint
Sprint 7.2 — Cart & Session Continuity — schema phase complete, application-level work not yet
scoped or started. Sprint 7.1 (User Area) is complete.

## Last Completed
- ✅ Product Create
- ✅ Product Read (Live Supabase)
- ✅ Admin Login
- ✅ Product Search
- ✅ Product Filters
- ✅ Pagination
- ✅ RLS for Product CRUD
- ✅ Product Edit (Sprint 7.1 — Product Edit, shipped 2026-07-12; not to be confused with Sprint
  7.1 — User Area, the next sprint — see ADR-020)
- ✅ Product Delete (soft), Archive, Restore, Duplicate
- ✅ Image upload to Supabase Storage
- ✅ Real Product Quality scoring (deterministic, not AI)
- ✅ Customer email/password registration + login (src/app/login/actions.ts)
- ✅ Google OAuth sign-in + `/auth/callback` code exchange (shared by OAuth and password recovery)
- ✅ Password reset flow (`/forgot-password` → email → `/auth/reset-password`)
- ✅ Customer session helpers in `src/lib/auth/dal.ts` (`verifySession`/`getUser`, generalized
  from the admin-only `verifyAdminSession`/`getAdminUser` pattern)
- ✅ Session-aware Navbar (account dropdown + sign out when logged in, live via
  `onAuthStateChange`)
- ✅ `src/proxy.ts` extended to gate `/checkout` and `/account/*` for customer sessions
- ✅ Account hub — Profile page (`/account`), full Address CRUD (`/account/addresses`), Orders
  and Wishlist UI-only placeholders — designed to scale to 10 categories (Security, Invoices,
  Home Projects, Service Bookings, Home Documents, Warranty Files shown as "coming soon") without
  a future redesign
- ✅ Found and fixed a real Base UI bug: `DropdownMenuLabel` requires a `<DropdownMenuGroup>`
  wrapper (unlike Radix) — crashed the Navbar's account dropdown the first time it was ever
  opened with a live session

## Current Status
Sprint 6.1 (Product CRUD) remains fully operational, unchanged.
Sprint 7.0 (Authentication Foundation) and Sprint 7.1 (User Area) are both complete: customers
can register, sign in with email/password or Google, reset a forgotten password, see a
session-aware Navbar, and manage their profile and addresses at `/account`. Orders and Wishlist
are UI-only placeholders (no `orders`/`wishlist_items` data wired up — that's Sprint 8 and a
future sprint respectively).

**Sprint 7.2's schema decision is made and applied (2026-07-14, ADR-021):** `carts` + `cart_items`
tables exist on the linked Supabase project (migration `20260714000001_cart_schema.sql`),
normalized and structurally parallel to `orders`/`order_items`, server-persisted for
authenticated users only, no price/name snapshot (cart reflects live product data),
`cart_items.source` prepared for future `'ai'`/`'partner'` attribution. **Application-level work
is not yet built**: no merge-on-login flow, no cart Server Actions, no Zustand/UI changes. The
existing client-only Zustand + `localStorage` cart (`src/lib/store.ts`) is completely unchanged
and still what the storefront actually uses today.

## Sprint 7.0 Verification (2026-07-13)

Verification-only pass, no code changes, against the live Supabase project via the dev server:

- **Login — PASS.** Negative path confirmed repeatedly: wrong credentials → clean "Invalid email
  or password." from `login()` in `src/app/login/actions.ts`, no crash, server logs show the
  Server Action executing against live Supabase each time. Positive path (successful sign-in)
  could not be independently re-exercised this session — no confirmed-working test account was
  available (see Registration below) — but the code path is identical in shape to the
  already-verified `getUser()`/`signOut()` calls, which do reach the live project correctly.
- **Registration — PASS (with a noted blocker).** Form toggle, validation, and the `signup()`
  Server Action all confirmed working end-to-end against live Supabase, including the
  Suspense/interactivity bug found and fixed earlier this sprint (see below). Every registration
  attempt this session returned either a Supabase-side error (invalid email domain, or "email
  rate limit exceeded" once several attempts had been made) or the code's honest fallback message
  ("Account created. Check your email to confirm, then sign in.") — meaning `signUp()` never
  returned an active session in any attempt made tonight. `supabase/config.toml` sets
  `enable_confirmations = false`, so this may indicate the **linked remote Supabase project has
  email confirmation enabled**, unlike local config — worth checking in the Supabase Dashboard.
  Not fixed here per explicit "verification only" instruction.
- **Google OAuth — BLOCKED (expected, external).** Clicking "Continue with Google" briefly shows
  "Redirecting…" then silently reverts with no navigation and no visible error — confirmed via
  console/network inspection that `signInWithOAuth()` resolves without throwing, but no
  authorize-URL redirect occurs. Root cause: `supabase/config.toml`'s `[auth.external.google]` has
  `enabled = false` with empty credentials (see Known Issues). This is the same category of
  manual, external setup step Sprint 6 needed for the admin account — not an app-code defect.
  Note: the silent (no error message) failure mode is a genuine UX gap, but fixing it would be an
  improvement beyond this verification pass, so it was only recorded, not addressed.
- **Protected routes — PASS.** Unauthenticated requests to `/account`, `/checkout`, and `/admin`
  all correctly redirect (`/account` and `/checkout` → `/login`, `/admin` → `/admin/login`,
  confirming Sprint 7.0's `src/proxy.ts` changes didn't regress the existing admin gate). The
  authenticated "does NOT redirect" branch could not be independently re-exercised this session
  for the same reason as Login/Logout below.
- **Logout — NOT INDEPENDENTLY VERIFIED THIS SESSION.** No live authenticated session could be
  obtained (see Registration blocker above), so the Navbar's Sign out action could not be clicked
  through. The handler is a direct `supabase.auth.signOut()` + redirect, the same shape as the
  already-shipped and working `signOutAdmin` in `src/app/admin/login/actions.ts` — verified by
  code review, not by live click-through.
- **Production build — PASS.** `npm run build` succeeds cleanly (TypeScript + ESLint via Next's
  build-in check), 31 routes generated, no errors.

**Root blocker for the unverified items:** Supabase's auth email rate limit (`email_sent = 2`/hour
in local config; the linked remote project has its own, likely similarly low, limit) was hit
after the several registration attempts made across this sprint's implementation and verification
work, and no pre-existing customer test account with known credentials exists. Re-verify Login
(positive path) and Logout once the rate limit clears or a test account is available.

## Sprint 7.1 Verification (2026-07-13)

The Sprint 7.0 blocker above was resolved: the user created a permanent, Dashboard-created,
Auto-Confirmed test account per the strategy in `TESTING.md` §1, and shared its credentials for
this session only (not stored anywhere — see `TESTING.md`'s "never store credentials" rule; the
email/password are intentionally not written down here either). This unblocked full live
verification of everything Sprint 7.0 left unconfirmed, plus all of Sprint 7.1:

- **Login (success) — PASS.** Signed in with the test account, redirected to `/`, session cookie
  (`sb-*-auth-token`, cookie-based via `@supabase/ssr` — not `localStorage`, correcting an earlier
  assumption in `TESTING.md`) confirmed present.
- **Logout — PASS.** Navbar account dropdown → Sign out → redirected to `/`, session cookie
  cleared, Navbar reverted to logged-out state, `/account` re-redirected to `/login` afterward.
- **Profile — PASS.** Edited Full Name/First Name/Last Name/Phone, saved, reloaded — all values
  persisted correctly to `profiles`, and `AccountShell`'s "Welcome back, {name}" header picked up
  the new name immediately.
- **Addresses — PASS.** Full CRUD confirmed: create (via the Sheet form), edit (confirmed
  pre-filled with existing values), set-as-default (badge updated, partial-unique constraint
  respected), delete (list returned to the empty state). RLS correctly scoped everything to the
  signed-in user.
- **Orders / Wishlist placeholders — PASS.** Both render the intended UI-only empty state, no
  network calls, no crash.
- **Protected routes — PASS.** Confirmed both directions this time: `/account`, `/account/addresses`,
  `/account/orders`, `/account/wishlist` all redirect to `/login` when logged out, and none of
  them redirect away when logged in. `/admin` still correctly redirects to `/admin/login`
  (unregressed).
- **Mobile responsiveness — PASS.** Account nav's pill-tab row wraps naturally to a second line at
  375px width; form fields stack correctly.
- **A real bug found and fixed:** the Navbar's account dropdown crashed the first time it was
  opened with a live session — Base UI's `DropdownMenuLabel` requires a `<DropdownMenuGroup>`
  ancestor (unlike Radix, which doesn't). This is Sprint 7.0 code, only now exercised for the
  first time with a real session. Fixed in `src/components/layout/Navbar.tsx` by wrapping the
  label/separator/sign-out item in `<DropdownMenuGroup>`.
- **Production build — PASS**, re-run after the fix; clean TypeScript + ESLint, 35 routes.

**Tooling note:** this session's browser automation intermittently reported a `0×0` viewport and
had clicks silently fail to register, on two different dev-server instances — resolved each time
by an explicit `preview_resize` call. Unrelated to application code; noted here in case a future
session hits the same thing and wastes time suspecting a real bug first.

## Current Branch
main

## Next Task
Sprint 7.2 — Cart & Session Continuity, application layer. Schema is done (`carts`/`cart_items`,
ADR-021). Remaining: merge-on-login flow, cart Server Actions (add/update/remove), Zustand/UI
changes to read from the server cart for authenticated users. Needs its own implementation plan
before coding — do NOT start without explicit user instruction — see docs/ROADMAP.md.

## Known Issues
- ESLint toolchain issue (pre-existing)
- Remaining RLS policies for Orders and Payments
- No automated tests yet
- No dedicated Media Library yet — each product's images are uploaded fresh, none are reusable
  across products (not yet scheduled to a sprint)
- Full interactive testing of the admin write paths (Delete/Archive/Restore/Duplicate/image
  upload) still requires the one-time manual admin-account step from Sprint 6 (docs/ROADMAP.md)
- Google OAuth is wired but **not switch-on-able yet**: `supabase/config.toml`'s
  `[auth.external.google]` has `enabled = false` and empty credentials. A real Google OAuth
  client ID/secret must be added in the Supabase Dashboard and the provider enabled before
  "Continue with Google" works end-to-end — same category of one-time manual step as Sprint 6's
  admin account creation. Confirmed during Sprint 7.0 verification: with the provider disabled,
  the button click fails **silently** (no error shown to the user) — worth a small UX fix in a
  future pass, not addressed here.
- The linked remote Supabase project requires email confirmation for new signups (contrary to
  local `config.toml`'s `enable_confirmations = false`) and has a low auth email rate limit —
  confirmed, not just suspected, as of Sprint 7.1. Resolved for verification purposes with a
  permanent Dashboard-created test account per `TESTING.md` §1 — do not attempt to work around
  this by disabling confirmation project-wide (see `TESTING.md` §3 for why).
- Orders and Wishlist are UI-only placeholders (`/account/orders`, `/account/wishlist`) — no
  `orders`/`wishlist_items` data is wired up yet.

## Do Not Change
- Design system
- RLS-first architecture
- No Service Role Key
- Product Studio layout
- Existing ADR decisions

## Long-Term Vision
HomeNest's long-term direction: an AI-native commerce operating system. The owner eventually only selects products, approves key AI decisions, monitors analytics, and sets strategy — specialized AI agents (Research, Import, Optimization, SEO, Pricing, Image Generation, Marketing, Advertising, Email, Social, Support, Inventory, Analytics, Operations) handle the rest. Strategic guidance only — does not change the current roadmap, does not add AI sprints. Full statement: PROJECT_VISION.md. Recorded as ADR-017 in docs/DECISIONS.md.

## Important Documents
- CLAUDE_CONTEXT.md
- PROJECT_VISION.md
- docs/ROADMAP.md
- docs/DECISIONS.md
- docs/DATABASE.md

## Notes
Always read the files above before starting work.
Never redesign existing UI without approval.
Reuse existing components whenever possible.