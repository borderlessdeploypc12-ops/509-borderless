import type { Metadata } from "next";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Preferências da clínica.",
};

export default async function ConfiguracoesPage() {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);

  return (
    <PageContainer>
      <DashboardPageHeader
        title="Configurações"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Configurações" },
        ]}
      />
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
        Preferências da clínica e da equipe em breve.
      </div>
    </PageContainer>
  );
}
