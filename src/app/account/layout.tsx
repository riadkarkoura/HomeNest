import { verifySession } from "@/lib/auth/dal";
import { getProfile } from "@/lib/supabase/queries/account";
import AccountShell from "@/components/account/AccountShell";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user } = await verifySession();
  const profile = await getProfile(user.id);

  return (
    <AccountShell name={profile?.name ?? profile?.first_name ?? ""} email={user.email ?? ""}>
      {children}
    </AccountShell>
  );
}
