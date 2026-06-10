import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireServerUserSession } from "@/lib/auth-server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireServerUserSession();

  return <DashboardShell session={session}>{children}</DashboardShell>;
}
