import type { Metadata } from "next";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Relatórios",
  description: "Indicadores e relatórios clínicos.",
};

export default async function RelatoriosPage() {
  await requirePermission(PERMISSIONS.REPORTS_VIEW);

  return (
    <PageContainer>
      <DashboardPageHeader
        title="Indicadores Clínicos"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Relatórios" },
        ]}
      />
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
        Indicadores de desempenho e relatórios para supervisão clínica em
        breve.
      </div>
    </PageContainer>
  );
}
