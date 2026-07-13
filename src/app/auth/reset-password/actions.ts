"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const NewPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export interface ResetPasswordState {
  error?: string;
}

// Relies on the recovery session /auth/callback already established for this
// request (via exchangeCodeForSession) — not a fresh sign-in. If that session
// is missing or expired, updateUser fails and the honest error is returned.
export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = NewPasswordSchema.safeParse({ password: formData.get("password") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your password." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "This reset link has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}
