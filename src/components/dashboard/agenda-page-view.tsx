"use client";

import { DailyAgenda } from "@/components/dashboard/daily-agenda";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";

export function AgendaPageView() {
  return (
    <PageContainer size="wide">
      <DashboardPageHeader
        title="Agenda"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Agenda" },
        ]}
      />
      <DailyAgenda />
    </PageContainer>
  );
}
