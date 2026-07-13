"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/dal";

const ProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  firstName: z.string().trim().max(100).optional().or(z.literal("")),
  lastName: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  marketingOptIn: z.coerce.boolean(),
});

export interface ProfileState {
  error?: string;
  success?: boolean;
}

export async function updateProfile(_prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await getUser();
  if (!session) return { error: "You're signed out. Please sign in again." };

  const parsed = ProfileSchema.safeParse({
    name: formData.get("name"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    marketingOptIn: formData.get("marketingOptIn"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const { error } = await session.supabase
    .from("profiles")
    .update({
      name: parsed.data.name,
      first_name: parsed.data.firstName || null,
      last_name: parsed.data.lastName || null,
      phone: parsed.data.phone || null,
      marketing_opt_in: parsed.data.marketingOptIn,
    })
    .eq("id", session.user.id);

  if (error) {
    return { error: "Something went wrong saving your profile. Please try again." };
  }

  revalidatePath("/account");
  return { success: true };
}
