import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Two entry points, split by call-site semantics — both are fast,
// friendly-error convenience checks, NOT the security boundary:
// src/proxy.ts already redirects unauthenticated requests away from
// /admin/*, and RLS (get_my_role() IN ('staff','admin')) is what
// actually enforces write access on every insert/delete. If either
// check below were skipped or buggy, RLS still blocks the write.
//
// verifyAdminSession() — for Server Components / pages. Redirecting
// on no-session is correct there: there's no in-progress user input
// to lose.
//
// getAdminUser() — for Server Actions that mutate user-entered form
// data (e.g. createProduct). MUST NOT redirect: a Server Action's
// redirect() is a real client-side navigation that unmounts the
// calling page, silently discarding whatever the user typed. A
// session can easily expire mid-form (short-lived JWT, long form),
// so the action has to hand a plain "you're signed out" result back
// to the client instead of yanking it away from its own draft.
export const verifyAdminSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return { user, supabase };
});

export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return { user, supabase };
}
