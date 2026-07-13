import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same mechanism, new
// file/export name). This is an optimistic check only — it just confirms
// a session exists and redirects if not. It does NOT check profiles.role;
// that authorization happens inside each Server Action via RLS, which is
// the real security boundary (see docs/DECISIONS.md ADR-013).
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isAdminLoginRoute = pathname === "/admin/login";

    if (!user && !isAdminLoginRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (user && isAdminLoginRoute) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
  }

  // Customer-facing protected routes (Sprint 7.0) — same optimistic,
  // session-only check as above, no role check. RLS remains the real
  // boundary for any data these routes touch.
  const isCustomerLoginRoute = pathname === "/login";

  if (!user && !isCustomerLoginRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isCustomerLoginRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/account/:path*", "/login"],
};
