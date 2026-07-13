import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getProfile } from "@/lib/supabase/queries/account";
import ProfileForm from "@/components/account/ProfileForm";
import ComingSoonGrid from "@/components/account/ComingSoonGrid";

export const metadata: Metadata = { title: "My Profile" };

export default async function AccountPage() {
  const { user } = await verifySession();
  const profile = await getProfile(user.id);

  return (
    <div className="space-y-10">
      <ProfileForm
        email={user.email ?? ""}
        initial={{
          name: profile?.name ?? "",
          firstName: profile?.first_name ?? "",
          lastName: profile?.last_name ?? "",
          phone: profile?.phone ?? "",
          marketingOptIn: profile?.marketing_opt_in ?? false,
        }}
      />
      <ComingSoonGrid />
    </div>
  );
}
