"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/dal";

const AddressSchema = z.object({
  type: z.enum(["shipping", "billing"]),
  label: z.string().trim().max(50).optional().or(z.literal("")),
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  company: z.string().trim().max(100).optional().or(z.literal("")),
  line1: z.string().trim().min(1, "Address is required."),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required."),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().min(1, "Postal code is required."),
  countryCode: z
    .string()
    .trim()
    .length(2, "Use a 2-letter country code (e.g. US)."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export interface AddressFormState {
  error?: string;
  success?: boolean;
}

function parseAddress(formData: FormData) {
  return AddressSchema.safeParse({
    type: formData.get("type"),
    label: formData.get("label"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    countryCode: formData.get("countryCode"),
    phone: formData.get("phone"),
  });
}

export async function createAddress(_prevState: AddressFormState, formData: FormData): Promise<AddressFormState> {
  const session = await getUser();
  if (!session) return { error: "You're signed out. Please sign in again." };

  const parsed = parseAddress(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the address details." };
  }

  const { error } = await session.supabase.from("addresses").insert({
    user_id: session.user.id,
    type: parsed.data.type,
    label: parsed.data.label || null,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    company: parsed.data.company || null,
    line1: parsed.data.line1,
    line2: parsed.data.line2 || null,
    city: parsed.data.city,
    state: parsed.data.state || null,
    postal_code: parsed.data.postalCode,
    country_code: parsed.data.countryCode.toUpperCase(),
    phone: parsed.data.phone || null,
  });

  if (error) return { error: "Something went wrong saving this address. Please try again." };

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function updateAddress(
  addressId: string,
  _prevState: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const session = await getUser();
  if (!session) return { error: "You're signed out. Please sign in again." };

  const parsed = parseAddress(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the address details." };
  }

  const { error } = await session.supabase
    .from("addresses")
    .update({
      type: parsed.data.type,
      label: parsed.data.label || null,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      company: parsed.data.company || null,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.state || null,
      postal_code: parsed.data.postalCode,
      country_code: parsed.data.countryCode.toUpperCase(),
      phone: parsed.data.phone || null,
    })
    .eq("id", addressId)
    .eq("user_id", session.user.id);

  if (error) return { error: "Something went wrong saving this address. Please try again." };

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(addressId: string): Promise<{ ok: boolean; message?: string }> {
  const session = await getUser();
  if (!session) return { ok: false, message: "You're signed out." };

  const { error } = await session.supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", session.user.id);

  if (error) return { ok: false, message: "Something went wrong deleting this address." };

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function setDefaultAddress(
  addressId: string,
  type: "shipping" | "billing"
): Promise<{ ok: boolean; message?: string }> {
  const session = await getUser();
  if (!session) return { ok: false, message: "You're signed out." };

  // Unset the prior default of this type, then set the new one — two plain
  // updates rather than a transaction, same "no transaction until it's
  // actually needed" posture as ADR-015/016. Worst case is a brief window
  // with no default of this type, which self-heals on the next save.
  await session.supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", session.user.id)
    .eq("type", type)
    .eq("is_default", true);

  const { error } = await session.supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", session.user.id);

  if (error) return { ok: false, message: "Something went wrong setting this as your default address." };

  revalidatePath("/account/addresses");
  return { ok: true };
}
