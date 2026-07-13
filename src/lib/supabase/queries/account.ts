import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
}

// Wrapped in React.cache — src/app/account/layout.tsx and each page both
// need this, and this dedupes the Supabase call within a single request
// (same rationale as ADR-008's getProductBySlug).
export const getProfile = cache(async (userId: string): Promise<ProfileRow | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, name, first_name, last_name, phone, marketing_opt_in")
      .eq("id", userId)
      .single();

    if (error) return null;

    return data as unknown as ProfileRow;
  } catch {
    return null;
  }
});

export interface AddressRow {
  id: string;
  type: "shipping" | "billing";
  is_default: boolean;
  label: string | null;
  first_name: string;
  last_name: string;
  company: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country_code: string;
  phone: string | null;
}

export async function getAddresses(userId: string): Promise<AddressRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("addresses")
      .select(
        "id, type, is_default, label, first_name, last_name, company, line1, line2, city, state, postal_code, country_code, phone"
      )
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) return [];

    return (data as unknown as AddressRow[]) ?? [];
  } catch {
    return [];
  }
}
