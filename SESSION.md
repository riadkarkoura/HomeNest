# HomeNest Session

## Current Sprint
Sprint 8.2 — Order Engine Hardening (Atomicity & Concurrency) — ✅ COMPLETE. Sprints 7.0, 7.1, 7.2,
8.0 (Milestone 2: First Sale), and 8.1 are also complete.

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
- ✅ Navbar UX integration — My Account/Addresses/Orders/Wishlist links added to the account
  dropdown and mobile panel (navigation only, no auth/logic changes)
- ✅ `carts`/`cart_items` schema (migration `20260714000001_cart_schema.sql`, ADR-021) — normalized,
  authenticated-only, `updated_at`/`added_at`/`source` columns, applied to the linked project
- ✅ Cart & Session Continuity application layer (Sprint 7.2 Phase 2): `src/app/cart/actions.ts`
  (`syncAddItem`/`syncUpdateQuantity`/`syncRemoveItem`/`syncClearCart`/`mergeGuestCart`/
  `fetchServerCart`, all `getUser()`-scoped, no service-role key), `src/lib/supabase/queries/cart.ts`
  (`getOrCreateActiveCart`/`getActiveCartItems`), `src/lib/store.ts` extended with `userId`/
  `setUserId` so the existing Zustand cart merges a guest's local cart into the server on first
  login, hydrates from the server on return visits/devices, and clears on sign-out — `CartDrawer.tsx`
  and `src/app/cart/page.tsx` needed zero changes
- ✅ `products.sku`, `orders.shipping_method`, `carts.converted_order_id`, and the first-ever
  `orders`/`order_items` INSERT RLS policies (migration `20260715000001_checkout_write_access.sql`,
  ADR-022) — both tables existed since Sprint 2 with SELECT-only RLS
- ✅ Two `SECURITY DEFINER` RPC functions (migration `20260715000002_stripe_payment_functions.sql`)
  so Stripe's webhook can update `orders` with no service-role key and no end-user session — the
  webhook's HMAC signature check is the real authorization boundary
- ✅ Full checkout flow at `/checkout` — guest-accessible (ADR-022), inline sign-in/registration
  gate before order creation, shipping/billing address (reuses `AddressForm`), static delivery
  options, order review, `createOrder()` Server Action (re-fetches live prices/stock, builds
  immutable `order_items.product_snapshot`, converts the cart)
  — `src/app/checkout/{page.tsx,actions.ts}`, `src/components/checkout/*`
- ✅ Provider-agnostic payment layer (`src/lib/payments/`) with Stripe as the only concrete
  provider today, `/api/payments/stripe/intent`, `/api/webhooks/stripe`, `CheckoutPayment.tsx`
  (renders Stripe's Payment Element when configured, gracefully degrades otherwise — order
  creation and payment are decoupled, so an order always exists regardless)
- ✅ Order confirmation page (`/order-confirmation/[orderNumber]`) and real order history/detail at
  `/account/orders` and `/account/orders/[orderNumber]` (replacing the Sprint 7.1 placeholder),
  sharing one `OrderSummary` component
- ✅ Checkout UI & Flow Hardening (Sprint 8.1): visual step indicator
  (`CheckoutSteps.tsx`, guidance only — no navigation/routing added), a `CheckoutClient`-local
  hydration guard (`useCartStore.persist.hasHydrated()`/`onFinishHydration()` — `store.ts` itself
  untouched) via a new `CheckoutSkeleton.tsx`, server-side Zod validation on `createOrder()` with
  `shippingMethodId`'s enum derived from `SHIPPING_OPTIONS` at runtime (never a hand-typed
  literal), per-section inline validation hints, and loading-state polish on `CheckoutPayment.tsx`
  / `CheckoutIdentify.tsx`
- ✅ Order Engine Hardening (Sprint 8.2, ADR-023): new `create_order_atomic()` Postgres function
  (migration `20260716000001_order_engine_atomic.sql`, `SECURITY INVOKER`) replaces `createOrder()`'s
  three sequential insert/insert/update calls with one atomic, transactional write — a
  `SELECT ... FOR UPDATE` row lock on the target cart prevents two near-simultaneous checkout
  requests for the same customer from racing, and reusing `carts.converted_order_id` makes a
  resubmission idempotent (returns the existing order instead of duplicating). All business logic
  (validation, pricing, snapshot-building) stays in TypeScript — the function does only the final
  write. `createOrder()`'s public contract is unchanged.

