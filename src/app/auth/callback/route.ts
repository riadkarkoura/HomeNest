import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Shared code-exchange endpoint for both OAuth sign-in and password-recovery
// links — both redirect here with a `code` query param under the PKCE flow
// @supabase/ssr uses. `next` lets the caller send the user somewhere other
// than home afterward (e.g. the reset-password form); it's restricted to a
// same-origin path to avoid becoming an open redirect.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
