"use client";

import Link from "next/link";
import { ExternalLink, Monitor } from "lucide-react";

import { DailyAgenda } from "@/components/dashboard/daily-agenda";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export function AgendaPageView() {
  return (
    <PageContainer size="wide">
      <DashboardPageHeader
        title="Agenda"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Agenda" },
        ]}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/painel-chamada" target="_blank" rel="noopener noreferrer" />
            }
          >
            <Monitor className="size-4" aria-hidden />
            Abrir painel da recepção
            <ExternalLink className="size-3.5 opacity-60" aria-hidden />
          </Button>
        }
      />
      <DailyAgenda />
    </PageContainer>
  );
}
