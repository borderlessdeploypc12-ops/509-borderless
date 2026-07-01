import { FamilyPortalShell } from "@/components/family-portal/family-portal-shell";
import { requireFamilySession } from "@/lib/auth-guard";

export default async function FamilyPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireFamilySession();

  return <FamilyPortalShell session={session}>{children}</FamilyPortalShell>;
}
