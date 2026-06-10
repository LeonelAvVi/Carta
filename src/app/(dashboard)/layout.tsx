import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentProfile } from "@/lib/data/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();

  const displayName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Usuario";

  return (
    <DashboardShell displayName={displayName} email={profile?.email ?? user.email}>
      {children}
    </DashboardShell>
  );
}
