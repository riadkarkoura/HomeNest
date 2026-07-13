# HomeNest — Manual Testing Notes

> Practical notes for verifying authentication (and similar Supabase-backed flows) by hand,
> written after Sprint 7.0 verification hit several avoidable snags. Read this before
> re-verifying auth so the same time isn't spent rediscovering the same constraints.

---

## 1. Test Account Strategy

- **Use Gmail plus-addressing tied to the project owner's real inbox** for test accounts, e.g.
  `riadkarkoura+homenest-test@gmail.com`. Supabase accepts these as normal, deliverable addresses
  (unlike `@example.com` or `.test` domains, which Supabase's signup validation rejects outright).
- **Maintain ONE persistent, known-working test account** for login/logout/session verification,
  rather than registering a fresh one every session. Supabase's auth email rate limit is low by
  default (`email_sent = 2`/hour in local `supabase/config.toml`; the linked remote project has
  its own dashboard-configured limit, observed to be similarly restrictive) — a handful of
  registration attempts in one sitting can exhaust it, blocking further signup testing for the
  rest of the hour.
- **Do not commit test account credentials to the repo.** Store the persistent test account's
  email/password in a local password manager or an untracked local file (e.g.
  `.env.local.notes`, already covered by `.gitignore` patterns for `.env*`) — never in Markdown
  docs, commit messages, or code comments.
- **Reserve fresh signups specifically for testing the registration flow itself** (validation,
  duplicate-email handling, the "check your email" fallback path). Use the persistent account for
  everything else (login, logout, protected-route checks, Navbar session state).
- If a fresh signup is needed and the rate limit is a concern, wait at least an hour since the
  last batch of signup attempts, or ask whoever holds Supabase Dashboard access to check the
  current rate-limit window under Authentication → Rate Limits.

---

## 2. External Configuration Dependencies

These live outside the repo (Supabase Dashboard / `.env.local`) and must be correct for auth to
work. None of them are things application code can fix.

| Dependency | Where | Status as of Sprint 7.0 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Present, working (all Sprint 6/6.1/7.0 features already depend on these) |
| Email confirmation requirement | Supabase Dashboard → Authentication → Providers → Email → "Confirm email" | **Unconfirmed / suspicious.** `supabase/config.toml` sets `enable_confirmations = false`, but every registration attempt during Sprint 7.0 verification returned a no-session response, consistent with the **linked remote project actually requiring confirmation**, contrary to local config. `config.toml` is a local-dev file; it is not guaranteed to reflect the linked remote project's actual settings (see ADR-013's note on a similar local/remote divergence for Storage buckets). **Check this directly in the Dashboard before assuming registration is fully working.** |
| Auth email rate limit | Supabase Dashboard → Authentication → Rate Limits | Low; exhausted during Sprint 7.0 verification after several registration attempts in one session. Exact remote value unconfirmed — don't assume it matches `config.toml`'s `email_sent = 2`. |
| Google OAuth provider | Supabase Dashboard → Authentication → Providers → Google | **Disabled.** `supabase/config.toml`'s `[auth.external.google]` has `enabled = false`, `client_id`/`secret` sourced from unset env vars (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`/`_SECRET`). See the checklist below. |
| Redirect URL allow-list | Supabase Dashboard → Authentication → URL Configuration → Redirect URLs | Must include `http://localhost:3000/auth/callback` for local dev OAuth/password-recovery redirects to be accepted. Not confirmed present — check before testing OAuth. |

---

## 3. Google OAuth Setup Checklist

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

## 4. Manual Verification Checklist

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
      redirect to `/`, Navbar reverts to the signed-out state (plain account icon, no dropdown),
      and `localStorage` keys starting with `sb-` are cleared (check via
      `Object.keys(localStorage).filter(k => k.startsWith('sb-'))` in the console).
- [ ] **Google OAuth** — see checklist item 7 above.
- [ ] **Password reset** — `/forgot-password` → submit the test account's email → expect the "if
      an account exists…" confirmation message (shown regardless of whether the email is real, by
      design) → check the inbox for the reset email → follow the link → should land on
      `/auth/reset-password` with an active recovery session → submit a new password → expect
      redirect to `/login` → log in with the new password to confirm it took effect.
- [ ] **Protected routes (logged out)** — visit `/account` and `/checkout` directly; expect
      redirect to `/login` in both cases. Visit `/admin`; expect redirect to `/admin/login`
      (confirms the customer-route proxy changes didn't regress the separate admin gate).
- [ ] **Protected routes (logged in)** — visit `/account` and `/checkout` while signed in; expect
      **no** redirect to `/login` (a 404 is fine and expected — no page exists behind the gate
      yet, that's Sprint 7.1 — but bouncing back to `/login` would indicate a proxy bug).
- [ ] **Production build** — `npm run build`; expect a clean TypeScript + ESLint pass and all
      routes listed with no errors.

---

## 5. Known Limitations

- **Supabase's auth email rate limit is easy to exhaust during manual testing.** Budget
  registration attempts accordingly (see §1); don't burn them on repeated login/logout checks.
- **Local `supabase/config.toml` may not reflect the linked remote project's actual auth
  settings** (email confirmation requirement, rate limits). Treat config.toml as documentation of
  intent, not a guarantee of the remote project's live behavior — confirm anything auth-critical
  directly in the Supabase Dashboard before relying on it.
- **Google OAuth fails silently in the UI** when the provider is disabled or misconfigured: the
  button briefly shows "Redirecting…" then reverts with no visible error and no console error.
  This is a real UX gap (a disabled/misconfigured provider should tell the user something went
  wrong) but was left unfixed per Sprint 7.0's "verification only, no code changes" scope — flag
  it for a future small fix rather than re-discovering it as a mystery.
- **No `/account` or `/checkout` pages exist yet** (Sprint 7.1/7.2). Protected-route testing can
  only confirm the redirect/no-redirect behavior at the proxy level, not any page content behind
  it.
- **No automated tests exist for any auth flow.** All verification here is manual and
  browser-driven; there is no CI safety net yet (matches the project-wide "No automated tests
  yet" status in `SESSION.md`).
- **A `Suspense` + `useSearchParams()` combination on `/login` previously broke all client-side
  interactivity on that page** (found and fixed during Sprint 7.0 implementation by removing the
  `next`-redirect-back enhancement that required it). If a future session reintroduces
  `useSearchParams()` on a page that also needs snappy click interactivity, wrap only the minimal
  subtree in `Suspense` and test click handlers immediately — this bug class produced no console
  errors and was easy to mistake for browser-automation flakiness rather than a real regression.
