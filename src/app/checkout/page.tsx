import type { Metadata } from "next";
import { getUser } from "@/lib/auth/dal";
import { getAddresses } from "@/lib/supabase/queries/account";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = { title: "Checkout" };

// Guests reach this page freely (ADR-022) -- getUser() never redirects, so
// unauthenticated visitors render with initialUser: null and CheckoutClient
// shows the inline identify step. Only createOrder() itself requires a
// session.
export default async function CheckoutPage() {
  const session = await getUser();
  const addresses = session ? await getAddresses(session.user.id) : [];

  return (
    <CheckoutClient
      initialUser={session ? { id: session.user.id, email: session.user.email ?? null } : null}
      initialAddresses={addresses}
    />
  );
}
