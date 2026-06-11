"use client";

import { Suspense, useState } from "react";

import { InternalCommunicationProvider } from "@/contexts/internal-communication-context";
import { UserRoleProvider } from "@/contexts/user-role-context";
import type { AppUserSession } from "@/lib/user-profile";
import { AccessDeniedBanner } from "@/components/layout/access-denied-banner";
import { PatientWaitingBanner } from "@/components/internal-communication/patient-waiting-banner";
import { AppLogo } from "@/components/layout/app-logo";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { LogoutButton } from "@/components/layout/logout-button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getNavItemsForProfile } from "@/lib/navigation";
import { useUserRole } from "@/hooks/use-user-role";

type DashboardShellProps = {
  children: React.ReactNode;
  session: AppUserSession;
};

export function DashboardShell({ children, session }: DashboardShellProps) {
  return (
    <UserRoleProvider session={session}>
      <InternalCommunicationProvider userId={session.id}>
        <DashboardShellContent session={session}>{children}</DashboardShellContent>
      </InternalCommunicationProvider>
    </UserRoleProvider>
  );
}

function DashboardShellContent({
  children,
  session,
}: DashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { profile, isMaster } = useUserRole();
  const navItems = getNavItemsForProfile(profile, isMaster);

  return (
    <div className="flex min-h-dvh bg-clinical-surface lg:flex-row">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <AppLogo linkToHome variant="compact" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <DashboardNav items={navItems} />
        </div>
        <Separator />
        <div className="space-y-3 px-4 py-4">
          <LogoutButton />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Soluções em Saúde para equipes multidisciplinares.
          </p>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <DashboardHeader onMenuClick={() => setIsMobileNavOpen(true)} />
        <Suspense fallback={null}>
          <AccessDeniedBanner />
        </Suspense>
        <PatientWaitingBanner />

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {children}
        </main>
      </div>

      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="flex w-[min(100vw-2rem,20rem)] flex-col p-0">
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <SheetDescription className="sr-only">
              Acesso às seções da clínica
            </SheetDescription>
            <AppLogo linkToHome variant="compact" />
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <DashboardNav
              items={navItems}
              onNavigate={() => setIsMobileNavOpen(false)}
            />
          </div>

          <div className="mt-auto border-t border-border px-4 py-4">
            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
