"use client";

import { InternalCommunicationProvider } from "@/contexts/internal-communication-context";
import { UserRoleProvider } from "@/contexts/user-role-context";
import type { AppUserSession } from "@/lib/user-profile";

type DashboardProvidersProps = {
  children: React.ReactNode;
  session: AppUserSession;
};

export function DashboardProviders({
  children,
  session,
}: DashboardProvidersProps) {
  return (
    <UserRoleProvider session={session}>
      <InternalCommunicationProvider userId={session.id}>
        {children}
      </InternalCommunicationProvider>
    </UserRoleProvider>
  );
}
