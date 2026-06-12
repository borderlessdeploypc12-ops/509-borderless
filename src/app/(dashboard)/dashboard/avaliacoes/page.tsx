import type { Metadata } from "next";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Avaliações",
  description: "Instrumentos de avaliação ABA.",
};

export default async function AvaliacoesPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  return (
    <PageContainer>
      <DashboardPageHeader
        title="Avaliações"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Atendimento" },
          { label: "Avaliações" },
        ]}
      />
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
        Instrumentos de avaliação e registros clínicos ABA em breve.
      </div>
    </PageContainer>
  );
}
