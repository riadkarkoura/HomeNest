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
  but could not be exercised past the redirect without that manual step.

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