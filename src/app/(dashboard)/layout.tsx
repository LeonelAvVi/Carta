import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { getCurrentProfile } from "@/lib/data/queries";
import { getRestaurantAccess } from "@/lib/data/restaurant-access";
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

  const [profile, access] = await Promise.all([
    getCurrentProfile(),
    getRestaurantAccess(),
  ]);

  const displayName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Usuario";

  return (
    <DashboardLayoutClient
      displayName={displayName}
      email={profile?.email ?? user.email}
      access={access}
    >
      {children}
    </DashboardLayoutClient>
  );
}
