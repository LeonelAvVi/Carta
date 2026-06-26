"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { RestaurantAccess } from "@/lib/types";

type DashboardLayoutClientProps = {
  children: React.ReactNode;
  displayName: string;
  email?: string | null;
  access: RestaurantAccess | null;
};

export function DashboardLayoutClient({
  children,
  displayName,
  email,
  access,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const isStaffView = pathname?.startsWith("/dashboard/staff");

  if (isStaffView) {
    return <>{children}</>;
  }

  return (
    <DashboardShell displayName={displayName} email={email} access={access}>
      {children}
    </DashboardShell>
  );
}
