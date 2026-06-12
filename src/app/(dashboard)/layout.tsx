import { DashboardProviders } from "@/components/layout/dashboard-providers";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireServerUserSession } from "@/lib/auth-server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireServerUserSession();

  return (
    <DashboardProviders session={session}>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProviders>
  );
}
