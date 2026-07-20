# HomeNest — Manual Testing Notes

> Practical notes for verifying authentication (and similar Supabase-backed flows) by hand,
> written after Sprint 7.0 verification hit several avoidable snags, and revised after Sprint 7.1
> confirmed those snags weren't one-offs. Read this before re-verifying auth so the same time
> isn't spent rediscovering the same constraints.

---

## 1. Test Account Strategy

**Do not rely on any personal email inbox for test-account verification.** Sprint 7.0's
verification pass used Gmail plus-addressing against the project owner's real inbox as a
workaround; Sprint 7.1 confirmed this doesn't actually work as a repeatable strategy — the linked
Supabase project requires email confirmation before a new signup gets a session (see §2), so
every plus-addressed test signup sat unconfirmed and unusable regardless of whose inbox it
pointed at, and repeated attempts also burn the project's auth email rate limit. Personal inboxes
are also simply the wrong place for infrastructure that other sessions and other people need to
depend on.

### Recommended: one permanent, Dashboard-created test account

Create this once; it works indefinitely afterward with no email step, ever.

1. Open the Supabase Dashboard for this project → **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Enter an email address. It does **not** need to be a real, reachable inbox — creating a user
   this way, with the option in step 4 checked, never sends a confirmation email for this account.
   Use something clearly labeled as a test account, e.g. `qa-customer@homenest-test.dev` (pick any
   convention; the exact address doesn't matter since nothing is ever delivered to it).
4. Enter a password (minimum 8 characters — matches `supabase/config.toml`'s
   `minimum_password_length = 8`; double check the hosted project's own policy under
   Authentication → Policies if it's been configured to differ).
5. **Check "Auto Confirm User" before saving.** This is the one setting that matters — it marks
   the account's email as confirmed immediately, skipping the confirmation-email step entirely
   for this account only. It does not change any project-wide setting.
6. Save. The existing `handle_new_user()` trigger fires exactly as it would for a normal signup,
   creating a matching `profiles` row with `role = 'user'` — correct for testing customer-only
   flows (Profile, Addresses, Orders, Wishlist, login, logout).
7. Store the resulting email/password in a local, untracked file or a password manager —
   never in the repo, never in a commit message, never pasted into a chat transcript that gets
   persisted anywhere durable.

This account is intentionally separate from the Sprint 6 admin/staff test account (`role =
'staff'`/`'admin'`, used for `/admin/*`) — keep them distinct so a test of customer-facing flows
never accidentally exercises admin-only RLS paths, and vice versa.

### Using the account

- **Reuse it indefinitely** for login (success path), logout, Navbar session state, Profile
  edits, and Address CRUD — anything that just needs *a* working session.
- **Reserve fresh signups** (a second, throwaway account per attempt) specifically for testing the
  registration flow's own behavior — validation, duplicate-email handling, the "check your email
  to confirm" fallback message. Expect these to sit unconfirmed and unusable for login; that's
  the current, confirmed behavior of this project's Supabase configuration, not a bug to chase.
- If a batch of fresh-signup testing is needed and the auth email rate limit is a concern, ask
  whoever holds Dashboard access to check the current window under Authentication → Rate Limits
  before assuming it's clear.

---

## 2. External Configuration Dependencies

These live outside the repo (Supabase Dashboard / `.env.local`) and must be correct for auth to
work. None of them are things application code can fix.

| Dependency | Where | Status as of Sprint 7.0 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Present, working (all Sprint 6/6.1/7.0/7.1 features already depend on these) |
| Email confirmation requirement | Supabase Dashboard → Authentication → Providers → Email → "Confirm email" | **Confirmed ON.** `supabase/config.toml` sets `enable_confirmations = false`, but repeated registration attempts across Sprint 7.0 and 7.1 verification consistently returned a no-session response — the **linked remote project requires confirmation**, contrary to local config. `config.toml` only governs the local Supabase CLI emulator (`supabase start`); it has no effect on the hosted/remote project this app's `.env.local` actually points to (see ADR-013's note on a similar local/remote divergence for Storage buckets, and §4 below for why this shouldn't simply be switched off). Use §1's "Auto Confirm User" test account to work around this for verification rather than waiting on it. |
| Auth email rate limit | Supabase Dashboard → Authentication → Rate Limits | Low; exhausted during Sprint 7.0 verification after several registration attempts in one session, and easy to re-hit. Exact remote value unconfirmed — don't assume it matches `config.toml`'s `email_sent = 2`. Budget fresh-signup attempts accordingly (§1). |
| Google OAuth provider | Supabase Dashboard → Authentication → Providers → Google | **Disabled.** `supabase/config.toml`'s `[auth.external.google]` has `enabled = false`, `client_id`/`secret` sourced from unset env vars (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`/`_SECRET`). See the checklist below. |
| Redirect URL allow-list | Supabase Dashboard → Authentication → URL Configuration → Redirect URLs | Must include `http://localhost:3000/auth/callback` for local dev OAuth/password-recovery redirects to be accepted. Not confirmed present — check before testing OAuth. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `.env.local` | **Not set (Sprint 8.0).** The `stripe` SDK, `/api/payments/stripe/intent`, and `/api/webhooks/stripe` are fully coded and reachable, but `createStripePaymentIntent()` returns a clean "Stripe is not configured yet" error without these — verified during Sprint 8.0 by placing a real order end-to-end and confirming the checkout page shows that message instead of crashing (`src/components/checkout/CheckoutPayment.tsx`). Same category of external, non-app-code blocker as Google OAuth below. |

---

## 3. Is Disabling Email Confirmation Appropriate for "Local Development Only"?

**Short answer: not by flipping the project's global toggle — no.** There are two different
things that both get called "local," and conflating them is the trap here:

- **`supabase/config.toml` + `supabase start`** is a genuine local Postgres/Auth/Storage emulator
  that runs entirely on a developer's machine via Docker. Setting `enable_confirmations = false`
  there is completely safe and properly scoped — it can never affect the shared hosted project,
  because it isn't talking to it.
- **The project this app actually talks to right now** — per `.env.local`'s
  `NEXT_PUBLIC_SUPABASE_URL` — is the single **hosted, remote** Supabase project. This is not a
  local emulator. Every `next dev` session, and (as far as these docs show) the eventual
  production deployment too, point at this same one project. There is no separate
  staging/production Supabase project documented anywhere in this repo.

Given that, turning off "Confirm email" in the Dashboard for this project would not be a
local-only change — it's a **project-wide, shared setting**. It would apply to every signup
through this project, including real customers once HomeNest actually ships, unless a separate
production project is stood up first (a real, valid option — see below — but a bigger decision
than what's needed today). Disabling it now would mean anyone could register with an email
address they don't own and get a working, logged-in session immediately: a real anti-abuse and
account-security regression for a live storefront, not something to leave in place as a side
effect of unblocking a test session.

**Recommendation:** don't touch the project-wide toggle. Use §1's single "Auto Confirm User"
test account instead — it produces the same practical result (a session-ready account with zero
email steps) scoped to exactly one account, with no effect on anyone else signing up through the
same project.

**If a genuinely separate dev environment is wanted later:** the standard fix is a second,
dedicated Supabase project used only for development (with its own, more permissive auth
settings), while the current project is reserved for staging/production. That's a legitimate,
common setup — but it's an infrastructure decision with its own tradeoffs (schema/migration sync
between two projects, separate seed data, etc.), and shouldn't be backed into via a single toggle
flip. Worth a deliberate conversation if repeated dev-only auth friction like this keeps coming
up, not something to decide informally while unblocking one sprint's verification.

## 4. Google OAuth Setup Checklist

Google sign-in is fully wired in code (`src/app/login/page.tsx`'s `handleGoogleSignIn`,
`src/app/auth/callback/route.ts`) but cannot work until someone with Supabase/Google Cloud access
completes this one-time setup — the same category of manual step Sprint 6 needed for the admin
account.

1. In Google Cloud Console, create an **OAuth 2.0 Client ID** (Application type: **Web
   application**).
2. Add this **Authorized redirect URI**: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   (the Supabase project's own callback, not this app's `/auth/callback` — Supabase sits in front
   of Google and forwards to this app's callback afterward).
3. Copy the generated **Client ID** and **Client Secret**.
4. In the Supabase Dashboard → Authentication → Providers → Google: paste the Client ID/Secret and
   toggle the provider **on**.
5. Add `http://localhost:3000/auth/callback` (and the production domain, once one exists) to
   Authentication → URL Configuration → **Redirect URLs**.
6. If also testing via local `supabase start`, mirror this in `supabase/config.toml`:
   `[auth.external.google]` → `enabled = true`, and set the
   `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`/`SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` env vars the
   file already references.
7. **Verify the setup, not just the app**: click "Continue with Google" on `/login`. Expect a full
   navigation to `accounts.google.com`'s consent screen. If the page just briefly shows
   "Redirecting…" and then silently reverts with no navigation, the provider is still disabled or
   misconfigured — see Known Limitations below.

---

## 5. Stripe Setup Checklist

Stripe is fully wired in code (`src/lib/payments/stripe.ts`, `/api/payments/stripe/intent`,
`/api/webhooks/stripe`, `src/components/checkout/CheckoutPayment.tsx`) but cannot process a real
charge until someone with Stripe Dashboard access completes this one-time setup.

1. In the Stripe Dashboard (test mode), copy the **Publishable key** and **Secret key** from
   Developers → API keys.
2. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` in `.env.local`.
3. Create a webhook endpoint (Developers → Webhooks) pointing at
   `https://<your-domain>/api/webhooks/stripe` (use the Stripe CLI's `stripe listen --forward-to
   localhost:3000/api/webhooks/stripe` for local dev), subscribed to at minimum
   `payment_intent.succeeded` and `payment_intent.payment_failed`.
4. Copy the webhook's **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
5. **Verify the setup, not just the app**: place a real order through `/checkout` with a
   [Stripe test card](https://docs.stripe.com/testing#cards). Expect the Payment Element to render
   instead of the "Stripe is not configured yet" fallback message, and the order's
   `payment_status` to flip from `unpaid` to `paid` after the webhook fires (check
   `/account/orders/[orderNumber]`).

### 5a. Sprint 8.4 — Live End-to-End Verification Results (2026-07-19)

First successful real (test-mode) card payment completed end-to-end, order `HN-20260719-0016`.
Verified via `stripe listen` output, the dev server's own request log, and read-only database/
Stripe API queries — not assumed from a green UI alone.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Webhook received | **PASS** | `stripe listen` forwarded `payment_intent.created` (×2), `payment_intent.succeeded`, `charge.succeeded`, `charge.updated` to `localhost:3000/api/webhooks/stripe` |
| 2 | Webhook responded 2xx | **PASS** | Every forwarded event returned `[200]` in both `stripe listen`'s log and the dev server's own request log (`POST /api/webhooks/stripe 200`, 5 for 5) |
| 3 | Order reaches `paid`/`processing` | **PASS** | `orders` row for `HN-20260719-0016`: `payment_status = 'paid'`, `status = 'processing'`, `updated_at` (01:01:13.55) lands between the `payment_intent.succeeded` and `charge.updated` events |
| 4 | Stored `stripe_payment_intent_id` matches Stripe | **PASS** | DB stores `pi_...oCjomn`; `stripe payment_intents retrieve` on that exact id returns `status: "succeeded"`, `amount_received: 5800` (= order total $58.00), `metadata.orderNumber: "HN-20260719-0016"` |
| 5 | Exactly one linked PaymentIntent | **PASS** | Stripe shows **two** PaymentIntents for this order's metadata (expected, documented trade-off of Patch 8.3.2 — Stripe-side creation isn't deduplicated, only DB linkage is): one `succeeded` (the one stored in the DB) and one `requires_payment_method` (the race's loser, correctly orphaned and untouched, never linked). Exactly one is ever linked/confirmed. |
| 6 | No duplicate orders | **PASS** | Querying by both `order_number` and `id` returns exactly one row; no other order was created in the surrounding time window |

**Conclusion:** the full payment lifecycle — PaymentIntent creation (including the concurrent-request race, which fired live and was handled correctly), card confirmation, webhook delivery, order status transition, and database consistency — is confirmed working end-to-end against real Stripe test-mode infrastructure. This is the first time this has been verified with an actual completed payment rather than code review or a partial flow.

---

## 6. Failed Payment Path (Sprint 8.3, ADR-024)

Sprint 8.3 was scoped to **successful card payments**; the table below is explicit about which
failure scenarios are actually implemented today versus deliberately deferred as documentation
only. PaymentIntents are card-only this sprint (`payment_method_types: ["card"]`) — no redirect-
based methods, and no additional payment providers.

| Scenario | Status | Behavior |
|---|---|---|
| **Declined card** | ✅ Implemented | Stripe's Payment Element shows the decline inline. `payment_intent.payment_failed` fires the webhook, which sets `status='cancelled'`/`payment_status='failed'` via `apply_stripe_payment_result()` (now guarded against out-of-order delivery — see below). The order stays visible in `/account/orders` regardless, since order creation and payment are decoupled (ADR-022). |
| **Retry after a decline** | ✅ Implemented | The Payment Element lets the customer re-enter card details and re-confirm the *same* PaymentIntent natively — no application code needed. |
| **Retry via reload/reopening checkout** | ✅ Implemented | `/api/payments/stripe/intent` now checks `orders.stripe_payment_intent_id` first and reuses the existing PaymentIntent's `client_secret` if it's still in a payable state (`requires_payment_method`/`requires_confirmation`/`requires_action`), instead of creating a second, orphaned PaymentIntent for the same order every time the route is called. |
| **Out-of-order / redelivered webhook events** | ✅ Implemented | `apply_stripe_payment_result()` refuses to move `payment_status` away from `'paid'` once set — a stale `payment_failed` arriving after `succeeded` for the same intent is now a no-op instead of a data-corrupting downgrade. |
| **Automatic Stripe webhook retry** (Stripe's own infrastructure retrying a failed delivery to our endpoint) | ✅ Implemented | The webhook now returns a non-2xx status if `apply_stripe_payment_result()` itself errors, instead of a false-positive `200` that would have told Stripe the event was handled when it wasn't — this is what makes Stripe's existing retry/backoff actually usable. |
| **Abandoned checkout** (customer never returns to complete payment) | ⚠️ Deferred, documented only | No cleanup job or expiration handling exists. Stripe auto-cancels an unconfirmed PaymentIntent after 24 hours by default, firing `payment_intent.canceled` — nothing subscribes to that event today, so the order simply stays `pending`/`unpaid` indefinitely. Future scope: subscribe to `payment_intent.canceled` (same `status`/`payment_status` transition already used for failures, no schema change) and/or a scheduled job to flag long-stale pending orders. |
| **Explicitly canceled payment** (customer backs out mid-flow, or the intent is canceled directly) | ⚠️ Deferred, documented only | Same root cause as abandoned checkout — `payment_intent.canceled` isn't subscribed to. The order remains `pending`/`unpaid` with no automatic transition until that event is wired up. |
| **Timeout** (network drop mid-confirmation) | ⚠️ Deferred, documented only | Server-side Stripe API timeouts during intent creation are already caught (`createStripePaymentIntent`'s `try/catch`) and surfaced as a friendly error. Client-side, `stripe.confirmPayment()` has no explicit timeout — if the network drops mid-request, the UI can show "Processing…" indefinitely with no automatic recovery prompt. Future scope: a client-side timeout with a "try again" affordance. |

**Verification for the deferred items is not applicable this sprint** — there is intentionally no
code to verify for abandoned checkout, explicit cancellation, or client-side timeout. Don't
mistake the absence of handling for a bug when re-testing this area later; check this table first.

---

## 7. Manual Verification Checklist

Run through this after any change touching auth, using the persistent test account from §1 for
every item except Registration.

- [ ] **Registration** — `/login` → "Create one" → fill Full Name/Email/Password (fresh email) →
      submit. Expect either a redirect to `/` with an active session, or the "Account created.
      Check your email to confirm, then sign in." message. If the message appears, check §2's
      email-confirmation row before treating it as a bug.
- [ ] **Login (success)** — `/login` → persistent test account credentials → submit. Expect
      redirect to `/`, Navbar's account icon becomes a dropdown showing the account's email.
- [ ] **Login (failure)** — wrong password → expect "Invalid email or password." inline, no
      crash, no redirect.
- [ ] **Logout** — while signed in, open the Navbar's account dropdown → "Sign out". Expect
      redirect to `/`, Navbar reverts to the signed-out state (plain account icon, no dropdown).
      Session state lives in a **cookie**, not `localStorage` (this app uses `@supabase/ssr`,
      which is cookie-based so Server Components/Actions can read the session) — check via
      `document.cookie.split('; ').filter(c => c.startsWith('sb-'))` in the console; it should be
      empty after logout.
- [ ] **Google OAuth** — see checklist item 7 above.
- [ ] **Password reset** — `/forgot-password` → submit the test account's email → expect the "if
      an account exists…" confirmation message (shown regardless of whether the email is real, by
      design) → check the inbox for the reset email → follow the link → should land on
      `/auth/reset-password` with an active recovery session → submit a new password → expect
      redirect to `/login` → log in with the new password to confirm it took effect.
- [ ] **Protected routes (logged out)** — visit `/account` directly; expect redirect to `/login`.
      Visit `/checkout` directly; expect **no** redirect (Sprint 8.0, ADR-022 — guests may browse
      the full checkout flow) — the page should render with the inline sign-in/create-account
      step in place of the address/delivery/review sections. Visit `/admin`; expect redirect to
      `/admin/login` (confirms the customer-route proxy changes didn't regress the separate admin
      gate).
- [ ] **Protected routes (logged in)** — visit `/account` while signed in; expect the Profile
      page, not a redirect. Visit `/checkout` while signed in; expect the full shipping/billing/
      delivery/review flow, not the identify step.
- [ ] **Checkout → order placement (Sprint 8.0)** — from a guest session with items in the cart,
      sign in inline on `/checkout`, select a shipping address and delivery option, click "Place
      Order". Expect: the order appears immediately at `/account/orders`, the local cart empties,
      and the payment step shows either a Stripe Payment Element (if configured, §5) or the
      "Stripe is not configured yet" fallback with a working "View Order" link — never a crash.
- [ ] **Production build** — `npm run build`; expect a clean TypeScript + ESLint pass and all
      routes listed with no errors.
- [ ] **Step indicator (Sprint 8.1)** — on `/checkout` while signed in, confirm Shipping/Billing/
      Delivery/Review each show a filled checkmark only once that section is actually satisfied
      (Billing and Delivery start pre-satisfied via their defaults — "same as shipping" and
      "Standard Delivery" — Shipping and the combined Review checkmark should not fill in until a
      shipping address is selected).
- [ ] **Per-section validation hints (Sprint 8.1)** — with no shipping address selected, confirm
      the amber hint appears directly under "Shipping Address", not only near the Place Order
      button. Uncheck "Same as shipping address" with no billing address selected; confirm the
      equivalent hint appears under "Billing Address".
- [ ] **No empty-cart flash on reload (Sprint 8.1)** — with items already in the cart
      (`localStorage`), reload `/checkout` several times; confirm the page never briefly shows
      "Your cart is empty" before the real items appear. If it does, `CheckoutClient`'s hydration
      guard (`useCartStore.persist.hasHydrated()`) has regressed.
- [ ] **`createOrder` input validation (Sprint 8.1)** — confirm placing a normal order still
      succeeds (the new Zod schema must not reject valid input); a malformed request (wrong-shaped
      IDs) should return "Invalid checkout details. Please refresh and try again." rather than a
      raw error.
- [ ] **Mobile pass (Sprint 8.1)** — resize to 375×812; confirm the step indicator wraps cleanly,
      every section stacks full-width with no horizontal overflow, and the Order Summary sits
      below the form sections rather than overlapping them.
- [ ] **Order Engine atomicity/idempotency (Sprint 8.2)** — place a normal order; confirm identical
      behavior to before (order created, cart converted, correct snapshot data at
      `/account/orders/[orderNumber]`). This now goes through `create_order_atomic()`
      (`supabase/migrations/20260716000001_order_engine_atomic.sql`) instead of three separate
      insert/insert/update calls — see ADR-023 for the full concurrency/idempotency design.
      **Note:** the race-condition guarantee itself (two concurrent requests for the same cart)
      was verified by code review and Postgres's standard `SELECT ... FOR UPDATE` semantics, not
      by firing a live concurrent test against the shared linked database — doing so would mean
      writing fabricated test orders into real project data outside the application layer, which
      wasn't warranted for this verification. If this needs empirical (not just reasoned)
      confirmation later, do it against a disposable local Supabase instance (`supabase start`),
      never the shared linked project.
- [ ] **Navbar cart-badge hydration (Patch 8.2.2)** — with items already in the cart
      (`localStorage`), hard-reload any page; confirm no "Cart, 0 items" vs "Cart, N items"
      hydration warning appears in the console and the badge settles to the correct count. Also
      confirm `npm run build` succeeds for `/cart` (static) and `/account/addresses` (dynamic) —
      the underlying bug briefly broke the build itself (see Known Limitations).
- [ ] **Checkout SSR hydration crash (Patch 8.3.1)** — with items in the cart, do a fresh, full
      (non-client-navigated) request to `/checkout` and check the **server/terminal logs**, not
      just the browser — confirm no `TypeError: Cannot read properties of undefined (reading
      'hasHydrated')` is thrown. The browser page can look correct even when this is broken (dev
      mode silently recovers client-side), so the server log is the only reliable signal. Also
      confirm no empty-cart flash for a returning customer with items already saved, and that
      `npm run build` passes.
- [x] **Stripe PaymentIntent creation race guard (Patch 8.3.2 — PaymentIntent concurrency guard,
      ADR-024 addendum)** — found live
      during Sprint 8.4 verification: two near-simultaneous requests to
      `/api/payments/stripe/intent` for the same order each created a separate, real Stripe
      PaymentIntent (confirmed via `stripe payment_intents list`: two intents, identical
      `orderId`/`orderNumber` metadata, created the same second), and the database only ever
      retained one. Fixed with a conditional write in `record_stripe_payment_intent()` — see
      ADR-024's addendum for the full design comparison. **Fully verified (2026-07-19, order
      `HN-20260719-0016`, see §5a):** the same race fired live and naturally, unprompted, during a
      real checkout — two `payment_intent.created` events, but only one `payment_intent.succeeded`.
      The order's stored `stripe_payment_intent_id` matches exactly the `succeeded` PaymentIntent
      in Stripe; the other (`requires_payment_method`) was correctly left orphaned and never
      linked, confirming the "loser reuses the winner's intent" behavior works under a genuine,
      not simulated, race.
- [x] **Sprint 9.1 — Product Integrity (Tier 1 fixes from `docs/UX_AUDIT.md`)** — see §7a for the
      full task-by-task verification.

---

## 7a. Sprint 9.1 Verification (2026-07-19)

Five tasks, all verified live against the dev server after `npm run build` passed cleanly. No
regressions found in checkout, cart persistence, or the Order Engine — none of those files were
touched.

- **Shipping Consistency — PASS.** `src/app/cart/page.tsx`'s shipping is now unconditionally
  `0` (`Free`), matching the real checkout flow's Standard Delivery default
  (`src/lib/checkout/shipping-options.ts`). Confirmed live: cart with a $48 subtotal now shows
  "Shipping: Free" / "Total: $48" instead of the old "$45" / "$93" ($500-threshold bug).
- **Search End-to-End — PASS**, with one real bug found and fixed during verification, not just
  claimed. `getProducts()` (`src/lib/supabase/queries/products.ts`) now accepts an optional `q`
  and filters by keyword; `/products/page.tsx` reads and passes it through; the navbar's
  `SearchOverlay` (`Navbar.tsx`) gained an actual `<form onSubmit>` and working suggestion chips.
  **First implementation matched the whole query phrase**, so the homepage's own placeholder
  example — "My sink gets wet." — returned 0 results; fixed to match on individual words instead,
  confirmed via `/products?q=my%20sink%20gets%20wet` returning the 2 correct sink-related
  products. Also verified: the navbar overlay's suggestion chips ("Shower caddy") correctly
  navigate, filter, and close the overlay; a genuinely unmatched query ("zzz nonexistent") shows
  an honest empty state, not an error or the full catalogue.
- **Buy Now — PASS.** `ProductHero.tsx`'s "Buy Now" button now calls the exact same
  `handleAddToCart()` used by "Add to Cart" (`ProductDetailClient.tsx`'s `handleBuyNow`), then
  navigates to `/checkout`. Verified live: cart had 2× Silicone Sink Splash Guard before the
  test; clicking Buy Now on that same product landed on `/checkout` showing "Subtotal (3 items)
  $72" — exactly one unit added, no duplication, checkout's own "Free" Standard Delivery shown
  consistently with the cart fix above.
- **Dead Links — PASS.** Every `href="#"` in the codebase was removed (verified via a
  repo-wide `grep` returning zero functional matches, only explanatory code comments) rather than
  pointed at a placeholder. Removed: navbar's "How It Works"/"Journal", the footer's entire
  Company/Support link groups and both bottom-bar legal links, the newsletter section's inline
  "Privacy Policy" link, and — found during this task's own repo-wide sweep, outside
  `docs/UX_AUDIT.md`'s original count — the login page's "Terms"/"Privacy Policy" links
  (`src/app/login/page.tsx`), de-linked to plain text rather than deleting the consent notice
  itself. The footer's "Shop" category links were corrected to the real, existing categories
  (Kitchen/Bathroom/Storage) instead of the removed Living Room/Bedroom/Office.
- **Branding Cleanup — PASS.** `src/app/layout.tsx`'s title/description/keywords/Open Graph tags
  no longer say "Luxury Home Furnishings" — copy pulled directly from `PROJECT_VISION.md`'s own
  mission statement, not invented. Footer tagline and shipping claim corrected to match; cart's
  empty-state copy ("Time to find something beautiful" → "Time to find your next solution.")
  aligned to the same voice. Verified live: browser tab title now reads "HomeNest — Smart Home
  Solutions".

---

## 8. Known Limitations

- **Supabase's auth email rate limit is easy to exhaust during manual testing.** Budget
  registration attempts accordingly (see §1); don't burn them on repeated login/logout checks.
- **Local `supabase/config.toml` does not reflect the linked remote project's actual auth
  settings** (confirmed during Sprint 7.1: email confirmation is required remotely despite
  `enable_confirmations = false` locally). Treat config.toml as documentation of intent for the
  local CLI emulator only, never as a guarantee of the hosted project's live behavior.
- **Google OAuth fails silently in the UI** when the provider is disabled or misconfigured: the
  button briefly shows "Redirecting…" then reverts with no visible error and no console error.
  This is a real UX gap (a disabled/misconfigured provider should tell the user something went
  wrong) but was left unfixed per Sprint 7.0's "verification only, no code changes" scope — flag
  it for a future small fix rather than re-discovering it as a mystery.
- **Resolved (Sprint 8.4, 2026-07-19): Stripe payment collection is now live-verified end-to-end**
  in this local environment (test-mode keys configured, `stripe listen` forwarding webhooks) — see
  §5a. This was previously an open item since Sprint 8.0 (orders placed as `pending`/`unpaid` with
  no way to test a real charge). Still outstanding: configuring test-mode keys in any *deployed*
  (non-local) environment and its own webhook endpoint remains a separate, environment-specific
  setup step (§5) — this local verification doesn't carry over automatically.
- **Resolved (Patch 8.2.2): the Navbar cart badge used to hydration-mismatch** ("Cart, 0 items"
  server-rendered vs. "Cart, N items" once `useCartStore`'s `persist` middleware rehydrated from
  `localStorage`). Long-observed across earlier sprints but never formally tracked or fixed until
  now. Fixed with a local hydration guard in `Navbar.tsx` (`useCartStore.persist.hasHydrated()`/
  `onFinishHydration()`, initial state a plain `false` literal, every read deferred into
  `useEffect`) — mirrors the Sprint 8.1 `CheckoutClient` guard, scoped to Navbar only, no changes
  to `useCartStore`'s public API. **Related build-breaking discovery:** the first version of this
  fix used a `useState(() => useCartStore.persist.hasHydrated())` lazy initializer — identical in
  shape to `CheckoutClient`'s existing guard — which crashed `next build`'s static-prerender pass
  with `Cannot read properties of undefined (reading 'hasHydrated')` on `/cart` and
  `/account/addresses`. At the time, this was believed to be scoped to that specific build-time
  worker context only, distinct from a real request-time SSR pass, and `CheckoutClient` was left
  unchanged on the theory that `/checkout` is never statically prerendered so its identical
  lazy-initializer pattern was safe. **That assumption was wrong — see Patch 8.3.1 below.**
- **Resolved (Patch 8.3.1): `CheckoutClient`'s identical lazy-initializer pattern was, in fact,
  crashing on every real request**, not just the build-time worker. `useCartStore.persist` is
  undefined in *any* Node.js SSR context — `window` doesn't exist there at all, causing zustand's
  default `localStorage`-backed `createJSONStorage(() => window.localStorage)` to throw internally
  and `persistImpl` to skip assigning `api.persist` entirely (confirmed by reading
  `node_modules/zustand/middleware.js` directly). The crash was masked in casual dev-mode browser
  checks because Next.js's client-side error recovery silently re-rendered the failing component
  on the client (where `window` does exist), producing a visually correct page with no console
  error — but the dev server logs showed the real exception on every request, and a `GET /checkout`
  without that client-side recovery available returned a genuine `500`. Fixed identically to Patch
  8.2.2: initial state changed to a plain `false` literal, every `.persist` read deferred into
  `useEffect`. No changes to `useCartStore`'s public API, cart business logic, or checkout
  behavior. Verified: `/checkout` no longer throws on SSR (confirmed via server logs across
  repeated fresh navigations), the empty-cart flash is still prevented by the unchanged
  `CheckoutSkeleton` gating logic, and `npm run build` passes cleanly.
- **The browser automation tool used for this project's verification sometimes fails to register
  clicks on visually-hidden (`sr-only`) radio inputs and on `useActionState`-backed form submit
  buttons**, even though the underlying React wiring is correct — confirmed during Sprint 8.0 by
  dispatching the same interaction via `form.requestSubmit()` / `element.click()` through
  `preview_eval` and observing it work every time the click tool itself didn't. Same category as
  the pre-existing 0×0-viewport quirk below: an automation-tool limitation, not an app bug. If a
  click silently does nothing during verification, retry via a direct DOM `.click()`/
  `.requestSubmit()` before assuming the feature is broken.
- **No automated tests exist for any auth flow.** All verification here is manual and
  browser-driven; there is no CI safety net yet (matches the project-wide "No automated tests
  yet" status in `SESSION.md`).
- **A `Suspense` + `useSearchParams()` combination on `/login` previously broke all client-side
  interactivity on that page** (found and fixed during Sprint 7.0 implementation by removing the
  `next`-redirect-back enhancement that required it). If a future session reintroduces
  `useSearchParams()` on a page that also needs snappy click interactivity, wrap only the minimal
  subtree in `Suspense` and test click handlers immediately — this bug class produced no console
  errors and was easy to mistake for browser-automation flakiness rather than a real regression.
- **Base UI's `DropdownMenuLabel` requires a `<DropdownMenuGroup>` ancestor** (unlike Radix,
  where a bare label works fine). Using it directly under `DropdownMenuContent` throws `Base UI:
  MenuGroupContext is missing` the moment the menu is actually opened — this crashed the Navbar's
  account dropdown (Sprint 7.0 code) the first time Sprint 7.1's verification pass opened it with
  a real session, since no session had existed to test it with before then. Fixed by wrapping the
  label/separator/item in `<DropdownMenuGroup>`. Watch for this in any new `DropdownMenu` usage
  that includes a label.
- **Browser automation in this environment has intermittently reported a `0×0` viewport and had
  clicks silently fail to register** (no error, `aria-expanded` just never flips), observed across
  two different dev-server restarts during Sprint 7.1 verification. Each time, an explicit
  `preview_resize` call to a real width/height fixed it. If a click "does nothing" with no console
  error and no network activity, check `window.innerWidth`/`innerHeight` before assuming the
  component is broken.
