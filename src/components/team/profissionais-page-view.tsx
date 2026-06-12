"use client";

import { TeamManagement } from "@/components/team/team-management";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";

export function ProfissionaisPageView() {
  return (
    <PageContainer size="wide">
      <DashboardPageHeader
        title="Profissionais e equipe"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Profissionais" },
        ]}
      />

      <TeamManagement />
    </PageContainer>
  );
}
