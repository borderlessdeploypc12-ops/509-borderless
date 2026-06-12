"use client";

import { Suspense } from "react";

import { AvailableAgendaSearch } from "@/components/dashboard/available-agenda-search";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";

export function BuscaAgendaPageView() {
  return (
    <PageContainer size="wide">
      <DashboardPageHeader
        title="Busca de Agenda"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Agenda" },
          { label: "Busca de Agenda" },
        ]}
      />

      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando busca...</p>
        }
      >
        <AvailableAgendaSearch />
      </Suspense>
    </PageContainer>
  );
}
