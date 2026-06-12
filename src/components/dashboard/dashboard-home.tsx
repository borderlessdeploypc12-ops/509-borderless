"use client";

import { useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { LearnerDashboardPanel } from "@/components/dashboard/learner-dashboard-panel";
import { ProfessionalDashboardPanel } from "@/components/dashboard/professional-dashboard-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDefaultDateRange } from "@/lib/dashboard-analytics-data";
import { PageContainer } from "@/components/layout/page-container";

export function DashboardHome() {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [activePanel, setActivePanel] = useState("learner");

  return (
    <PageContainer size="wide" className="space-y-7">
      <DashboardPageHeader
        title="Dashboard"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Dashboard" },
        ]}
      />

      <Tabs
        value={activePanel}
        onValueChange={setActivePanel}
        className="gap-6"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted/80 p-1.5 sm:w-fit sm:min-w-[32rem]">
          <TabsTrigger
            value="learner"
            className="rounded-lg px-4 py-3 text-xs font-semibold uppercase tracking-wide data-active:bg-foreground data-active:text-background sm:text-sm"
          >
            Painel do Aprendiz
          </TabsTrigger>
          <TabsTrigger
            value="professional"
            className="rounded-lg px-4 py-3 text-xs font-semibold uppercase tracking-wide data-active:bg-foreground data-active:text-background sm:text-sm"
          >
            Painel do Profissional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learner" className="mt-0">
          <LearnerDashboardPanel
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </TabsContent>

        <TabsContent value="professional" className="mt-0">
          <ProfessionalDashboardPanel
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
