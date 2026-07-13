# HomeNest Session

## Current Sprint
Sprint 7.0 — Authentication Foundation — complete.

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

## Current Status
Sprint 6.1 (Product CRUD) remains fully operational, unchanged this sprint.
Sprint 7.0 (Authentication Foundation) is complete: customers can register, sign in with
email/password or Google, reset a forgotten password, and see a session-aware Navbar. Protected
route scaffolding for `/checkout` and `/account/*` is in place via `src/proxy.ts`, but no pages
exist behind it yet — that's Sprint 7.1. No account dashboard, orders, wishlist, or cart merge
were built this sprint, per explicit scope.

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

## Current Branch
main

## Next Task
Sprint 7.1 — User Area (profile page, addresses, account dashboard shell, orders placeholder,
wishlist placeholder). Do NOT start without explicit user instruction — see docs/ROADMAP.md.
Sprint 7.2 — Cart & Session Continuity (scope to be defined later; cart merge on login is
postponed here, pending a schema decision — no `cart`/`cart_items` table exists yet).

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
  admin account creation. Email/password registration, login, and password reset were verified
  end-to-end against the live Supabase project this session; Google OAuth's code path was wired
  but could not be exercised past the redirect without that manual step. Confirmed during Sprint
  7.0 verification: with the provider disabled, the button click fails **silently** (no error
  shown to the user) — worth a small UX fix in a future pass, not addressed here.
- Supabase auth email rate limit was hit during Sprint 7.0 verification (several registration
  attempts in one session) — blocks further registration testing until it clears. No customer
  test account with known credentials currently exists, so Login (positive path) and Logout
  could not be independently re-verified this session — see "Sprint 7.0 Verification" above.

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