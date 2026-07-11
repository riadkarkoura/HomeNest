import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same mechanism, new
// file/export name). This is an optimistic check only — it just confirms
// a session exists and redirects if not. It does NOT check profiles.role;
// that authorization happens inside each Server Action via RLS, which is
// the real security boundary (see docs/DECISIONS.md ADR-013).
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginRoute) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (user && isLoginRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
