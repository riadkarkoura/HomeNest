import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getAddresses } from "@/lib/supabase/queries/account";
import AddressesView from "@/components/account/AddressesView";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const { user } = await verifySession();
  const addresses = await getAddresses(user.id);

  return <AddressesView addresses={addresses} />;
}
