# Supabase Clients

This directory contains the three Supabase client factories required by the Next.js App Router.
Each file targets a different runtime environment. Using the wrong client in the wrong context
will either silently fail to read cookies or throw a runtime error.

---

## client.ts — Browser Client

**Use in: Client Components (`"use client"`)**

```ts
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

Creates a browser-side Supabase client using `createBrowserClient` from `@supabase/ssr`.
Reads and writes the session from browser cookies automatically.

Use this file when you need to query Supabase from a React component that runs in the browser —
for example, a search input that fetches results on keystroke, a wishlist button, or a
real-time subscription.

**Do not use in Server Components, Route Handlers, or middleware.** The browser client has no
access to HTTP request cookies and cannot authenticate server-side requests.

---

## server.ts — Server Client

**Use in: Server Components and Route Handlers**

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
```

Creates a server-side Supabase client using `createServerClient` from `@supabase/ssr`.
Reads and writes the session via the `cookies()` API from `next/headers`.

Use this file when fetching data inside an `async` Server Component or inside a Route Handler
(`app/api/**/route.ts`). This client automatically forwards the user's session cookie to
Supabase, so Row Level Security policies apply as the authenticated user.

> **Note:** When called from a Server Component, `setAll` will catch and swallow cookie-write
> errors — Server Components are read-only for cookies. Session refresh is handled by
> middleware instead (see below). Only Route Handlers can write cookies using this client.

**Do not use in Client Components or middleware.**

---

## middleware.ts — Edge Client

**Use in: `src/middleware.ts` only**

```ts
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}
```

Exports a single function, `updateSession`, which creates a server-side Supabase client scoped
to the edge runtime and calls `supabase.auth.getUser()` to silently refresh the JWT on every
request. The refreshed session cookies are forwarded on both the incoming `NextRequest` and
the outgoing `NextResponse`.

This is what keeps users logged in across page navigations without requiring a full re-login.
It must run on every route that requires authentication.

**Do not call `updateSession` from anywhere other than `src/middleware.ts`.** It is not a
general-purpose client factory — it exists solely to refresh sessions at the edge.

---

## Summary

| File | Runtime | Factory | Typical caller |
|------|---------|---------|----------------|
| `client.ts` | Browser | `createBrowserClient` | Client Components |
| `server.ts` | Node.js | `createServerClient` + `next/headers` | Server Components, Route Handlers |
| `middleware.ts` | Edge | `createServerClient` + `NextRequest` | `src/middleware.ts` |

---

## Environment Variables

Both clients rely on two variables defined in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The `NEXT_PUBLIC_` prefix makes them available in the browser bundle. They are safe to expose —
they are the public-facing anon key, not the service role key.

If you ever need to perform privileged operations that bypass Row Level Security (admin jobs,
migrations, background workers), add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` — **without**
the `NEXT_PUBLIC_` prefix — and create a separate admin client that is never imported from
client-side code.

> **Never commit `.env.local` to version control.**