## Current Status
Sprint 6.1 (Product CRUD) remains fully operational, unchanged.
Sprint 7.0 (Authentication Foundation) and Sprint 7.1 (User Area) are both complete: customers
can register, sign in with email/password or Google, reset a forgotten password, see a
session-aware Navbar, and manage their profile and addresses at `/account`. Orders now show real
data (Sprint 8.0); Wishlist remains a UI-only placeholder (no `wishlist_items` data wired up —
future sprint).

**Sprint 8.0 is now fully complete (2026-07-15, ADR-022, Milestone 2: First Sale):** a customer —
guest or signed-in — can add products to cart, reach `/checkout` without being forced to log in
first, identify inline only when actually placing an order, choose a shipping/billing address and
delivery option, and have a real `orders`/`order_items` row created with immutable snapshots that
never depend on `products` again. Payment collection itself is wired end-to-end in code (Stripe
PaymentIntent creation, webhook, RPC-based order updates with no service-role key) but not yet
configured — `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are
unset, so orders place successfully as `pending`/`unpaid` and the checkout page shows a graceful
"Stripe is not configured yet" fallback rather than a real charge. This is an external
configuration dependency, the same category as Sprint 7.0's Google OAuth — see `TESTING.md` §5.

**Sprint 7.2 is now fully complete (2026-07-14, ADR-021):** `carts` + `cart_items` tables exist on
the linked Supabase project (migration `20260714000001_cart_schema.sql`), normalized and
structurally parallel to `orders`/`order_items`, server-persisted for authenticated users only,
no price/name snapshot (cart reflects live product data), `cart_items.source` prepared for future
`'ai'`/`'partner'` attribution. **The application layer is also built and verified**: guests still
use the existing client-only Zustand + `localStorage` cart (`src/lib/store.ts`) unchanged from the
outside, but it now merges into the server cart on first login (folding local quantities into
whatever's already there), hydrates from the server on every subsequent load/device for that
account, and clears local state on sign-out so nothing leaks to the next person on a shared
device. `CartDrawer.tsx` and `src/app/cart/page.tsx` required zero changes.

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

## Sprint 7.2 Phase 2 Verification (2026-07-14)

Verified live against the linked Supabase project using the same permanent test account (per
`TESTING.md` §1; credentials not stored anywhere):

- **Guest → login merge — PASS.** Added items to the cart while signed out (localStorage only),
  signed in, confirmed the same items appeared server-side in `cart_items` and stayed in the
  Zustand store with no UI changes required.
- **Cross-device/return-visit hydration — PASS.** Cleared `localStorage`'s cart items while
  keeping the `homenest-cart-merged-user` flag, reloaded — both previously-added items came back
  correctly from the server, confirming real server persistence and not just an optimistic client
  cache.
- **Add/update/remove/clear while authenticated — PASS.** Each action's Server Action fired and
  the corresponding `cart_items` row was inserted/updated/deleted as expected; no desync observed
  after repeated add/remove cycles.
- **Sign-out clears local cart — PASS.** Confirmed the local cart empties and the merge flag is
  removed on sign-out, so the next person on the same device/browser doesn't see the previous
  account's items.
- **Production build — PASS.** Clean TypeScript + ESLint after Phase 2 changes.
- **Dev-overlay "5 Issues" badge — investigated, not a regression.** All five pre-existed Phase 2
  (image `src` warnings seen earlier in the session, plus a Base UI `SheetClose` warning inside
  `CartDrawer.tsx`, which Phase 2 never touched) — no fix applied, per "no unnecessary refactoring."

## Sprint 8.0 Verification (2026-07-15)

Verified live against the linked Supabase project using the same permanent test account (per
`TESTING.md` §1; credentials not stored anywhere):

- **RLS smoke test — PASS.** Anonymous REST insert into `orders` returned `401` (no `anon` INSERT
  policy exists, matching the authenticated-only design), confirming the new `orders_own_insert`/
  `order_items_own_insert` policies don't accidentally open a wider hole.
- **`products.sku` backfill — PASS.** Verified via anon-key REST read that all 8 products received
  a deterministic `HN-<SLUG>` SKU.
- **Guest reaches `/checkout` — PASS.** Signed out, confirmed `/checkout` returns `200` and renders
  the cart summary + inline identify step, not a redirect to `/login`.
- **Inline identify → cart merge — PASS.** Signed in on the checkout page itself; confirmed the
  page re-rendered with the full shipping/billing/delivery/review flow (via `router.refresh()`,
  no full navigation) and the account's server-side cart items appeared merged alongside the
  guest's local items.
- **Order placement — PASS.** Selected a saved shipping address, placed the order twice (once with
  3 merged items, once with 1 fresh item) — both created real `orders`/`order_items` rows with
  correct SKUs, names, images, quantities, and totals; the active cart converted and cleared
  locally each time.
- **Order confirmation and history — PASS.** `/order-confirmation/[orderNumber]`,
  `/account/orders`, and `/account/orders/[orderNumber]` all rendered the same real order data
  correctly.
- **Payment step graceful degradation — PASS.** With no Stripe keys configured,
  `CheckoutPayment.tsx` correctly showed "Stripe is not configured yet (STRIPE_SECRET_KEY
  missing). Your order has been saved and is pending payment." with a working "View Order" link —
  no crash, no dead end.
- **Protected routes unregressed — PASS.** `/account/orders` still returns `200` only for an
  authenticated session; the `/checkout` proxy change is scoped to that one path.
- **Production build — PASS**, run twice (once before adding the payment step, once after).
- **Tooling note:** this session's browser automation tool failed to register clicks on
  visually-hidden (`sr-only`) radio inputs and on a `useActionState` form's submit button, even
  though the underlying React state updates were correct — confirmed by dispatching the same
  interaction via `element.click()` / `form.requestSubmit()` through `preview_eval`, which worked
  every time. Documented in `TESTING.md` §7 as an automation-tool limitation, not an app bug.

## Sprint 8.1 Verification (2026-07-16)

Verified live using the dev server and the permanent test account (per `TESTING.md` §1):

- **Step indicator accuracy — PASS.** Signed in with an address already saved: Billing/Delivery
  showed complete immediately (their defaults — "same as shipping" and Standard Delivery — start
  satisfied), Shipping and the combined Review checkmark stayed incomplete until an address was
  selected, then all four filled in correctly.
- **Per-section hints — PASS.** The amber "Select or add an address to continue." hint appeared
  directly under Shipping Address while incomplete and disappeared the moment an address was
  selected.
- **No empty-cart flash — PASS.** Reloaded `/checkout` multiple times with items already in
  `localStorage`; the skeleton (or full flow) rendered correctly with no empty-cart screen ever
  appearing.
- **`createOrder` Zod validation — PASS.** Placed a real order (order `HN-20260716-0005`) after
  the schema change with no regression — confirms the new validation doesn't reject legitimate
  input; cart merged, order created, cart cleared, order appeared at `/account/orders` correctly.
- **Mobile pass (375×812) — PASS.** Step indicator wraps to a second line cleanly, all sections
  stack full-width with no horizontal overflow.
- **Production build — PASS**, run twice (before and after the full set of changes).
- **Tooling note:** the same previously-documented `sr-only` radio / form-submission automation
  quirk (`TESTING.md` §7) recurred this session under the newer browser tool set — same root
  cause, same workaround (`element.click()` via direct JS execution), not a new issue.

## Sprint 8.2 Verification (2026-07-16)

Verified against the linked Supabase project:

- **Migration applied — PASS.** `20260716000001_order_engine_atomic.sql` applied via
  `supabase db push`, confirmed matched in `supabase migration list`.
- **`SECURITY INVOKER` confirmed — PASS.** `SELECT prosecdef FROM pg_proc WHERE proname =
  'create_order_atomic'` returned `false` (read-only check) — the function runs as the calling
  role, not a privileged one, exactly as designed.
- **Normal order placement — PASS.** Placed a real order (`HN-20260716-0009`) through the new
  atomic path; behavior identical to before (order created, cart converted, correct SKU/name/
  image snapshot), confirmed by reading it back at `/account/orders/HN-20260716-0009`.
- **Production build — PASS**, after wiring `createOrder()` to the new `.rpc()` call.
- **Concurrency guarantee — verified by design/code review, not by a live concurrent-write
  test.** A live two-simultaneous-request test against the shared linked database was attempted
  and correctly stopped short: it would have required writing fabricated test orders directly
  into real project data, bypassing the application layer, which exceeds what this verification
  needed. The `SELECT ... FOR UPDATE` row-lock mechanism is standard, well-established Postgres
  behavior (not a novel pattern) — see ADR-023 for the full walkthrough. If empirical
  confirmation is wanted later, it belongs on a disposable local Supabase instance
  (`supabase start`), never the shared linked project.

## Current Branch
main

## Next Task
Sprint 8.2 is complete. The next candidate is Sprint 8.3 — Payment Activation & Order
Notifications (configure Stripe keys, verify a real charge, order confirmation email, tax
calculation, coupon redemption UI) — see `docs/ROADMAP.md`'s "Upcoming Sprints". Do NOT start new
work without explicit user instruction.

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